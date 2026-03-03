import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

interface ComboOverlayProps {
  show: boolean;
  combo: number;
  onDone: () => void;
}

export function ComboOverlay({ show, combo, onDone }: ComboOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onDone();
      }, 1500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.3, y: -30 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          aria-live="polite"
          aria-label={`Combo x${combo}!`}
        >
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.82 0.22 50 / 0.6), transparent 70%)",
              filter: "blur(8px)",
            }}
          />

          <div
            className="relative px-6 py-3 rounded-2xl text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 50 / 0.95), oklch(0.08 0.03 265 / 0.98))",
              border: "2px solid oklch(0.82 0.22 50 / 0.8)",
              boxShadow:
                "0 0 30px oklch(0.82 0.22 50 / 0.6), 0 0 60px oklch(0.82 0.22 50 / 0.3), inset 0 1px 0 oklch(0.9 0.18 50 / 0.2)",
            }}
          >
            <motion.div
              animate={{ rotate: [-3, 3, -3, 3, 0] }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="font-display font-black tracking-wider leading-none"
                style={{
                  fontSize: "clamp(1.2rem, 6vw, 1.8rem)",
                  background:
                    "linear-gradient(90deg, oklch(0.95 0.2 50), oklch(0.82 0.22 50), oklch(0.95 0.18 70))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 8px oklch(0.82 0.22 50 / 0.6))",
                }}
              >
                🔥 COMBO x{combo}!
              </div>
              <div
                className="font-display font-bold text-sm tracking-widest mt-1"
                style={{ color: "oklch(0.9 0.18 70)" }}
              >
                DOUBLE XP BONUS!
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
