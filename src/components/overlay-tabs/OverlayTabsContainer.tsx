'use client';

/**
 * OverlayTabsContainer - Main container for overlay tabs system
 *
 * Manages tab navigation and renders the appropriate content
 * with glassmorphism overlay effect.
 */

import { useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOverlayTab, useUIActions } from '@/lib/store';
import { OverlayPanel } from './OverlayPanel';
import { OverlayTabBar } from './OverlayTabBar';
import { ProjectsTab, AgentsTab, InsightsTab } from './tabs';
import type { OverlayTab } from '@/lib/store';

interface OverlayTabsContainerProps {
  className?: string;
}

export function OverlayTabsContainer({ className = '' }: OverlayTabsContainerProps) {
  const overlayTab = useOverlayTab();
  const { setOverlayTab, closeOverlay } = useUIActions();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape' && overlayTab) {
        closeOverlay();
        return;
      }

      // Number keys to switch tabs when overlay is open
      if (overlayTab) {
        if (e.key === '1') setOverlayTab('projects');
        if (e.key === '2') setOverlayTab('agents');
        if (e.key === '3') setOverlayTab('insights');
      }

      // Cmd/Ctrl + Shift + I to open insights
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'i') {
        e.preventDefault();
        setOverlayTab(overlayTab === 'insights' ? null : 'insights');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [overlayTab, setOverlayTab, closeOverlay]);

  const handleTabChange = useCallback(
    (tab: OverlayTab) => {
      setOverlayTab(tab);
    },
    [setOverlayTab]
  );

  const handleClose = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeOverlay();
      }
    },
    [closeOverlay]
  );

  return (
    <AnimatePresence>
      {overlayTab && (
        <div
          className={`absolute inset-0 z-20 flex items-start justify-center pt-12 px-6 ${className}`}
          onClick={handleBackdropClick}
        >
          <OverlayPanel className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Tab Bar */}
            <OverlayTabBar
              activeTab={overlayTab}
              onTabChange={handleTabChange}
              onClose={handleClose}
            />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {overlayTab === 'projects' && <ProjectsTab key="projects" />}
                {overlayTab === 'agents' && <AgentsTab key="agents" />}
                {overlayTab === 'insights' && <InsightsTab key="insights" />}
              </AnimatePresence>
            </div>
          </OverlayPanel>
        </div>
      )}
    </AnimatePresence>
  );
}

export default OverlayTabsContainer;
