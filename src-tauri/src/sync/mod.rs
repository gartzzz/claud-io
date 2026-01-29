//! Folder synchronization module
//!
//! Handles auto-sync of PROJECTS folder and manual sync of MR-AGENTS repo.

pub mod agent_parser;
pub mod commands;
pub mod git_sync;
pub mod project_discovery;
pub mod watcher;
