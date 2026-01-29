use super::pty::PtyProcess;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::mpsc;

#[derive(Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub id: String,
    pub title: String,
    pub created_at: u64,
    pub is_active: bool,
}

pub struct Session {
    pub id: String,
    pub title: String,
    pub created_at: u64,
    pty: Arc<Mutex<PtyProcess>>,
    output_rx: Arc<tokio::sync::Mutex<mpsc::Receiver<Vec<u8>>>>,
}

impl Session {
    pub fn new(id: String, cols: u16, rows: u16, command: Option<&str>) -> Result<Self, String> {
        let (pty, output_rx) = PtyProcess::spawn(cols, rows, command)?;

        let created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Ok(Self {
            id: id.clone(),
            title: format!("Session {}", &id[..8]),
            created_at,
            pty: Arc::new(Mutex::new(pty)),
            output_rx: Arc::new(tokio::sync::Mutex::new(output_rx)),
        })
    }

    pub fn write(&self, data: &[u8]) -> Result<(), String> {
        self.pty.lock().write(data)
    }

    pub fn resize(&self, cols: u16, rows: u16) -> Result<(), String> {
        self.pty.lock().resize(cols, rows)
    }

    pub async fn read_output(&self) -> Option<Vec<u8>> {
        self.output_rx.lock().await.recv().await
    }

    pub fn info(&self, is_active: bool) -> SessionInfo {
        SessionInfo {
            id: self.id.clone(),
            title: self.title.clone(),
            created_at: self.created_at,
            is_active,
        }
    }
}
