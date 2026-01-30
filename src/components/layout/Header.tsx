'use client';

/**
 * Header - Top navigation bar
 */

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export function Header() {
  const isConnected = useAppStore((state) => state.isConnected);
  const claudeState = useAppStore((state) => state.claudeState);
  const activeModule = useAppStore((state) => state.activeModule);
  const toggleCommandPalette = useAppStore((state) => state.toggleCommandPalette);

  const moduleLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    terminal: 'Terminal',
    projects: 'Projects',
    agents: 'Agents',
    content: 'Content Tools',
  };

  return (
    <motion.header
      className="flex items-center justify-between h-12 px-4 border-b border-amber-wire/30 bg-void-deep/80 backdrop-blur-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: Module title */}
      <div className="flex items-center gap-4">
        <h1 className="font-mono text-sm font-medium text-smoke-bright">
          {moduleLabels[activeModule]}
        </h1>

        {/* Breadcrumb / Context */}
        {claudeState?.event && activeModule === 'dashboard' && (
          <span className="font-mono text-xs text-smoke-dim">
            / {claudeState.event}
          </span>
        )}
      </div>

      {/* Center: Search bar */}
      <button
        onClick={toggleCommandPalette}
        className="
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          bg-void-lighter/30 border border-amber-wire/20
          text-smoke-dim hover:text-smoke-mid hover:border-amber-wire/40
          transition-colors
        "
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="5.5" cy="5.5" r="3.5" />
          <path d="M12 12l-3-3" />
        </svg>
        <span className="font-mono text-xs">Search or command...</span>
        <span className="font-mono text-xs text-smoke-dim ml-4">⌘K</span>
      </button>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Claude state */}
        {claudeState && (
          <div className="flex items-center gap-2">
            <span
              className={`
                font-mono text-xs uppercase
                ${claudeState.state === 'working' ? 'text-amber-electric' : ''}
                ${claudeState.state === 'thinking' ? 'text-amber-bright' : ''}
                ${claudeState.state === 'done' ? 'text-state-success' : ''}
                ${claudeState.state === 'idle' ? 'text-smoke-dim' : ''}
              `}
            >
              {claudeState.state}
            </span>
            {claudeState.toolName && (
              <span className="font-mono text-xs text-smoke-dim">
                ({claudeState.toolName})
              </span>
            )}
          </div>
        )}

        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className={`led ${isConnected ? 'animate-led-pulse' : 'led--off'}`} />
          <span className="font-mono text-xs text-smoke-dim">
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Settings */}
        <button
          className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-smoke-dim hover:text-smoke-bright hover:bg-void-lighter/50
            transition-colors
          "
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="2" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" />
          </svg>
        </button>
      </div>
    </motion.header>
  );
}

export default Header;
