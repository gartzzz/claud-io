'use client';

/**
 * Sidebar - Main navigation sidebar
 *
 * Hybrid sidebar with collapsed (60px) and expanded (240px) states.
 * Includes:
 * - Navigation to main modules
 * - Projects section (auto-synced from PROYECTOS)
 * - Agents section (synced from MR-AGENTS repo)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useWizardActions } from '@/lib/store';
import type { ActiveModule } from '@/lib/store/types';
import { SidebarProjectsSection, SidebarAgentsSection } from '@/components/sidebar';

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortcut: '⌘1',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="7" height="7" rx="1" />
        <rect x="11" y="2" width="7" height="7" rx="1" />
        <rect x="2" y="11" width="7" height="7" rx="1" />
        <rect x="11" y="11" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'terminal',
    label: 'Terminal',
    shortcut: '⌘2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="16" height="14" rx="2" />
        <path d="M5 9l3 2-3 2" />
        <path d="M10 13h5" />
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    shortcut: '⌘3',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
      </svg>
    ),
  },
  {
    id: 'agents',
    label: 'Agents',
    shortcut: '⌘4',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="6" r="3" />
        <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
        <circle cx="15" cy="4" r="2" />
        <path d="M17 8v1" />
      </svg>
    ),
  },
  {
    id: 'content',
    label: 'Content',
    shortcut: '⌘5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 7h6" />
        <path d="M7 10h6" />
        <path d="M7 13h3" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const activeModule = useAppStore((state) => state.activeModule);
  const setActiveModule = useAppStore((state) => state.setActiveModule);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const toggleCommandPalette = useAppStore((state) => state.toggleCommandPalette);
  const { openWizard } = useWizardActions();

  // Agent status mini indicator
  const agents = useAppStore((state) => state.agents);
  const runningAgents = agents.filter((a) => a.status === 'working').length;
  const taskQueue = useAppStore((state) => state.taskQueue);

  return (
    <motion.aside
      className="relative flex flex-col h-full bg-void-deep border-r border-amber-wire/30"
      initial={false}
      animate={{ width: sidebarCollapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-amber-wire/20">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleSidebar}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-electric to-amber-deep flex items-center justify-center shrink-0">
            <span className="font-mono text-xs font-bold text-void-deepest">C</span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                className="font-mono text-sm font-bold tracking-wider text-smoke-bright whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                CLAUD<span className="text-amber-electric">.IO</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="py-3 px-2 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-colors group relative
              ${
                activeModule === item.id
                  ? 'bg-amber-electric/10 text-amber-electric'
                  : 'text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50'
              }
            `}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active indicator */}
            {activeModule === item.id && (
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-electric rounded-r"
                layoutId="activeIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            {/* Icon */}
            <span className="shrink-0">{item.icon}</span>

            {/* Label & Shortcut */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  className="flex-1 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <span className="font-mono text-sm">{item.label}</span>
                  <span className="font-mono text-xs text-smoke-dim group-hover:text-smoke-mid">
                    {item.shortcut}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded bg-void-mid border border-amber-wire/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                <span className="font-mono text-xs text-smoke-bright">{item.label}</span>
                <span className="font-mono text-xs text-smoke-dim ml-2">{item.shortcut}</span>
              </div>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-amber-wire/20" />

      {/* Synced Folders */}
      <div className="flex-1 overflow-y-auto">
        {/* Projects Section */}
        <SidebarProjectsSection
          collapsed={sidebarCollapsed}
          onSelectProject={(project) => {
            setActiveModule('projects');
            console.log('Selected project:', project.name);
          }}
        />

        {/* Divider */}
        <div className="mx-3 border-t border-amber-wire/10" />

        {/* Agents Section */}
        <SidebarAgentsSection
          collapsed={sidebarCollapsed}
          onSelectAgent={(agent) => {
            setActiveModule('agents');
            console.log('Selected agent:', agent.name);
          }}
          onCreateAgent={() => {
            openWizard();
          }}
        />
      </div>

      {/* Agent Status Mini */}
      <div className="px-2 py-3 border-t border-amber-wire/20">
        <motion.button
          onClick={() => setActiveModule('agents')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50
            transition-colors
          `}
          whileHover={{ x: 2 }}
        >
          {/* Status indicator */}
          <div className={`w-2 h-2 rounded-full ${runningAgents > 0 ? 'bg-state-success animate-pulse' : 'bg-smoke-dim'}`} />

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="flex-1 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <span className="font-mono text-xs">
                  {runningAgents > 0 ? `${runningAgents} working` : 'Agents idle'}
                </span>
                {taskQueue.pending > 0 && (
                  <span className="font-mono text-xs text-amber-electric">
                    {taskQueue.pending} queued
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Command Palette Trigger */}
      <div className="px-2 py-3 border-t border-amber-wire/20">
        <motion.button
          onClick={toggleCommandPalette}
          className="
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-smoke-dim hover:text-smoke-bright hover:bg-void-lighter/50
            transition-colors
          "
          whileHover={{ x: 2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="4" />
            <path d="M14 14l-4-4" />
          </svg>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="flex-1 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <span className="font-mono text-xs">Search</span>
                <span className="font-mono text-xs">⌘K</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
