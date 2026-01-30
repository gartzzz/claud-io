//! Database module for Claud.io
//!
//! Provides SQLite database access for projects, agents, tasks, and content.

pub mod schema;

use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::Arc;
use parking_lot::Mutex;

/// Database wrapper with thread-safe connection
pub struct Database {
    conn: Arc<Mutex<Connection>>,
    path: PathBuf,
}

impl Database {
    /// Create or open the database at the given path
    pub fn new(app_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_dir).ok();
        let db_path = app_dir.join("claud-io.db");

        let conn = Connection::open(&db_path)?;

        // Enable WAL mode for better concurrent access
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;

        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
            path: db_path,
        };

        // Run migrations
        db.run_migrations()?;

        Ok(db)
    }

    /// Run all database migrations
    fn run_migrations(&self) -> Result<()> {
        let conn = self.conn.lock();

        // Create migrations table if not exists
        conn.execute(
            "CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                applied_at INTEGER NOT NULL
            )",
            [],
        )?;

        // Run each migration
        schema::run_migrations(&conn)?;

        Ok(())
    }

    /// Execute a function with the database connection
    pub fn with_conn<F, T>(&self, f: F) -> T
    where
        F: FnOnce(&Connection) -> T,
    {
        let conn = self.conn.lock();
        f(&conn)
    }

    /// Get the database file path
    pub fn path(&self) -> &PathBuf {
        &self.path
    }
}

impl Clone for Database {
    fn clone(&self) -> Self {
        Self {
            conn: Arc::clone(&self.conn),
            path: self.path.clone(),
        }
    }
}
