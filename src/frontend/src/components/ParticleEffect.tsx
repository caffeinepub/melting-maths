import { useEffect, useState } from "react";

interface ParticleEffectProps {
  type: "win" | "combo" | "levelup" | "badge";
  active: boolean;
  onDone?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

const TYPE_CONFIG = {
  win: {
    count: 16,
    colors: [
      "oklch(0.78 0.2 195)",
      "oklch(0.72 0.22 155)",
      "oklch(0.7 0.22 280)",
      "oklch(0.85 0.18 195)",
    ],
    maxDistance: 80,
    duration: 700,
  },
  combo: {
    count: 12,
    colors: [
      "oklch(0.82 0.18 70)",
      "oklch(0.85 0.18 50)",
      "oklch(0.9 0.15 70)",
      "oklch(0.78 0.2 195)",
    ],
    maxDistance: 60,
    duration: 600,
  },
  levelup: {
    count: 20,
    colors: [
      "oklch(0.82 0.18 70)",
      "oklch(0.78 0.2 195)",
      "oklch(0.7 0.22 280)",
      "oklch(0.72 0.22 155)",
      "oklch(0.72 0.25 310)",
    ],
    maxDistance: 100,
    duration: 800,
  },
  badge: {
    count: 14,
    colors: [
      "oklch(0.82 0.18 70)",
      "oklch(0.85 0.15 70)",
      "oklch(0.9 0.12 70)",
      "oklch(0.78 0.2 195)",
    ],
    maxDistance: 70,
    duration: 700,
  },
};

let particleKey = 0;

function generateParticles(type: ParticleEffectProps["type"]): Particle[] {
  const config = TYPE_CONFIG[type];
  return Array.from({ length: config.count }, (_, i) => {
    const angle =
      (i / config.count) * 360 + Math.random() * (360 / config.count);
    const distance = config.maxDistance * (0.5 + Math.random() * 0.5);
    const size = 4 + Math.random() * 5;
    const color =
      config.colors[Math.floor(Math.random() * config.colors.length)];
    return {
      id: particleKey++,
      x: Math.cos((angle * Math.PI) / 180) * distance,
      y: Math.sin((angle * Math.PI) / 180) * distance,
      angle,
      distance,
      size,
      color,
      delay: Math.random() * 80,
    };
  });
}

export function ParticleEffect({ type, active, onDone }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!active) return;

    const newParticles = generateParticles(type);
    setParticles(newParticles);
    setAnimating(true);

    const config = TYPE_CONFIG[type];
    const timer = setTimeout(() => {
      setAnimating(false);
      setParticles([]);
      onDone?.();
    }, config.duration + 200);

    return () => clearTimeout(timer);
  }, [active, type, onDone]);

  if (!animating || particles.length === 0) return null;

  const config = TYPE_CONFIG[type];

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 50 }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={
              {
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
                willChange: "transform, opacity",
                left: -p.size / 2,
                top: -p.size / 2,
                animation: `particle-burst ${config.duration}ms ease-out ${p.delay}ms both`,
                "--tx": `${p.x}px`,
                "--ty": `${p.y}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <style>{`
        @keyframes particle-burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
