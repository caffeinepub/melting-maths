import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface GameIntroProps {
  gameTitle: string;
  gradeGroup: string;
  onComplete: () => void;
}

const GRADE_GROUP_COLORS: Record<
  string,
  { primary: string; secondary: string; glow: string }
> = {
  "1-3": {
    primary: "oklch(0.78 0.2 195)",
    secondary: "oklch(0.65 0.2 180)",
    glow: "0 0 60px oklch(0.78 0.2 195 / 0.4), 0 0 120px oklch(0.78 0.2 195 / 0.2)",
  },
  "4-5": {
    primary: "oklch(0.7 0.22 280)",
    secondary: "oklch(0.6 0.2 270)",
    glow: "0 0 60px oklch(0.7 0.22 280 / 0.4), 0 0 120px oklch(0.7 0.22 280 / 0.2)",
  },
  "6-8": {
    primary: "oklch(0.72 0.22 155)",
    secondary: "oklch(0.62 0.2 145)",
    glow: "0 0 60px oklch(0.72 0.22 155 / 0.4), 0 0 120px oklch(0.72 0.22 155 / 0.2)",
  },
  "9-10": {
    primary: "oklch(0.82 0.18 70)",
    secondary: "oklch(0.72 0.18 60)",
    glow: "0 0 60px oklch(0.82 0.18 70 / 0.4), 0 0 120px oklch(0.82 0.18 70 / 0.2)",
  },
  "11-12": {
    primary: "oklch(0.72 0.25 310)",
    secondary: "oklch(0.62 0.22 300)",
    glow: "0 0 60px oklch(0.72 0.25 310 / 0.4), 0 0 120px oklch(0.72 0.25 310 / 0.2)",
  },
};

type CountdownStep = "game-title" | "3" | "2" | "1" | "go" | "flash";

export function GameIntro({
  gameTitle,
  gradeGroup,
  onComplete,
}: GameIntroProps) {
  const [step, setStep] = useState<CountdownStep>("game-title");
  const colors = GRADE_GROUP_COLORS[gradeGroup] ?? GRADE_GROUP_COLORS["1-3"];

  useEffect(() => {
    const sequence: [CountdownStep, number][] = [
      ["game-title", 1200],
      ["3", 700],
      ["2", 700],
      ["1", 700],
      ["go", 600],
      ["flash", 300],
    ];

    let timeout: ReturnType<typeof setTimeout>;
    let index = 0;

    const next = () => {
      if (index >= sequence.length) {
        onComplete();
        return;
      }
      const [nextStep, delay] = sequence[index];
      index++;
      setStep(nextStep);
      timeout = setTimeout(next, delay);
    };

    timeout = setTimeout(next, 400);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const isCountdown = step === "3" || step === "2" || step === "1";
  const isGo = step === "go";
  const isFlash = step === "flash";

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isFlash ? 1 : 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: isFlash
          ? colors.primary
          : "radial-gradient(ellipse 80% 70% at 50% 50%, oklch(0.08 0.04 265), oklch(0.04 0.02 270))",
      }}
      data-ocid="game_intro.panel"
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle, ${colors.primary}, transparent 70%)`,
          top: "-10%",
          left: "20%",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-15"
        style={{
          background: `radial-gradient(circle, ${colors.secondary}, transparent 70%)`,
          bottom: "10%",
          right: "15%",
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0.9 0.05 265) 2px, oklch(0.9 0.05 265) 4px)",
        }}
      />

      <AnimatePresence mode="wait">
        {step === "game-title" && (
          <motion.div
            key="game-title"
            className="flex flex-col items-center gap-5 px-8 text-center"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            {/* Grade badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase"
              style={{
                background: `${colors.primary.replace(")", " / 0.15)")}`,
                border: `1px solid ${colors.primary.replace(")", " / 0.5)")}`,
                color: colors.primary,
                boxShadow: `0 0 12px ${colors.primary.replace(")", " / 0.3)")}`,
              }}
            >
              Grades {gradeGroup}
            </motion.div>

            {/* Game title */}
            <motion.h1
              className="font-display font-black leading-tight"
              style={{
                fontSize: "clamp(2.4rem, 10vw, 4rem)",
                letterSpacing: "-0.02em",
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `drop-shadow(${colors.glow.split(",")[0]})`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              {gameTitle}
            </motion.h1>

            {/* "GET READY" subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display text-sm font-bold tracking-[0.3em] uppercase text-muted-foreground"
            >
              GET READY
            </motion.div>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
              className="w-32 h-0.5"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                boxShadow: `0 0 8px ${colors.primary.replace(")", " / 0.5)")}`,
              }}
            />
          </motion.div>
        )}

        {isCountdown && (
          <motion.div
            key={step}
            className="flex flex-col items-center gap-2"
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {/* Big countdown number */}
            <motion.div
              className="font-display font-black tabular-nums select-none"
              style={{
                fontSize: "clamp(7rem, 30vw, 12rem)",
                lineHeight: 1,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `drop-shadow(0 0 30px ${colors.primary.replace(")", " / 0.6)")})`,
              }}
            >
              {step}
            </motion.div>

            {/* Pulse ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "220px",
                height: "220px",
                border: `2px solid ${colors.primary.replace(")", " / 0.4)")}`,
              }}
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {isGo && (
          <motion.div
            key="go"
            className="font-display font-black select-none"
            style={{
              fontSize: "clamp(5rem, 22vw, 9rem)",
              letterSpacing: "-0.04em",
              background: `linear-gradient(135deg, ${colors.primary} 0%, oklch(0.92 0.12 70) 50%, ${colors.primary} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 40px ${colors.primary.replace(")", " / 0.8)")})`,
            }}
            initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
            animate={{ scale: [0.3, 1.15, 1], opacity: 1, rotate: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 20,
              duration: 0.4,
            }}
          >
            GO!
          </motion.div>
        )}

        {isFlash && (
          <motion.div
            key="flash"
            className="absolute inset-0"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ background: colors.primary }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
