import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

interface ConfettiBurstProps {
  show: boolean;
  onDone: () => void;
}

interface ConfettiPiece {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  shape: "circle" | "rect" | "star";
  rotation: number;
}

const COLORS = [
  "oklch(0.78 0.2 195)",
  "oklch(0.7 0.22 280)",
  "oklch(0.82 0.18 70)",
  "oklch(0.72 0.22 155)",
  "oklch(0.72 0.22 25)",
  "oklch(0.72 0.22 330)",
  "oklch(0.65 0.22 255)",
];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + (i % 3) * 12,
    distance: 80 + (i % 5) * 30,
    color: COLORS[i % COLORS.length],
    size: 6 + (i % 4) * 3,
    shape: (["circle", "rect", "star"] as const)[i % 3],
    rotation: i * 47,
  }));
}

export function ConfettiBurst({ show, onDone }: ConfettiBurstProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pieces = useMemo(() => generatePieces(28), []);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onDone();
      }, 2000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          aria-live="polite"
          aria-label="Badge earned!"
        >
          {/* Confetti pieces */}
          {pieces.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;

            return (
              <motion.div
                key={p.id}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: tx,
                  y: ty,
                  opacity: [1, 1, 0],
                  scale: [0, 1.2, 0.8],
                  rotate: p.rotation,
                }}
                transition={{
                  duration: 1.6,
                  delay: (p.id % 4) * 0.05,
                  ease: "easeOut",
                }}
                className="absolute"
                style={{
                  width: p.size,
                  height: p.shape === "rect" ? p.size * 0.5 : p.size,
                  background: p.color,
                  borderRadius:
                    p.shape === "circle"
                      ? "50%"
                      : p.shape === "star"
                        ? "2px"
                        : "1px",
                  boxShadow: `0 0 ${p.size}px ${p.color}`,
                }}
              />
            );
          })}

          {/* Center burst flash */}
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute w-20 h-20 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.95 0.2 70 / 0.8), oklch(0.82 0.22 50 / 0.3), transparent)",
            }}
          />

          {/* Badge earned text */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="relative px-5 py-2.5 rounded-2xl text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 50 / 0.95), oklch(0.08 0.02 265 / 0.98))",
              border: "2px solid oklch(0.82 0.22 50 / 0.8)",
              boxShadow:
                "0 0 30px oklch(0.82 0.22 50 / 0.5), 0 0 60px oklch(0.82 0.22 50 / 0.2)",
            }}
          >
            <div
              className="font-display font-black text-lg"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.95 0.2 50), oklch(0.82 0.22 70))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🏅 NEW BADGE!
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
