'use client';

/**
 * ProjectsTab - Projects overview in overlay
 */

import { motion } from 'framer-motion';
import { useDiscoveredProjects } from '@/lib/store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

// Project type icons
const projectIcons: Record<string, React.ReactNode> = {
  node: (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="#68A063" strokeWidth="1.2" />
      <path d="M7 5V9" stroke="#68A063" strokeWidth="1.2" />
    </svg>
  ),
  rust: (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#DEA584" strokeWidth="1.2" />
      <path d="M7 4V7L9 9" stroke="#DEA584" strokeWidth="1.2" />
    </svg>
  ),
  python: (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path d="M4 3H10V7H7V8H10V12H4V8H7V7H4V3Z" stroke="#3776AB" strokeWidth="1.2" />
    </svg>
  ),
  go: (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <ellipse cx="7" cy="7" rx="5" ry="4" stroke="#00ADD8" strokeWidth="1.2" />
    </svg>
  ),
  unknown: (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 4L7 2L12 4V10L7 12L2 10V4Z" />
    </svg>
  ),
};

export function ProjectsTab() {
  const projects = useDiscoveredProjects();

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  return (
    <motion.div
      className="p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        variants={itemVariants}
        className="font-mono text-sm text-smoke-dim uppercase tracking-wider mb-4"
      >
        <span className="text-smoke-muted">// </span>
        Discovered Projects
      </motion.h2>

      {projects.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-void-lighter/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-smoke-dim/50">
              <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <p className="font-mono text-sm text-smoke-dim">No projects discovered</p>
          <p className="font-mono text-xs text-smoke-dim/60 mt-1">Add projects to ~/Desktop/PROYECTOS</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="group p-4 rounded-lg bg-void-lighter/20 border border-amber-wire/5 hover:border-amber-wire/20 hover:bg-void-lighter/40 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  {projectIcons[project.projectType] || projectIcons.unknown}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-sm text-smoke-mid group-hover:text-smoke-bright truncate transition-colors">
                      {project.name}
                    </span>
                    <span className="font-mono text-[10px] text-smoke-dim/60 shrink-0">
                      {formatTimeAgo(project.lastModified)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.hasGit && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F05032]/60" />
                        <span className="font-mono text-[10px] text-smoke-dim/60">git</span>
                      </div>
                    )}
                    <span className="font-mono text-[10px] text-smoke-dim/50 uppercase">
                      {project.projectType}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ProjectsTab;
