//! Tauri commands for sync module

use super::agent_parser::{parse_agents_directory, AgentDefinition};
use super::git_sync::{get_repo_status, pull_repository, GitSyncResult, RepoStatus};
use super::project_discovery::{discover_projects, DiscoveredProject};
use super::watcher::FolderWatcher;
use parking_lot::Mutex;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, State};

/// State for the folder watcher
pub struct SyncState {
    pub watcher: Arc<Mutex<FolderWatcher>>,
    pub projects_path: PathBuf,
    pub agents_path: PathBuf,
}

impl SyncState {
    pub fn new() -> Self {
        Self {
            watcher: Arc::new(Mutex::new(FolderWatcher::new())),
            projects_path: PathBuf::from("/Users/mikel/Desktop/PROYECTOS"),
            agents_path: PathBuf::from("/Users/mikel/Claude/MR-AGENTS"),
        }
    }
}

impl Default for SyncState {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Project Commands
// ============================================================================

/// Discover all projects in the PROYECTOS folder
#[tauri::command]
pub fn sync_discover_projects(
    state: State<'_, SyncState>,
) -> Result<Vec<DiscoveredProject>, String> {
    discover_projects(&state.projects_path)
}

/// Start watching the PROYECTOS folder for changes
#[tauri::command]
pub fn sync_start_project_watch(
    state: State<'_, SyncState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut watcher = state.watcher.lock();
    watcher.start_watching(state.projects_path.clone(), app_handle)
}

/// Stop watching the PROYECTOS folder
#[tauri::command]
pub fn sync_stop_project_watch(state: State<'_, SyncState>) -> Result<(), String> {
    let mut watcher = state.watcher.lock();
    watcher.stop_watching();
    Ok(())
}

/// Get the projects folder path
#[tauri::command]
pub fn sync_get_projects_path(state: State<'_, SyncState>) -> String {
    state.projects_path.to_string_lossy().to_string()
}

// ============================================================================
// Agent Commands
// ============================================================================

/// Parse all agent definitions from MR-AGENTS folder
#[tauri::command]
pub fn sync_parse_agents(state: State<'_, SyncState>) -> Result<Vec<AgentDefinition>, String> {
    parse_agents_directory(&state.agents_path)
}

/// Get a single agent definition by ID
#[tauri::command]
pub fn sync_get_agent_definition(
    state: State<'_, SyncState>,
    agent_id: String,
) -> Result<AgentDefinition, String> {
    let agents = parse_agents_directory(&state.agents_path)?;
    agents
        .into_iter()
        .find(|a| a.id == agent_id)
        .ok_or_else(|| format!("Agent not found: {}", agent_id))
}

/// Pull latest changes from MR-AGENTS repo
#[tauri::command]
pub fn sync_pull_agents_repo(state: State<'_, SyncState>) -> Result<GitSyncResult, String> {
    pull_repository(&state.agents_path)
}

/// Get the status of MR-AGENTS repo
#[tauri::command]
pub fn sync_get_agents_repo_status(state: State<'_, SyncState>) -> Result<RepoStatus, String> {
    get_repo_status(&state.agents_path)
}

/// Get the agents folder path
#[tauri::command]
pub fn sync_get_agents_path(state: State<'_, SyncState>) -> String {
    state.agents_path.to_string_lossy().to_string()
}
