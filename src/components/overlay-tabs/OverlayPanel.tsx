'use client';

/**
 * OverlayPanel - Base glassmorphism panel component
 *
 * Provides the premium glass overlay effect with proper backdrop blur
 * and animations for the overlay tabs system.
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface OverlayPanelProps {
  children: ReactNode;
  className?: string;
}

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function OverlayPanel({ children, className = '' }: OverlayPanelProps) {
  return (
    <motion.div
      className={`glass-overlay rounded-xl overflow-hidden ${className}`}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export default OverlayPanel;
