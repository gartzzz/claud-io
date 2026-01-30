'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getStatusStyle, type StatusStyle } from '@/lib/constants/agentStyles';
import type { AgentStatus } from '@/types/agent';

interface StatusDotProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-[13px]',
  lg: 'text-sm',
};

export function StatusDot({
  status,
  size = 'md',
  showLabel = false,
  className,
}: StatusDotProps) {
  const style = getStatusStyle(status);
  const isAnimated = status === 'working' || status === 'thinking';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          style.dotColor,
          isAnimated && 'animate-pulse'
        )}
        initial={false}
        animate={
          isAnimated
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }
            : {}
        }
        transition={
          isAnimated
            ? {
                duration: status === 'working' ? 1 : 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      />
      {showLabel && (
        <span
          className={cn(
            'font-mono capitalize',
            labelSizeClasses[size],
            style.textColor
          )}
        >
          {status}
        </span>
      )}
    </div>
  );
}

export default StatusDot;
