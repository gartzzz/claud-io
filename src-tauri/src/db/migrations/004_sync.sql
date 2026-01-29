-- Migration 004: Sync tables for project discovery and agent definitions
-- Auto-synced from PROYECTOS and MR-AGENTS folders

-- Discovered projects (auto-synced from PROYECTOS folder)
CREATE TABLE IF NOT EXISTS discovered_projects (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    project_type TEXT,  -- 'node', 'rust', 'python', 'go', 'unknown'
    has_git INTEGER DEFAULT 0,
    last_modified INTEGER,
    discovered_at INTEGER NOT NULL
);

-- Agent definitions (parsed from MR-AGENTS repo)
CREATE TABLE IF NOT EXISTS agent_definitions (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    model TEXT DEFAULT 'sonnet',
    mode TEXT DEFAULT 'normal',
    system_prompt TEXT NOT NULL,
    parsed_at INTEGER NOT NULL,
    repo_commit TEXT  -- Git commit hash when parsed
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_discovered_projects_path ON discovered_projects(path);
CREATE INDEX IF NOT EXISTS idx_discovered_projects_type ON discovered_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_agent_definitions_name ON agent_definitions(name);
