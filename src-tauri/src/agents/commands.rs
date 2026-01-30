//! Tauri commands for agents module

use super::manager::{Agent, AgentConfig, AgentManager, Task, TaskLog};
use std::sync::Arc;
use tauri::State;

#[derive(serde::Deserialize)]
pub struct CreateAgentInput {
    pub name: String,
    #[serde(rename = "type")]
    pub agent_type: String,
    #[serde(flatten)]
    pub config: AgentConfig,
}

#[tauri::command]
pub fn agent_list(manager: State<'_, Arc<AgentManager>>) -> Result<Vec<Agent>, String> {
    manager.list_agents()
}

#[tauri::command]
pub fn agent_create(
    manager: State<'_, Arc<AgentManager>>,
    config: CreateAgentInput,
) -> Result<Agent, String> {
    manager.create_agent(config.config, &config.name, &config.agent_type)
}

#[tauri::command]
pub fn agent_update(
    manager: State<'_, Arc<AgentManager>>,
    agent_id: String,
    updates: serde_json::Value,
) -> Result<(), String> {
    let name = updates.get("name").and_then(|v| v.as_str());
    let status = updates.get("status").and_then(|v| v.as_str());
    manager.update_agent(&agent_id, name, status)
}

#[tauri::command]
pub fn agent_delete(manager: State<'_, Arc<AgentManager>>, agent_id: String) -> Result<(), String> {
    manager.delete_agent(&agent_id)
}

#[tauri::command]
pub fn agent_start(manager: State<'_, Arc<AgentManager>>, agent_id: String) -> Result<(), String> {
    manager.update_agent(&agent_id, None, Some("idle"))
}

#[tauri::command]
pub fn agent_stop(manager: State<'_, Arc<AgentManager>>, agent_id: String) -> Result<(), String> {
    manager.update_agent(&agent_id, None, Some("idle"))
}

#[tauri::command]
pub fn agent_pause(manager: State<'_, Arc<AgentManager>>, agent_id: String) -> Result<(), String> {
    manager.update_agent(&agent_id, None, Some("paused"))
}

#[tauri::command]
pub fn agent_get_logs(
    manager: State<'_, Arc<AgentManager>>,
    agent_id: String,
    limit: Option<i32>,
) -> Result<Vec<TaskLog>, String> {
    manager.get_agent_logs(&agent_id, limit.unwrap_or(100))
}

#[tauri::command]
pub fn task_list(
    manager: State<'_, Arc<AgentManager>>,
    agent_id: Option<String>,
) -> Result<Vec<Task>, String> {
    manager.list_tasks(agent_id.as_deref())
}

#[tauri::command]
pub fn task_create(manager: State<'_, Arc<AgentManager>>, task: Task) -> Result<Task, String> {
    manager.create_task(&task)
}

#[tauri::command]
pub fn task_cancel(manager: State<'_, Arc<AgentManager>>, task_id: String) -> Result<(), String> {
    manager.cancel_task(&task_id)
}
