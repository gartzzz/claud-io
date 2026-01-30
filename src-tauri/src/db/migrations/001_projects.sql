-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'code',
    description TEXT,
    git_remote TEXT,
    last_opened INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    settings TEXT NOT NULL DEFAULT '{}'
);

-- Project tags
CREATE TABLE IF NOT EXISTS project_tags (
    project_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (project_id, tag),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Index for quick project lookups
CREATE INDEX IF NOT EXISTS idx_projects_last_opened ON projects(last_opened DESC);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
