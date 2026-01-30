'use client';

/**
 * OverlayTabBar - Glassmorphism tab navigation
 *
 * Premium horizontal tabs with animated indicator and hover effects.
 */

import { motion } from 'framer-motion';
import type { OverlayTab } from '@/lib/store';

interface Tab {
  id: OverlayTab;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'projects',
    label: 'Projects',
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
      </svg>
    ),
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="6" r="3" />
        <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v14h14" />
        <path d="M7 10l3-3 3 3 4-4" />
      </svg>
    ),
  },
];

interface OverlayTabBarProps {
  activeTab: OverlayTab;
  onTabChange: (tab: OverlayTab) => void;
  onClose: () => void;
}

export function OverlayTabBar({ activeTab, onTabChange, onClose }: OverlayTabBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-amber-wire/10 glass-tab">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg
              font-mono text-xs transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'text-amber-electric'
                  : 'text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/30'
              }
            `}
          >
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>

            {/* Active indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="overlay-tab-indicator"
                className="absolute inset-0 rounded-lg bg-amber-electric/10 border border-amber-electric/20"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="p-2 rounded-lg text-smoke-dim hover:text-smoke-bright hover:bg-void-lighter/30 transition-all duration-200"
        title="Close (Esc)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  );
}

export default OverlayTabBar;
