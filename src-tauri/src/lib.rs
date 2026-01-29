mod agents;
mod content;
mod db;
mod projects;
mod state;
mod sync;
mod terminal;

use std::sync::Arc;
use tauri::Manager;
use agents::{AgentManager, AgentRuntime};
use content::ContentManager;
use db::Database;
use projects::ProjectManager;
use state::StateManager;
use sync::commands::SyncState;
use terminal::SessionManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let session_manager = Arc::new(SessionManager::new());
    let state_manager = Arc::new(StateManager::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .manage(session_manager)
        .manage(state_manager.clone())
        .invoke_handler(tauri::generate_handler![
            // Terminal commands
            terminal::terminal_create_session,
            terminal::terminal_write_input,
            terminal::terminal_resize,
            terminal::terminal_kill_session,
            terminal::terminal_list_sessions,
            terminal::terminal_set_active,
            terminal::terminal_get_active,
            // State commands
            state::get_claude_state,
            state::check_state_file_exists,
            state::get_state_file_path,
            // Project commands
            projects::commands::project_list,
            projects::commands::project_add,
            projects::commands::project_remove,
            projects::commands::project_get_file_tree,
            projects::commands::project_git_status,
            projects::commands::project_read_file,
            projects::commands::project_write_file,
            // Agent commands
            agents::commands::agent_list,
            agents::commands::agent_create,
            agents::commands::agent_update,
            agents::commands::agent_delete,
            agents::commands::agent_start,
            agents::commands::agent_stop,
            agents::commands::agent_pause,
            agents::commands::agent_get_logs,
            agents::commands::task_list,
            agents::commands::task_create,
            agents::commands::task_cancel,
            // Content commands
            content::commands::content_list_carousels,
            content::commands::content_create_carousel,
            content::commands::content_add_slide,
            content::commands::content_generate_copy,
            content::commands::content_list_copy_results,
            content::commands::content_generate_carousel,
            content::commands::content_export_carousel,
            // Sync commands
            sync::commands::sync_discover_projects,
            sync::commands::sync_start_project_watch,
            sync::commands::sync_stop_project_watch,
            sync::commands::sync_get_projects_path,
            sync::commands::sync_parse_agents,
            sync::commands::sync_get_agent_definition,
            sync::commands::sync_pull_agents_repo,
            sync::commands::sync_get_agents_repo_status,
            sync::commands::sync_get_agents_path,
        ])
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize database
            let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
            let database = Database::new(app_dir).map_err(|e| e.to_string())?;

            // Initialize managers
            let project_manager = Arc::new(ProjectManager::new(database.clone()));
            let agent_manager = Arc::new(AgentManager::new(database.clone()));
            let content_manager = Arc::new(ContentManager::new(database.clone()));

            // Initialize agent runtime
            let mut agent_runtime = AgentRuntime::new(Arc::clone(&agent_manager));
            agent_runtime.init(app.handle().clone());
            agent_runtime.start();

            // Initialize sync state
            let sync_state = SyncState::new();

            // Register managers with app state
            app.manage(project_manager);
            app.manage(agent_manager);
            app.manage(content_manager);
            app.manage(agent_runtime);
            app.manage(sync_state);

            // Start watching the state file for changes
            state_manager.start_watching(app.handle().clone());

            log::info!("Claud.io initialized successfully");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
