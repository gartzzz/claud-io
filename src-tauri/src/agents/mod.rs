//! Agents module for Claud.io
//!
//! Manages autonomous agents, task queue, and execution runtime.

pub mod commands;
mod manager;
mod runtime;

pub use manager::AgentManager;
pub use runtime::AgentRuntime;
