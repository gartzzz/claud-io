//! Project discovery module
//!
//! Scans the PROYECTOS folder and detects project types.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

/// Detected project type based on config files
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ProjectType {
    Node,
    Rust,
    Python,
    Go,
    Unknown,
}

/// A discovered project from the PROYECTOS folder
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoveredProject {
    pub id: String,
    pub path: String,
    pub name: String,
    pub project_type: ProjectType,
    pub has_git: bool,
    pub last_modified: i64,
    pub discovered_at: i64,
}

/// Scan a folder for projects
pub fn discover_projects(root_path: &Path) -> Result<Vec<DiscoveredProject>, String> {
    if !root_path.exists() {
        return Err(format!("Path does not exist: {}", root_path.display()));
    }

    let mut projects = Vec::new();

    // Only scan immediate subdirectories (depth 1)
    for entry in fs::read_dir(root_path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_dir() {
            // Skip hidden directories
            if path
                .file_name()
                .and_then(|n| n.to_str())
                .map(|n| n.starts_with('.'))
                .unwrap_or(false)
            {
                continue;
            }

            if let Some(project) = detect_project(&path) {
                projects.push(project);
            }
        }
    }

    // Sort by name
    projects.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(projects)
}

/// Detect if a directory is a project and determine its type
fn detect_project(path: &Path) -> Option<DiscoveredProject> {
    let name = path.file_name()?.to_str()?.to_string();

    // Detect project type
    let project_type = detect_project_type(path);

    // Check for git
    let has_git = path.join(".git").exists();

    // Get last modified time
    let last_modified = fs::metadata(path)
        .and_then(|m| m.modified())
        .map(|t| {
            t.duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs() as i64)
                .unwrap_or(0)
        })
        .unwrap_or(0);

    // Generate ID from path
    let id = uuid::Uuid::new_v4().to_string();

    Some(DiscoveredProject {
        id,
        path: path.to_string_lossy().to_string(),
        name,
        project_type,
        has_git,
        last_modified,
        discovered_at: chrono::Utc::now().timestamp(),
    })
}

/// Detect the type of project based on config files
fn detect_project_type(path: &Path) -> ProjectType {
    // Check for Node.js
    if path.join("package.json").exists() {
        return ProjectType::Node;
    }

    // Check for Rust
    if path.join("Cargo.toml").exists() {
        return ProjectType::Rust;
    }

    // Check for Python
    if path.join("pyproject.toml").exists()
        || path.join("setup.py").exists()
        || path.join("requirements.txt").exists()
    {
        return ProjectType::Python;
    }

    // Check for Go
    if path.join("go.mod").exists() {
        return ProjectType::Go;
    }

    ProjectType::Unknown
}

/// Get icon for project type
pub fn get_project_icon(project_type: &ProjectType) -> &'static str {
    match project_type {
        ProjectType::Node => "js",
        ProjectType::Rust => "rust",
        ProjectType::Python => "python",
        ProjectType::Go => "go",
        ProjectType::Unknown => "folder",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_detect_node_project() {
        let dir = tempdir().unwrap();
        let project_path = dir.path().join("my-node-app");
        fs::create_dir(&project_path).unwrap();
        fs::write(project_path.join("package.json"), "{}").unwrap();

        let project = detect_project(&project_path).unwrap();
        assert_eq!(project.project_type, ProjectType::Node);
        assert_eq!(project.name, "my-node-app");
    }

    #[test]
    fn test_detect_rust_project() {
        let dir = tempdir().unwrap();
        let project_path = dir.path().join("my-rust-app");
        fs::create_dir(&project_path).unwrap();
        fs::write(project_path.join("Cargo.toml"), "[package]").unwrap();

        let project = detect_project(&project_path).unwrap();
        assert_eq!(project.project_type, ProjectType::Rust);
    }
}
