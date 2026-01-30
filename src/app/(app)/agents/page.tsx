'use client';

/**
 * Agents Page - Agent management and task queue
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { Agent, Task } from '@/types/agent';

export default function AgentsPage() {
  const agents = useAppStore((state) => state.agents);
  const tasks = useAppStore((state) => state.tasks);
  const taskQueue = useAppStore((state) => state.taskQueue);
  const loadAgents = useAppStore((state) => state.loadAgents);
  const loadTasks = useAppStore((state) => state.loadTasks);
  const openModal = useAppStore((state) => state.openModal);
  const startAgent = useAppStore((state) => state.startAgent);
  const stopAgent = useAppStore((state) => state.stopAgent);

  useEffect(() => {
    loadAgents();
    loadTasks();
  }, [loadAgents, loadTasks]);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-mono text-lg text-smoke-bright">
            <span className="text-smoke-dim">// </span>Agent Orchestrator
          </h1>
          <p className="font-mono text-sm text-smoke-dim mt-1">
            Manage autonomous agents and task queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('new-task')}
            className="px-3 py-1.5 rounded-lg font-mono text-sm text-smoke-mid hover:text-amber-electric hover:bg-amber-electric/10 transition-colors"
          >
            + New Task
          </button>
          <button
            onClick={() => openModal('new-agent')}
            className="px-3 py-1.5 rounded-lg font-mono text-sm bg-amber-electric/10 text-amber-electric border border-amber-wire/30 hover:bg-amber-electric/20 transition-colors"
          >
            + Create Agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-1">Total Agents</div>
          <div className="font-mono text-2xl text-smoke-bright">{agents.length}</div>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-1">Tasks Pending</div>
          <div className="font-mono text-2xl text-amber-electric">{taskQueue.pending}</div>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-1">Tasks Running</div>
          <div className="font-mono text-2xl text-state-success">{taskQueue.running}</div>
        </div>
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-smoke-dim mb-1">Completed Today</div>
          <div className="font-mono text-2xl text-smoke-bright">{taskQueue.completed}</div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Agents list */}
        <div className="w-96 flex flex-col">
          <h2 className="font-mono text-sm text-smoke-dim uppercase tracking-wider mb-3">
            Agents
          </h2>
          <div className="flex-1 overflow-auto space-y-3">
            {agents.length === 0 ? (
              <div className="glass rounded-lg p-6 text-center">
                <p className="font-mono text-sm text-smoke-dim mb-4">No agents created yet</p>
                <button
                  onClick={() => openModal('new-agent')}
                  className="font-mono text-sm text-amber-electric hover:underline"
                >
                  Create your first agent
                </button>
              </div>
            ) : (
              agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={index}
                  onStart={() => startAgent(agent.id)}
                  onStop={() => stopAgent(agent.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Task queue */}
        <div className="flex-1 flex flex-col min-w-0">
          <h2 className="font-mono text-sm text-smoke-dim uppercase tracking-wider mb-3">
            Task Queue
          </h2>
          <div className="flex-1 overflow-auto space-y-2">
            {tasks.length === 0 ? (
              <div className="glass rounded-lg p-6 text-center">
                <p className="font-mono text-sm text-smoke-dim mb-4">No tasks in queue</p>
                <button
                  onClick={() => openModal('new-task')}
                  className="font-mono text-sm text-amber-electric hover:underline"
                >
                  Create a task
                </button>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  index,
  onStart,
  onStop,
}: {
  agent: Agent;
  index: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const statusColors: Record<string, string> = {
    idle: 'bg-smoke-dim',
    thinking: 'bg-amber-bright animate-pulse',
    working: 'bg-state-success animate-pulse',
    paused: 'bg-amber-electric',
    error: 'bg-state-error',
    sleeping: 'bg-smoke-muted',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
          <span className="font-mono text-sm text-smoke-bright">{agent.name}</span>
        </div>
        <span className="font-mono text-xs text-smoke-dim uppercase">{agent.type}</span>
      </div>

      <p className="font-mono text-xs text-smoke-dim mb-3 line-clamp-2">
        {agent.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono text-xs text-smoke-dim">
          <span>{agent.stats.tasksCompleted} completed</span>
          <span>{agent.stats.tasksFailed} failed</span>
        </div>

        <div className="flex items-center gap-2">
          {agent.status === 'idle' || agent.status === 'paused' ? (
            <button
              onClick={onStart}
              className="px-2 py-1 rounded text-xs font-mono text-state-success hover:bg-state-success/20 transition-colors"
            >
              Start
            </button>
          ) : agent.status === 'working' || agent.status === 'thinking' ? (
            <button
              onClick={onStop}
              className="px-2 py-1 rounded text-xs font-mono text-state-error hover:bg-state-error/20 transition-colors"
            >
              Stop
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  const statusColors: Record<string, string> = {
    pending: 'text-smoke-dim',
    assigned: 'text-amber-bright',
    running: 'text-state-success',
    completed: 'text-state-success',
    failed: 'text-state-error',
    cancelled: 'text-smoke-muted',
    waiting: 'text-amber-electric',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-smoke-dim/20 text-smoke-dim',
    normal: 'bg-smoke-mid/20 text-smoke-mid',
    high: 'bg-amber-electric/20 text-amber-electric',
    urgent: 'bg-state-error/20 text-state-error',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="glass rounded-lg p-3 flex items-center gap-3"
    >
      {/* Status indicator */}
      <div className={`font-mono text-xs uppercase ${statusColors[task.status]}`}>
        {task.status === 'running' && (
          <span className="inline-block w-2 h-2 rounded-full bg-state-success animate-pulse mr-1" />
        )}
        {task.status}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className="font-mono text-sm text-smoke-bright truncate block">
          {task.title}
        </span>
      </div>

      {/* Priority */}
      <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${priorityColors[task.priority]}`}>
        {task.priority}
      </span>

      {/* Agent */}
      {task.agentId && (
        <span className="font-mono text-xs text-smoke-dim">
          Agent: {task.agentId.slice(0, 6)}
        </span>
      )}
    </motion.div>
  );
}
