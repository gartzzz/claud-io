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
}

// Model badge colors
const modelColors: Record<string, string> = {
  sonnet: 'text-cyan-400',
  opus: 'text-purple-400',
  haiku: 'text-emerald-400',
};

export function SidebarAgentsSection({
  collapsed,
  onSelectAgent,
  onCreateAgent,
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
    return (
      <div className="px-2 py-2">
        <button
          className="w-full flex items-center justify-center p-2 rounded-lg text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50 transition-colors group relative"
          title="Agents"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="6" r="3" />
            <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            <circle cx="15" cy="4" r="2" />
          </svg>
          {agents.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-xs font-mono flex items-center justify-center">
              {agents.length}
            </span>
          )}
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 rounded bg-void-mid border border-amber-wire/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
            <span className="font-mono text-xs text-smoke-bright">Agents ({agents.length})</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-void-lighter/30 rounded transition-colors"
        >
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
            Agents
          </span>
          <span className="font-mono text-xs text-smoke-dim">({agents.length})</span>
        </button>

        <div className="flex items-center gap-1">
          {/* Create agent button */}
          <motion.button
            onClick={onCreateAgent}
            className="p-1 rounded hover:bg-void-lighter/50 text-smoke-dim hover:text-amber-electric transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Create new agent"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2V10M2 6H10" />
            </svg>
          </motion.button>

          {/* Sync button */}
          <motion.button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 rounded hover:bg-void-lighter/50 text-smoke-dim hover:text-smoke-bright transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Sync from MR-AGENTS repo"
          >
            <svg
              width="12"
              height="12"
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

      {/* Repo status */}
      {repoStatus && (
        <div className="px-2 mb-1">
          <div className="flex items-center gap-2 text-smoke-dim">
            <span className="font-mono text-xs">
              {repoStatus.branch}@{repoStatus.commit}
            </span>
            {repoStatus.hasChanges && (
              <span className="text-amber-electric text-xs">*</span>
            )}
          </div>
        </div>
      )}

      {/* Agents List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Search */}
            {agents.length > 10 && (
              <div className="px-2 mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full px-2 py-1 rounded bg-void-lighter/50 border border-amber-wire/20 font-mono text-xs text-smoke-bright placeholder:text-smoke-dim focus:outline-none focus:border-amber-electric/50"
                />
              </div>
            )}

            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {filteredAgents.length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <span className="font-mono text-xs text-smoke-dim">
                    {searchQuery ? 'No agents match your search' : 'No agents found'}
                  </span>
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <AgentItem
                    key={agent.id}
                    agent={agent}
                    onSelect={onSelectAgent}
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

interface AgentItemProps {
  agent: AgentDefinition;
  onSelect?: (agent: AgentDefinition) => void;
}

function AgentItem({ agent, onSelect }: AgentItemProps) {
  return (
    <motion.button
      onClick={() => onSelect?.(agent)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-void-lighter/50 text-smoke-mid hover:text-smoke-bright transition-colors group"
      whileHover={{ x: 2 }}
    >
      {/* Agent icon */}
      <span className="shrink-0 w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="5" cy="3" r="2" />
          <path d="M2 9v-.5a3 3 0 013-3h0a3 3 0 013 3V9" />
        </svg>
      </span>

      {/* Agent name */}
      <span className="font-mono text-xs truncate flex-1 text-left">
        {agent.name}
      </span>

      {/* Model badge */}
      <span
        className={`shrink-0 font-mono text-[10px] uppercase ${modelColors[agent.model] || 'text-smoke-dim'}`}
        title={`Model: ${agent.model}`}
      >
        {agent.model.charAt(0)}
      </span>
    </motion.button>
  );
}

export default SidebarAgentsSection;
