'use client';

/**
 * Projects Page - Project management
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export default function ProjectsPage() {
  const projects = useAppStore((state) => state.projects);
  const activeProjectId = useAppStore((state) => state.activeProjectId);
  const loadProjects = useAppStore((state) => state.loadProjects);
  const setActiveProject = useAppStore((state) => state.setActiveProject);
  const openModal = useAppStore((state) => state.openModal);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="h-full flex">
      {/* Project list */}
      <div className="w-80 border-r border-amber-wire/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm text-smoke-dim uppercase tracking-wider">
            <span className="text-smoke-muted">// </span>Projects
          </h2>
          <button
            onClick={() => openModal('new-project')}
            className="font-mono text-xs text-amber-electric hover:underline"
          >
            + Add
          </button>
        </div>

        <div className="space-y-2">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-mono text-sm text-smoke-dim mb-4">No projects yet</p>
              <button
                onClick={() => openModal('new-project')}
                className="font-mono text-sm text-amber-electric hover:underline"
              >
                Add your first project
              </button>
            </div>
          ) : (
            projects.map((project, index) => (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => setActiveProject(project.id)}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors
                  ${
                    project.id === activeProjectId
                      ? 'bg-amber-electric/10 border border-amber-wire/30'
                      : 'hover:bg-void-lighter/50'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-electric">
                    <path d="M2 4a1.5 1.5 0 011.5-1.5h3l1.5 1.5h5A1.5 1.5 0 0114.5 5.5v7a1.5 1.5 0 01-1.5 1.5H3.5A1.5 1.5 0 012 12.5V4z" />
                  </svg>
                  <span className="font-mono text-sm text-smoke-bright truncate">
                    {project.name}
                  </span>
                </div>
                <p className="font-mono text-xs text-smoke-dim truncate">
                  {project.path}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`
                    px-1.5 py-0.5 rounded text-xs font-mono
                    ${project.type === 'code' ? 'bg-amber-electric/20 text-amber-electric' : ''}
                    ${project.type === 'content' ? 'bg-state-success/20 text-state-success' : ''}
                    ${project.type === 'mixed' ? 'bg-smoke-dim/20 text-smoke-mid' : ''}
                  `}>
                    {project.type}
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Project detail */}
      <div className="flex-1 p-6">
        {activeProjectId ? (
          <ProjectDetail projectId={activeProjectId} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-smoke-dim mb-4">
                <path d="M6 12a4.5 4.5 0 014.5-4.5h9l4.5 4.5h15A4.5 4.5 0 0143.5 16.5v21a4.5 4.5 0 01-4.5 4.5H10.5A4.5 4.5 0 016 37.5V12z" />
              </svg>
              <p className="font-mono text-sm text-smoke-dim">
                Select a project to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ projectId }: { projectId: string }) {
  const project = useAppStore((state) => state.projects.find((p) => p.id === projectId));
  const fileTree = useAppStore((state) => state.fileTree);
  const gitStatus = useAppStore((state) => state.gitStatus);

  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-mono text-xl text-smoke-bright">{project.name}</h1>
        <p className="font-mono text-sm text-smoke-dim mt-1">{project.path}</p>
        {project.description && (
          <p className="font-mono text-sm text-smoke-mid mt-2">{project.description}</p>
        )}
      </div>

      {/* Git status */}
      {gitStatus && (
        <div className="glass rounded-lg p-4 mb-4">
          <h3 className="font-mono text-xs text-smoke-dim uppercase tracking-wider mb-3">
            Git Status
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-electric">
                <path d="M2 7h10M7 2v10" />
              </svg>
              <span className="font-mono text-sm text-smoke-bright">{gitStatus.branch}</span>
            </div>
            {gitStatus.ahead > 0 && (
              <span className="font-mono text-xs text-state-success">
                ↑{gitStatus.ahead}
              </span>
            )}
            {gitStatus.behind > 0 && (
              <span className="font-mono text-xs text-state-error">
                ↓{gitStatus.behind}
              </span>
            )}
          </div>
          {(gitStatus.modified.length > 0 || gitStatus.staged.length > 0 || gitStatus.untracked.length > 0) && (
            <div className="flex items-center gap-4 mt-2 font-mono text-xs">
              {gitStatus.staged.length > 0 && (
                <span className="text-state-success">+{gitStatus.staged.length} staged</span>
              )}
              {gitStatus.modified.length > 0 && (
                <span className="text-amber-electric">~{gitStatus.modified.length} modified</span>
              )}
              {gitStatus.untracked.length > 0 && (
                <span className="text-smoke-dim">?{gitStatus.untracked.length} untracked</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* File tree placeholder */}
      <div className="flex-1 glass rounded-lg p-4 overflow-auto">
        <h3 className="font-mono text-xs text-smoke-dim uppercase tracking-wider mb-3">
          Files
        </h3>
        {fileTree ? (
          <div className="font-mono text-sm">
            {/* File tree would be rendered here */}
            <p className="text-smoke-dim">File tree loading...</p>
          </div>
        ) : (
          <p className="font-mono text-sm text-smoke-dim">Loading files...</p>
        )}
      </div>
    </motion.div>
  );
}
