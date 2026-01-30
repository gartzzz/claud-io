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
import {
  getModelColor,
  getModeIcon,
  getModeColor,
} from '@/lib/constants/agentStyles';

interface SidebarAgentsSectionProps {
  collapsed: boolean;
  onSelectAgent?: (agent: AgentDefinition) => void;
  onCreateAgent?: () => void;
  runningCount?: number;
  queuedCount?: number;
}

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
          className="mb-3 mx-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {runningCount > 0 && (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs text-emerald-400 font-medium">
                    {runningCount} active
                  </span>
                </>
              )}
            </div>
            {queuedCount > 0 && (
              <>
                {runningCount > 0 && <span className="text-smoke-dim/30 text-xs">·</span>}
                <span className="font-mono text-xs text-cyan-400/70">
                  {queuedCount} queued
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-void-lighter/30 rounded-md px-2 py-1 transition-all duration-200"
        >
          <motion.svg
            width="12"
            height="12"
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
          <span className="font-mono text-[13px] text-smoke-dim uppercase tracking-widest font-medium">
            Agents
          </span>
        </button>

        <div className="flex items-center gap-2">
          {agents.length > 0 && (
            <span className="font-mono text-xs text-smoke-dim/70">
              {agents.length}
            </span>
          )}

          {/* Create agent button */}
          <motion.button
            onClick={onCreateAgent}
            className="p-1.5 rounded text-smoke-dim hover:text-amber-electric transition-colors duration-200"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Create new agent"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2V10M2 6H10" />
            </svg>
          </motion.button>

          {/* Sync button */}
          <motion.button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1.5 rounded text-smoke-dim hover:text-smoke-bright transition-colors duration-200 disabled:opacity-50"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Sync from MR-AGENTS repo"
          >
            <svg
              width="14"
              height="14"
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
          className="px-2 mb-2 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-void-lighter/30 border border-amber-wire/5">
            <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="2" fill={repoStatus.hasChanges ? '#F59E0B' : '#10B981'} opacity="0.6" />
            </svg>
            <span className="font-mono text-xs text-smoke-dim/70 tracking-wide">
              {repoStatus.branch}
            </span>
            <span className="font-mono text-xs text-smoke-dim/50">
              {repoStatus.commit.slice(0, 7)}
            </span>
            {repoStatus.hasChanges && (
              <span className="text-amber-electric text-xs">*</span>
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
              <div className="px-2 mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter agents..."
                    className="
                      w-full px-3 py-2 pl-8 rounded-lg
                      bg-void-lighter/40 border border-amber-wire/10
                      font-mono text-sm text-smoke-bright placeholder:text-smoke-dim/60
                      focus:outline-none focus:border-amber-electric/30 focus:bg-void-lighter/60
                      transition-all duration-200
                    "
                  />
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-smoke-dim/60">
                    <circle cx="5" cy="5" r="3" />
                    <path d="M10 10l-3-3" />
                  </svg>
                </div>
              </div>
            )}

            <div className="space-y-1 max-h-[40vh] overflow-y-auto px-1">
              {filteredAgents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 py-8 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-void-lighter/30 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-smoke-dim/50">
                      <circle cx="10" cy="6" r="3" />
                      <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                    </svg>
                  </div>
                  <span className="font-mono text-sm text-smoke-dim/70 block">
                    {searchQuery ? 'No matches' : 'No agents'}
                  </span>
                  {!searchQuery && (
                    <span className="font-mono text-xs text-smoke-dim/50 block mt-1">Pull from MR-AGENTS repo</span>
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
  // Use centralized style functions
  const modeColor = getModeColor(agent.mode);
  const modeIcon = getModeIcon(agent.mode);
  const modelColor = getModelColor(agent.model);

  // Truncate description
  const shortDesc = agent.description.length > 80
    ? agent.description.slice(0, 80) + '...'
    : agent.description;

  return (
    <motion.button
      onClick={() => onSelect?.(agent)}
      className="
        w-full group relative text-left
        px-3 py-3 rounded-xl
        bg-void-lighter/0 hover:bg-void-lighter/50
        border border-transparent hover:border-amber-wire/10
        transition-all duration-200 ease-out
      "
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        {/* Agent icon with mode indicator */}
        <div className={`
          shrink-0 w-9 h-9 rounded-lg
          bg-gradient-to-br ${modeColor}
          border flex items-center justify-center
          group-hover:scale-105 transition-transform duration-200
        `}>
          <span className="font-mono text-sm text-smoke-bright opacity-90">
            {modeIcon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[15px] text-smoke-mid group-hover:text-smoke-bright font-medium truncate transition-colors leading-tight">
              {agent.name}
            </span>

            {/* Model badge */}
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`font-mono text-xs uppercase tracking-wide ${modelColor} font-medium`}
                title={`Model: ${agent.model}`}
              >
                {agent.model}
              </span>
            </div>
          </div>

          {/* Description */}
          {agent.description && (
            <p className="font-mono text-xs text-smoke-dim/70 leading-relaxed line-clamp-2">
              {shortDesc}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-2 pt-1">
            {/* Mode badge */}
            <span className="font-mono text-[11px] text-smoke-dim/60 uppercase tracking-wider">
              {agent.mode}
            </span>

            {/* Separator */}
            {agent.mode && (
              <span className="text-smoke-dim/30">·</span>
            )}

            {/* File indicator */}
            <span className="font-mono text-[11px] text-smoke-dim/50" title={agent.filename}>
              {agent.filename.replace('.md', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-electric/0 via-amber-electric/5 to-amber-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
}

export default SidebarAgentsSection;
