'use client';

/**
 * TerminalContainer - Multi-tab terminal manager
 *
 * Manages multiple terminal sessions with a tab interface.
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { TerminalTabs } from './TerminalTabs';
import { TerminalPane } from './TerminalPane';
import { isTauri } from '@/lib/tauri/events';

interface TerminalContainerProps {
  className?: string;
  showHeader?: boolean;
  collapsible?: boolean;
}

export function TerminalContainer({
  className = '',
  showHeader = true,
  collapsible = true,
}: TerminalContainerProps) {
  const sessions = useAppStore((state) => state.sessions);
  const activeSessionId = useAppStore((state) => state.activeSessionId);
  const isTerminalPanelOpen = useAppStore((state) => state.isTerminalPanelOpen);
  const terminalPanelHeight = useAppStore((state) => state.terminalPanelHeight);
  const createSession = useAppStore((state) => state.createSession);
  const setTerminalPanelOpen = useAppStore((state) => state.setTerminalPanelOpen);
  const setTerminalPanelHeight = useAppStore((state) => state.setTerminalPanelHeight);

  // Create initial session on mount
  useEffect(() => {
    if (sessions.length === 0 && isTauri()) {
      createSession().catch(console.error);
    }
  }, [sessions.length, createSession]);

  // Handle new tab
  const handleNewTab = useCallback(() => {
    createSession().catch(console.error);
  }, [createSession]);

  // Handle toggle
  const handleToggle = useCallback(() => {
    setTerminalPanelOpen(!isTerminalPanelOpen);
  }, [isTerminalPanelOpen, setTerminalPanelOpen]);

  // Drag to resize
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalPanelHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      setTerminalPanelHeight(startHeight + delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [terminalPanelHeight, setTerminalPanelHeight]);

  return (
    <motion.div
      className={`relative flex flex-col bg-void-deep border-t border-amber-wire/30 ${className}`}
      initial={false}
      animate={{
        height: isTerminalPanelOpen ? terminalPanelHeight : 36,
      }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Resize handle */}
      {isTerminalPanelOpen && (
        <div
          className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-10 group"
          onMouseDown={handleDragStart}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 rounded-full bg-void-lighter group-hover:bg-amber-wire/50 transition-colors" />
        </div>
      )}

      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-amber-wire/20 bg-void-mid/50">
          <div className="flex items-center gap-2">
            {/* Toggle button */}
            {collapsible && (
              <button
                onClick={handleToggle}
                className="w-5 h-5 flex items-center justify-center text-smoke-dim hover:text-amber-electric transition-colors"
              >
                <motion.svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  initial={false}
                  animate={{ rotate: isTerminalPanelOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M2 4l3 3 3-3" />
                </motion.svg>
              </button>
            )}

            {/* Title */}
            <span className="font-mono text-xs uppercase tracking-wider text-smoke-mid">
              <span className="text-smoke-dim">// </span>
              Terminal
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewTab}
              className="font-mono text-xs text-smoke-dim hover:text-amber-electric transition-colors"
              title="New terminal"
            >
              + New
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence>
        {isTerminalPanelOpen && (
          <motion.div
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Tabs */}
            {sessions.length > 1 && (
              <TerminalTabs onNewTab={handleNewTab} />
            )}

            {/* Active terminal */}
            <div className="flex-1 relative">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`absolute inset-0 ${
                    session.id === activeSessionId ? 'visible' : 'invisible'
                  }`}
                >
                  <TerminalPane
                    sessionId={session.id}
                    title={session.title}
                  />
                </div>
              ))}

              {/* No sessions placeholder */}
              {sessions.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="font-mono text-sm text-smoke-dim mb-4">
                      No terminal sessions
                    </p>
                    <button
                      onClick={handleNewTab}
                      className="font-mono text-sm text-amber-electric hover:underline"
                    >
                      + Create new session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TerminalContainer;
