//! Agent parser module
//!
//! Parses agent markdown files with YAML frontmatter from MR-AGENTS repo.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

/// Agent definition parsed from markdown file
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentDefinition {
    pub id: String,
    pub filename: String,
    pub name: String,
    pub description: String,
    pub model: String,
    pub mode: String,
    pub system_prompt: String,
    pub parsed_at: i64,
    pub repo_commit: Option<String>,
}

/// YAML frontmatter structure
#[derive(Debug, Deserialize)]
struct AgentFrontmatter {
    name: String,
    #[serde(default)]
    description: Option<String>,
    #[serde(default = "default_model")]
    model: String,
    #[serde(default = "default_mode")]
    mode: String,
}

fn default_model() -> String {
    "sonnet".to_string()
}

fn default_mode() -> String {
    "normal".to_string()
}

/// Parse all agent files from a directory
pub fn parse_agents_directory(dir_path: &Path) -> Result<Vec<AgentDefinition>, String> {
    if !dir_path.exists() {
        return Err(format!("Directory does not exist: {}", dir_path.display()));
    }

    let mut agents = Vec::new();

    for entry in fs::read_dir(dir_path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        // Only process .md files
        if path.extension().and_then(|e| e.to_str()) == Some("md") {
            match parse_agent_file(&path) {
                Ok(agent) => agents.push(agent),
                Err(e) => {
                    log::warn!("Failed to parse agent file {:?}: {}", path, e);
                }
            }
        }
    }

    // Sort by name
    agents.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(agents)
}

/// Parse a single agent markdown file
pub fn parse_agent_file(path: &Path) -> Result<AgentDefinition, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;

    let filename = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    // Parse frontmatter and body
    let (frontmatter, body) = parse_frontmatter(&content)?;

    // Generate ID from filename
    let id = filename
        .trim_end_matches(".md")
        .to_string()
        .replace(' ', "-")
        .to_lowercase();

    Ok(AgentDefinition {
        id,
        filename,
        name: frontmatter.name,
        description: frontmatter.description.unwrap_or_default(),
        model: frontmatter.model,
        mode: frontmatter.mode,
        system_prompt: body.trim().to_string(),
        parsed_at: chrono::Utc::now().timestamp(),
        repo_commit: None,
    })
}

/// Parse YAML frontmatter from markdown content
fn parse_frontmatter(content: &str) -> Result<(AgentFrontmatter, String), String> {
    // Check if content starts with frontmatter delimiter
    if !content.starts_with("---") {
        return Err("No frontmatter found (must start with ---)".to_string());
    }

    // Find the closing delimiter
    let rest = &content[3..];
    let end_idx = rest
        .find("\n---")
        .ok_or("No closing frontmatter delimiter found")?;

    let yaml_content = &rest[..end_idx].trim();
    let body = &rest[end_idx + 4..];

    // Parse YAML
    let frontmatter: AgentFrontmatter =
        serde_yaml::from_str(yaml_content).map_err(|e| format!("YAML parse error: {}", e))?;

    Ok((frontmatter, body.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_frontmatter() {
        let content = r#"---
name: Software Architect
description: Designs system architecture
model: opus
mode: autonomous
---

You are a software architect agent.
"#;

        let (frontmatter, body) = parse_frontmatter(content).unwrap();
        assert_eq!(frontmatter.name, "Software Architect");
        assert_eq!(frontmatter.description, Some("Designs system architecture".to_string()));
        assert_eq!(frontmatter.model, "opus");
        assert_eq!(frontmatter.mode, "autonomous");
        assert!(body.contains("software architect agent"));
    }

    #[test]
    fn test_parse_frontmatter_defaults() {
        let content = r#"---
name: Simple Agent
---

Basic agent.
"#;

        let (frontmatter, _) = parse_frontmatter(content).unwrap();
        assert_eq!(frontmatter.name, "Simple Agent");
        assert_eq!(frontmatter.model, "sonnet");
        assert_eq!(frontmatter.mode, "normal");
    }
}
