use super::manager::SessionManager;
use super::session::SessionInfo;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};

#[derive(Clone, Serialize)]
pub struct TerminalOutput {
    pub session_id: String,
    pub data: Vec<u8>,
}

#[derive(Clone, Serialize)]
pub struct TerminalExit {
    pub session_id: String,
    pub code: i32,
}

#[tauri::command]
pub async fn terminal_create_session(
    app: AppHandle,
    manager: State<'_, Arc<SessionManager>>,
    cols: u16,
    rows: u16,
    command: Option<String>,
) -> Result<SessionInfo, String> {
    let info = manager.create_session(cols, rows, command.as_deref())?;
    let session_id = info.id.clone();

    // Get session for output streaming
    if let Some(session) = manager.get_session(&session_id) {
        let app_handle = app.clone();
        let sid = session_id.clone();

        // Spawn task to stream output
        tokio::spawn(async move {
            loop {
                if let Some(data) = session.read_output().await {
                    let _ = app_handle.emit(
                        "terminal:output",
                        TerminalOutput {
                            session_id: sid.clone(),
                            data,
                        },
                    );
                } else {
                    // Channel closed, session ended
                    let _ = app_handle.emit(
                        "terminal:exit",
                        TerminalExit {
                            session_id: sid.clone(),
                            code: 0,
                        },
                    );
                    break;
                }
            }
        });
    }

    Ok(info)
}

#[tauri::command]
pub fn terminal_write_input(
    manager: State<'_, Arc<SessionManager>>,
    session_id: String,
    data: Vec<u8>,
) -> Result<(), String> {
    let session = manager
        .get_session(&session_id)
        .ok_or_else(|| format!("Session {} not found", session_id))?;
    session.write(&data)
}

#[tauri::command]
pub fn terminal_resize(
    manager: State<'_, Arc<SessionManager>>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let session = manager
        .get_session(&session_id)
        .ok_or_else(|| format!("Session {} not found", session_id))?;
    session.resize(cols, rows)
}

#[tauri::command]
pub fn terminal_kill_session(
    manager: State<'_, Arc<SessionManager>>,
    session_id: String,
) -> Result<(), String> {
    manager.kill_session(&session_id)
}

#[tauri::command]
pub fn terminal_list_sessions(manager: State<'_, Arc<SessionManager>>) -> Vec<SessionInfo> {
    manager.list_sessions()
}

#[tauri::command]
pub fn terminal_set_active(
    manager: State<'_, Arc<SessionManager>>,
    session_id: String,
) -> Result<(), String> {
    manager.set_active_session(&session_id)
}

#[tauri::command]
pub fn terminal_get_active(manager: State<'_, Arc<SessionManager>>) -> Option<String> {
    manager.get_active_session_id()
}
