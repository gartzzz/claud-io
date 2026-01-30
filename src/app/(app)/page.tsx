'use client';

/**
 * Dashboard Page - Main view with ClaudeCore visualization and orbiting agents
 */

import { motion } from 'framer-motion';
import { ClaudeCoreWithAgents } from '@/components/visualization';
import { useAppStore, useWizardActions, useUIActions } from '@/lib/store';

export default function DashboardPage() {
  const claudeState = useAppStore((state) => state.claudeState);
  const currentState = claudeState?.state ?? 'idle';
  const isConnected = useAppStore((state) => state.isConnected);
  const eventCount = useAppStore((state) => state.eventCount);
  const taskQueue = useAppStore((state) => state.taskQueue);
  const agents = useAppStore((state) => state.agents);
  const { openWizard } = useWizardActions();
  const { setActiveModule } = useUIActions();

  const runningAgents = agents.filter((a) => a.status === 'working').length;

  const handleSelectAgent = () => {
    setActiveModule('agents');
  };

  return (
    <div className="h-full flex">
      {/* Main visualization area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* ClaudeCore with Agent Orbit Visualization */}
        <div className="relative">
          {/* Decorative corner accents - enlarged for agent orbit */}
          <motion.div
            className="absolute -top-12 -left-12 w-20 h-20 border-l-2 border-t-2 border-amber-wire/20 rounded-tl-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.div
            className="absolute -top-12 -right-12 w-20 h-20 border-r-2 border-t-2 border-amber-wire/20 rounded-tr-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.div
            className="absolute -bottom-12 -left-12 w-20 h-20 border-l-2 border-b-2 border-amber-wire/20 rounded-bl-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          />
          <motion.div
            className="absolute -bottom-12 -right-12 w-20 h-20 border-r-2 border-b-2 border-amber-wire/20 rounded-br-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />

          <ClaudeCoreWithAgents
            state={currentState}
            size="lg"
            showAgents={true}
            maxVisibleAgents={8}
            onSelectAgent={handleSelectAgent}
          />
        </div>

        {/* State Description */}
        <motion.div
          className="mt-12 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-mono text-sm text-smoke-mid leading-relaxed">
            {currentState === 'idle' && 'Waiting for Claude to start thinking...'}
            {currentState === 'thinking' && 'Claude is processing your request...'}
            {currentState === 'working' && 'Claude is actively working on tools and actions...'}
            {currentState === 'done' && 'Task completed successfully'}
          </p>

          {/* Current activity */}
          {isConnected && claudeState?.event && (
            <motion.div
              className="mt-6 p-4 glass rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="font-mono text-xs space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-smoke-dim">event:</span>
                  <span className="text-smoke-bright text-right flex-1 truncate">
                    {claudeState.event}
                  </span>
                </div>
                {claudeState.toolName && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-smoke-dim">tool:</span>
                    <span className="text-amber-electric text-right flex-1 truncate">
                      {claudeState.toolName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Stats sidebar */}
      <div className="w-72 border-l border-amber-wire/20 p-6 space-y-6">
        <h2 className="font-mono text-sm text-smoke-dim uppercase tracking-wider">
          <span className="text-smoke-muted">// </span>Stats
        </h2>

        {/* Event count */}
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-1">Events processed</div>
          <div className="font-mono text-2xl text-amber-electric">{eventCount}</div>
        </div>

        {/* Task queue */}
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-3">Task Queue</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-lg text-smoke-bright">{taskQueue.pending}</div>
              <div className="font-mono text-xs text-smoke-dim">Pending</div>
            </div>
            <div>
              <div className="font-mono text-lg text-amber-electric">{taskQueue.running}</div>
              <div className="font-mono text-xs text-smoke-dim">Running</div>
            </div>
            <div>
              <div className="font-mono text-lg text-state-success">{taskQueue.completed}</div>
              <div className="font-mono text-xs text-smoke-dim">Completed</div>
            </div>
            <div>
              <div className="font-mono text-lg text-state-error">{taskQueue.failed}</div>
              <div className="font-mono text-xs text-smoke-dim">Failed</div>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-3">Agents</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-lg text-smoke-bright">{agents.length}</div>
              <div className="font-mono text-xs text-smoke-dim">Total</div>
            </div>
            <div>
              <div className="font-mono text-lg text-state-success">{runningAgents}</div>
              <div className="font-mono text-xs text-smoke-dim">Active</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <h3 className="font-mono text-xs text-smoke-dim uppercase tracking-wider">
            Quick Actions
          </h3>
          <button className="w-full text-left px-3 py-2 rounded-lg font-mono text-sm text-smoke-mid hover:text-amber-electric hover:bg-amber-electric/10 transition-colors">
            + New Task
          </button>
          <button
            onClick={() => setActiveModule('projects')}
            className="w-full text-left px-3 py-2 rounded-lg font-mono text-sm text-smoke-mid hover:text-amber-electric hover:bg-amber-electric/10 transition-colors"
          >
            + Add Project
          </button>
          <button
            onClick={openWizard}
            className="w-full text-left px-3 py-2 rounded-lg font-mono text-sm text-smoke-mid hover:text-amber-electric hover:bg-amber-electric/10 transition-colors"
          >
            + Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
