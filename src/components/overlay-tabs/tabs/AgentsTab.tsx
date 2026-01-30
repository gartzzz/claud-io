'use client';

/**
 * AgentsTab - Agents overview in overlay
 */

import { motion } from 'framer-motion';
import { useAgentDefinitions, useAgents, useTaskQueue } from '@/lib/store';
import { getModelColor, getModeIcon, MODE_COLORS } from '@/lib/constants/agentStyles';

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

// Mode colors for icons
const modeIconColors: Record<string, string> = {
  code: 'text-cyan-400',
  architect: 'text-purple-400',
  standard: 'text-amber-electric',
};

const getModeIconColor = (mode: string): string => {
  const lower = mode.toLowerCase();
  if (lower.includes('code')) return modeIconColors.code;
  if (lower.includes('architect')) return modeIconColors.architect;
  return modeIconColors.standard;
};

export function AgentsTab() {
  const agentDefinitions = useAgentDefinitions();
  const agents = useAgents();
  const taskQueue = useTaskQueue();

  const runningAgents = agents.filter((a) => a.status === 'working').length;

  return (
    <motion.div
      className="p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with stats */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-sm text-smoke-dim uppercase tracking-wider">
          <span className="text-smoke-muted">// </span>
          Agent Definitions
        </h2>
        {(runningAgents > 0 || taskQueue.pending > 0) && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            {runningAgents > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400">{runningAgents} active</span>
              </div>
            )}
            {taskQueue.pending > 0 && (
              <>
                {runningAgents > 0 && <span className="text-smoke-dim/30 text-xs">·</span>}
                <span className="font-mono text-xs text-cyan-400/70">{taskQueue.pending} queued</span>
              </>
            )}
          </div>
        )}
      </motion.div>

      {agentDefinitions.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-void-lighter/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-smoke-dim/50">
              <circle cx="10" cy="6" r="3" />
              <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            </svg>
          </div>
          <p className="font-mono text-sm text-smoke-dim">No agents configured</p>
          <p className="font-mono text-xs text-smoke-dim/60 mt-1">Pull from MR-AGENTS repo</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {agentDefinitions.slice(0, 8).map((agent) => {
            const modeIcon = getModeIcon(agent.mode);
            const modeColor = getModeIconColor(agent.mode);
            const modelColor = getModelColor(agent.model);

            return (
              <motion.div
                key={agent.id}
                variants={itemVariants}
                className="group p-4 rounded-xl bg-void-lighter/20 border border-amber-wire/5 hover:border-amber-wire/20 hover:bg-void-lighter/40 transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-lg ${modeColor}`}>{modeIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[15px] text-smoke-mid group-hover:text-smoke-bright truncate transition-colors">
                        {agent.name}
                      </span>
                      <span className={`font-mono text-xs ${modelColor} shrink-0`}>
                        {agent.model}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-smoke-dim/70 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {agentDefinitions.length > 8 && (
        <motion.p
          variants={itemVariants}
          className="mt-4 text-center font-mono text-sm text-smoke-dim/60"
        >
          + {agentDefinitions.length - 8} more agents
        </motion.p>
      )}
    </motion.div>
  );
}

export default AgentsTab;
