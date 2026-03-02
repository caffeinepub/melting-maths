import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { NeonButton } from "../NeonButton";

interface Props {
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
  1: { maxNum: 5, total: 8 },
  2: { maxNum: 10, total: 10 },
  3: { maxNum: 20, total: 12 },
};

function generateQuestion(maxNum: number) {
  const target = Math.floor(Math.random() * maxNum) + 1;
  const options: number[] = [target];
  while (options.length < 4) {
    const n = Math.floor(Math.random() * (maxNum + 3)) + 1;
    if (!options.includes(n)) options.push(n);
  }
  return { target, options: options.sort(() => Math.random() - 0.5) };
}

export function NumberRace({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: Props) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState(() => generateQuestion(config.maxNum));
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const nextQ = useCallback(() => {
    setQ(generateQuestion(config.maxNum));
    setFeedback(null);
  }, [config.maxNum]);

  const handleAnswer = (n: number) => {
    if (feedback || done) return;
    const total = correct + incorrect + 1;
    if (n === q.target) {
      setCorrect((c) => c + 1);
      onCorrect?.();
      setFeedback("correct");
      if (total >= config.total) {
        setTimeout(() => {
          setDone(true);
          onComplete({
            score: Math.round(((correct + 1) / config.total) * 100),
            correct: correct + 1,
            incorrect,
          });
        }, 700);
      } else {
        setTimeout(nextQ, 700);
      }
    } else {
      setIncorrect((i) => i + 1);
      onWrong?.();
      setFeedback("wrong");
      if (total >= config.total) {
        setTimeout(() => {
          setDone(true);
          onComplete({
            score: Math.round((correct / config.total) * 100),
            correct,
            incorrect: incorrect + 1,
          });
        }, 700);
      } else {
        setTimeout(nextQ, 900);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">⭐</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Number Race
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          See a number, click the matching count of objects! Level {level}:
          numbers up to {config.maxNum}.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Start!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  const dots = Array.from({ length: q.target }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-4">
      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
        <span>✓ {correct}</span>
        <span className="text-neon-cyan font-mono-game">
          {correct + incorrect}/{config.total}
        </span>
        <span className="text-red-400">✗ {incorrect}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.target}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="card-neon rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-4"
        >
          <p className="text-muted-foreground text-sm text-center">
            How many ⭐ stars?
          </p>
          <div className="flex flex-wrap justify-center gap-2 min-h-[80px]">
            {dots.map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-2xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold transition-all ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "✓ Correct!"
          : feedback === "wrong"
            ? "✗ Try again!"
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            className="py-4 rounded-xl font-display text-2xl font-bold btn-neon-cyan transition-all hover:scale-105"
            disabled={!!feedback}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
