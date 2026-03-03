import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

interface LevelUpOverlayProps {
  show: boolean;
  newLevel: number;
  onDone: () => void;
  xpEarned?: number;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  shape: "circle" | "rect" | "diamond";
}

const COLORS = [
  "oklch(0.78 0.2 195)",
  "oklch(0.7 0.22 280)",
  "oklch(0.82 0.18 70)",
  "oklch(0.72 0.22 155)",
  "oklch(0.72 0.22 25)",
  "oklch(0.72 0.22 330)",
  "oklch(0.65 0.22 255)",
  "oklch(0.9 0.15 195)",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + (i % 7) * 5,
    distance: 100 + (i % 6) * 40,
    color: COLORS[i % COLORS.length],
    size: 5 + (i % 5) * 3,
    delay: (i % 5) * 0.04,
    shape: (["circle", "rect", "diamond"] as const)[i % 3],
  }));
}

export function LevelUpOverlay({
  show,
  newLevel,
  onDone,
  xpEarned,
}: LevelUpOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particles = useMemo(() => generateParticles(35), []);

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
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: "oklch(0.04 0.02 265 / 0.95)",
            backdropFilter: "blur(12px)",
          }}
          onClick={onDone}
          aria-label="Level up! Tap to continue"
        >
          {/* Radial burst background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 4, opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.2 195 / 0.8), oklch(0.7 0.22 280 / 0.4), transparent)",
            }}
          />

          {/* Particle burst - outer ring */}
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = `${Math.cos(rad) * p.distance}px`;
            const ty = `${Math.sin(rad) * p.distance}px`;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.4, 1, 0],
                  x: tx,
                  y: ty,
                  rotate: p.id * 30,
                }}
                transition={{
                  duration: 2.0,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                className="absolute pointer-events-none"
                style={{
                  width: p.size,
                  height:
                    p.shape === "rect" ? Math.max(p.size * 0.4, 3) : p.size,
                  background: p.color,
                  borderRadius: p.shape === "circle" ? "50%" : "2px",
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  transform: p.shape === "diamond" ? "rotate(45deg)" : "none",
                }}
              />
            );
          })}

          {/* Floating sparkles near the center */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative
                key={`sparkle-${i}`}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: `${Math.cos(rad) * 55}px`,
                  y: `${Math.sin(rad) * 55}px`,
                }}
                transition={{
                  duration: 1.0,
                  delay: 0.2 + i * 0.08,
                  ease: "easeOut",
                }}
                className="absolute text-lg pointer-events-none"
              >
                ✦
              </motion.div>
            );
          })}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.3, opacity: 0, y: -50 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 18,
              delay: 0.08,
            }}
            className="flex flex-col items-center gap-5 text-center px-8 relative z-10"
          >
            {/* Glowing star with ring */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.78 0.2 195 / 0.8), transparent 70%)",
                  filter: "blur(6px)",
                }}
              />
              <motion.div
                animate={{
                  rotate: [0, 20, -20, 15, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="relative text-8xl drop-shadow-[0_0_40px_oklch(0.78_0.2_195/0.9)]"
              >
                ⭐
              </motion.div>
            </div>

            {/* LEVEL UP text */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div
                className="font-display font-black leading-none tracking-wider"
                style={{
                  fontSize: "clamp(3rem, 14vw, 5rem)",
                  background:
                    "linear-gradient(135deg, oklch(0.95 0.15 195) 0%, oklch(0.88 0.2 280) 40%, oklch(0.92 0.18 50) 80%, oklch(0.95 0.15 195) 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 30px oklch(0.78 0.2 195 / 0.6))",
                  animation: "shimmer 2s linear infinite",
                }}
              >
                LEVEL UP!
              </div>
            </motion.div>

            {/* Level number badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 250 }}
              className="rounded-3xl px-8 py-3 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.06 195 / 0.95), oklch(0.14 0.05 280 / 0.95))",
                border: "2px solid oklch(0.78 0.2 195 / 0.6)",
                boxShadow:
                  "0 0 40px oklch(0.78 0.2 195 / 0.4), 0 0 80px oklch(0.78 0.2 195 / 0.2), inset 0 1px 0 oklch(0.9 0.15 195 / 0.2)",
              }}
            >
              {/* Shimmer overlay */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.9 0.15 195 / 0.15), transparent)",
                }}
              />
              <span className="relative font-display text-3xl font-bold text-foreground">
                Level {newLevel}
              </span>
            </motion.div>

            {/* XP earned */}
            {xpEarned !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display font-bold text-xl"
                style={{ color: "oklch(0.82 0.18 70)" }}
              >
                +{xpEarned} XP Earned! ⚡
              </motion.div>
            )}

            {/* Tap to dismiss */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
              transition={{
                delay: 1.2,
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
              className="text-muted-foreground text-xs mt-1"
            >
              Tap to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
