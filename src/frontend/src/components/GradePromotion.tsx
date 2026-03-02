import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { NeonButton } from "./NeonButton";

interface GradePromotionProps {
  currentGrade: number;
  newGrade: number;
  onAccept: () => void;
}

function generateConfetti(count = 60) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2.5 + Math.random() * 2}s`,
    color: [
      "oklch(0.78 0.2 195)",
      "oklch(0.7 0.22 280)",
      "oklch(0.82 0.18 70)",
      "oklch(0.75 0.2 155)",
      "oklch(0.65 0.22 255)",
      "oklch(0.72 0.22 330)",
    ][i % 6],
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }));
}

export function GradePromotion({
  currentGrade,
  newGrade,
  onAccept,
}: GradePromotionProps) {
  const confetti = useMemo(() => generateConfetti(60), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: "oklch(0.05 0.02 265 / 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-piece"
          style={{
            left: c.left,
            top: "-10px",
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${c.rotate})`,
            animationDelay: c.delay,
            animationDuration: c.duration,
            boxShadow: `0 0 6px ${c.color}`,
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex flex-col items-center gap-6 text-center px-8 z-10 max-w-sm"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="text-8xl"
        >
          🎓
        </motion.div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display font-black leading-none mb-2"
            style={{
              fontSize: "clamp(2rem, 12vw, 3.5rem)",
              background:
                "linear-gradient(135deg, oklch(0.92 0.15 195), oklch(0.85 0.2 280), oklch(0.9 0.18 50))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GRADE UP!
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-sm"
          >
            Grade {currentGrade} → Grade {newGrade}
          </motion.p>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          className="rounded-2xl px-6 py-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.15 0.05 195 / 0.9), oklch(0.12 0.04 280 / 0.9))",
            border: "1px solid oklch(0.78 0.2 195 / 0.5)",
            boxShadow: "0 0 30px oklch(0.78 0.2 195 / 0.3)",
          }}
        >
          <p className="text-foreground font-display font-bold text-lg">
            You're now <span className="text-neon-cyan">Grade {newGrade}!</span>
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            New challenges await! +🎓 Grade Up badge earned!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <NeonButton variant="cyan" size="lg" onClick={onAccept}>
            Accept Promotion! 🚀
          </NeonButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
