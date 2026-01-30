/**
 * Agent Styles Constants
 *
 * Centralized styling constants for agent components.
 * Import these instead of duplicating color/icon definitions.
 */

import type { AgentStatus, AgentType } from '@/types/agent';

// ─────────────────────────────────────────────────────────────────────────────
// MODEL COLORS - Tailwind classes for model badges
// ─────────────────────────────────────────────────────────────────────────────

export const MODEL_COLORS: Record<string, string> = {
  // Full names
  'opus-4': 'text-model-opus',
  'sonnet-4': 'text-model-sonnet',
  'haiku': 'text-model-haiku',
  // Short names
  'opus': 'text-model-opus',
  'sonnet': 'text-model-sonnet',
  // Legacy/alternative names
  'claude-opus': 'text-model-opus',
  'claude-sonnet': 'text-model-sonnet',
  'claude-haiku': 'text-model-haiku',
};

// Fallback for unknown models
export const getModelColor = (model: string): string => {
  const normalized = model.toLowerCase();
  return MODEL_COLORS[normalized] || 'text-smoke-dim';
};

// ─────────────────────────────────────────────────────────────────────────────
// MODE STYLING - Icons and colors for agent modes
// ─────────────────────────────────────────────────────────────────────────────

export const MODE_ICONS: Record<string, string> = {
  code: '◆',
  architect: '▲',
  standard: '●',
};

export const MODE_COLORS: Record<string, string> = {
  code: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20',
  architect: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',
  standard: 'from-amber-500/20 to-orange-500/20 border-amber-500/20',
};

export const getModeIcon = (mode: string): string => {
  const lower = mode.toLowerCase();
  if (lower.includes('code')) return MODE_ICONS.code;
  if (lower.includes('architect')) return MODE_ICONS.architect;
  return MODE_ICONS.standard;
};

export const getModeColor = (mode: string): string => {
  const lower = mode.toLowerCase();
  if (lower.includes('code')) return MODE_COLORS.code;
  if (lower.includes('architect')) return MODE_COLORS.architect;
  return MODE_COLORS.standard;
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS STYLING - Colors and animations for agent states
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusStyle {
  dotColor: string;
  textColor: string;
  glowClass: string;
  animationClass: string;
  bgColor: string;
}

export const STATUS_STYLES: Record<AgentStatus, StatusStyle> = {
  working: {
    dotColor: 'bg-state-success',
    textColor: 'text-state-success',
    glowClass: 'glow-medium',
    animationClass: 'animate-working',
    bgColor: 'bg-state-success/10',
  },
  thinking: {
    dotColor: 'bg-amber-electric',
    textColor: 'text-amber-electric',
    glowClass: 'glow-subtle',
    animationClass: 'animate-thinking',
    bgColor: 'bg-amber-subtle',
  },
  idle: {
    dotColor: 'bg-smoke-dim',
    textColor: 'text-smoke-dim',
    glowClass: '',
    animationClass: 'animate-idle',
    bgColor: 'bg-void-lighter/50',
  },
  paused: {
    dotColor: 'bg-amber-deep',
    textColor: 'text-amber-deep',
    glowClass: '',
    animationClass: '',
    bgColor: 'bg-amber-wire',
  },
  error: {
    dotColor: 'bg-state-error',
    textColor: 'text-state-error',
    glowClass: 'glow-subtle',
    animationClass: 'animate-led-pulse',
    bgColor: 'bg-state-error/10',
  },
  sleeping: {
    dotColor: 'bg-smoke-muted',
    textColor: 'text-smoke-muted',
    glowClass: '',
    animationClass: '',
    bgColor: 'bg-void-mid',
  },
};

export const getStatusStyle = (status: AgentStatus): StatusStyle => {
  return STATUS_STYLES[status] || STATUS_STYLES.idle;
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT TYPE COLORS - For orbit visualization
// ─────────────────────────────────────────────────────────────────────────────

export interface TypeColors {
  primary: string;
  glow: string;
  bg: string;
}

export const AGENT_TYPE_COLORS: Record<AgentType, TypeColors> = {
  copywriting: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.5)',
    bg: 'rgba(245, 158, 11, 0.2)',
  },
  'code-generation': {
    primary: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.5)',
    bg: 'rgba(34, 211, 238, 0.2)',
  },
  'code-review': {
    primary: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.5)',
    bg: 'rgba(96, 165, 250, 0.2)',
  },
  design: {
    primary: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.5)',
    bg: 'rgba(192, 132, 252, 0.2)',
  },
  research: {
    primary: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.5)',
    bg: 'rgba(74, 222, 128, 0.2)',
  },
  general: {
    primary: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.5)',
    bg: 'rgba(148, 163, 184, 0.2)',
  },
};

export const getAgentTypeColors = (type: AgentType): TypeColors => {
  return AGENT_TYPE_COLORS[type] || AGENT_TYPE_COLORS.general;
};

// ─────────────────────────────────────────────────────────────────────────────
// SIZE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
} as const;

export const ORBIT_RADII = {
  sm: 100,
  md: 140,
  lg: 180,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SPACING PRESETS
// ─────────────────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;
