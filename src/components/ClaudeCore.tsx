'use client';

import { motion, useReducedMotion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

export type ClaudeState = 'idle' | 'thinking' | 'working' | 'done';

interface ClaudeCoreProps {
  state?: ClaudeState;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onStateChange?: (state: ClaudeState) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const sizeConfig = {
  sm: { core: 48, orbit1: 36, orbit2: 48, orbit3: 60, particle: 4 },
  md: { core: 80, orbit1: 60, orbit2: 80, orbit3: 100, particle: 6 },
  lg: { core: 120, orbit1: 90, orbit2: 120, orbit3: 150, particle: 8 },
};

const stateLabels: Record<ClaudeState, string> = {
  idle: 'ready',
  thinking: 'thinking',
  working: 'processing',
  done: 'complete',
};

// Spring configurations for different feelings
const springConfigs = {
  gentle: { stiffness: 100, damping: 15, mass: 1 },
  snappy: { stiffness: 300, damping: 20, mass: 0.8 },
  bouncy: { stiffness: 400, damping: 10, mass: 0.5 },
  smooth: { stiffness: 150, damping: 25, mass: 1 },
};

// Easing curves as typed tuples for Framer Motion 12
const easeSmooth: [number, number, number, number] = [0.4, 0, 0.6, 1];
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeBounce: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const easeExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

interface Particle {
  id: number;
  angle: number;
  radius: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
  orbit: 1 | 2 | 3;
}

function generateParticles(state: ClaudeState, baseParticleSize: number): Particle[] {
  const particles: Particle[] = [];

  const config = {
    idle: { count: 3, orbits: [1] as const },
    thinking: { count: 6, orbits: [1, 2] as const },
    working: { count: 12, orbits: [1, 2, 3] as const },
    done: { count: 8, orbits: [1, 2] as const },
  };

  const { count, orbits } = config[state];

  for (let i = 0; i < count; i++) {
    const orbit = orbits[i % orbits.length];
    particles.push({
      id: i,
      angle: (360 / count) * i + Math.random() * 20,
      radius: orbit,
      size: baseParticleSize * (0.5 + Math.random() * 0.8),
      speed: 0.8 + Math.random() * 0.4,
      opacity: 0.4 + Math.random() * 0.6,
      delay: i * 0.1,
      orbit,
    });
  }

  return particles;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENERGY BEAM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface EnergyBeamProps {
  startAngle: number;
  length: number;
  state: ClaudeState;
  delay?: number;
}

function EnergyBeam({ startAngle, length, state, delay = 0 }: EnergyBeamProps) {
  const shouldReduce = useReducedMotion();

  if (state === 'idle' || shouldReduce) return null;

  const duration = state === 'working' ? 1.5 : 2.5;
  const intensity = state === 'working' ? 1 : 0.7;

  return (
    <motion.div
      className="absolute origin-center"
      style={{
        width: length,
        height: 2,
        left: '50%',
        top: '50%',
        marginLeft: -length / 2,
        marginTop: -1,
        transform: `rotate(${startAngle}deg)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity }}
      exit={{ opacity: 0 }}
    >
      {/* Base wire */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'var(--amber-wire)',
        }}
      />

      {/* Traveling beam */}
      <motion.div
        className="absolute h-full rounded-full"
        style={{
          width: '30%',
          background: 'linear-gradient(90deg, transparent, var(--amber-electric), transparent)',
          boxShadow: '0 0 8px var(--amber-glow)',
        }}
        animate={{
          left: ['-30%', '100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          delay,
        }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORBIT RING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface OrbitRingProps {
  radius: number;
  opacity?: number;
  state: ClaudeState;
  pulseDelay?: number;
}

function OrbitRing({ radius, opacity = 1, state, pulseDelay = 0 }: OrbitRingProps) {
  const shouldReduce = useReducedMotion();
  const isActive = state === 'working' || state === 'thinking';

  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: 'var(--amber-wire)',
        left: '50%',
        top: '50%',
        marginLeft: -radius,
        marginTop: -radius,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: opacity * (isActive ? 1 : 0.5),
        scale: 1,
      }}
      transition={springConfigs.gentle}
    >
      {/* Pulsing glow on active states */}
      {isActive && !shouldReduce && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 20px var(--amber-wire)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: state === 'working' ? 1 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: pulseDelay,
          }}
        />
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ParticleOrbitProps {
  particle: Particle;
  orbitRadii: { 1: number; 2: number; 3: number };
  state: ClaudeState;
}

function ParticleOrbit({ particle, orbitRadii, state }: ParticleOrbitProps) {
  const shouldReduce = useReducedMotion();
  const orbitRadius = orbitRadii[particle.orbit];

  const duration = useMemo(() => {
    const baseDuration = state === 'working' ? 2 : state === 'thinking' ? 3.5 : 5;
    return baseDuration / particle.speed;
  }, [state, particle.speed]);

  const direction = particle.orbit === 2 ? -1 : 1;

  if (shouldReduce) {
    return (
      <div
        className="absolute rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          background: state === 'done' ? 'var(--state-success)' : 'var(--amber-electric)',
          opacity: particle.opacity,
          left: '50%',
          top: '50%',
          transform: `rotate(${particle.angle}deg) translateX(${orbitRadius}px)`,
          boxShadow: `0 0 ${particle.size * 2}px ${state === 'done' ? 'rgba(139, 195, 74, 0.5)' : 'var(--amber-glow)'}`,
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute"
      style={{
        width: particle.size,
        height: particle.size,
        left: '50%',
        top: '50%',
        marginLeft: -particle.size / 2,
        marginTop: -particle.size / 2,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: particle.opacity,
        scale: 1,
        rotate: direction * 360,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        opacity: { duration: 0.3, delay: particle.delay },
        scale: { ...springConfigs.bouncy, delay: particle.delay },
        rotate: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
      }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          background: state === 'done' ? 'var(--state-success)' : 'var(--amber-electric)',
          transform: `translateX(${orbitRadius}px)`,
          boxShadow: `0 0 ${particle.size * 2}px ${state === 'done' ? 'rgba(139, 195, 74, 0.5)' : 'var(--amber-glow)'}`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [particle.opacity, particle.opacity * 1.2, particle.opacity],
        }}
        transition={{
          duration: state === 'working' ? 0.8 : 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: particle.delay * 2,
        }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESS CELEBRATION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface SuccessRingProps {
  coreSize: number;
  delay: number;
}

function SuccessRing({ coreSize, delay }: SuccessRingProps) {
  return (
    <motion.div
      className="absolute rounded-full border-2"
      style={{
        width: coreSize,
        height: coreSize,
        borderColor: 'var(--state-success)',
        left: '50%',
        top: '50%',
        marginLeft: -coreSize / 2,
        marginTop: -coreSize / 2,
      }}
      initial={{ scale: 0.8, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{
        duration: 0.8,
        ease: easeExpo,
        delay,
      }}
    />
  );
}

interface CelebrationParticleProps {
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

function CelebrationParticle({ angle, distance, size, delay }: CelebrationParticleProps) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: 'var(--state-success)',
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        boxShadow: '0 0 8px rgba(139, 195, 74, 0.6)',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x,
        y,
        opacity: 0,
        scale: 0.5,
      }}
      transition={{
        duration: 0.6,
        ease: easeExpo,
        delay,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

interface RippleProps {
  x: number;
  y: number;
  size: number;
  onComplete: () => void;
}

function Ripple({ x, y, size, onComplete }: RippleProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x - size / 2,
        top: y - size / 2,
        border: '2px solid var(--amber-electric)',
        boxShadow: '0 0 20px var(--amber-glow)',
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.5, ease: easeExpo }}
      onAnimationComplete={onComplete}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE TEXTURE OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 rounded-full pointer-events-none opacity-30 mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ClaudeCore({
  state = 'idle',
  size = 'md',
  interactive = true,
}: ClaudeCoreProps) {
  const config = sizeConfig[size];
  const containerSize = config.core * 3.5;
  const shouldReduce = useReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [prevState, setPrevState] = useState(state);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  // Track state changes for celebration
  const showCelebration = state === 'done' && prevState !== 'done';

  useEffect(() => {
    if (state !== prevState) {
      setPrevState(state);
    }
  }, [state, prevState]);

  // Generate particles based on state
  const particles = useMemo(
    () => generateParticles(state, config.particle),
    [state, config.particle]
  );

  const orbitRadii = useMemo(() => ({
    1: config.orbit1,
    2: config.orbit2,
    3: config.orbit3,
  }), [config]);

  // Spring-animated scale for hover
  const hoverScale = useSpring(1, springConfigs.snappy);

  useEffect(() => {
    hoverScale.set(isHovered ? 1.05 : 1);
  }, [isHovered, hoverScale]);

  // Handle click ripple
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = rippleIdRef.current++;
    setRipples(prev => [...prev, { id, x, y }]);
  }, [interactive]);

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  // Core animation variants
  const coreVariants = {
    idle: {
      scale: shouldReduce ? 1 : [1, 1.02, 1],
      transition: shouldReduce ? {} : {
        duration: 3,
        repeat: Infinity,
        ease: easeSmooth,
      },
    },
    thinking: {
      scale: shouldReduce ? 1 : [1, 1.04, 1],
      transition: shouldReduce ? {} : {
        duration: 2.5,
        repeat: Infinity,
        ease: easeSmooth,
      },
    },
    working: {
      scale: shouldReduce ? 1 : [1, 1.08, 1.02, 1.06, 1],
      transition: shouldReduce ? {} : {
        duration: 0.8,
        repeat: Infinity,
        ease: easeOut,
      },
    },
    done: {
      scale: [1, 1.15, 1.05, 1],
      transition: {
        duration: 0.6,
        ease: easeBounce,
      },
    },
  };

  // Glow configuration by state
  const glowConfig = {
    idle: {
      color: 'var(--amber-glow)',
      size: config.core / 2,
      intensity: 0.3,
    },
    thinking: {
      color: 'var(--amber-glow)',
      size: config.core / 1.5,
      intensity: 0.5,
    },
    working: {
      color: 'var(--amber-glow)',
      size: config.core,
      intensity: 0.7,
    },
    done: {
      color: 'rgba(139, 195, 74, 0.6)',
      size: config.core,
      intensity: 0.8,
    },
  };

  const currentGlow = glowConfig[state];

  // Energy beam angles
  const beamAngles = state === 'working'
    ? [0, 45, 90, 135, 180, 225, 270, 315]
    : state === 'thinking'
    ? [0, 90, 180, 270]
    : [];

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none"
      style={{
        width: containerSize,
        height: containerSize,
        cursor: interactive ? 'pointer' : 'default',
      }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Claude is ${stateLabels[state]}`}
    >
      {/* Energy beams radiating from center */}
      <AnimatePresence>
        {beamAngles.map((angle, i) => (
          <EnergyBeam
            key={`beam-${angle}`}
            startAngle={angle}
            length={config.orbit3}
            state={state}
            delay={i * 0.15}
          />
        ))}
      </AnimatePresence>

      {/* Orbit rings */}
      <OrbitRing radius={config.orbit1} state={state} pulseDelay={0} />
      <OrbitRing radius={config.orbit2} opacity={0.7} state={state} pulseDelay={0.3} />
      {(state === 'working' || state === 'done') && (
        <OrbitRing radius={config.orbit3} opacity={0.4} state={state} pulseDelay={0.6} />
      )}

      {/* Orbiting particles */}
      <AnimatePresence mode="popLayout">
        {particles.map(particle => (
          <ParticleOrbit
            key={`particle-${state}-${particle.id}`}
            particle={particle}
            orbitRadii={orbitRadii}
            state={state}
          />
        ))}
      </AnimatePresence>

      {/* Core with breathing effect */}
      <motion.div
        className="relative rounded-full will-change-transform"
        style={{
          width: config.core,
          height: config.core,
          scale: hoverScale,
        }}
      >
        {/* Outer glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `0 0 ${currentGlow.size}px ${currentGlow.color}`,
              `0 0 ${currentGlow.size * 1.3}px ${currentGlow.color}`,
              `0 0 ${currentGlow.size}px ${currentGlow.color}`,
            ],
            opacity: shouldReduce ? currentGlow.intensity : [
              currentGlow.intensity,
              currentGlow.intensity * 1.2,
              currentGlow.intensity,
            ],
          }}
          transition={{
            duration: state === 'working' ? 0.8 : 2,
            repeat: shouldReduce ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main core */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: state === 'done'
              ? 'linear-gradient(135deg, var(--state-success), #6B9B3A)'
              : 'linear-gradient(135deg, var(--amber-electric), var(--amber-deep))',
          }}
          variants={coreVariants}
          animate={state}
        >
          {/* Inner highlight */}
          <div
            className="absolute rounded-full"
            style={{
              width: '60%',
              height: '60%',
              top: '10%',
              left: '10%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)',
            }}
          />

          {/* Noise texture for organic feel */}
          <NoiseOverlay />

          {/* Secondary inner glow for depth */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.2) 100%)',
            }}
            animate={{
              opacity: state === 'working' ? [0.3, 0.5, 0.3] : 0.3,
            }}
            transition={{
              duration: 0.8,
              repeat: state === 'working' ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Hover highlight ring */}
        <AnimatePresence>
          {isHovered && !shouldReduce && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: state === 'done' ? 'var(--state-success)' : 'var(--amber-bright)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={springConfigs.snappy}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Success celebration effects */}
      <AnimatePresence>
        {showCelebration && !shouldReduce && (
          <>
            {/* Expanding rings */}
            <SuccessRing coreSize={config.core} delay={0} />
            <SuccessRing coreSize={config.core} delay={0.15} />
            <SuccessRing coreSize={config.core} delay={0.3} />

            {/* Celebration particles */}
            {[...Array(8)].map((_, i) => (
              <CelebrationParticle
                key={`celebration-${i}`}
                angle={i * 45}
                distance={config.orbit2}
                size={config.particle}
                delay={0.1 + i * 0.03}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <Ripple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            size={config.core}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}
      </AnimatePresence>

      {/* State label */}
      <motion.div
        className="absolute font-mono text-xs uppercase tracking-wider"
        style={{
          bottom: -28,
          color: state === 'done' ? 'var(--state-success)' : 'var(--amber-electric)',
        }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        key={state}
        transition={springConfigs.gentle}
      >
        <span className="text-smoke-dim">// </span>
        <motion.span
          animate={state === 'working' && !shouldReduce ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {stateLabels[state]}
        </motion.span>
      </motion.div>
    </div>
  );
}
