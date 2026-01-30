'use client';

/**
 * CommandPalette - Quick access command palette (Cmd+K)
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { ActiveModule } from '@/lib/store/types';

interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const isOpen = useAppStore((state) => state.commandPaletteOpen);
  const setOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const setActiveModule = useAppStore((state) => state.setActiveModule);
  const createSession = useAppStore((state) => state.createSession);
  const openModal = useAppStore((state) => state.openModal);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands
  const commands: Command[] = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', shortcut: '⌘1', action: () => setActiveModule('dashboard') },
    { id: 'nav-terminal', label: 'Go to Terminal', category: 'Navigation', shortcut: '⌘2', action: () => setActiveModule('terminal') },
    { id: 'nav-projects', label: 'Go to Projects', category: 'Navigation', shortcut: '⌘3', action: () => setActiveModule('projects') },
    { id: 'nav-agents', label: 'Go to Agents', category: 'Navigation', shortcut: '⌘4', action: () => setActiveModule('agents') },
    { id: 'nav-content', label: 'Go to Content Tools', category: 'Navigation', shortcut: '⌘5', action: () => setActiveModule('content') },

    // Terminal
    { id: 'terminal-new', label: 'New Terminal Session', category: 'Terminal', action: () => createSession() },

    // Projects
    { id: 'project-add', label: 'Add Project', category: 'Projects', action: () => openModal('new-project') },

    // Agents
    { id: 'agent-create', label: 'Create New Agent', category: 'Agents', action: () => openModal('new-agent') },
    { id: 'task-create', label: 'Create New Task', category: 'Agents', action: () => openModal('new-task') },

    // Content
    { id: 'carousel-create', label: 'Create Carousel', category: 'Content', action: () => { setActiveModule('content'); } },
    { id: 'copy-generate', label: 'Generate Copy', category: 'Content', action: () => { setActiveModule('content'); } },
  ], [setActiveModule, createSession, openModal]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups = new Map<string, Command[]>();
    for (const cmd of filteredCommands) {
      if (!groups.has(cmd.category)) {
        groups.set(cmd.category, []);
      }
      groups.get(cmd.category)!.push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setOpen(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, setOpen]);

  // Track flat index for selection
  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-void-deepest/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="glass-elevated rounded-xl border border-amber-wire/30 overflow-hidden shadow-2xl">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-wire/20">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-smoke-dim">
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <path d="M14 14l-4-4" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent font-mono text-sm text-smoke-bright placeholder-smoke-dim outline-none"
                />
                <kbd className="font-mono text-xs text-smoke-dim bg-void-lighter/50 px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="font-mono text-sm text-smoke-dim">No commands found</p>
                  </div>
                ) : (
                  Array.from(groupedCommands.entries()).map(([category, cmds]) => (
                    <div key={category}>
                      <div className="px-4 py-1">
                        <span className="font-mono text-xs uppercase tracking-wider text-smoke-dim">
                          {category}
                        </span>
                      </div>
                      {cmds.map((cmd) => {
                        flatIndex++;
                        const isSelected = flatIndex === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action();
                              setOpen(false);
                            }}
                            className={`
                              w-full flex items-center justify-between px-4 py-2
                              text-left transition-colors
                              ${isSelected ? 'bg-amber-electric/10 text-amber-electric' : 'text-smoke-mid hover:bg-void-lighter/50'}
                            `}
                          >
                            <span className="font-mono text-sm">{cmd.label}</span>
                            {cmd.shortcut && (
                              <kbd className="font-mono text-xs text-smoke-dim">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-amber-wire/20 bg-void-deep/50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-mono text-xs text-smoke-dim">
                    <kbd className="bg-void-lighter/50 px-1 rounded">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-smoke-dim">
                    <kbd className="bg-void-lighter/50 px-1 rounded">↵</kbd> select
                  </span>
                </div>
                <span className="font-mono text-xs text-smoke-dim">
                  {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
