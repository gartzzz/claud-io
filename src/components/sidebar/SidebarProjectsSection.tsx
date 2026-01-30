'use client';

/**
 * SidebarProjectsSection - Shows discovered projects from PROYECTOS folder
 *
 * Features:
 * - Auto-sync with file system watcher
 * - Project type icons (Node, Rust, Python, Go)
 * - Git status indicator
 * - Last task performed indicator
 * - Progress bar for completion
 * - Recommended agents for the project
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useDiscoveredProjects,
  useSyncActions,
  useIsWatchingProjects,
  useAgentDefinitions,
  useTasks,
  type DiscoveredProject,
  type AgentDefinition,
} from '@/lib/store';

// Recommended agents by project type
const agentRecommendations: Record<string, string[]> = {
  node: ['nextjs-architect', 'test-architect', 'senior-code-reviewer', 'perf-optimizer'],
  rust: ['software-architect', 'senior-code-reviewer', 'perf-optimizer', 'debug-specialist'],
  python: ['data-engineer', 'test-architect', 'senior-code-reviewer', 'api-architect'],
  go: ['software-architect', 'api-architect', 'perf-optimizer', 'load-test-engineer'],
  unknown: ['software-architect', 'senior-code-reviewer', 'debug-specialist'],
};

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
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const projects = useDiscoveredProjects();
  const isWatching = useIsWatchingProjects();
  const agentDefinitions = useAgentDefinitions();
  const tasks = useTasks();
  const { discoverProjects, startProjectWatch, setupSyncEventListeners } = useSyncActions();

  // Get recommended agents for a project
  const getRecommendedAgents = (projectType: string): AgentDefinition[] => {
    const recommendedIds = agentRecommendations[projectType] || agentRecommendations.unknown;
    return agentDefinitions
      .filter(agent => recommendedIds.some(id => agent.name.toLowerCase().includes(id.replace('-', ' ').toLowerCase()) || agent.id.includes(id)))
      .slice(0, 3);
  };

  // Get last task for a project
  const getLastTask = (projectId: string) => {
    const projectTasks = tasks
      .filter(t => t.projectId === projectId)
      .sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));
    return projectTasks[0];
  };

  // Calculate project completion (based on completed vs total tasks)
  const getProjectCompletion = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return null;
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

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
    return null;
  }

  return (
    <div>
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-1.5 py-1 rounded-md hover:bg-void-lighter/30 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2">
          <motion.svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-smoke-dim"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <path d="M3 1.5L6.5 5L3 8.5" />
          </motion.svg>
          <span className="font-mono text-[10px] text-smoke-dim uppercase tracking-widest font-medium">
            Projects
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {projects.length > 0 && (
            <span className="font-mono text-[10px] text-smoke-dim/70">
              {projects.length}
            </span>
          )}
          {/* Refresh button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-0.5 rounded text-smoke-dim hover:text-amber-electric opacity-0 group-hover:opacity-100 transition-all duration-200"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Refresh projects"
          >
            <svg
              width="11"
              height="11"
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
        </div>
      </button>

      {/* Projects List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 space-y-0.5 max-h-56 overflow-y-auto">
              {projects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2 py-6 text-center"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-void-lighter/30 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-smoke-dim/50">
                      <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <span className="font-mono text-[11px] text-smoke-dim/70 block">No projects yet</span>
                  <span className="font-mono text-[10px] text-smoke-dim/50 block mt-0.5">Add to ~/Desktop/PROYECTOS</span>
                </motion.div>
              ) : (
                projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <ProjectItem
                      project={project}
                      onSelect={onSelectProject}
                      lastTask={getLastTask(project.id)}
                      completion={getProjectCompletion(project.id)}
                      recommendedAgents={getRecommendedAgents(project.projectType)}
                      isHovered={hoveredProject === project.id}
                    />
                  </motion.div>
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
  lastTask?: { title: string; status: string; completedAt?: number };
  completion: number | null;
  recommendedAgents: AgentDefinition[];
  isHovered: boolean;
}

function ProjectItem({ project, onSelect, lastTask, completion, recommendedAgents, isHovered }: ProjectItemProps) {
  // Format last modified time
  const timeAgo = React.useMemo(() => {
    const now = Date.now();
    const diff = now - project.lastModified;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  }, [project.lastModified]);

  return (
    <motion.button
      onClick={() => onSelect?.(project)}
      className="
        w-full group relative
        px-2 py-2 rounded-lg
        bg-void-lighter/0 hover:bg-void-lighter/40
        border border-transparent hover:border-amber-wire/10
        transition-all duration-200 ease-out
      "
      whileHover={{ x: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-2">
        {/* Project type icon */}
        <span className="shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {projectIcons[project.projectType] || projectIcons.unknown}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Project name & metadata */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-mono text-[11px] text-smoke-mid group-hover:text-smoke-bright truncate transition-colors leading-tight">
              {project.name}
            </span>
            <span className="font-mono text-[9px] text-smoke-dim/60 shrink-0 leading-tight">
              {timeAgo}
            </span>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-1.5">
            {/* Git status */}
            {project.hasGit && (
              <div className="flex items-center gap-0.5" title="Git repository">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="1" fill="#F05032" opacity="0.6" />
                </svg>
                <span className="font-mono text-[9px] text-smoke-dim/70">git</span>
              </div>
            )}

            {/* Project type badge */}
            <span className="font-mono text-[9px] text-smoke-dim/50 uppercase tracking-wide">
              {project.projectType}
            </span>
          </div>

          {/* Progress bar - only show if there are tasks */}
          {completion !== null && (
            <div className="mt-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-mono text-[8px] text-smoke-dim/60 uppercase tracking-wider">Progress</span>
                <span className="font-mono text-[9px] text-amber-electric/80">{completion}%</span>
              </div>
              <div className="h-1 bg-void-lighter/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-deep via-amber-electric to-amber-bright"
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    boxShadow: completion > 50 ? '0 0 8px var(--amber-glow)' : 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Last task indicator */}
          {lastTask && (
            <div className="mt-1.5 flex items-center gap-1">
              <div className={`w-1 h-1 rounded-full ${
                lastTask.status === 'completed' ? 'bg-state-success' :
                lastTask.status === 'running' ? 'bg-amber-electric animate-pulse' :
                lastTask.status === 'failed' ? 'bg-state-error' : 'bg-smoke-dim'
              }`} />
              <span className="font-mono text-[9px] text-smoke-dim/70 truncate">
                {lastTask.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recommended agents - show on hover */}
      <AnimatePresence>
        {isHovered && recommendedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 pt-2 border-t border-amber-wire/10"
          >
            <span className="font-mono text-[8px] text-smoke-dim/60 uppercase tracking-wider block mb-1">
              Recommended Agents
            </span>
            <div className="flex flex-wrap gap-1">
              {recommendedAgents.map(agent => (
                <span
                  key={agent.id}
                  className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-[8px] text-purple-400/80 truncate max-w-[80px]"
                  title={agent.description}
                >
                  {agent.name.split('-').slice(0, 2).join('-')}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-electric/0 via-amber-electric/5 to-amber-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
}

export default SidebarProjectsSection;
