//! Content manager implementation

use crate::db::Database;
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Carousel {
    pub id: String,
    pub title: String,
    pub platform: String,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
    pub slides: Vec<CarouselSlide>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CarouselSlide {
    pub id: String,
    #[serde(rename = "type")]
    pub slide_type: String,
    pub content: String,
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    pub style: SlideStyle,
    pub order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SlideStyle {
    #[serde(rename = "backgroundColor")]
    pub background_color: String,
    #[serde(rename = "textColor")]
    pub text_color: String,
    #[serde(rename = "fontSize")]
    pub font_size: String,
    pub alignment: String,
    #[serde(rename = "fontWeight")]
    pub font_weight: Option<String>,
    pub padding: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopyRequest {
    #[serde(rename = "type")]
    pub copy_type: String,
    pub topic: String,
    pub tone: String,
    pub length: String,
    pub context: Option<String>,
    pub keywords: Option<Vec<String>>,
    #[serde(rename = "targetAudience")]
    pub target_audience: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopyResult {
    pub id: String,
    pub request: CopyRequest,
    pub content: String,
    pub variations: Vec<String>,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    pub rating: Option<i32>,
}

pub struct ContentManager {
    db: Database,
}

impl ContentManager {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    /// List all carousels
    pub fn list_carousels(&self) -> Result<Vec<Carousel>, String> {
        self.db.with_conn(|conn| {
            let mut carousel_stmt = conn
                .prepare(
                    "SELECT id, title, platform, project_id, status, created_at, updated_at
                     FROM carousels ORDER BY updated_at DESC",
                )
                .map_err(|e| e.to_string())?;

            let carousels: Vec<_> = carousel_stmt
                .query_map([], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                        row.get::<_, Option<String>>(3)?,
                        row.get::<_, String>(4)?,
                        row.get::<_, i64>(5)?,
                        row.get::<_, i64>(6)?,
                    ))
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            let mut result = Vec::new();
            for (id, title, platform, project_id, status, created_at, updated_at) in carousels {
                // Load slides for this carousel
                let slides = self.load_slides(conn, &id)?;

                result.push(Carousel {
                    id,
                    title,
                    platform,
                    project_id,
                    status,
                    created_at,
                    updated_at,
                    slides,
                });
            }

            Ok(result)
        })
    }

    fn load_slides(&self, conn: &rusqlite::Connection, carousel_id: &str) -> Result<Vec<CarouselSlide>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, type, content, image_url, style, \"order\"
                 FROM carousel_slides WHERE carousel_id = ?1 ORDER BY \"order\"",
            )
            .map_err(|e| e.to_string())?;

        let slides = stmt
            .query_map(params![carousel_id], |row| {
                let style_json: String = row.get(4)?;
                let style: SlideStyle = serde_json::from_str(&style_json).unwrap_or_default();

                Ok(CarouselSlide {
                    id: row.get(0)?,
                    slide_type: row.get(1)?,
                    content: row.get(2)?,
                    image_url: row.get(3)?,
                    style,
                    order: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        Ok(slides)
    }

    /// Create a new carousel
    pub fn create_carousel(&self, title: &str, platform: &str) -> Result<Carousel, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        let carousel = Carousel {
            id: id.clone(),
            title: title.to_string(),
            platform: platform.to_string(),
            project_id: None,
            status: "draft".to_string(),
            created_at: now,
            updated_at: now,
            slides: vec![],
        };

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO carousels (id, title, platform, status, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    carousel.id,
                    carousel.title,
                    carousel.platform,
                    carousel.status,
                    carousel.created_at,
                    carousel.updated_at,
                ],
            )
            .map_err(|e| e.to_string())?;

            Ok(carousel)
        })
    }

    /// Add a slide to a carousel
    pub fn add_slide(&self, carousel_id: &str, slide: &CarouselSlide) -> Result<CarouselSlide, String> {
        let id = if slide.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            slide.id.clone()
        };

        let new_slide = CarouselSlide {
            id: id.clone(),
            ..slide.clone()
        };

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO carousel_slides (id, carousel_id, type, content, image_url, style, \"order\")
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    new_slide.id,
                    carousel_id,
                    new_slide.slide_type,
                    new_slide.content,
                    new_slide.image_url,
                    serde_json::to_string(&new_slide.style).unwrap_or_default(),
                    new_slide.order,
                ],
            )
            .map_err(|e| e.to_string())?;

            // Update carousel's updated_at
            let now = Utc::now().timestamp();
            conn.execute(
                "UPDATE carousels SET updated_at = ?1 WHERE id = ?2",
                params![now, carousel_id],
            )
            .map_err(|e| e.to_string())?;

            Ok(new_slide)
        })
    }

    /// Generate copy (placeholder - would use Claude API)
    pub fn generate_copy(&self, request: &CopyRequest) -> Result<CopyResult, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        // Placeholder content generation
        let content = format!(
            "Generated {} about \"{}\" in {} tone ({} length).",
            request.copy_type, request.topic, request.tone, request.length
        );

        let result = CopyResult {
            id: id.clone(),
            request: request.clone(),
            content,
            variations: vec![],
            created_at: now,
            rating: None,
        };

        self.db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO copy_results (id, request, content, variations, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![
                    result.id,
                    serde_json::to_string(&result.request).unwrap_or_default(),
                    result.content,
                    serde_json::to_string(&result.variations).unwrap_or_default(),
                    result.created_at,
                ],
            )
            .map_err(|e| e.to_string())?;

            Ok(result)
        })
    }

    /// List copy results
    pub fn list_copy_results(&self) -> Result<Vec<CopyResult>, String> {
        self.db.with_conn(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT id, request, content, variations, created_at, rating
                     FROM copy_results ORDER BY created_at DESC",
                )
                .map_err(|e| e.to_string())?;

            let results = stmt
                .query_map([], |row| {
                    let request_json: String = row.get(1)?;
                    let variations_json: String = row.get(3)?;

                    Ok(CopyResult {
                        id: row.get(0)?,
                        request: serde_json::from_str(&request_json).unwrap_or_else(|_| CopyRequest {
                            copy_type: "unknown".to_string(),
                            topic: "".to_string(),
                            tone: "".to_string(),
                            length: "".to_string(),
                            context: None,
                            keywords: None,
                            target_audience: None,
                        }),
                        content: row.get(2)?,
                        variations: serde_json::from_str(&variations_json).unwrap_or_default(),
                        created_at: row.get(4)?,
                        rating: row.get(5)?,
                    })
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            Ok(results)
        })
    }
}
