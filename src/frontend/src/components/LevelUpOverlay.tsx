import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

interface LevelUpOverlayProps {
  show: boolean;
  newLevel: number;
  onDone: () => void;
}

const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

function generateParticles(): Particle[] {
  const colors = [
    "oklch(0.78 0.2 195)", // cyan
    "oklch(0.7 0.22 280)", // purple
    "oklch(0.75 0.2 50)", // amber
    "oklch(0.72 0.22 155)", // green
    "oklch(0.65 0.22 255)", // blue
  ];
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[i % colors.length],
    size: Math.random() * 8 + 4,
  }));
}

const particles = generateParticles();

export function LevelUpOverlay({
  show,
  newLevel,
  onDone,
}: LevelUpOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onDone();
      }, 2500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "oklch(0.05 0.02 265 / 0.92)",
            backdropFilter: "blur(8px)",
          }}
          onClick={onDone}
          aria-label="Level up! Tap to continue"
        >
          {/* Particle burst */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0, x: "50vw", y: "50vh" }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                x: `${p.x}vw`,
                y: `${p.y}vh`,
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: Math.random() * 0.3,
              }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
            />
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.3, opacity: 0, y: -40 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 16,
              delay: 0.1,
            }}
            className="flex flex-col items-center gap-4 text-center px-8"
          >
            {/* Glowing star */}
            <motion.div
              animate={{
                rotate: [0, 15, -15, 10, -10, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="text-7xl drop-shadow-[0_0_30px_oklch(0.78_0.2_195/0.8)]"
            >
              ⭐
            </motion.div>

            {/* LEVEL UP text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div
                className="font-display font-black leading-none"
                style={{
                  fontSize: "clamp(2.5rem, 12vw, 4rem)",
                  background:
                    "linear-gradient(135deg, oklch(0.92 0.15 195), oklch(0.85 0.2 280), oklch(0.9 0.18 50))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 20px oklch(0.78 0.2 195 / 0.5))",
                }}
              >
                LEVEL UP!
              </div>
            </motion.div>

            {/* Level number */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="rounded-2xl px-6 py-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.05 195 / 0.9), oklch(0.12 0.04 280 / 0.9))",
                border: "1px solid oklch(0.78 0.2 195 / 0.5)",
                boxShadow: "0 0 30px oklch(0.78 0.2 195 / 0.3)",
              }}
            >
              <span className="font-display text-2xl font-bold text-foreground">
                Level {newLevel}
              </span>
            </motion.div>

            {/* Tap to dismiss */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
              transition={{
                delay: 1,
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
              className="text-muted-foreground text-xs mt-2"
            >
              Tap to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
