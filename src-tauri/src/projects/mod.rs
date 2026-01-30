//! Projects module for Claud.io
//!
//! Manages code and content projects, file trees, and git operations.

pub mod commands;
mod manager;

pub use manager::ProjectManager;
