import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

const COLORS = [
  'bg-yellow-400',
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-purple-400',
];

export const ParticleBurst: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 35 particles with random angles, speeds, sizes, colors and delays
    const newParticles: Particle[] = Array.from({ length: 35 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2; // Random direction
      const distance = 80 + Math.random() * 120; // Random distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 6 + Math.random() * 10; // Random size in pixels
      const delay = Math.random() * 0.15; // Stagger effect

      return {
        id: i,
        x,
        y,
        color,
        size,
        delay,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-50">
      <style>{`
        @keyframes explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y)) scale(0);
            opacity: 0;
          }
        }
        .particle-item {
          animation: explode 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full particle-item ${p.color}`}
          style={
            {
              '--x': `${p.x}px`,
              '--y': `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
