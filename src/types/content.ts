/**
 * Content types for Claud.io
 */

export interface CarouselSlide {
  id: string;
  type: 'text' | 'image' | 'mixed';
  content: string;
  imageUrl?: string;
  style: SlideStyle;
  order: number;
}

export interface SlideStyle {
  backgroundColor: string;
  textColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  alignment: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'medium' | 'bold';
  padding?: string;
}

export type CarouselPlatform = 'instagram' | 'linkedin' | 'twitter';

export interface Carousel {
  id: string;
  title: string;
  slides: CarouselSlide[];
  platform: CarouselPlatform;
  createdAt: number;
  updatedAt: number;
  projectId?: string;
  status: 'draft' | 'ready' | 'exported';
}

export type CopyType = 'tweet' | 'linkedin_post' | 'email' | 'ad_copy' | 'blog_intro' | 'newsletter';
export type CopyTone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational';
export type CopyLength = 'short' | 'medium' | 'long';

export interface CopyRequest {
  type: CopyType;
  topic: string;
  tone: CopyTone;
  length: CopyLength;
  context?: string;
  keywords?: string[];
  targetAudience?: string;
}

export interface CopyResult {
  id: string;
  request: CopyRequest;
  content: string;
  variations: string[];
  createdAt: number;
  rating?: number;
}

export interface ContentState {
  carousels: Carousel[];
  copyResults: CopyResult[];
  activeCarouselId: string | null;
  isGenerating: boolean;
  generationProgress: number;
}

export interface ContentActions {
  createCarousel: (title: string, platform: CarouselPlatform) => Carousel;
  updateCarousel: (id: string, updates: Partial<Carousel>) => void;
  deleteCarousel: (id: string) => void;
  updateSlide: (carouselId: string, slideId: string, updates: Partial<CarouselSlide>) => void;
  addSlide: (carouselId: string, slide: Omit<CarouselSlide, 'id'>) => void;
  removeSlide: (carouselId: string, slideId: string) => void;
  reorderSlides: (carouselId: string, slideIds: string[]) => void;
  generateCopy: (request: CopyRequest) => Promise<CopyResult>;
  generateCarouselContent: (carouselId: string, topic: string) => Promise<void>;
  exportCarousel: (id: string, format: 'png' | 'pdf') => Promise<string>;
  setActiveCarousel: (id: string | null) => void;
}
