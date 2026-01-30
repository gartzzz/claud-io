//! Agent manager implementation

use crate::db::Database;
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub agent_type: String,
    pub description: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "lastActiveAt")]
    pub last_active_at: i64,
    pub config: AgentConfig,
    pub stats: AgentStats,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AgentConfig {
    pub model: String,
    #[serde(rename = "systemPrompt")]
    pub system_prompt: String,
    pub tools: Vec<String>,
    #[serde(rename = "maxConcurrentTasks")]
    pub max_concurrent_tasks: i32,
    #[serde(rename = "autoAssign")]
    pub auto_assign: bool,
    #[serde(rename = "tokenLimit")]
    pub token_limit: Option<i32>,
    #[serde(rename = "dailyBudget")]
    pub daily_budget: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AgentStats {
    #[serde(rename = "tasksCompleted")]
    pub tasks_completed: i32,
    #[serde(rename = "tasksFailed")]
    pub tasks_failed: i32,
    #[serde(rename = "totalTokensUsed")]
    pub total_tokens_used: i64,
    #[serde(rename = "averageTaskDuration")]
    pub average_task_duration: f64,
    #[serde(rename = "userSatisfaction")]
    pub user_satisfaction: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    #[serde(rename = "agentId")]
    pub agent_id: Option<String>,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "scheduledFor")]
    pub scheduled_for: Option<i64>,
    pub deadline: Option<i64>,
    #[serde(rename = "startedAt")]
    pub started_at: Option<i64>,
    #[serde(rename = "completedAt")]
    pub completed_at: Option<i64>,
    pub result: Option<TaskResult>,
    pub logs: Vec<TaskLog>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub success: bool,
    pub output: Option<String>,
    pub error: Option<String>,
    #[serde(rename = "tokensUsed")]
    pub tokens_used: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskLog {
    pub timestamp: i64,
    pub level: String,
    pub message: String,
    pub metadata: Option<serde_json::Value>,
}

pub struct AgentManager {
    db: Database,
}

impl AgentManager {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    /// List all agents
    pub fn list_agents(&self) -> Result<Vec<Agent>, String> {
        self.db.with_conn(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT id, name, type, description, status, created_at, last_active_at, config, stats
                     FROM agents ORDER BY last_active_at DESC",
                )
                .map_err(|e| e.to_string())?;

            let agents = stmt
                .query_map([], |row| {
                    let config_json: String = row.get(7)?;
                    let stats_json: String = row.get(8)?;

                    Ok(Agent {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        agent_type: row.get(2)?,
                        description: row.get::<_, Option<String>>(3)?.unwrap_or_default(),
                        status: row.get(4)?,
                        created_at: row.get(5)?,
                        last_active_at: row.get(6)?,
                        config: serde_json::from_str(&config_json).unwrap_or_default(),
                        stats: serde_json::from_str(&stats_json).unwrap_or_default(),
                    })
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            Ok(agents)
        })
    }

    /// Create a new agent
    pub fn create_agent(&self, config: AgentConfig, name: &str, agent_type: &str) -> Result<Agent, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        let agent = Agent {
            id: id.clone(),
            name: name.to_string(),
            agent_type: agent_type.to_string(),
            description: config.system_prompt.clone(),
            status: "idle".to_string(),
            created_at: now,
            last_active_at: now,
            config,
            stats: AgentStats::default(),
        };

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO agents (id, name, type, description, status, created_at, last_active_at, config, stats)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    agent.id,
                    agent.name,
                    agent.agent_type,
                    agent.description,
                    agent.status,
                    agent.created_at,
                    agent.last_active_at,
                    serde_json::to_string(&agent.config).unwrap_or_default(),
                    serde_json::to_string(&agent.stats).unwrap_or_default(),
                ],
            )
            .map_err(|e| e.to_string())?;

            Ok(agent)
        })
    }

    /// Update an agent
    pub fn update_agent(&self, agent_id: &str, name: Option<&str>, status: Option<&str>) -> Result<(), String> {
        self.db.with_conn(|conn| {
            let now = Utc::now().timestamp();

            if let Some(name) = name {
                conn.execute(
                    "UPDATE agents SET name = ?1, last_active_at = ?2 WHERE id = ?3",
                    params![name, now, agent_id],
                )
                .map_err(|e| e.to_string())?;
            }

            if let Some(status) = status {
                conn.execute(
                    "UPDATE agents SET status = ?1, last_active_at = ?2 WHERE id = ?3",
                    params![status, now, agent_id],
                )
                .map_err(|e| e.to_string())?;
            }

            Ok(())
        })
    }

    /// Delete an agent
    pub fn delete_agent(&self, agent_id: &str) -> Result<(), String> {
        self.db.with_conn(|conn| {
            conn.execute("DELETE FROM agents WHERE id = ?1", params![agent_id])
                .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    /// List tasks, optionally filtered by agent
    pub fn list_tasks(&self, agent_id: Option<&str>) -> Result<Vec<Task>, String> {
        self.db.with_conn(|conn| {
            let query = if agent_id.is_some() {
                "SELECT id, agent_id, project_id, title, description, status, priority, created_at, scheduled_for, deadline, started_at, completed_at, result
                 FROM tasks WHERE agent_id = ?1 ORDER BY created_at DESC"
            } else {
                "SELECT id, agent_id, project_id, title, description, status, priority, created_at, scheduled_for, deadline, started_at, completed_at, result
                 FROM tasks ORDER BY created_at DESC"
            };

            let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

            let tasks = if let Some(aid) = agent_id {
                stmt.query_map(params![aid], Self::map_task_row)
            } else {
                stmt.query_map([], Self::map_task_row)
            }
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

            Ok(tasks)
        })
    }

    fn map_task_row(row: &rusqlite::Row) -> rusqlite::Result<Task> {
        let result_json: Option<String> = row.get(12)?;
        let result = result_json.and_then(|j| serde_json::from_str(&j).ok());

        Ok(Task {
            id: row.get(0)?,
            agent_id: row.get(1)?,
            project_id: row.get(2)?,
            title: row.get(3)?,
            description: row.get(4)?,
            status: row.get(5)?,
            priority: row.get(6)?,
            created_at: row.get(7)?,
            scheduled_for: row.get(8)?,
            deadline: row.get(9)?,
            started_at: row.get(10)?,
            completed_at: row.get(11)?,
            result,
            logs: vec![], // TODO: Load logs separately
        })
    }

    /// Create a new task
    pub fn create_task(&self, task: &Task) -> Result<Task, String> {
        let id = if task.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            task.id.clone()
        };
        let now = Utc::now().timestamp();

        let new_task = Task {
            id: id.clone(),
            created_at: now,
            status: "pending".to_string(),
            ..task.clone()
        };

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO tasks (id, agent_id, project_id, title, description, status, priority, created_at, scheduled_for, deadline)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                params![
                    new_task.id,
                    new_task.agent_id,
                    new_task.project_id,
                    new_task.title,
                    new_task.description,
                    new_task.status,
                    new_task.priority,
                    new_task.created_at,
                    new_task.scheduled_for,
                    new_task.deadline,
                ],
            )
            .map_err(|e| e.to_string())?;

            Ok(new_task)
        })
    }

    /// Update task status
    pub fn update_task_status(&self, task_id: &str, status: &str) -> Result<(), String> {
        self.db.with_conn(|conn| {
            let now = Utc::now().timestamp();

            match status {
                "running" => {
                    conn.execute(
                        "UPDATE tasks SET status = ?1, started_at = ?2 WHERE id = ?3",
                        params![status, now, task_id],
                    )
                    .map_err(|e| e.to_string())?;
                }
                "completed" | "failed" | "cancelled" => {
                    conn.execute(
                        "UPDATE tasks SET status = ?1, completed_at = ?2 WHERE id = ?3",
                        params![status, now, task_id],
                    )
                    .map_err(|e| e.to_string())?;
                }
                _ => {
                    conn.execute(
                        "UPDATE tasks SET status = ?1 WHERE id = ?2",
                        params![status, task_id],
                    )
                    .map_err(|e| e.to_string())?;
                }
            }

            Ok(())
        })
    }

    /// Cancel a task
    pub fn cancel_task(&self, task_id: &str) -> Result<(), String> {
        self.update_task_status(task_id, "cancelled")
    }

    /// Get agent logs
    pub fn get_agent_logs(&self, agent_id: &str, limit: i32) -> Result<Vec<TaskLog>, String> {
        self.db.with_conn(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT tl.timestamp, tl.level, tl.message, tl.metadata
                     FROM task_logs tl
                     INNER JOIN tasks t ON tl.task_id = t.id
                     WHERE t.agent_id = ?1
                     ORDER BY tl.timestamp DESC
                     LIMIT ?2",
                )
                .map_err(|e| e.to_string())?;

            let logs = stmt
                .query_map(params![agent_id, limit], |row| {
                    let metadata_json: Option<String> = row.get(3)?;
                    Ok(TaskLog {
                        timestamp: row.get(0)?,
                        level: row.get(1)?,
                        message: row.get(2)?,
                        metadata: metadata_json.and_then(|j| serde_json::from_str(&j).ok()),
                    })
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            Ok(logs)
        })
    }
}
