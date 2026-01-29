'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  elevated?: boolean;
  cornerAccents?: boolean;
}

export function GlassCard({
  children,
  title,
  className = '',
  elevated = false,
  cornerAccents = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={`relative rounded-xl p-4 ${elevated ? 'glass-elevated' : 'glass'} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Corner accents */}
      {cornerAccents && (
        <>
          <div className="corner-accent corner-accent--tl" />
          <div className="corner-accent corner-accent--tr" />
          <div className="corner-accent corner-accent--bl" />
          <div className="corner-accent corner-accent--br" />
        </>
      )}

      {/* Title */}
      {title && (
        <div className="mb-3 font-mono text-sm uppercase tracking-wider text-amber-electric">
          <span className="text-smoke-dim">// </span>
          {title}
        </div>
      )}

      {/* Content */}
      {children}
    </motion.div>
  );
}
