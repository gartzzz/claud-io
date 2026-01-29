'use client';

import { motion } from 'framer-motion';

export function AmbientBackground() {
  // Generate particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(var(--amber-wire) 1px, transparent 1px),
            linear-gradient(90deg, var(--amber-wire) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-amber-electric/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: '0 0 4px var(--amber-glow)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--void-deepest) 100%)',
          opacity: 0.5,
        }}
      />

      {/* Scanlines effect (very subtle) */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--amber-electric) 2px, var(--amber-electric) 4px)',
          animation: 'scanlines 8s linear infinite',
        }}
      />
    </div>
  );
}
