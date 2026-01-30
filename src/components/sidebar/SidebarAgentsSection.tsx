'use client';

/**
 * SidebarAgentsSection - Shows agent definitions from MR-AGENTS repo
 *
 * Features:
 * - Manual sync button (git pull)
 * - Agent type indicators
 * - Quick access to agent details
 * - Collapsible section
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useAgentDefinitions,
  useSyncActions,
  useIsSyncingAgents,
  useAgentsRepoStatus,
  useLastAgentsSync,
  type AgentDefinition,
} from '@/lib/store';

interface SidebarAgentsSectionProps {
  collapsed: boolean;
  onSelectAgent?: (agent: AgentDefinition) => void;
  onCreateAgent?: () => void;
  runningCount?: number;
  queuedCount?: number;
}

// Model badge colors - refined for premium look
const modelColors: Record<string, string> = {
  'opus-4': 'text-purple-400',
  'sonnet-4': 'text-cyan-400',
  'sonnet': 'text-cyan-400/80',
  'opus': 'text-purple-400/80',
  'haiku': 'text-emerald-400',
  'claude-opus': 'text-purple-400',
  'claude-sonnet': 'text-cyan-400',
  'claude-haiku': 'text-emerald-400',
};

export function SidebarAgentsSection({
  collapsed,
  onSelectAgent,
  onCreateAgent,
  runningCount = 0,
  queuedCount = 0,
}: SidebarAgentsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const agents = useAgentDefinitions();
  const isSyncing = useIsSyncingAgents();
  const repoStatus = useAgentsRepoStatus();
  const lastSync = useLastAgentsSync();
  const { parseAgents, pullAgentsRepo, getAgentsRepoStatus } = useSyncActions();

  // Load agents on mount
  useEffect(() => {
    const init = async () => {
      try {
        await parseAgents();
        await getAgentsRepoStatus();
      } catch (error) {
        console.error('Failed to load agents:', error);
      }
    };

    init();
  }, []);

  const handleSync = async () => {
    try {
      const result = await pullAgentsRepo();
      if (result.success) {
        console.log('Agents synced:', result.message);
      } else {
        console.error('Sync failed:', result.message);
      }
    } catch (error) {
      console.error('Failed to sync agents:', error);
    }
  };

  // Filter agents by search
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return null;
  }

  return (
    <div>
      {/* Activity Status Badge */}
      {(runningCount > 0 || queuedCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 mx-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {runningCount > 0 && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[9px] text-emerald-400 font-medium">
                    {runningCount} active
                  </span>
                </>
              )}
            </div>
            {queuedCount > 0 && (
              <>
                {runningCount > 0 && <span className="text-smoke-dim/30 text-[8px]">·</span>}
                <span className="font-mono text-[9px] text-cyan-400/70">
                  {queuedCount} queued
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between px-1.5 py-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-void-lighter/30 rounded-md px-1 py-0.5 transition-all duration-200"
        >
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
            Agents
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {agents.length > 0 && (
            <span className="font-mono text-[10px] text-smoke-dim/70">
              {agents.length}
            </span>
          )}

          {/* Create agent button */}
          <motion.button
            onClick={onCreateAgent}
            className="p-0.5 rounded text-smoke-dim hover:text-amber-electric transition-colors duration-200"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Create new agent"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2V10M2 6H10" />
            </svg>
          </motion.button>

          {/* Sync button */}
          <motion.button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-0.5 rounded text-smoke-dim hover:text-smoke-bright transition-colors duration-200 disabled:opacity-50"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Sync from MR-AGENTS repo"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={isSyncing ? 'animate-spin' : ''}
            >
              <path d="M10 6A4 4 0 114 3" />
              <path d="M10 2V6H6" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Repo status badge */}
      {repoStatus && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-1.5 mb-1.5 overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-void-lighter/30 border border-amber-wire/5">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="1.5" fill={repoStatus.hasChanges ? '#F59E0B' : '#10B981'} opacity="0.6" />
            </svg>
            <span className="font-mono text-[9px] text-smoke-dim/70 tracking-wide">
              {repoStatus.branch}
            </span>
            <span className="font-mono text-[9px] text-smoke-dim/50">
              {repoStatus.commit.slice(0, 7)}
            </span>
            {repoStatus.hasChanges && (
              <span className="text-amber-electric text-[9px]">*</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Agents List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            {/* Search */}
            {agents.length > 5 && (
              <div className="px-1.5 mb-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter agents..."
                    className="
                      w-full px-2 py-1.5 pl-6 rounded-lg
                      bg-void-lighter/40 border border-amber-wire/10
                      font-mono text-[11px] text-smoke-bright placeholder:text-smoke-dim/60
                      focus:outline-none focus:border-amber-electric/30 focus:bg-void-lighter/60
                      transition-all duration-200
                    "
                  />
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-2 top-1/2 -translate-y-1/2 text-smoke-dim/60">
                    <circle cx="5" cy="5" r="3" />
                    <path d="M10 10l-3-3" />
                  </svg>
                </div>
              </div>
            )}

            <div className="space-y-0.5 max-h-[400px] overflow-y-auto px-0.5">
              {filteredAgents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2 py-8 text-center"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-void-lighter/30 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-smoke-dim/50">
                      <circle cx="10" cy="6" r="3" />
                      <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                    </svg>
                  </div>
                  <span className="font-mono text-[11px] text-smoke-dim/70 block">
                    {searchQuery ? 'No matches' : 'No agents'}
                  </span>
                  {!searchQuery && (
                    <span className="font-mono text-[10px] text-smoke-dim/50 block mt-0.5">Pull from MR-AGENTS repo</span>
                  )}
                </motion.div>
              ) : (
                filteredAgents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                  >
                    <AgentItem
                      agent={agent}
                      onSelect={onSelectAgent}
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

interface AgentItemProps {
  agent: AgentDefinition;
  onSelect?: (agent: AgentDefinition) => void;
}

function AgentItem({ agent, onSelect }: AgentItemProps) {
  // Get mode-based styling
  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      code: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20',
      architect: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',
      standard: 'from-emerald-500/20 to-green-500/20 border-emerald-500/20',
    };
    return colors[mode.toLowerCase()] || 'from-smoke-dim/10 to-smoke-dim/20 border-smoke-dim/20';
  };

  const getModeIcon = (mode: string) => {
    const lower = mode.toLowerCase();
    if (lower.includes('code')) return '◆';
    if (lower.includes('architect')) return '▲';
    return '●';
  };

  // Truncate description
  const shortDesc = agent.description.length > 60
    ? agent.description.slice(0, 60) + '...'
    : agent.description;

  return (
    <motion.button
      onClick={() => onSelect?.(agent)}
      className="
        w-full group relative text-left
        px-2 py-2.5 rounded-lg
        bg-void-lighter/0 hover:bg-void-lighter/50
        border border-transparent hover:border-amber-wire/10
        transition-all duration-200 ease-out
      "
      whileHover={{ x: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-2.5">
        {/* Agent icon with mode indicator */}
        <div className={`
          shrink-0 w-6 h-6 rounded-md
          bg-gradient-to-br ${getModeColor(agent.mode)}
          border flex items-center justify-center
          group-hover:scale-105 transition-transform duration-200
        `}>
          <span className="font-mono text-[10px] text-smoke-bright opacity-80">
            {getModeIcon(agent.mode)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-smoke-mid group-hover:text-smoke-bright font-medium truncate transition-colors leading-tight">
              {agent.name}
            </span>

            {/* Model badge */}
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`font-mono text-[9px] uppercase tracking-wide ${modelColors[agent.model] || 'text-smoke-dim/60'} font-medium`}
                title={`Model: ${agent.model}`}
              >
                {agent.model}
              </span>
            </div>
          </div>

          {/* Description */}
          {agent.description && (
            <p className="font-mono text-[9px] text-smoke-dim/70 leading-relaxed line-clamp-2">
              {shortDesc}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-2 pt-0.5">
            {/* Mode badge */}
            <span className="font-mono text-[8px] text-smoke-dim/60 uppercase tracking-wider">
              {agent.mode}
            </span>

            {/* Separator */}
            {agent.mode && (
              <span className="text-smoke-dim/30">·</span>
            )}

            {/* File indicator */}
            <span className="font-mono text-[8px] text-smoke-dim/50" title={agent.filename}>
              {agent.filename.replace('.md', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-electric/0 via-amber-electric/5 to-amber-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
}

export default SidebarAgentsSection;
