//! Project manager implementation

use crate::db::Database;
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;
use uuid::Uuid;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub project_type: String,
    pub description: Option<String>,
    #[serde(rename = "gitRemote")]
    pub git_remote: Option<String>,
    #[serde(rename = "lastOpened")]
    pub last_opened: i64,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    pub tags: Vec<String>,
    pub settings: ProjectSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProjectSettings {
    #[serde(rename = "defaultBranch")]
    pub default_branch: Option<String>,
    #[serde(rename = "autoCommit")]
    pub auto_commit: Option<bool>,
    #[serde(rename = "watchPatterns")]
    pub watch_patterns: Option<Vec<String>>,
    #[serde(rename = "ignorePatterns")]
    pub ignore_patterns: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectFile {
    pub path: String,
    pub name: String,
    #[serde(rename = "isDirectory")]
    pub is_directory: bool,
    pub size: Option<u64>,
    #[serde(rename = "modifiedAt")]
    pub modified_at: Option<i64>,
    pub children: Option<Vec<ProjectFile>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub ahead: i32,
    pub behind: i32,
    pub staged: Vec<String>,
    pub modified: Vec<String>,
    pub untracked: Vec<String>,
}

pub struct ProjectManager {
    db: Database,
}

impl ProjectManager {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    /// List all projects
    pub fn list(&self) -> Result<Vec<Project>, String> {
        self.db.with_conn(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT id, name, path, type, description, git_remote, last_opened, created_at, settings
                     FROM projects ORDER BY last_opened DESC",
                )
                .map_err(|e| e.to_string())?;

            let projects = stmt
                .query_map([], |row| {
                    let settings_json: String = row.get(8)?;
                    let settings: ProjectSettings =
                        serde_json::from_str(&settings_json).unwrap_or_default();

                    Ok(Project {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        path: row.get(2)?,
                        project_type: row.get(3)?,
                        description: row.get(4)?,
                        git_remote: row.get(5)?,
                        last_opened: row.get(6)?,
                        created_at: row.get(7)?,
                        tags: vec![], // TODO: Load tags
                        settings,
                    })
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            Ok(projects)
        })
    }

    /// Add a new project
    pub fn add(&self, path: &str, project_type: &str) -> Result<Project, String> {
        let path_buf = PathBuf::from(path);

        if !path_buf.exists() {
            return Err(format!("Path does not exist: {}", path));
        }

        let name = path_buf
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unnamed")
            .to_string();

        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        // Check for git remote
        let git_remote = self.get_git_remote(&path_buf);

        let project = Project {
            id: id.clone(),
            name,
            path: path.to_string(),
            project_type: project_type.to_string(),
            description: None,
            git_remote,
            last_opened: now,
            created_at: now,
            tags: vec![],
            settings: ProjectSettings::default(),
        };

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO projects (id, name, path, type, description, git_remote, last_opened, created_at, settings)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    project.id,
                    project.name,
                    project.path,
                    project.project_type,
                    project.description,
                    project.git_remote,
                    project.last_opened,
                    project.created_at,
                    serde_json::to_string(&project.settings).unwrap_or_default(),
                ],
            )
            .map_err(|e| e.to_string())?;

            Ok(project)
        })
    }

    /// Remove a project (doesn't delete files)
    pub fn remove(&self, project_id: &str) -> Result<(), String> {
        self.db.with_conn(|conn| {
            conn.execute("DELETE FROM projects WHERE id = ?1", params![project_id])
                .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    /// Get a project by ID
    pub fn get(&self, project_id: &str) -> Result<Option<Project>, String> {
        self.db.with_conn(|conn| {
            let result = conn.query_row(
                "SELECT id, name, path, type, description, git_remote, last_opened, created_at, settings
                 FROM projects WHERE id = ?1",
                params![project_id],
                |row| {
                    let settings_json: String = row.get(8)?;
                    let settings: ProjectSettings =
                        serde_json::from_str(&settings_json).unwrap_or_default();

                    Ok(Project {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        path: row.get(2)?,
                        project_type: row.get(3)?,
                        description: row.get(4)?,
                        git_remote: row.get(5)?,
                        last_opened: row.get(6)?,
                        created_at: row.get(7)?,
                        tags: vec![],
                        settings,
                    })
                },
            );

            match result {
                Ok(project) => Ok(Some(project)),
                Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
                Err(e) => Err(e.to_string()),
            }
        })
    }

    /// Get file tree for a project
    pub fn get_file_tree(&self, project_id: &str) -> Result<ProjectFile, String> {
        let project = self
            .get(project_id)?
            .ok_or_else(|| format!("Project not found: {}", project_id))?;

        let root_path = PathBuf::from(&project.path);
        self.build_file_tree(&root_path, 3) // Max depth of 3 levels
    }

    fn build_file_tree(&self, path: &Path, max_depth: usize) -> Result<ProjectFile, String> {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let metadata = std::fs::metadata(path).map_err(|e| e.to_string())?;
        let is_directory = metadata.is_dir();

        let mut file = ProjectFile {
            path: path.to_string_lossy().to_string(),
            name,
            is_directory,
            size: if is_directory { None } else { Some(metadata.len()) },
            modified_at: metadata
                .modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs() as i64),
            children: None,
        };

        if is_directory && max_depth > 0 {
            let mut children = Vec::new();

            let entries = std::fs::read_dir(path).map_err(|e| e.to_string())?;

            for entry in entries.flatten() {
                let entry_name = entry.file_name().to_string_lossy().to_string();

                // Skip hidden files and common ignored directories
                if entry_name.starts_with('.')
                    || entry_name == "node_modules"
                    || entry_name == "target"
                    || entry_name == ".git"
                    || entry_name == "__pycache__"
                {
                    continue;
                }

                if let Ok(child) = self.build_file_tree(&entry.path(), max_depth - 1) {
                    children.push(child);
                }
            }

            // Sort: directories first, then by name
            children.sort_by(|a, b| {
                match (a.is_directory, b.is_directory) {
                    (true, false) => std::cmp::Ordering::Less,
                    (false, true) => std::cmp::Ordering::Greater,
                    _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
                }
            });

            file.children = Some(children);
        }

        Ok(file)
    }

    /// Get git status for a project
    pub fn get_git_status(&self, project_id: &str) -> Result<Option<GitStatus>, String> {
        let project = self
            .get(project_id)?
            .ok_or_else(|| format!("Project not found: {}", project_id))?;

        let project_path = PathBuf::from(&project.path);

        // Check if it's a git repository
        if !project_path.join(".git").exists() {
            return Ok(None);
        }

        // Get current branch
        let branch_output = Command::new("git")
            .args(["branch", "--show-current"])
            .current_dir(&project_path)
            .output()
            .map_err(|e| e.to_string())?;

        let branch = String::from_utf8_lossy(&branch_output.stdout)
            .trim()
            .to_string();

        // Get status
        let status_output = Command::new("git")
            .args(["status", "--porcelain"])
            .current_dir(&project_path)
            .output()
            .map_err(|e| e.to_string())?;

        let status_str = String::from_utf8_lossy(&status_output.stdout);

        let mut staged = Vec::new();
        let mut modified = Vec::new();
        let mut untracked = Vec::new();

        for line in status_str.lines() {
            if line.len() < 3 {
                continue;
            }

            let index = line.chars().next().unwrap_or(' ');
            let worktree = line.chars().nth(1).unwrap_or(' ');
            let file = line[3..].to_string();

            if index != ' ' && index != '?' {
                staged.push(file.clone());
            }
            if worktree == 'M' || worktree == 'D' {
                modified.push(file.clone());
            }
            if index == '?' {
                untracked.push(file);
            }
        }

        // Get ahead/behind counts
        let ahead_behind_output = Command::new("git")
            .args(["rev-list", "--left-right", "--count", "HEAD...@{upstream}"])
            .current_dir(&project_path)
            .output();

        let (ahead, behind) = if let Ok(output) = ahead_behind_output {
            let counts = String::from_utf8_lossy(&output.stdout);
            let parts: Vec<&str> = counts.trim().split('\t').collect();
            if parts.len() == 2 {
                (
                    parts[0].parse().unwrap_or(0),
                    parts[1].parse().unwrap_or(0),
                )
            } else {
                (0, 0)
            }
        } else {
            (0, 0)
        };

        Ok(Some(GitStatus {
            branch,
            ahead,
            behind,
            staged,
            modified,
            untracked,
        }))
    }

    fn get_git_remote(&self, path: &Path) -> Option<String> {
        let output = Command::new("git")
            .args(["remote", "get-url", "origin"])
            .current_dir(path)
            .output()
            .ok()?;

        if output.status.success() {
            Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
        } else {
            None
        }
    }
}
