import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
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
  1: { total: 8, types: ["arithmetic"] },
  2: { total: 10, types: ["arithmetic", "geometric"] },
  3: { total: 12, types: ["arithmetic", "geometric", "quadratic"] },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const type = config.types[Math.floor(Math.random() * config.types.length)];

  let seq: number[];
  let answer: number;
  let ruleText: string;

  if (type === "arithmetic") {
    const start = Math.floor(Math.random() * 10) + 1;
    const diff = Math.floor(Math.random() * 5) + 2;
    seq = Array.from({ length: 5 }, (_, i) => start + i * diff);
    answer = start + 5 * diff;
    ruleText = `+${diff} each time`;
  } else if (type === "geometric") {
    const start = Math.floor(Math.random() * 3) + 1;
    const ratio = Math.floor(Math.random() * 2) + 2;
    seq = Array.from({ length: 5 }, (_, i) => start * ratio ** i);
    answer = start * ratio ** 5;
    ruleText = `×${ratio} each time`;
  } else {
    // quadratic: n²
    const offset = Math.floor(Math.random() * 3);
    seq = [1, 4, 9, 16, 25].map((n) => n + offset);
    answer = 36 + offset;
    ruleText = "n² sequence";
  }

  const blankIdx = seq.length; // blank is at the END
  const opts = [
    answer,
    answer + 2,
    answer - 2,
    answer + seq[1] - seq[0],
  ].filter((v) => v > 0);
  const uniqueOpts = [...new Set(opts)].slice(0, 4);
  while (uniqueOpts.length < 4) uniqueOpts.push(answer + uniqueOpts.length * 3);

  return {
    seq,
    answer,
    options: uniqueOpts.sort(() => Math.random() - 0.5),
    blankIdx,
    ruleText,
  };
}

export function PatternDetective({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: Props) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState(() => makeQ(level));
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showRule, setShowRule] = useState(false);

  const nextQ = useCallback(() => {
    setQ(makeQ(level));
    setFeedback(null);
    setShowRule(false);
  }, [level]);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (n === q.answer) {
      setCorrect((c) => c + 1);
      onCorrect?.();
      setFeedback("correct");
      setShowRule(true);
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round(((correct + 1) / config.total) * 100),
              correct: correct + 1,
              incorrect,
            }),
          700,
        );
      } else setTimeout(nextQ, 1000);
    } else {
      setIncorrect((i) => i + 1);
      onWrong?.();
      setFeedback("wrong");
      setShowRule(true);
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((correct / config.total) * 100),
              correct,
              incorrect: incorrect + 1,
            }),
          1000,
        );
      } else setTimeout(nextQ, 1000);
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🔍</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Pattern Detective
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Spot the pattern and find the next number! Level {level}:{" "}
          {config.total} patterns.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Investigate!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-4">
      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
        <span className="text-green-400">🔍 {correct}</span>
        <span className="text-neon-cyan font-mono-game">
          {correct + incorrect}/{config.total}
        </span>
        <span className="text-red-400">✗ {incorrect}</span>
      </div>

      <p className="text-muted-foreground text-xs">What comes next?</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.seq[0]}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex items-center gap-2 flex-wrap justify-center"
        >
          {q.seq.map((n, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static sequence display
              key={i}
              className="flex items-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary border border-border/50 flex items-center justify-center font-display font-bold text-lg text-foreground">
                {n}
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
          ))}
          <div
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-display font-bold text-lg
              ${
                feedback === "correct"
                  ? "bg-green-500/20 border-green-400 text-green-300"
                  : feedback === "wrong"
                    ? "bg-red-500/20 border-red-400 text-red-300"
                    : "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan animate-pulse-glow"
              }`}
          >
            {feedback ? q.answer : "?"}
          </div>
        </motion.div>
      </AnimatePresence>

      {showRule && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-neon-purple"
        >
          Rule: {q.ruleText}
        </motion.p>
      )}

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "🔍 Detected!"
          : feedback === "wrong"
            ? `✗ Answer: ${q.answer}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            className="py-4 rounded-xl font-display text-xl font-bold btn-neon-cyan transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
