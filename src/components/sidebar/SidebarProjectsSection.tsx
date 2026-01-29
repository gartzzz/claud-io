'use client';

/**
 * SidebarProjectsSection - Shows discovered projects from PROYECTOS folder
 *
 * Features:
 * - Auto-sync with file system watcher
 * - Project type icons (Node, Rust, Python, Go)
 * - Git status indicator
 * - Collapsible section
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscoveredProjects, useSyncActions, useIsWatchingProjects, useLastProjectsSync, type DiscoveredProject } from '@/lib/store';

interface SidebarProjectsSectionProps {
  collapsed: boolean;
  onSelectProject?: (project: DiscoveredProject) => void;
}

// Project type icons
const projectIcons: Record<string, React.ReactNode> = {
  node: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="#68A063" strokeWidth="1.2" />
      <path d="M7 5V9" stroke="#68A063" strokeWidth="1.2" />
    </svg>
  ),
  rust: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#DEA584" strokeWidth="1.2" />
      <path d="M7 4V7L9 9" stroke="#DEA584" strokeWidth="1.2" />
    </svg>
  ),
  python: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 3H10V7H7V8H10V12H4V8H7V7H4V3Z" stroke="#3776AB" strokeWidth="1.2" />
    </svg>
  ),
  go: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <ellipse cx="7" cy="7" rx="5" ry="4" stroke="#00ADD8" strokeWidth="1.2" />
    </svg>
  ),
  unknown: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 4L7 2L12 4V10L7 12L2 10V4Z" />
    </svg>
  ),
};

export function SidebarProjectsSection({ collapsed, onSelectProject }: SidebarProjectsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const projects = useDiscoveredProjects();
  const isWatching = useIsWatchingProjects();
  const lastSync = useLastProjectsSync();
  const { discoverProjects, startProjectWatch, setupSyncEventListeners } = useSyncActions();

  // Initialize project watching on mount
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const init = async () => {
      try {
        // Start watching and discover projects
        await startProjectWatch();

        // Setup event listeners for changes
        unlisten = await setupSyncEventListeners();
      } catch (error) {
        console.error('Failed to initialize project sync:', error);
        // Try to at least discover projects
        await discoverProjects();
      }
    };

    init();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleRefresh = () => {
    discoverProjects();
  };

  if (collapsed) {
    return (
      <div className="px-2 py-2">
        <button
          className="w-full flex items-center justify-center p-2 rounded-lg text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50 transition-colors group relative"
          title="Projects"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
          </svg>
          {projects.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-electric text-void-deepest text-xs font-mono flex items-center justify-center">
              {projects.length}
            </span>
          )}
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 rounded bg-void-mid border border-amber-wire/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
            <span className="font-mono text-xs text-smoke-bright">Projects ({projects.length})</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-2">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-void-lighter/30 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <path d="M4 2L8 6L4 10" />
          </motion.svg>
          <span className="font-mono text-xs text-smoke-mid uppercase tracking-wider">
            Projects
          </span>
          <span className="font-mono text-xs text-smoke-dim">({projects.length})</span>
        </div>

        {/* Refresh button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleRefresh();
          }}
          className="p-1 rounded hover:bg-void-lighter/50 text-smoke-dim hover:text-smoke-bright opacity-0 group-hover:opacity-100 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Refresh projects"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={isWatching ? 'animate-spin' : ''}
          >
            <path d="M10 6A4 4 0 114 3" />
            <path d="M10 2V6H6" />
          </svg>
        </motion.button>
      </button>

      {/* Projects List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <span className="font-mono text-xs text-smoke-dim">No projects found</span>
                </div>
              ) : (
                projects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onSelect={onSelectProject}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProjectItemProps {
  project: DiscoveredProject;
  onSelect?: (project: DiscoveredProject) => void;
}

function ProjectItem({ project, onSelect }: ProjectItemProps) {
  return (
    <motion.button
      onClick={() => onSelect?.(project)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-void-lighter/50 text-smoke-mid hover:text-smoke-bright transition-colors group"
      whileHover={{ x: 2 }}
    >
      {/* Project type icon */}
      <span className="shrink-0 text-smoke-dim group-hover:text-smoke-mid">
        {projectIcons[project.projectType] || projectIcons.unknown}
      </span>

      {/* Project name */}
      <span className="font-mono text-xs truncate flex-1 text-left">
        {project.name}
      </span>

      {/* Git indicator */}
      {project.hasGit && (
        <span className="shrink-0" title="Git repository">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="2" cy="5" r="1.5" fill="#F05032" />
            <circle cx="8" cy="3" r="1.5" fill="#F05032" />
            <circle cx="8" cy="7" r="1.5" fill="#F05032" />
            <path d="M3.5 5H6.5M6.5 5L6.5 3M6.5 5L6.5 7" stroke="#F05032" strokeWidth="0.8" />
          </svg>
        </span>
      )}
    </motion.button>
  );
}

export default SidebarProjectsSection;
