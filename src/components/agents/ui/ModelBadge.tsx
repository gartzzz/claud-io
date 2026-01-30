'use client';

import { cn } from '@/lib/utils';
import { getModelColor } from '@/lib/constants/agentStyles';

interface ModelBadgeProps {
  model: string;
  size?: 'sm' | 'md' | 'lg';
  showFull?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-[13px] px-2 py-1',
  lg: 'text-sm px-2.5 py-1',
};

// Normalize model names for display
const getDisplayName = (model: string, showFull: boolean): string => {
  const lower = model.toLowerCase();

  if (showFull) {
    if (lower.includes('opus')) return 'Claude Opus';
    if (lower.includes('sonnet')) return 'Claude Sonnet';
    if (lower.includes('haiku')) return 'Claude Haiku';
    return model;
  }

  // Short names
  if (lower.includes('opus')) return 'opus';
  if (lower.includes('sonnet')) return 'sonnet';
  if (lower.includes('haiku')) return 'haiku';
  return model;
};

export function ModelBadge({
  model,
  size = 'md',
  showFull = false,
  className,
}: ModelBadgeProps) {
  const colorClass = getModelColor(model);
  const displayName = getDisplayName(model, showFull);

  return (
    <span
      className={cn(
        'font-mono font-medium uppercase tracking-wide rounded',
        'bg-void-lighter/50',
        sizeClasses[size],
        colorClass,
        className
      )}
      title={`Model: ${model}`}
    >
      {displayName}
    </span>
  );
}

export default ModelBadge;
