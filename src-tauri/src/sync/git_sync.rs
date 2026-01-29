//! Git sync module
//!
//! Handles git operations for the MR-AGENTS repository.

use git2::{Repository, FetchOptions, RemoteCallbacks};
use serde::{Deserialize, Serialize};
use std::path::Path;

/// Result of a git sync operation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitSyncResult {
    pub success: bool,
    pub message: String,
    pub previous_commit: Option<String>,
    pub current_commit: Option<String>,
    pub files_changed: u32,
}

/// Get the current HEAD commit hash
pub fn get_current_commit(repo_path: &Path) -> Result<String, String> {
    let repo = Repository::open(repo_path).map_err(|e| format!("Failed to open repo: {}", e))?;

    let head = repo
        .head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;

    let commit = head
        .peel_to_commit()
        .map_err(|e| format!("Failed to get commit: {}", e))?;

    Ok(commit.id().to_string())
}

/// Pull latest changes from remote
pub fn pull_repository(repo_path: &Path) -> Result<GitSyncResult, String> {
    let repo = Repository::open(repo_path).map_err(|e| format!("Failed to open repo: {}", e))?;

    // Get current commit before pull
    let previous_commit = get_current_commit(repo_path).ok();

    // Find the remote (usually "origin")
    let mut remote = repo
        .find_remote("origin")
        .map_err(|e| format!("Failed to find remote 'origin': {}", e))?;

    // Set up fetch options
    let mut callbacks = RemoteCallbacks::new();
    callbacks.transfer_progress(|progress| {
        log::debug!(
            "Fetching: {}/{}",
            progress.received_objects(),
            progress.total_objects()
        );
        true
    });

    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    // Fetch from remote
    remote
        .fetch(&["main"], Some(&mut fetch_options), None)
        .map_err(|e| format!("Failed to fetch: {}", e))?;

    // Get the fetch head
    let fetch_head = repo
        .find_reference("FETCH_HEAD")
        .map_err(|e| format!("Failed to find FETCH_HEAD: {}", e))?;

    let fetch_commit = repo
        .reference_to_annotated_commit(&fetch_head)
        .map_err(|e| format!("Failed to get fetch commit: {}", e))?;

    // Perform fast-forward merge if possible
    let analysis = repo
        .merge_analysis(&[&fetch_commit])
        .map_err(|e| format!("Merge analysis failed: {}", e))?;

    if analysis.0.is_up_to_date() {
        return Ok(GitSyncResult {
            success: true,
            message: "Already up to date".to_string(),
            previous_commit: previous_commit.clone(),
            current_commit: previous_commit,
            files_changed: 0,
        });
    }

    if analysis.0.is_fast_forward() {
        // Fast-forward merge
        let refname = "refs/heads/main";
        let mut reference = repo
            .find_reference(refname)
            .map_err(|e| format!("Failed to find reference: {}", e))?;

        reference
            .set_target(fetch_commit.id(), "Fast-forward")
            .map_err(|e| format!("Failed to set target: {}", e))?;

        repo.set_head(refname)
            .map_err(|e| format!("Failed to set HEAD: {}", e))?;

        repo.checkout_head(Some(git2::build::CheckoutBuilder::default().force()))
            .map_err(|e| format!("Failed to checkout: {}", e))?;

        let current_commit = get_current_commit(repo_path).ok();

        Ok(GitSyncResult {
            success: true,
            message: "Successfully pulled latest changes".to_string(),
            previous_commit,
            current_commit,
            files_changed: 0, // Would need diff to count
        })
    } else {
        Err("Cannot fast-forward, manual merge required".to_string())
    }
}

/// Check if repository has uncommitted changes
pub fn has_uncommitted_changes(repo_path: &Path) -> Result<bool, String> {
    let repo = Repository::open(repo_path).map_err(|e| format!("Failed to open repo: {}", e))?;

    let statuses = repo
        .statuses(None)
        .map_err(|e| format!("Failed to get status: {}", e))?;

    Ok(!statuses.is_empty())
}

/// Get the repository status summary
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RepoStatus {
    pub branch: String,
    pub commit: String,
    pub has_changes: bool,
    pub ahead: u32,
    pub behind: u32,
}

pub fn get_repo_status(repo_path: &Path) -> Result<RepoStatus, String> {
    let repo = Repository::open(repo_path).map_err(|e| format!("Failed to open repo: {}", e))?;

    let head = repo
        .head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;

    let branch = head
        .shorthand()
        .unwrap_or("unknown")
        .to_string();

    let commit = head
        .peel_to_commit()
        .map(|c| c.id().to_string()[..7].to_string())
        .unwrap_or_default();

    let has_changes = has_uncommitted_changes(repo_path).unwrap_or(false);

    Ok(RepoStatus {
        branch,
        commit,
        has_changes,
        ahead: 0,
        behind: 0,
    })
}
