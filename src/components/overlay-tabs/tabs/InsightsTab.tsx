'use client';

/**
 * InsightsTab - Project insights and analytics
 *
 * Shows metrics, agent recommendations, and activity timeline
 * with premium animations.
 */

import { motion, animate } from 'framer-motion';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  useDiscoveredProjects,
  useAgentDefinitions,
  useTasks,
  useTaskQueue,
} from '@/lib/store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.5,
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

// Recommended agents by project type
const agentRecommendations: Record<string, string[]> = {
  node: ['nextjs-architect', 'test-architect', 'senior-code-reviewer'],
  rust: ['software-architect', 'senior-code-reviewer', 'perf-optimizer'],
  python: ['data-engineer', 'test-architect', 'api-architect'],
  go: ['software-architect', 'api-architect', 'perf-optimizer'],
  unknown: ['software-architect', 'senior-code-reviewer'],
};

export function InsightsTab() {
  const projects = useDiscoveredProjects();
  const agentDefinitions = useAgentDefinitions();
  const tasks = useTasks();
  const taskQueue = useTaskQueue();

  // Calculate metrics
  const metrics = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const healthScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    return {
      projects: projects.length,
      agents: agentDefinitions.length,
      tasksCompleted: completedTasks,
      tasksRunning: taskQueue.running,
      healthScore,
    };
  }, [projects, agentDefinitions, tasks, taskQueue]);

  // Get recommended agents based on project types
  const recommendedAgents = useMemo(() => {
    const projectTypes = [...new Set(projects.map((p) => p.projectType))];
    const recommendedIds = new Set<string>();

    projectTypes.forEach((type) => {
      const recs = agentRecommendations[type] || agentRecommendations.unknown;
      recs.forEach((id) => recommendedIds.add(id));
    });

    return agentDefinitions
      .filter((agent) =>
        [...recommendedIds].some(
          (id) =>
            agent.name.toLowerCase().includes(id.replace('-', ' ').toLowerCase()) ||
            agent.id.includes(id)
        )
      )
      .slice(0, 4);
  }, [projects, agentDefinitions]);

  // Build activity timeline (mock for now, would integrate with real data)
  const timeline = useMemo(() => {
    const events: { id: string; time: string; title: string; type: 'task' | 'project' | 'agent' }[] = [];

    // Recent tasks
    tasks
      .filter((t) => t.status === 'completed')
      .slice(0, 3)
      .forEach((task, i) => {
        events.push({
          id: `task-${i}`,
          time: formatTimeAgo(task.completedAt || task.createdAt),
          title: task.title,
          type: 'task',
        });
      });

    // Recent projects
    projects.slice(0, 2).forEach((project, i) => {
      events.push({
        id: `project-${i}`,
        time: formatTimeAgo(project.lastModified),
        title: `Modified: ${project.name}`,
        type: 'project',
      });
    });

    return events.slice(0, 5);
  }, [tasks, projects]);

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.h2
        variants={itemVariants}
        className="font-mono text-sm text-smoke-dim uppercase tracking-wider"
      >
        <span className="text-smoke-muted">// </span>
        Project Insights
      </motion.h2>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3">
        <MetricCard
          label="Projects"
          value={metrics.projects}
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
          }
        />
        <MetricCard
          label="Agents"
          value={metrics.agents}
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="6" r="3" />
              <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            </svg>
          }
        />
        <MetricCard
          label="Completed"
          value={metrics.tasksCompleted}
          color="text-state-success"
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 10l3 3 5-5" />
              <circle cx="10" cy="10" r="8" />
            </svg>
          }
        />
        <MetricCard
          label="Running"
          value={metrics.tasksRunning}
          color="text-amber-electric"
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3v4M10 17v-4M3 10h4M17 10h-4" />
            </svg>
          }
          pulse={metrics.tasksRunning > 0}
        />
      </motion.div>

      {/* Health Score */}
      <motion.div variants={itemVariants} className="p-4 rounded-lg bg-void-lighter/20 border border-amber-wire/5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-smoke-dim uppercase tracking-wider">Project Health</span>
          <span className="font-mono text-lg text-amber-electric">
            <AnimatedCounter value={metrics.healthScore} suffix="%" />
          </span>
        </div>
        <div className="h-2 bg-void-lighter/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-deep via-amber-electric to-amber-bright"
            initial={{ width: 0 }}
            animate={{ width: `${metrics.healthScore}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              boxShadow: metrics.healthScore > 50 ? '0 0 12px var(--amber-glow)' : 'none',
            }}
          />
        </div>
      </motion.div>

      {/* Two columns: Recommendations + Timeline */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recommended Agents */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-void-lighter/20 border border-amber-wire/5"
        >
          <h3 className="font-mono text-xs text-smoke-dim uppercase tracking-wider mb-3">
            Recommended Agents
          </h3>
          {recommendedAgents.length === 0 ? (
            <p className="font-mono text-xs text-smoke-dim/60">No recommendations yet</p>
          ) : (
            <div className="space-y-2">
              {recommendedAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-void-lighter/30 transition-colors cursor-pointer group"
                  whileHover={{ x: 2 }}
                >
                  <span className="text-purple-400">◆</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-smoke-mid group-hover:text-smoke-bright truncate block transition-colors">
                      {agent.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-void-lighter/20 border border-amber-wire/5"
        >
          <h3 className="font-mono text-xs text-smoke-dim uppercase tracking-wider mb-3">
            Recent Activity
          </h3>
          {timeline.length === 0 ? (
            <p className="font-mono text-xs text-smoke-dim/60">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      event.type === 'task'
                        ? 'bg-state-success'
                        : event.type === 'agent'
                        ? 'bg-purple-400'
                        : 'bg-amber-electric'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-smoke-mid truncate">{event.title}</p>
                    <span className="font-mono text-[10px] text-smoke-dim/60">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Metric card component
function MetricCard({
  label,
  value,
  icon,
  color = 'text-smoke-bright',
  pulse = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  pulse?: boolean;
}) {
  return (
    <div className="p-3 rounded-lg bg-void-lighter/20 border border-amber-wire/5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`opacity-60 ${color}`}>{icon}</span>
        <span className="font-mono text-[10px] text-smoke-dim uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono text-xl ${color} ${pulse ? 'animate-pulse' : ''}`}>
        <AnimatedCounter value={value} />
      </div>
    </div>
  );
}

// Helper to format time ago
function formatTimeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default InsightsTab;
