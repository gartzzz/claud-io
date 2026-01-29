use super::session::{Session, SessionInfo};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

pub struct SessionManager {
    sessions: RwLock<HashMap<String, Arc<Session>>>,
    active_session: RwLock<Option<String>>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: RwLock::new(HashMap::new()),
            active_session: RwLock::new(None),
        }
    }

    pub fn create_session(
        &self,
        cols: u16,
        rows: u16,
        command: Option<&str>,
    ) -> Result<SessionInfo, String> {
        let id = Uuid::new_v4().to_string();
        let session = Session::new(id.clone(), cols, rows, command)?;
        let session = Arc::new(session);
        let info = session.info(true);

        {
            let mut sessions = self.sessions.write();
            sessions.insert(id.clone(), session);
        }

        {
            let mut active = self.active_session.write();
            *active = Some(id);
        }

        Ok(info)
    }

    pub fn get_session(&self, id: &str) -> Option<Arc<Session>> {
        self.sessions.read().get(id).cloned()
    }

    pub fn kill_session(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.write();
        if sessions.remove(id).is_some() {
            let mut active = self.active_session.write();
            if active.as_ref().map(|s| s == id).unwrap_or(false) {
                // Set another session as active, or None
                *active = sessions.keys().next().cloned();
            }
            Ok(())
        } else {
            Err(format!("Session {} not found", id))
        }
    }

    pub fn set_active_session(&self, id: &str) -> Result<(), String> {
        let sessions = self.sessions.read();
        if sessions.contains_key(id) {
            let mut active = self.active_session.write();
            *active = Some(id.to_string());
            Ok(())
        } else {
            Err(format!("Session {} not found", id))
        }
    }

    pub fn get_active_session(&self) -> Option<Arc<Session>> {
        let active_id = self.active_session.read().clone()?;
        self.get_session(&active_id)
    }

    pub fn get_active_session_id(&self) -> Option<String> {
        self.active_session.read().clone()
    }

    pub fn list_sessions(&self) -> Vec<SessionInfo> {
        let sessions = self.sessions.read();
        let active_id = self.active_session.read();

        sessions
            .values()
            .map(|s| s.info(active_id.as_ref().map(|a| a == &s.id).unwrap_or(false)))
            .collect()
    }

    pub fn session_count(&self) -> usize {
        self.sessions.read().len()
    }
}

impl Default for SessionManager {
    fn default() -> Self {
        Self::new()
    }
}
