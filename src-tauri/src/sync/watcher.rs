//! File system watcher module
//!
//! Watches the PROYECTOS folder for changes and emits events.

use notify::{
    Config, Event, RecommendedWatcher, RecursiveMode, Watcher,
    event::EventKind,
};
use std::path::PathBuf;
use std::sync::mpsc::{channel, Receiver};
use std::sync::Arc;
use std::time::Duration;
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter};

/// File system watcher for project folder
pub struct FolderWatcher {
    watcher: Option<RecommendedWatcher>,
    watched_path: Option<PathBuf>,
    is_running: Arc<Mutex<bool>>,
}

impl FolderWatcher {
    pub fn new() -> Self {
        Self {
            watcher: None,
            watched_path: None,
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    /// Start watching a folder for changes
    pub fn start_watching(
        &mut self,
        path: PathBuf,
        app_handle: AppHandle,
    ) -> Result<(), String> {
        if *self.is_running.lock() {
            return Err("Watcher is already running".to_string());
        }

        let (tx, rx) = channel();

        // Create watcher with debounce
        let config = Config::default()
            .with_poll_interval(Duration::from_secs(1));

        let mut watcher = RecommendedWatcher::new(
            move |res: Result<Event, notify::Error>| {
                if let Ok(event) = res {
                    let _ = tx.send(event);
                }
            },
            config,
        )
        .map_err(|e| format!("Failed to create watcher: {}", e))?;

        // Start watching the path (non-recursive, only immediate children)
        watcher
            .watch(&path, RecursiveMode::NonRecursive)
            .map_err(|e| format!("Failed to watch path: {}", e))?;

        self.watcher = Some(watcher);
        self.watched_path = Some(path.clone());
        *self.is_running.lock() = true;

        // Spawn event handler
        let is_running = Arc::clone(&self.is_running);
        tauri::async_runtime::spawn(async move {
            Self::handle_events(rx, app_handle, is_running).await;
        });

        log::info!("Started watching folder: {:?}", path);
        Ok(())
    }

    /// Stop watching
    pub fn stop_watching(&mut self) {
        *self.is_running.lock() = false;
        self.watcher = None;
        self.watched_path = None;
        log::info!("Stopped folder watcher");
    }

    /// Handle file system events
    async fn handle_events(
        rx: Receiver<Event>,
        app_handle: AppHandle,
        is_running: Arc<Mutex<bool>>,
    ) {
        let mut debounce_timer: Option<tokio::time::Instant> = None;
        let debounce_duration = Duration::from_millis(500);

        loop {
            if !*is_running.lock() {
                break;
            }

            // Check for events with timeout
            match rx.recv_timeout(Duration::from_millis(100)) {
                Ok(event) => {
                    // Filter relevant events
                    let is_relevant = matches!(
                        event.kind,
                        EventKind::Create(_) | EventKind::Remove(_) | EventKind::Modify(_)
                    );

                    if is_relevant {
                        debounce_timer = Some(tokio::time::Instant::now());
                    }
                }
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                    // Check if debounce timer has expired
                    if let Some(timer) = debounce_timer {
                        if timer.elapsed() >= debounce_duration {
                            // Emit change event
                            let _ = app_handle.emit("sync:projects-changed", ());
                            log::debug!("Emitted sync:projects-changed event");
                            debounce_timer = None;
                        }
                    }
                }
                Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                    break;
                }
            }
        }

        log::info!("Folder watcher event handler stopped");
    }

    /// Check if watcher is running
    pub fn is_running(&self) -> bool {
        *self.is_running.lock()
    }

    /// Get the currently watched path
    pub fn watched_path(&self) -> Option<&PathBuf> {
        self.watched_path.as_ref()
    }
}

impl Default for FolderWatcher {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for FolderWatcher {
    fn drop(&mut self) {
        self.stop_watching();
    }
}
