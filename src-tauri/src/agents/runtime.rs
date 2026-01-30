//! Agent runtime for task execution
//!
//! This module handles the autonomous execution of tasks by agents.

use super::manager::{AgentManager, Task};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::AppHandle;

/// Agent runtime manages task execution
pub struct AgentRuntime {
    manager: Arc<AgentManager>,
    app_handle: Option<AppHandle>,
    is_running: Arc<AtomicBool>,
}

impl AgentRuntime {
    pub fn new(manager: Arc<AgentManager>) -> Self {
        Self {
            manager,
            app_handle: None,
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Initialize the runtime with the app handle
    pub fn init(&mut self, app_handle: AppHandle) {
        self.app_handle = Some(app_handle);
    }

    /// Start the task scheduler
    pub fn start(&mut self) {
        self.is_running.store(true, Ordering::SeqCst);

        let manager = Arc::clone(&self.manager);
        let app_handle = self.app_handle.clone();
        let is_running = Arc::clone(&self.is_running);

        // Spawn the scheduler task using tauri's async runtime
        tauri::async_runtime::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(5));

            while is_running.load(Ordering::SeqCst) {
                interval.tick().await;

                // Check for pending tasks and assign to idle agents
                if let Err(e) = Self::process_queue(&manager, &app_handle).await {
                    log::error!("Error processing task queue: {}", e);
                }
            }

            log::info!("Agent runtime stopped");
        });

        log::info!("Agent runtime started");
    }

    /// Stop the runtime
    #[allow(dead_code)]
    pub fn stop(&self) {
        self.is_running.store(false, Ordering::SeqCst);
    }

    /// Process the task queue
    async fn process_queue(
        manager: &Arc<AgentManager>,
        _app_handle: &Option<AppHandle>,
    ) -> Result<(), String> {
        // Get pending tasks
        let tasks = manager.list_tasks(None)?;
        let pending_tasks: Vec<&Task> = tasks
            .iter()
            .filter(|t| t.status == "pending")
            .collect();

        if pending_tasks.is_empty() {
            return Ok(());
        }

        // Get available agents
        let agents = manager.list_agents()?;
        let idle_agents: Vec<_> = agents
            .iter()
            .filter(|a| a.status == "idle" && a.config.auto_assign)
            .collect();

        // Assign tasks to agents
        for (task, agent) in pending_tasks.iter().zip(idle_agents.iter()) {
            // Update task status
            manager.update_task_status(&task.id, "assigned")?;

            // Update agent status
            manager.update_agent(&agent.id, None, Some("working"))?;

            log::info!("Assigned task {} to agent {}", task.id, agent.id);

            // TODO: Actually execute the task with Claude API
            // For now, just mark it as completed after a delay
            let task_id = task.id.clone();
            let agent_id = agent.id.clone();
            let manager_clone = Arc::clone(manager);

            tauri::async_runtime::spawn(async move {
                // Simulate task execution
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

                // Mark task as completed
                let _ = manager_clone.update_task_status(&task_id, "completed");
                let _ = manager_clone.update_agent(&agent_id, None, Some("idle"));

                log::info!("Task {} completed by agent {}", task_id, agent_id);
            });
        }

        Ok(())
    }
}
