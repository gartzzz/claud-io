'use client';

/**
 * AgentOrbit - Visualizes agents orbiting around the ClaudeCore
 *
 * Features:
 * - Agents orbit at different distances based on priority
 * - Color coding by agent type
 * - Status-based animations (idle, working, paused, error)
 * - Tooltips showing agent status on hover
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { Agent, AgentType, AgentStatus } from '@/types/agent';
import { AGENT_TYPE_COLORS, getAgentTypeColors } from '@/lib/constants/agentStyles';

// Status-based animation configurations
const statusConfig: Record<AgentStatus, {
  opacity: number;
  pulseScale: [number, number];
  pulseDuration: number;
  orbitSpeed: number;
  glowIntensity: number;
  showTrail: boolean;
}> = {
  idle: {
    opacity: 0.7,
    pulseScale: [1, 1.05],
    pulseDuration: 3,
    orbitSpeed: 1,
    glowIntensity: 0.3,
    showTrail: false,
  },
  thinking: {
    opacity: 0.85,
    pulseScale: [1, 1.1],
    pulseDuration: 2,
    orbitSpeed: 1.5,
    glowIntensity: 0.5,
    showTrail: false,
  },
  working: {
    opacity: 1,
    pulseScale: [1, 1.15],
    pulseDuration: 0.8,
    orbitSpeed: 2.5,
    glowIntensity: 0.8,
    showTrail: true,
  },
  paused: {
    opacity: 0.4,
    pulseScale: [1, 1],
    pulseDuration: 0,
    orbitSpeed: 0,
    glowIntensity: 0.1,
    showTrail: false,
  },
  error: {
    opacity: 1,
    pulseScale: [1, 1.2],
    pulseDuration: 0.5,
    orbitSpeed: 0,
    glowIntensity: 1,
    showTrail: false,
  },
  sleeping: {
    opacity: 0.25,
    pulseScale: [1, 1.02],
    pulseDuration: 5,
    orbitSpeed: 0.2,
    glowIntensity: 0.05,
    showTrail: false,
  },
};

interface AgentAvatarProps {
  agent: Agent;
  angle: number;
  orbitRadius: number;
  size?: number;
  onSelect?: (agent: Agent) => void;
  currentTaskTitle?: string;
}

function AgentAvatar({
  agent,
  angle,
  orbitRadius,
  size = 44, // Increased from 28px for better visibility
  onSelect,
  currentTaskTitle,
}: AgentAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduce = useReducedMotion();

  const colors = getAgentTypeColors(agent.type);
  const config = statusConfig[agent.status] || statusConfig.idle;

  const isError = agent.status === 'error';
  const primaryColor = isError ? '#ef4444' : colors.primary;
  const glowColor = isError ? 'rgba(239, 68, 68, 0.6)' : colors.glow;

  // Calculate orbit duration based on speed
  const orbitDuration = config.orbitSpeed > 0 ? 30 / config.orbitSpeed : 0;

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={config.orbitSpeed > 0 && !shouldReduce ? {
        rotate: 360,
      } : {}}
      transition={config.orbitSpeed > 0 ? {
        duration: orbitDuration,
        repeat: Infinity,
        ease: 'linear',
      } : {}}
      initial={{ rotate: angle }}
    >
      {/* Trail effect for working agents */}
      {config.showTrail && !shouldReduce && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 1.5,
            height: size * 0.5,
            background: `linear-gradient(90deg, transparent, ${glowColor})`,
            left: -size * 0.5,
            top: size * 0.25,
            transform: `translateX(${orbitRadius}px)`,
            transformOrigin: `${size * 0.5 + orbitRadius}px center`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Agent node */}
      <motion.div
        className="relative cursor-pointer"
        style={{
          width: size,
          height: size,
          transform: `translateX(${orbitRadius}px)`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect?.(agent)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${size * 0.6}px ${glowColor}`,
          }}
          animate={config.pulseDuration > 0 && !shouldReduce ? {
            opacity: [config.glowIntensity, config.glowIntensity * 1.5, config.glowIntensity],
            scale: config.pulseScale,
          } : {
            opacity: config.glowIntensity,
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main circle */}
        <motion.div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${colors.bg})`,
            border: `2px solid ${primaryColor}`,
            opacity: config.opacity,
          }}
          animate={config.pulseDuration > 0 && !shouldReduce ? {
            scale: config.pulseScale,
          } : {}}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Agent type icon */}
          <AgentTypeIcon type={agent.type} size={size * 0.5} />
        </motion.div>

        {/* Status indicator dot */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 rounded-full border border-void-deepest"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            background: getStatusColor(agent.status),
          }}
          animate={agent.status === 'working' && !shouldReduce ? {
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <AgentTooltip
              agent={agent}
              currentTaskTitle={currentTaskTitle}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

interface AgentTooltipProps {
  agent: Agent;
  currentTaskTitle?: string;
}

function AgentTooltip({ agent, currentTaskTitle }: AgentTooltipProps) {
  const colors = getAgentTypeColors(agent.type);

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{
        left: '50%',
        bottom: '100%',
        marginBottom: 12,
        transform: 'translateX(-50%)',
      }}
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="px-4 py-3 rounded-xl border backdrop-blur-md whitespace-nowrap"
        style={{
          background: 'rgba(13, 13, 17, 0.95)',
          borderColor: colors.primary,
          boxShadow: `0 4px 20px ${colors.glow}`,
        }}
      >
        {/* Agent name and type */}
        <div className="flex items-center gap-3 mb-2">
          <span
            className="font-mono text-sm font-medium"
            style={{ color: colors.primary }}
          >
            {agent.name}
          </span>
          <span className="font-mono text-xs text-smoke-dim uppercase">
            {agent.type.replace('-', ' ')}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: getStatusColor(agent.status) }}
          />
          <span className="font-mono text-xs text-smoke-mid capitalize">
            {agent.status}
          </span>
        </div>

        {/* Current task if working */}
        {currentTaskTitle && agent.status === 'working' && (
          <div className="mt-2 pt-2 border-t border-amber-wire/20">
            <p className="font-mono text-xs text-smoke-dim truncate max-w-[200px]">
              {currentTaskTitle}
            </p>
          </div>
        )}

        {/* Stats preview */}
        <div className="mt-2 flex items-center gap-4">
          <span className="font-mono text-xs text-smoke-dim">
            {agent.stats.tasksCompleted} tasks
          </span>
          {agent.stats.userSatisfaction > 0 && (
            <span className="font-mono text-xs text-smoke-dim">
              {agent.stats.userSatisfaction.toFixed(1)}★
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-2.5 rotate-45"
        style={{
          background: 'rgba(13, 13, 17, 0.95)',
          borderRight: `1px solid ${colors.primary}`,
          borderBottom: `1px solid ${colors.primary}`,
        }}
      />
    </motion.div>
  );
}

function AgentTypeIcon({ type, size }: { type: AgentType; size: number }) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className: 'text-void-deepest',
  };

  switch (type) {
    case 'copywriting':
      return (
        <svg {...iconProps}>
          <path d="M3 13h10M3 9h6M3 5h10" />
        </svg>
      );
    case 'code-generation':
    case 'code-review':
      return (
        <svg {...iconProps}>
          <path d="M5 4L2 8l3 4M11 4l3 4-3 4M9 3l-2 10" />
        </svg>
      );
    case 'design':
      return (
        <svg {...iconProps}>
          <circle cx="8" cy="8" r="5" />
          <path d="M8 5v6M5 8h6" />
        </svg>
      );
    case 'research':
      return (
        <svg {...iconProps}>
          <circle cx="7" cy="7" r="4" />
          <path d="M13 13l-3-3" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="8" cy="6" r="3" />
          <path d="M3 14v-1a5 5 0 0110 0v1" />
        </svg>
      );
  }
}

function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'working':
      return '#22c55e'; // green-500
    case 'thinking':
      return '#3b82f6'; // blue-500
    case 'idle':
      return '#94a3b8'; // slate-400
    case 'paused':
      return '#f59e0b'; // amber-500
    case 'error':
      return '#ef4444'; // red-500
    case 'sleeping':
      return '#475569'; // slate-600
    default:
      return '#94a3b8';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORBIT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface AgentOrbitProps {
  agents: Agent[];
  tasks?: { id: string; agentId: string | null; title: string; status: string }[];
  baseRadius?: number;
  onSelectAgent?: (agent: Agent) => void;
}

export function AgentOrbit({
  agents,
  tasks = [],
  baseRadius = 140,
  onSelectAgent,
}: AgentOrbitProps) {
  // Position agents around the orbit
  const agentPositions = useMemo(() => {
    if (agents.length === 0) return [];

    // Group agents by status for better distribution
    const working = agents.filter(a => a.status === 'working' || a.status === 'thinking');
    const idle = agents.filter(a => a.status === 'idle');
    const other = agents.filter(a => !['working', 'thinking', 'idle'].includes(a.status));

    // Working agents on inner orbit, idle on outer
    const positioned: { agent: Agent; angle: number; radius: number }[] = [];

    // Working agents - inner orbit
    working.forEach((agent, i) => {
      const angle = (360 / Math.max(working.length, 1)) * i;
      positioned.push({ agent, angle, radius: baseRadius * 0.85 });
    });

    // Idle agents - outer orbit
    idle.forEach((agent, i) => {
      const angle = (360 / Math.max(idle.length, 1)) * i + 15; // Offset from working
      positioned.push({ agent, angle, radius: baseRadius * 1.1 });
    });

    // Other agents - middle orbit
    other.forEach((agent, i) => {
      const angle = (360 / Math.max(other.length, 1)) * i + 30;
      positioned.push({ agent, angle, radius: baseRadius });
    });

    return positioned;
  }, [agents, baseRadius]);

  // Get current task for each agent
  const getCurrentTask = (agentId: string) => {
    const task = tasks.find(t => t.agentId === agentId && t.status === 'running');
    return task?.title;
  };

  if (agents.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Orbit guide ring */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border border-dashed opacity-10"
        style={{
          width: baseRadius * 2,
          height: baseRadius * 2,
          marginLeft: -baseRadius,
          marginTop: -baseRadius,
          borderColor: 'var(--amber-wire)',
        }}
      />

      {/* Agent avatars */}
      <div className="pointer-events-auto">
        <AnimatePresence>
          {agentPositions.map(({ agent, angle, radius }) => (
            <AgentAvatar
              key={agent.id}
              agent={agent}
              angle={angle}
              orbitRadius={radius}
              onSelect={onSelectAgent}
              currentTaskTitle={getCurrentTask(agent.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AgentOrbit;
