-- Carousels table
CREATE TABLE IF NOT EXISTS carousels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    project_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Carousel slides
CREATE TABLE IF NOT EXISTS carousel_slides (
    id TEXT PRIMARY KEY,
    carousel_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    content TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    style TEXT NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL,
    FOREIGN KEY (carousel_id) REFERENCES carousels(id) ON DELETE CASCADE
);

-- Copy results
CREATE TABLE IF NOT EXISTS copy_results (
    id TEXT PRIMARY KEY,
    request TEXT NOT NULL,
    content TEXT NOT NULL,
    variations TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL,
    rating INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carousels_project ON carousels(project_id);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_carousel ON carousel_slides(carousel_id);
CREATE INDEX IF NOT EXISTS idx_copy_results_created ON copy_results(created_at DESC);
