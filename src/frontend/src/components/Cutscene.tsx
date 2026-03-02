import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

interface CutsceneProps {
  onComplete: () => void;
}

const SLIDE_DURATION = 1200; // ms per auto-advancing slide
const LAST_SLIDE_TIMEOUT = 2000; // ms before last slide auto-completes
const TOTAL_SLIDES = 5;

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

const GAME_ICONS = [
  { icon: "🎮", label: "Number Games", delay: 0 },
  { icon: "🚀", label: "Speed Rounds", delay: 0.1 },
  { icon: "⚔️", label: "Boss Battles", delay: 0.2 },
  { icon: "🔢", label: "Algebra", delay: 0.3 },
  { icon: "📐", label: "Geometry", delay: 0.4 },
];

const BADGE_ICONS = [
  { icon: "🏆", label: "Champion", delay: 0 },
  { icon: "⭐", label: "Star Streak", delay: 0.15 },
  { icon: "🎖️", label: "Badges", delay: 0.3 },
  { icon: "🔥", label: "Hot Streak", delay: 0.45 },
];

function NeonLogo({ size = "large" }: { size?: "large" | "small" }) {
  const fontSize =
    size === "large"
      ? "clamp(2.8rem, 16vw, 5.5rem)"
      : "clamp(2rem, 12vw, 4rem)";

  return (
    <div className="flex flex-col items-center leading-none gap-1">
      <motion.div
        animate={{
          textShadow: [
            "0 0 20px oklch(0.78 0.2 195 / 0.8), 0 0 40px oklch(0.78 0.2 195 / 0.4)",
            "0 0 30px oklch(0.7 0.22 280 / 0.8), 0 0 60px oklch(0.7 0.22 280 / 0.4)",
            "0 0 20px oklch(0.78 0.2 195 / 0.8), 0 0 40px oklch(0.78 0.2 195 / 0.4)",
          ],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="font-display font-black text-center"
        style={{
          fontSize,
          background:
            "linear-gradient(135deg, oklch(0.92 0.15 195), oklch(0.8 0.22 280), oklch(0.88 0.18 50))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        MELTING
      </motion.div>
      <div
        className="font-display font-black text-center"
        style={{
          fontSize,
          background:
            "linear-gradient(135deg, oklch(0.7 0.22 280), oklch(0.65 0.22 255), oklch(0.78 0.2 195))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        MATHS
      </div>
    </div>
  );
}

// Slide 1: Intro
function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full px-8">
      {/* Burst symbols */}
      {BURST_SYMBOLS.map((sym, i) => {
        const angle = (i / BURST_SYMBOLS.length) * 360;
        const distance = 35 + (i % 3) * 12;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;
        return (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: static burst animation
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: `${tx}vw`,
              y: `${ty}vh`,
              opacity: [0, 0.9, 0.6, 0],
              scale: [0, 1.4, 1, 0],
            }}
            transition={{
              duration: 1.8,
              delay: 0.2 + i * 0.05,
              ease: "easeOut",
            }}
            className="absolute font-mono-game font-black pointer-events-none select-none"
            style={{
              fontSize: `${16 + (i % 3) * 8}px`,
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

      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 200,
          delay: 0.1,
        }}
        className="relative z-10"
      >
        <NeonLogo size="large" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="text-muted-foreground text-xs tracking-widest uppercase z-10"
        style={{ color: "oklch(0.6 0.08 265)" }}
      >
        The ultimate math gaming universe
      </motion.p>
    </div>
  );
}

// Slide 2: Games
function SlideGames() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="font-display font-black text-center"
        style={{
          fontSize: "clamp(2rem, 12vw, 3.5rem)",
          background:
            "linear-gradient(135deg, oklch(0.88 0.18 50), oklch(0.78 0.2 195))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.1,
        }}
      >
        36 Math Games
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        {GAME_ICONS.map(({ icon, label, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.3 + delay,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="text-4xl w-16 h-16 flex items-center justify-center rounded-xl"
              style={{
                background: "oklch(0.12 0.04 265)",
                border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                boxShadow: "0 0 16px oklch(0.78 0.2 195 / 0.2)",
              }}
            >
              {icon}
            </div>
            <span className="text-xs" style={{ color: "oklch(0.6 0.08 265)" }}>
              {label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="font-display font-bold tracking-wider"
        style={{
          color: "oklch(0.7 0.22 280)",
          textShadow: "0 0 12px oklch(0.7 0.22 280 / 0.5)",
          fontSize: "clamp(0.9rem, 4vw, 1.2rem)",
          letterSpacing: "0.15em",
        }}
      >
        GRADES 1 – 12
      </motion.div>
    </div>
  );
}

// Slide 3: Shinchen
function SlideShinchen() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-6xl relative"
          style={{
            background:
              "radial-gradient(circle, oklch(0.14 0.05 280) 0%, oklch(0.08 0.03 265) 100%)",
            border: "2px solid oklch(0.7 0.22 280 / 0.6)",
            boxShadow:
              "0 0 30px oklch(0.7 0.22 280 / 0.4), 0 0 60px oklch(0.7 0.22 280 / 0.15)",
          }}
        >
          ⭐{/* Orbit ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: "1px dashed oklch(0.78 0.2 195 / 0.4)",
              transform: "scale(1.2)",
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div
          className="font-display font-black text-center"
          style={{
            fontSize: "clamp(1.8rem, 10vw, 3rem)",
            background:
              "linear-gradient(135deg, oklch(0.92 0.15 195), oklch(0.7 0.22 280))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.1,
          }}
        >
          Meet SHINCHEN
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <p
          className="font-display font-semibold tracking-wide text-center"
          style={{
            color: "oklch(0.78 0.2 195)",
            fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
          }}
        >
          Your AI Math Tutor
        </p>
        <p
          className="text-xs tracking-wider text-center max-w-[260px]"
          style={{ color: "oklch(0.55 0.07 265)" }}
        >
          Hints, explanations, daily quizzes &amp; weak topic drills
        </p>
      </motion.div>

      {/* Chat bubble */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="rounded-2xl px-4 py-3 text-sm max-w-[240px]"
        style={{
          background: "oklch(0.12 0.04 265)",
          border: "1px solid oklch(0.7 0.22 280 / 0.35)",
          color: "oklch(0.85 0.06 265)",
          fontStyle: "italic",
        }}
      >
        "Hmm 🤔 Let's solve this together! You've got this!"
      </motion.div>
    </div>
  );
}

// Slide 4: Rewards
function SlideRewards() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="font-display font-black text-center"
        style={{
          fontSize: "clamp(1.8rem, 11vw, 3.2rem)",
          background:
            "linear-gradient(135deg, oklch(0.88 0.18 50), oklch(0.8 0.22 280), oklch(0.78 0.2 195))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.1,
        }}
      >
        Earn XP &amp; Badges
      </motion.div>

      <div className="flex gap-4 flex-wrap justify-center">
        {BADGE_ICONS.map(({ icon, label, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: 0.25 + delay,
              type: "spring",
              stiffness: 280,
              damping: 18,
            }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="text-3xl w-14 h-14 flex items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.18 0.06 50) 0%, oklch(0.1 0.03 265) 100%)",
                border: "1px solid oklch(0.88 0.18 50 / 0.4)",
                boxShadow: "0 0 14px oklch(0.88 0.18 50 / 0.25)",
              }}
            >
              {icon}
            </div>
            <span className="text-xs" style={{ color: "oklch(0.6 0.08 265)" }}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="flex flex-col items-center gap-1"
      >
        <p
          className="font-display font-bold tracking-widest"
          style={{
            color: "oklch(0.88 0.18 50)",
            textShadow: "0 0 12px oklch(0.88 0.18 50 / 0.5)",
            fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
            letterSpacing: "0.12em",
          }}
        >
          LEVEL UP YOUR BRAIN
        </p>
        <p className="text-xs" style={{ color: "oklch(0.55 0.07 265)" }}>
          23 badges • Daily streaks • Leaderboards
        </p>
      </motion.div>
    </div>
  );
}

// Slide 5: Start
function SlideStart() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-full px-8 text-center">
      {/* Burst symbols for final slide */}
      {BURST_SYMBOLS.slice(0, 8).map((sym, i) => {
        const angle = (i / 8) * 360;
        const distance = 30 + (i % 2) * 15;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;
        return (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: static decoration
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: `${tx}vw`,
              y: `${ty}vh`,
              opacity: [0, 0.7, 0.5, 0],
              scale: [0, 1.2, 0.9, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.08,
              ease: "easeOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
            }}
            className="absolute font-mono-game font-black pointer-events-none select-none"
            style={{
              fontSize: `${14 + (i % 3) * 6}px`,
              color:
                i % 2 === 0 ? "oklch(0.78 0.2 195)" : "oklch(0.7 0.22 280)",
              textShadow: "0 0 16px currentColor",
            }}
          >
            {sym}
          </motion.span>
        );
      })}

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 180 }}
        className="relative z-10"
      >
        <NeonLogo size="large" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4, 1] }}
        transition={{
          delay: 0.4,
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
        }}
        className="font-display font-black tracking-widest z-10"
        style={{
          fontSize: "clamp(1rem, 5vw, 1.4rem)",
          color: "oklch(0.88 0.18 50)",
          textShadow: "0 0 20px oklch(0.88 0.18 50 / 0.7)",
          letterSpacing: "0.25em",
        }}
      >
        TAP TO START
      </motion.div>
    </div>
  );
}

const SLIDES = [
  SlideIntro,
  SlideGames,
  SlideShinchen,
  SlideRewards,
  SlideStart,
];

const slideVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export function Cutscene({ onComplete }: CutsceneProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const advance = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev >= TOTAL_SLIDES - 1) return prev; // stay on last
      return prev + 1;
    });
  }, []);

  const handleClick = useCallback(() => {
    if (currentSlide >= TOTAL_SLIDES - 1) {
      onComplete();
    } else {
      advance();
    }
  }, [currentSlide, advance, onComplete]);

  // Auto-advance slides 0-3
  useEffect(() => {
    if (currentSlide >= TOTAL_SLIDES - 1) return;
    const timer = setTimeout(advance, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [currentSlide, advance]);

  // Auto-complete on last slide after timeout
  useEffect(() => {
    if (currentSlide !== TOTAL_SLIDES - 1) return;
    const timer = setTimeout(onComplete, LAST_SLIDE_TIMEOUT);
    return () => clearTimeout(timer);
  }, [currentSlide, onComplete]);

  // Total safety timeout: 7s max
  useEffect(() => {
    const timer = setTimeout(onComplete, 7000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const SlideComponent = SLIDES[currentSlide];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.1 0.03 265) 0%, oklch(0.04 0.01 265) 100%)",
        cursor: "pointer",
      }}
      onClick={handleClick}
      // biome-ignore lint/a11y/useSemanticElements: full-screen overlay
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      aria-label="Advance slideshow"
    >
      {/* Scan line */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "110vh" }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 2,
        }}
        className="absolute left-0 right-0 h-px pointer-events-none z-20"
        style={{ background: "oklch(0.78 0.2 195 / 0.3)" }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-4 left-4 w-8 h-8 pointer-events-none"
        style={{
          borderTop: "2px solid oklch(0.78 0.2 195 / 0.5)",
          borderLeft: "2px solid oklch(0.78 0.2 195 / 0.5)",
        }}
      />
      <div
        className="absolute top-4 right-4 w-8 h-8 pointer-events-none"
        style={{
          borderTop: "2px solid oklch(0.78 0.2 195 / 0.5)",
          borderRight: "2px solid oklch(0.78 0.2 195 / 0.5)",
        }}
      />
      <div
        className="absolute bottom-4 left-4 w-8 h-8 pointer-events-none"
        style={{
          borderBottom: "2px solid oklch(0.78 0.2 195 / 0.5)",
          borderLeft: "2px solid oklch(0.78 0.2 195 / 0.5)",
        }}
      />
      <div
        className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none"
        style={{
          borderBottom: "2px solid oklch(0.78 0.2 195 / 0.5)",
          borderRight: "2px solid oklch(0.78 0.2 195 / 0.5)",
        }}
      />

      {/* Slide content */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <SlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-10 flex gap-2 z-30 pointer-events-none">
        {SLIDES.map((_, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: static indicator dots
            key={i}
            animate={{
              width: i === currentSlide ? 20 : 6,
              backgroundColor:
                i === currentSlide
                  ? "oklch(0.78 0.2 195)"
                  : i < currentSlide
                    ? "oklch(0.5 0.1 265)"
                    : "oklch(0.25 0.04 265)",
              boxShadow:
                i === currentSlide
                  ? "0 0 8px oklch(0.78 0.2 195 / 0.8)"
                  : "none",
            }}
            transition={{ duration: 0.3 }}
            className="h-[6px] rounded-full"
          />
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] z-30 pointer-events-none"
        animate={{
          width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%`,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          background:
            "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
          boxShadow: "0 0 8px oklch(0.78 0.2 195 / 0.6)",
        }}
      />
    </motion.div>
  );
}
