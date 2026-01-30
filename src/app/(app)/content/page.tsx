'use client';

/**
 * Content Page - Content generation tools
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { CarouselPlatform, CopyType, CopyTone, CopyLength } from '@/types/content';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'carousel' | 'copy'>('carousel');

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-mono text-lg text-smoke-bright">
            <span className="text-smoke-dim">// </span>Content Tools
          </h1>
          <p className="font-mono text-sm text-smoke-dim mt-1">
            Generate carousels, copy, and more
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-void-lighter/30 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('carousel')}
          className={`
            px-4 py-2 rounded-md font-mono text-sm transition-colors
            ${activeTab === 'carousel' ? 'bg-amber-electric/20 text-amber-electric' : 'text-smoke-mid hover:text-smoke-bright'}
          `}
        >
          Carousel Editor
        </button>
        <button
          onClick={() => setActiveTab('copy')}
          className={`
            px-4 py-2 rounded-md font-mono text-sm transition-colors
            ${activeTab === 'copy' ? 'bg-amber-electric/20 text-amber-electric' : 'text-smoke-mid hover:text-smoke-bright'}
          `}
        >
          Copy Generator
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'carousel' ? <CarouselEditor /> : <CopyGenerator />}
      </div>
    </div>
  );
}

function CarouselEditor() {
  const carousels = useAppStore((state) => state.carousels);
  const activeCarouselId = useAppStore((state) => state.activeCarouselId);
  const activeCarousel = useAppStore((state) =>
    state.carousels.find((c) => c.id === state.activeCarouselId)
  );
  const createCarousel = useAppStore((state) => state.createCarousel);
  const setActiveCarousel = useAppStore((state) => state.setActiveCarousel);
  const addSlide = useAppStore((state) => state.addSlide);
  const updateSlide = useAppStore((state) => state.updateSlide);
  const removeSlide = useAppStore((state) => state.removeSlide);

  const [newTitle, setNewTitle] = useState('');
  const [platform, setPlatform] = useState<CarouselPlatform>('instagram');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createCarousel(newTitle, platform);
    setNewTitle('');
  };

  return (
    <div className="h-full flex gap-6">
      {/* Carousels list */}
      <div className="w-72 flex flex-col">
        <div className="mb-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New carousel title..."
            className="w-full px-3 py-2 bg-void-lighter/30 border border-amber-wire/20 rounded-lg font-mono text-sm text-smoke-bright placeholder-smoke-dim focus:border-amber-wire/50 focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as CarouselPlatform)}
              className="flex-1 px-2 py-1.5 bg-void-lighter/30 border border-amber-wire/20 rounded font-mono text-xs text-smoke-mid focus:outline-none"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 rounded bg-amber-electric/20 text-amber-electric font-mono text-xs hover:bg-amber-electric/30 transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {carousels.map((carousel) => (
            <button
              key={carousel.id}
              onClick={() => setActiveCarousel(carousel.id)}
              className={`
                w-full text-left p-3 rounded-lg transition-colors
                ${carousel.id === activeCarouselId ? 'bg-amber-electric/10 border border-amber-wire/30' : 'glass hover:bg-void-lighter/50'}
              `}
            >
              <div className="font-mono text-sm text-smoke-bright truncate">
                {carousel.title}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-smoke-dim">
                  {carousel.slides.length} slides
                </span>
                <span className="font-mono text-xs text-smoke-dim">
                  {carousel.platform}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeCarousel ? (
          <>
            {/* Slides */}
            <div className="flex-1 overflow-auto">
              <div className="flex gap-4 pb-4">
                {activeCarousel.slides.map((slide, index) => (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-64 shrink-0"
                  >
                    <div
                      className="aspect-square rounded-lg p-4 flex items-center justify-center"
                      style={{
                        backgroundColor: slide.style.backgroundColor,
                        color: slide.style.textColor,
                      }}
                    >
                      <textarea
                        value={slide.content}
                        onChange={(e) =>
                          updateSlide(activeCarousel.id, slide.id, {
                            content: e.target.value,
                          })
                        }
                        className={`
                          w-full h-full bg-transparent resize-none focus:outline-none font-mono
                          ${slide.style.fontSize === 'sm' ? 'text-xs' : ''}
                          ${slide.style.fontSize === 'md' ? 'text-sm' : ''}
                          ${slide.style.fontSize === 'lg' ? 'text-lg' : ''}
                          text-${slide.style.alignment}
                        `}
                        placeholder="Slide content..."
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-xs text-smoke-dim">
                        Slide {index + 1}
                      </span>
                      <button
                        onClick={() => removeSlide(activeCarousel.id, slide.id)}
                        className="font-mono text-xs text-state-error hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Add slide button */}
                <button
                  onClick={() => addSlide(activeCarousel.id)}
                  className="w-64 shrink-0 aspect-square rounded-lg border-2 border-dashed border-amber-wire/30 flex items-center justify-center hover:border-amber-wire/50 transition-colors"
                >
                  <span className="font-mono text-sm text-smoke-dim">+ Add Slide</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-wire/20">
              <button className="px-4 py-2 rounded-lg font-mono text-sm text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50 transition-colors">
                Generate Content
              </button>
              <button className="px-4 py-2 rounded-lg font-mono text-sm bg-amber-electric/20 text-amber-electric border border-amber-wire/30 hover:bg-amber-electric/30 transition-colors">
                Export
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-sm text-smoke-dim">
                Select or create a carousel to start editing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyGenerator() {
  const copyResults = useAppStore((state) => state.copyResults);
  const generateCopy = useAppStore((state) => state.generateCopy);
  const isGenerating = useAppStore((state) => state.isGenerating);

  const [topic, setTopic] = useState('');
  const [type, setType] = useState<CopyType>('tweet');
  const [tone, setTone] = useState<CopyTone>('professional');
  const [length, setLength] = useState<CopyLength>('medium');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generateCopy({
      type,
      topic,
      tone,
      length,
    });
    setTopic('');
  };

  return (
    <div className="h-full flex gap-6">
      {/* Input form */}
      <div className="w-80 glass rounded-lg p-4">
        <h3 className="font-mono text-sm text-smoke-dim uppercase tracking-wider mb-4">
          Generate Copy
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-smoke-dim mb-1">Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should the copy be about?"
              rows={3}
              className="w-full px-3 py-2 bg-void-lighter/30 border border-amber-wire/20 rounded-lg font-mono text-sm text-smoke-bright placeholder-smoke-dim focus:border-amber-wire/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-smoke-dim mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CopyType)}
              className="w-full px-3 py-2 bg-void-lighter/30 border border-amber-wire/20 rounded-lg font-mono text-sm text-smoke-mid focus:outline-none"
            >
              <option value="tweet">Tweet</option>
              <option value="linkedin_post">LinkedIn Post</option>
              <option value="email">Email</option>
              <option value="ad_copy">Ad Copy</option>
              <option value="blog_intro">Blog Intro</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-smoke-dim mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as CopyTone)}
              className="w-full px-3 py-2 bg-void-lighter/30 border border-amber-wire/20 rounded-lg font-mono text-sm text-smoke-mid focus:outline-none"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="humorous">Humorous</option>
              <option value="inspirational">Inspirational</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-smoke-dim mb-1">Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as CopyLength)}
              className="w-full px-3 py-2 bg-void-lighter/30 border border-amber-wire/20 rounded-lg font-mono text-sm text-smoke-mid focus:outline-none"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full px-4 py-2 rounded-lg font-mono text-sm bg-amber-electric/20 text-amber-electric border border-amber-wire/30 hover:bg-amber-electric/30 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-4 overflow-auto">
        <h3 className="font-mono text-sm text-smoke-dim uppercase tracking-wider">
          Generated Copy
        </h3>

        {copyResults.length === 0 ? (
          <div className="glass rounded-lg p-6 text-center">
            <p className="font-mono text-sm text-smoke-dim">
              Generated copy will appear here
            </p>
          </div>
        ) : (
          copyResults.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-amber-electric/20 text-amber-electric font-mono text-xs">
                  {result.request.type}
                </span>
                <span className="font-mono text-xs text-smoke-dim">
                  {result.request.tone} · {result.request.length}
                </span>
              </div>
              <p className="font-mono text-sm text-smoke-bright whitespace-pre-wrap">
                {result.content}
              </p>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  onClick={() => navigator.clipboard.writeText(result.content)}
                  className="font-mono text-xs text-smoke-dim hover:text-amber-electric transition-colors"
                >
                  Copy
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
