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
  1: { total: 8, mode: "arithmetic" },
  2: { total: 10, mode: "geometric" },
  3: { total: 12, mode: "both" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const isArith =
    config.mode === "arithmetic" ||
    (config.mode === "both" && Math.random() > 0.5);

  if (isArith) {
    const a1 = Math.floor(Math.random() * 10) + 1;
    const d = Math.floor(Math.random() * 6) + 1;
    const n = Math.floor(Math.random() * 5) + 4; // find nth term where n = 4..8
    const answer = a1 + (n - 1) * d;
    const seq = Array.from({ length: 3 }, (_, i) => a1 + i * d);
    const opts = [answer, answer + d, answer - d, answer + 2 * d].sort(
      () => Math.random() - 0.5,
    );
    return {
      seq,
      prompt: `a₁=${a1}, d=${d}. Find term n=${n}`,
      answer,
      options: opts,
      type: "arithmetic",
    };
  }
  const a1 = Math.floor(Math.random() * 3) + 1;
  const r = Math.floor(Math.random() * 2) + 2;
  const n = Math.floor(Math.random() * 3) + 4;
  const answer = a1 * r ** (n - 1);
  const seq = Array.from({ length: 3 }, (_, i) => a1 * r ** i);
  const opts = [
    answer,
    answer * r,
    Math.max(1, Math.round(answer / r)),
    answer + r,
  ].sort(() => Math.random() - 0.5);
  return {
    seq,
    prompt: `a₁=${a1}, r=${r}. Find term n=${n}`,
    answer,
    options: opts,
    type: "geometric",
  };
}

export function SequenceSolver({
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

  const nextQ = useCallback(() => {
    setQ(makeQ(level));
    setFeedback(null);
  }, [level]);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (n === q.answer) {
      setCorrect((c) => c + 1);
      onCorrect?.();
      setFeedback("correct");
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
      } else setTimeout(nextQ, 700);
    } else {
      setIncorrect((i) => i + 1);
      onWrong?.();
      setFeedback("wrong");
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((correct / config.total) * 100),
              correct,
              incorrect: incorrect + 1,
            }),
          900,
        );
      } else setTimeout(nextQ, 900);
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🧮</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Sequence Solver
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Find the nth term of arithmetic and geometric sequences! Level {level}
          .
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

      <AnimatePresence mode="wait">
        <motion.div
          key={q.prompt}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="card-neon rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3"
        >
          <span className="text-xs text-neon-purple font-semibold uppercase tracking-wider">
            {q.type === "arithmetic"
              ? "Arithmetic Sequence"
              : "Geometric Sequence"}
          </span>
          <div className="flex gap-2 items-center">
            {q.seq.map((n, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: static sequence display
                key={i}
                className="font-display font-bold text-xl text-foreground"
              >
                {n}
                {i < q.seq.length - 1 ? "," : ", ..."}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">{q.prompt}</p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "🧮 Solved!"
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
            className="py-5 rounded-xl font-display text-2xl font-bold btn-neon-blue transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
