/**
 * Content slice - manages carousels and copy generation
 */

import { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Carousel, CarouselSlide, CarouselPlatform, CopyRequest, CopyResult, SlideStyle } from '@/types/content';

export interface ContentSlice {
  // State
  carousels: Carousel[];
  copyResults: CopyResult[];
  activeCarouselId: string | null;
  isGenerating: boolean;
  generationProgress: number;

  // Actions
  loadCarousels: () => Promise<void>;
  createCarousel: (title: string, platform: CarouselPlatform) => Carousel;
  updateCarousel: (id: string, updates: Partial<Carousel>) => void;
  deleteCarousel: (id: string) => void;
  setActiveCarousel: (id: string | null) => void;

  // Slide actions
  addSlide: (carouselId: string, slide?: Partial<Omit<CarouselSlide, 'id'>>) => void;
  updateSlide: (carouselId: string, slideId: string, updates: Partial<CarouselSlide>) => void;
  removeSlide: (carouselId: string, slideId: string) => void;
  reorderSlides: (carouselId: string, slideIds: string[]) => void;
  duplicateSlide: (carouselId: string, slideId: string) => void;

  // Generation actions
  generateCopy: (request: CopyRequest) => Promise<CopyResult>;
  generateCarouselContent: (carouselId: string, topic: string) => Promise<void>;
  exportCarousel: (id: string, format: 'png' | 'pdf') => Promise<string>;

  // Copy history
  loadCopyResults: () => Promise<void>;
  deleteCopyResult: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const defaultSlideStyle: SlideStyle = {
  backgroundColor: '#16161C',
  textColor: '#F5A623',
  fontSize: 'md',
  alignment: 'center',
  fontWeight: 'normal',
};

export const createContentSlice: StateCreator<
  ContentSlice,
  [['zustand/immer', never]],
  [],
  ContentSlice
> = (set, get) => ({
  // Initial state
  carousels: [],
  copyResults: [],
  activeCarouselId: null,
  isGenerating: false,
  generationProgress: 0,

  // Actions
  loadCarousels: async () => {
    try {
      const carousels = await invoke<Carousel[]>('content_list_carousels');
      set((state) => {
        state.carousels = carousels;
      });
    } catch (error) {
      console.error('Failed to load carousels:', error);
    }
  },

  createCarousel: (title: string, platform: CarouselPlatform) => {
    const carousel: Carousel = {
      id: generateId(),
      title,
      platform,
      slides: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
    };

    set((state) => {
      state.carousels.push(carousel);
      state.activeCarouselId = carousel.id;
    });

    // Add initial slide
    get().addSlide(carousel.id);

    return carousel;
  },

  updateCarousel: (id: string, updates: Partial<Carousel>) => {
    set((state) => {
      const carousel = state.carousels.find((c) => c.id === id);
      if (carousel) {
        Object.assign(carousel, updates, { updatedAt: Date.now() });
      }
    });
  },

  deleteCarousel: (id: string) => {
    set((state) => {
      state.carousels = state.carousels.filter((c) => c.id !== id);
      if (state.activeCarouselId === id) {
        state.activeCarouselId = null;
      }
    });
  },

  setActiveCarousel: (id: string | null) => {
    set((state) => {
      state.activeCarouselId = id;
    });
  },

  addSlide: (carouselId: string, slide?: Partial<Omit<CarouselSlide, 'id'>>) => {
    set((state) => {
      const carousel = state.carousels.find((c) => c.id === carouselId);
      if (carousel) {
        const newSlide: CarouselSlide = {
          id: generateId(),
          type: slide?.type || 'text',
          content: slide?.content || '',
          imageUrl: slide?.imageUrl,
          style: slide?.style || { ...defaultSlideStyle },
          order: carousel.slides.length,
        };
        carousel.slides.push(newSlide);
        carousel.updatedAt = Date.now();
      }
    });
  },

  updateSlide: (carouselId: string, slideId: string, updates: Partial<CarouselSlide>) => {
    set((state) => {
      const carousel = state.carousels.find((c) => c.id === carouselId);
      if (carousel) {
        const slide = carousel.slides.find((s) => s.id === slideId);
        if (slide) {
          Object.assign(slide, updates);
          carousel.updatedAt = Date.now();
        }
      }
    });
  },

  removeSlide: (carouselId: string, slideId: string) => {
    set((state) => {
      const carousel = state.carousels.find((c) => c.id === carouselId);
      if (carousel) {
        carousel.slides = carousel.slides.filter((s) => s.id !== slideId);
        // Reorder remaining slides
        carousel.slides.forEach((s, i) => {
          s.order = i;
        });
        carousel.updatedAt = Date.now();
      }
    });
  },

  reorderSlides: (carouselId: string, slideIds: string[]) => {
    set((state) => {
      const carousel = state.carousels.find((c) => c.id === carouselId);
      if (carousel) {
        const orderedSlides = slideIds
          .map((id) => carousel.slides.find((s) => s.id === id))
          .filter((s): s is CarouselSlide => s !== undefined)
          .map((s, i) => ({ ...s, order: i }));
        carousel.slides = orderedSlides;
        carousel.updatedAt = Date.now();
      }
    });
  },

  duplicateSlide: (carouselId: string, slideId: string) => {
    set((state) => {
      const carousel = state.carousels.find((c) => c.id === carouselId);
      if (carousel) {
        const slide = carousel.slides.find((s) => s.id === slideId);
        if (slide) {
          const newSlide: CarouselSlide = {
            ...slide,
            id: generateId(),
            order: carousel.slides.length,
          };
          carousel.slides.push(newSlide);
          carousel.updatedAt = Date.now();
        }
      }
    });
  },

  generateCopy: async (request: CopyRequest) => {
    set((state) => {
      state.isGenerating = true;
      state.generationProgress = 0;
    });

    try {
      const result = await invoke<CopyResult>('content_generate_copy', { request });

      set((state) => {
        state.copyResults.unshift(result);
        state.isGenerating = false;
        state.generationProgress = 100;
      });

      return result;
    } catch (error) {
      console.error('Failed to generate copy:', error);
      set((state) => {
        state.isGenerating = false;
        state.generationProgress = 0;
      });

      // Return a placeholder result if backend not ready
      const result: CopyResult = {
        id: generateId(),
        request,
        content: `Generated ${request.type} about "${request.topic}" in ${request.tone} tone.`,
        variations: [],
        createdAt: Date.now(),
      };

      set((state) => {
        state.copyResults.unshift(result);
      });

      return result;
    }
  },

  generateCarouselContent: async (carouselId: string, topic: string) => {
    set((state) => {
      state.isGenerating = true;
      state.generationProgress = 0;
    });

    try {
      const slides = await invoke<CarouselSlide[]>('content_generate_carousel', {
        carouselId,
        topic
      });

      set((state) => {
        const carousel = state.carousels.find((c) => c.id === carouselId);
        if (carousel) {
          carousel.slides = slides;
          carousel.updatedAt = Date.now();
        }
        state.isGenerating = false;
        state.generationProgress = 100;
      });
    } catch (error) {
      console.error('Failed to generate carousel content:', error);
      set((state) => {
        state.isGenerating = false;
        state.generationProgress = 0;
      });
    }
  },

  exportCarousel: async (id: string, format: 'png' | 'pdf') => {
    try {
      const path = await invoke<string>('content_export_carousel', {
        carouselId: id,
        format
      });

      set((state) => {
        const carousel = state.carousels.find((c) => c.id === id);
        if (carousel) {
          carousel.status = 'exported';
          carousel.updatedAt = Date.now();
        }
      });

      return path;
    } catch (error) {
      console.error('Failed to export carousel:', error);
      throw error;
    }
  },

  loadCopyResults: async () => {
    try {
      const results = await invoke<CopyResult[]>('content_list_copy_results');
      set((state) => {
        state.copyResults = results;
      });
    } catch (error) {
      console.error('Failed to load copy results:', error);
    }
  },

  deleteCopyResult: (id: string) => {
    set((state) => {
      state.copyResults = state.copyResults.filter((r) => r.id !== id);
    });
  },
});
