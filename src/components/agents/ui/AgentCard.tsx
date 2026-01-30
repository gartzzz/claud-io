'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentAvatar } from './AgentAvatar';
import { ModelBadge } from './ModelBadge';
import { StatusDot } from './StatusDot';
import type { AgentStatus } from '@/types/agent';

interface AgentCardProps {
  name: string;
  description?: string;
  model: string;
  mode: string;
  status?: AgentStatus;
  variant?: 'compact' | 'default' | 'expanded';
  metadata?: string;
  onClick?: () => void;
  className?: string;
}

export function AgentCard({
  name,
  description,
  model,
  mode,
  status = 'idle',
  variant = 'default',
  metadata,
  onClick,
  className,
}: AgentCardProps) {
  const isCompact = variant === 'compact';
  const isExpanded = variant === 'expanded';

  // Truncate description based on variant
  const maxDescLength = isCompact ? 50 : isExpanded ? 200 : 80;
  const truncatedDesc =
    description && description.length > maxDescLength
      ? description.slice(0, maxDescLength) + '...'
      : description;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full group relative text-left',
        'rounded-xl transition-all duration-200 ease-out',
        'bg-void-lighter/0 hover:bg-void-lighter/50',
        'border border-transparent hover:border-amber-wire/10',
        // Sizing based on variant
        isCompact ? 'px-2 py-2' : 'px-3 py-3',
        className
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={cn(
          'flex items-start',
          isCompact ? 'gap-2' : 'gap-3'
        )}
      >
        {/* Avatar */}
        <AgentAvatar
          mode={mode}
          status={status}
          size={isCompact ? 'sm' : 'md'}
          showStatus={!isCompact}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header row: Name + Model Badge */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'font-mono font-medium truncate',
                'text-smoke-mid group-hover:text-smoke-bright',
                'transition-colors leading-tight',
                isCompact ? 'text-[13px]' : 'text-[15px]'
              )}
            >
              {name}
            </span>

            <ModelBadge
              model={model}
              size={isCompact ? 'sm' : 'md'}
            />
          </div>

          {/* Description */}
          {description && !isCompact && (
            <p
              className={cn(
                'font-mono text-smoke-dim/70 leading-relaxed',
                isExpanded ? 'text-[13px]' : 'text-xs',
                isExpanded ? 'line-clamp-4' : 'line-clamp-2'
              )}
            >
              {truncatedDesc}
            </p>
          )}

          {/* Metadata row */}
          <div
            className={cn(
              'flex items-center',
              isCompact ? 'gap-1.5' : 'gap-2',
              isCompact ? 'pt-0' : 'pt-0.5'
            )}
          >
            {/* Status dot for compact view */}
            {isCompact && (
              <StatusDot status={status} size="sm" />
            )}

            {/* Mode badge */}
            <span
              className={cn(
                'font-mono text-smoke-dim/60 uppercase tracking-wider',
                isCompact ? 'text-[11px]' : 'text-xs'
              )}
            >
              {mode}
            </span>

            {/* Separator */}
            {metadata && (
              <>
                <span className="text-smoke-dim/30">·</span>
                <span
                  className={cn(
                    'font-mono text-smoke-dim/50',
                    isCompact ? 'text-[11px]' : 'text-xs'
                  )}
                >
                  {metadata}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-electric/0 via-amber-electric/5 to-amber-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
}

export default AgentCard;
