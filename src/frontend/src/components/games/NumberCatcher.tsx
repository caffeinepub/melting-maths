import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NeonButton } from "../NeonButton";

interface NumberCatcherProps {
  level: number;
  onComplete: (result: {
    score: number;
    correct: number;
    incorrect: number;
  }) => void;
  onBack: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const LEVEL_CONFIG = {
  1: { maxSum: 5, totalTargets: 10, timeSeconds: 30 },
  2: { maxSum: 10, totalTargets: 10, timeSeconds: 30 },
  3: { maxSum: 20, totalTargets: 10, timeSeconds: 30 },
};

interface Bubble {
  id: number;
  value: number;
  x: number;
  y: number;
  caught: boolean;
  wrong: boolean;
  speed: number;
}

export function NumberCatcher({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: NumberCatcherProps) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
  const [targetSum, setTargetSum] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [caughtValues, setCaughtValues] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(config.timeSeconds);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const bubbleIdRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const generateTarget = useCallback(() => {
    return Math.floor(Math.random() * (config.maxSum - 3)) + 3;
  }, [config.maxSum]);

  const spawnBubble = useCallback(() => {
    const value = Math.floor(Math.random() * config.maxSum) + 1;
    const newBubble: Bubble = {
      id: bubbleIdRef.current++,
      value,
      x: Math.random() * 80 + 5,
      y: 100,
      caught: false,
      wrong: false,
      speed: 0.8 + Math.random() * 0.6,
    };
    return newBubble;
  }, [config.maxSum]);

  useEffect(() => {
    setTargetSum(generateTarget());
  }, [generateTarget]);

  const endGame = useCallback(
    (c: number, inc: number) => {
      setGameOver(true);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const score = Math.round((c / config.totalTargets) * 100);
      setTimeout(() => onComplete({ score, correct: c, incorrect: inc }), 1500);
    },
    [config.totalTargets, onComplete],
  );

  // Game loop
  useEffect(() => {
    if (!started || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, gameOver]);

  useEffect(() => {
    if (timeLeft === 0 && started && !gameOver) {
      endGame(correct, incorrect);
    }
  }, [timeLeft, started, gameOver, correct, incorrect, endGame]);

  // Bubble spawn
  useEffect(() => {
    if (!started || gameOver) return;
    const spawn = setInterval(() => {
      setBubbles((prev) => {
        const active = prev.filter((b) => !b.caught && !b.wrong && b.y > -10);
        if (active.length < 6) {
          return [...prev.filter((b) => b.y > -10), spawnBubble()];
        }
        return prev.filter((b) => b.y > -10);
      });
    }, 700);
    return () => clearInterval(spawn);
  }, [started, gameOver, spawnBubble]);

  // Bubble movement
  useEffect(() => {
    if (!started || gameOver) return;
    const moveInterval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) =>
            b.caught || b.wrong ? b : { ...b, y: b.y - b.speed * 0.5 },
          )
          .filter((b) => b.y > -15),
      );
    }, 50);
    return () => clearInterval(moveInterval);
  }, [started, gameOver]);

  const catchBubble = (bubble: Bubble) => {
    if (bubble.caught || bubble.wrong || gameOver) return;
    const newCaught = [...caughtValues, bubble.value];
    const sum = newCaught.reduce((a, b) => a + b, 0);

    if (sum === targetSum) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      onCorrect?.();
      setCaughtValues([]);
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, caught: true } : b)),
      );
      setTargetSum(generateTarget());
      if (newCorrect >= config.totalTargets) {
        endGame(newCorrect, incorrect);
      }
    } else if (sum > targetSum) {
      setIncorrect((i) => i + 1);
      onWrong?.();
      setCaughtValues([]);
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, wrong: true } : b)),
      );
    } else {
      setCaughtValues(newCaught);
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, caught: true } : b)),
      );
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🎯</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Number Catcher
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Numbers will fall from the sky! Click bubbles that{" "}
          <strong className="text-neon-cyan">add up to the target sum</strong>.
          Level {level}: sums up to {config.maxSum}. You have{" "}
          {config.timeSeconds} seconds!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Start Game!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  const currentSum = caughtValues.reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full" style={{ height: "480px" }}>
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10">
        <div className="font-mono-game text-sm text-neon-cyan">
          ⏱{" "}
          <span
            className={timeLeft <= 10 ? "text-red-400 animate-pulse-glow" : ""}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Catch sum:</div>
          <div className="font-display text-2xl font-bold text-glow-cyan">
            {targetSum}
          </div>
          <div className="text-xs text-muted-foreground">
            Current:{" "}
            <span
              className={
                currentSum > targetSum ? "text-red-400" : "text-neon-cyan"
              }
            >
              {currentSum}
            </span>
          </div>
        </div>
        <div className="font-mono-game text-sm">
          <span className="text-neon-cyan">✓{correct}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-muted-foreground">{config.totalTargets}</span>
        </div>
      </div>

      {/* Bubbles */}
      <div className="absolute inset-0 top-16 overflow-hidden">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              initial={{ scale: 0 }}
              animate={{ scale: bubble.caught || bubble.wrong ? 0 : 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute w-14 h-14 rounded-full font-display font-bold text-lg cursor-pointer
                flex items-center justify-center border-2 transition-colors
                ${
                  bubble.caught
                    ? "bg-green-500/20 border-green-400 text-green-300"
                    : bubble.wrong
                      ? "bg-red-500/20 border-red-400 text-red-300"
                      : "btn-neon-cyan hover:scale-110"
                }
              `}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => catchBubble(bubble)}
              aria-label={`Catch number ${bubble.value}`}
            >
              {bubble.value}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-20">
          <div className="text-center animate-bounce-in">
            <div className="text-4xl mb-2">
              {correct >= config.totalTargets / 2 ? "🎉" : "⏰"}
            </div>
            <div className="font-display text-xl font-bold text-neon-cyan">
              {correct >= config.totalTargets ? "Perfect!" : "Time's Up!"}
            </div>
            <div className="text-muted-foreground mt-1">
              Caught: {correct} / {config.totalTargets}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
