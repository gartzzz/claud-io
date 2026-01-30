//! Tauri commands for content module

use super::manager::{Carousel, CarouselSlide, ContentManager, CopyRequest, CopyResult};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn content_list_carousels(
    manager: State<'_, Arc<ContentManager>>,
) -> Result<Vec<Carousel>, String> {
    manager.list_carousels()
}

#[tauri::command]
pub fn content_create_carousel(
    manager: State<'_, Arc<ContentManager>>,
    title: String,
    platform: String,
) -> Result<Carousel, String> {
    manager.create_carousel(&title, &platform)
}

#[tauri::command]
pub fn content_add_slide(
    manager: State<'_, Arc<ContentManager>>,
    carousel_id: String,
    slide: CarouselSlide,
) -> Result<CarouselSlide, String> {
    manager.add_slide(&carousel_id, &slide)
}

#[tauri::command]
pub fn content_generate_copy(
    manager: State<'_, Arc<ContentManager>>,
    request: CopyRequest,
) -> Result<CopyResult, String> {
    manager.generate_copy(&request)
}

#[tauri::command]
pub fn content_list_copy_results(
    manager: State<'_, Arc<ContentManager>>,
) -> Result<Vec<CopyResult>, String> {
    manager.list_copy_results()
}

#[tauri::command]
pub fn content_generate_carousel(
    _carousel_id: String,
    _topic: String,
) -> Result<Vec<CarouselSlide>, String> {
    // Placeholder - would use Claude API to generate content
    Ok(vec![])
}

#[tauri::command]
pub fn content_export_carousel(
    _carousel_id: String,
    _format: String,
) -> Result<String, String> {
    // Placeholder - would export to PNG/PDF
    Err("Export not yet implemented".to_string())
}
