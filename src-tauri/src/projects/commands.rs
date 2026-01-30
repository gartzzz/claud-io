//! Tauri commands for projects module

use super::manager::{GitStatus, Project, ProjectFile, ProjectManager};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn project_list(manager: State<'_, Arc<ProjectManager>>) -> Result<Vec<Project>, String> {
    manager.list()
}

#[tauri::command]
pub fn project_add(
    manager: State<'_, Arc<ProjectManager>>,
    path: String,
    project_type: Option<String>,
) -> Result<Project, String> {
    manager.add(&path, project_type.as_deref().unwrap_or("code"))
}

#[tauri::command]
pub fn project_remove(
    manager: State<'_, Arc<ProjectManager>>,
    project_id: String,
) -> Result<(), String> {
    manager.remove(&project_id)
}

#[tauri::command]
pub fn project_get_file_tree(
    manager: State<'_, Arc<ProjectManager>>,
    project_id: String,
) -> Result<ProjectFile, String> {
    manager.get_file_tree(&project_id)
}

#[tauri::command]
pub fn project_git_status(
    manager: State<'_, Arc<ProjectManager>>,
    project_id: String,
) -> Result<Option<GitStatus>, String> {
    manager.get_git_status(&project_id)
}

#[tauri::command]
pub fn project_read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn project_write_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}
