use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::Mutex;
use tokio::time::{interval, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeState {
    pub state: String,
    pub event: String,
    pub session_id: String,
    pub tool_name: Option<String>,
    pub timestamp: String,
}

impl Default for ClaudeState {
    fn default() -> Self {
        Self {
            state: "idle".to_string(),
            event: "unknown".to_string(),
            session_id: "unknown".to_string(),
            tool_name: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

pub struct StateManager {
    current_state: Arc<Mutex<Option<ClaudeState>>>,
    state_file_path: PathBuf,
}

impl StateManager {
    pub fn new() -> Self {
        let home_dir = dirs::home_dir().expect("Failed to get home directory");
        let state_file_path = home_dir.join(".claude").join("claud-io-state.json");

        Self {
            current_state: Arc::new(Mutex::new(None)),
            state_file_path,
        }
    }

    pub async fn read_state(&self) -> Result<ClaudeState, String> {
        if !self.state_file_path.exists() {
            return Err("State file does not exist".to_string());
        }

        let content = fs::read_to_string(&self.state_file_path)
            .map_err(|e| format!("Failed to read state file: {}", e))?;

        let state: ClaudeState = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse state JSON: {}", e))?;

        Ok(state)
    }

    pub async fn get_current_state(&self) -> Option<ClaudeState> {
        self.current_state.lock().await.clone()
    }

    pub async fn update_state(&self, state: ClaudeState) {
        let mut current = self.current_state.lock().await;
        *current = Some(state);
    }

    pub fn start_watching(&self, app_handle: AppHandle) {
        let state_manager = Arc::new(self.clone());

        tauri::async_runtime::spawn(async move {
            let mut last_modified: Option<std::time::SystemTime> = None;
            let mut tick = interval(Duration::from_millis(200));

            loop {
                tick.tick().await;

                if !state_manager.state_file_path.exists() {
                    continue;
                }

                // Check if file was modified
                if let Ok(metadata) = fs::metadata(&state_manager.state_file_path) {
                    if let Ok(modified) = metadata.modified() {
                        if last_modified.is_none() || last_modified.unwrap() != modified {
                            last_modified = Some(modified);

                            // Read and emit new state
                            if let Ok(new_state) = state_manager.read_state().await {
                                state_manager.update_state(new_state.clone()).await;

                                // Emit event to frontend
                                let _ = app_handle.emit("claude-state-changed", &new_state);
                            }
                        }
                    }
                }
            }
        });
    }
}

impl Clone for StateManager {
    fn clone(&self) -> Self {
        Self {
            current_state: Arc::clone(&self.current_state),
            state_file_path: self.state_file_path.clone(),
        }
    }
}

// Tauri commands
#[tauri::command]
pub async fn get_claude_state(
    state_manager: State<'_, Arc<StateManager>>,
) -> Result<ClaudeState, String> {
    state_manager.read_state().await
}

#[tauri::command]
pub async fn check_state_file_exists(
    state_manager: State<'_, Arc<StateManager>>,
) -> Result<bool, String> {
    Ok(state_manager.state_file_path.exists())
}

#[tauri::command]
pub async fn get_state_file_path(
    state_manager: State<'_, Arc<StateManager>>,
) -> Result<String, String> {
    Ok(state_manager
        .state_file_path
        .to_string_lossy()
        .to_string())
}
