mod state;
mod terminal;

use std::sync::Arc;
use state::StateManager;
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
            terminal::terminal_create_session,
            terminal::terminal_write_input,
            terminal::terminal_resize,
            terminal::terminal_kill_session,
            terminal::terminal_list_sessions,
            terminal::terminal_set_active,
            terminal::terminal_get_active,
            state::get_claude_state,
            state::check_state_file_exists,
            state::get_state_file_path,
        ])
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Start watching the state file for changes
            state_manager.start_watching(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
