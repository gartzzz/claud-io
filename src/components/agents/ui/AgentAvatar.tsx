'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  getModeIcon,
  getModeColor,
  getStatusStyle,
  AVATAR_SIZES,
} from '@/lib/constants/agentStyles';
import type { AgentStatus } from '@/types/agent';

interface AgentAvatarProps {
  mode: string;
  status?: AgentStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const iconSizeClasses = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const statusDotSizes = {
  xs: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5',
  sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
  md: 'w-2.5 h-2.5 -bottom-1 -right-1',
  lg: 'w-3 h-3 -bottom-1 -right-1',
  xl: 'w-3.5 h-3.5 -bottom-1.5 -right-1.5',
};

export function AgentAvatar({
  mode,
  status = 'idle',
  size = 'md',
  showStatus = true,
  className,
}: AgentAvatarProps) {
  const modeIcon = getModeIcon(mode);
  const modeColor = getModeColor(mode);
  const statusStyle = getStatusStyle(status);
  const pixelSize = AVATAR_SIZES[size];

  const isActive = status === 'working' || status === 'thinking';

  return (
    <motion.div
      className={cn('relative shrink-0', className)}
      style={{ width: pixelSize, height: pixelSize }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Main avatar */}
      <div
        className={cn(
          'w-full h-full rounded-lg',
          'bg-gradient-to-br border',
          'flex items-center justify-center',
          'transition-all duration-300',
          modeColor,
          isActive && statusStyle.glowClass
        )}
      >
        <span
          className={cn(
            'font-mono text-smoke-bright opacity-90',
            iconSizeClasses[size]
          )}
        >
          {modeIcon}
        </span>
      </div>

      {/* Status indicator */}
      {showStatus && (
        <motion.div
          className={cn(
            'absolute rounded-full border-2 border-void-deep',
            statusDotSizes[size],
            statusStyle.dotColor,
            isActive && 'animate-pulse'
          )}
          initial={false}
          animate={
            isActive
              ? {
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={
            isActive
              ? {
                  duration: status === 'working' ? 1 : 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
        />
      )}
    </motion.div>
  );
}

export default AgentAvatar;
