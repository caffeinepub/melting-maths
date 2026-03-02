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
  1: { steps: [2, 5, 10], total: 8, seqLen: 4 },
  2: { steps: [3, 4, 6], total: 10, seqLen: 5 },
  3: { steps: [7, 8, 9, 11], total: 12, seqLen: 6 },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const step = config.steps[Math.floor(Math.random() * config.steps.length)];
  const start = Math.floor(Math.random() * 5) + 1;
  const seq = Array.from({ length: config.seqLen }, (_, i) => start + i * step);
  const blankIdx = Math.floor(Math.random() * (config.seqLen - 1)) + 1;
  const answer = seq[blankIdx];
  const opts = [answer];
  while (opts.length < 4) {
    const wrong =
      answer +
      (Math.random() > 0.5 ? 1 : -1) *
        step *
        (Math.floor(Math.random() * 3) + 1);
    if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
  }
  return {
    seq,
    blankIdx,
    answer,
    options: opts.sort(() => Math.random() - 0.5),
    step,
  };
}

export function SkipCounter({
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
  const [selected, setSelected] = useState<number | null>(null);

  const nextQ = useCallback(() => {
    setQ(makeQ(level));
    setFeedback(null);
    setSelected(null);
  }, [level]);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    setSelected(n);
    const total = correct + incorrect + 1;
    if (n === q.answer) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      onCorrect?.();
      setFeedback("correct");
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((newCorrect / config.total) * 100),
              correct: newCorrect,
              incorrect,
            }),
          700,
        );
      } else {
        setTimeout(nextQ, 700);
      }
    } else {
      const newIncorrect = incorrect + 1;
      setIncorrect(newIncorrect);
      onWrong?.();
      setFeedback("wrong");
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((correct / config.total) * 100),
              correct,
              incorrect: newIncorrect,
            }),
          900,
        );
      } else {
        setTimeout(nextQ, 900);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🔢</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Skip Counter
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Find the missing number in the skip counting sequence! Level {level}:
          count by {config.steps.join(", ")}.
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

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-4">
      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
        <span className="text-green-400">✓ {correct}</span>
        <span className="text-neon-cyan font-mono-game">
          {correct + incorrect}/{config.total}
        </span>
        <span className="text-red-400">✗ {incorrect}</span>
      </div>

      <p className="text-muted-foreground text-xs">
        Count by <span className="text-neon-cyan font-bold">{q.step}s</span> —
        fill in the blank:
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${q.blankIdx}-${q.step}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 w-full max-w-sm"
        >
          {q.seq.map((n, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static sequence display
              key={i}
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-xl border
                ${
                  i === q.blankIdx
                    ? feedback === "correct"
                      ? "bg-green-500/20 border-green-400 text-green-300"
                      : feedback === "wrong"
                        ? "bg-red-500/20 border-red-400 text-red-300"
                        : "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan animate-pulse-glow"
                    : "bg-secondary border-border/50 text-foreground"
                }`}
            >
              {i === q.blankIdx
                ? feedback
                  ? feedback === "correct"
                    ? n
                    : (selected ?? "?")
                  : "?"
                : n}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "✓ Correct!"
          : feedback === "wrong"
            ? `✗ Answer was ${q.answer}`
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
