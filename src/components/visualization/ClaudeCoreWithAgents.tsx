'use client';

/**
 * ClaudeCoreWithAgents - Combines ClaudeCore visualization with orbiting agents
 *
 * This component wraps the central ClaudeCore and overlays the AgentOrbit
 * visualization, creating a unified "command center" view.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClaudeCore, type ClaudeState } from '../ClaudeCore';
import { AgentOrbit } from './AgentOrbit';
import { useAgents, useTasks, useAgentsActions } from '@/lib/store';
import type { Agent } from '@/types/agent';

interface ClaudeCoreWithAgentsProps {
  state?: ClaudeState;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showAgents?: boolean;
  maxVisibleAgents?: number;
  onSelectAgent?: (agent: Agent) => void;
}

// Size configurations for the combined view
const containerSizes = {
  sm: { core: 168, orbit: 100 },   // 48 * 3.5
  md: { core: 280, orbit: 140 },   // 80 * 3.5
  lg: { core: 420, orbit: 180 },   // 120 * 3.5
};

export function ClaudeCoreWithAgents({
  state = 'idle',
  size = 'md',
  interactive = true,
  showAgents = true,
  maxVisibleAgents = 8,
  onSelectAgent,
}: ClaudeCoreWithAgentsProps) {
  const agents = useAgents();
  const tasks = useTasks();
  const { setActiveAgent } = useAgentsActions();

  const config = containerSizes[size];

  // Filter and prioritize agents for display
  const visibleAgents = useMemo(() => {
    if (!showAgents) return [];

    // Prioritize: working > thinking > error > idle > paused > sleeping
    const statusPriority: Record<string, number> = {
      working: 0,
      thinking: 1,
      error: 2,
      idle: 3,
      paused: 4,
      sleeping: 5,
    };

    return [...agents]
      .sort((a, b) => {
        const priorityA = statusPriority[a.status] ?? 10;
        const priorityB = statusPriority[b.status] ?? 10;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return b.lastActiveAt - a.lastActiveAt;
      })
      .slice(0, maxVisibleAgents);
  }, [agents, showAgents, maxVisibleAgents]);

  // Get running tasks for tooltip display
  const runningTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === 'running')
      .map(t => ({
        id: t.id,
        agentId: t.agentId,
        title: t.title,
        status: t.status,
      }));
  }, [tasks]);

  const handleSelectAgent = (agent: Agent) => {
    setActiveAgent(agent.id);
    onSelectAgent?.(agent);
  };

  // Determine if any agent is actively working (affects core state)
  const hasWorkingAgents = visibleAgents.some(a => a.status === 'working');
  const hasThinkingAgents = visibleAgents.some(a => a.status === 'thinking');

  // Override state based on agent activity if not explicitly set
  const effectiveState = useMemo(() => {
    if (state !== 'idle') return state;
    if (hasWorkingAgents) return 'working';
    if (hasThinkingAgents) return 'thinking';
    return 'idle';
  }, [state, hasWorkingAgents, hasThinkingAgents]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: config.core + config.orbit * 2,
        height: config.core + config.orbit * 2,
      }}
    >
      {/* Agent count indicator (if more agents than visible) */}
      {agents.length > maxVisibleAgents && (
        <motion.div
          className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-void-mid/80 border border-amber-wire/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-mono text-sm text-smoke-dim">
            +{agents.length - maxVisibleAgents} more
          </span>
        </motion.div>
      )}

      {/* Central ClaudeCore */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <ClaudeCore
          state={effectiveState}
          size={size}
          interactive={interactive}
        />
      </div>

      {/* Agent Orbit Overlay */}
      {showAgents && (
        <AgentOrbit
          agents={visibleAgents}
          tasks={runningTasks}
          baseRadius={config.orbit}
          onSelectAgent={handleSelectAgent}
        />
      )}

      {/* Summary stats */}
      {showAgents && agents.length > 0 && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatBadge
            label="working"
            count={agents.filter(a => a.status === 'working').length}
            color="#22c55e"
          />
          <StatBadge
            label="idle"
            count={agents.filter(a => a.status === 'idle').length}
            color="#94a3b8"
          />
          {agents.some(a => a.status === 'error') && (
            <StatBadge
              label="error"
              count={agents.filter(a => a.status === 'error').length}
              color="#ef4444"
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

interface StatBadgeProps {
  label: string;
  count: number;
  color: string;
}

function StatBadge({ label, count, color }: StatBadgeProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-void-mid/50">
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: color }}
      />
      <span className="font-mono text-xs text-smoke-dim">
        {count} {label}
      </span>
    </div>
  );
}

export default ClaudeCoreWithAgents;
