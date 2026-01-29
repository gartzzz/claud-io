//! Database schema and migrations for Claud.io

use rusqlite::{Connection, Result};
use chrono::Utc;

/// Run all database migrations
pub fn run_migrations(conn: &Connection) -> Result<()> {
    let migrations: Vec<(&str, &str)> = vec![
        ("001_projects", include_str!("migrations/001_projects.sql")),
        ("002_agents", include_str!("migrations/002_agents.sql")),
        ("003_content", include_str!("migrations/003_content.sql")),
        ("004_sync", include_str!("migrations/004_sync.sql")),
    ];

    for (name, sql) in migrations {
        // Check if migration was already applied
        let applied: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM migrations WHERE name = ?1)",
                [name],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if !applied {
            log::info!("Running migration: {}", name);

            // Execute migration
            conn.execute_batch(sql)?;

            // Record migration
            conn.execute(
                "INSERT INTO migrations (name, applied_at) VALUES (?1, ?2)",
                rusqlite::params![name, Utc::now().timestamp()],
            )?;
        }
    }

    Ok(())
}
