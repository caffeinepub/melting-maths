import { motion } from "motion/react";
import { useEffect } from "react";

interface CutsceneProps {
  onComplete: () => void;
}

const BURST_SYMBOLS = [
  "∫",
  "∑",
  "π",
  "√",
  "∞",
  "Δ",
  "θ",
  "±",
  "÷",
  "×",
  "²",
  "α",
];

export function Cutscene({ onComplete }: CutsceneProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.1 0.03 265) 0%, oklch(0.04 0.01 265) 100%)",
      }}
      onClick={onComplete}
    >
      {/* Burst symbols */}
      {BURST_SYMBOLS.map((sym, i) => {
        const angle = (i / BURST_SYMBOLS.length) * 360;
        const distance = 45 + (i % 3) * 15;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;

        return (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: static burst animation array
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: `${tx}vw`,
              y: `${ty}vh`,
              opacity: [0, 0.9, 0.7, 0],
              scale: [0, 1.5, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.4 + i * 0.06,
              ease: "easeOut",
            }}
            className="absolute font-mono-game font-black pointer-events-none"
            style={{
              fontSize: `${18 + (i % 3) * 8}px`,
              color:
                i % 3 === 0
                  ? "oklch(0.78 0.2 195)"
                  : i % 3 === 1
                    ? "oklch(0.7 0.22 280)"
                    : "oklch(0.65 0.22 255)",
              textShadow: "0 0 20px currentColor",
            }}
          >
            {sym}
          </motion.span>
        );
      })}

      {/* Main title */}
      <div className="relative flex flex-col items-center gap-3 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            type: "spring",
            stiffness: 200,
          }}
        >
          <motion.div
            animate={{
              textShadow: [
                "0 0 20px oklch(0.78 0.2 195 / 0.8), 0 0 40px oklch(0.78 0.2 195 / 0.4)",
                "0 0 30px oklch(0.7 0.22 280 / 0.8), 0 0 60px oklch(0.7 0.22 280 / 0.4)",
                "0 0 20px oklch(0.78 0.2 195 / 0.8), 0 0 40px oklch(0.78 0.2 195 / 0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="font-display font-black text-center leading-none"
            style={{
              fontSize: "clamp(2.5rem, 15vw, 5rem)",
              background:
                "linear-gradient(135deg, oklch(0.92 0.15 195), oklch(0.8 0.22 280), oklch(0.88 0.18 50))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            MELTING
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="font-display font-black text-center leading-none"
            style={{
              fontSize: "clamp(2.5rem, 15vw, 5rem)",
              background:
                "linear-gradient(135deg, oklch(0.7 0.22 280), oklch(0.65 0.22 255), oklch(0.78 0.2 195))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            MATHS
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-muted-foreground text-xs tracking-widest uppercase"
        >
          Tap to skip
        </motion.p>
      </div>

      {/* Scan line effect */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100vh" }}
        transition={{ duration: 2, delay: 0.3, ease: "linear" }}
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: "oklch(0.78 0.2 195 / 0.4)" }}
      />
    </motion.div>
  );
}
