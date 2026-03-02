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
  1: { total: 8, mode: "simplify" },
  2: { total: 10, mode: "complete" },
  3: { total: 12, mode: "both" },
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const mode =
    config.mode === "both"
      ? Math.random() > 0.5
        ? "simplify"
        : "complete"
      : config.mode;

  if (mode === "simplify") {
    const a = Math.floor(Math.random() * 4) + 2;
    const b = Math.floor(Math.random() * 4) + 2;
    const factor = Math.floor(Math.random() * 3) + 2;
    const bigA = a * factor;
    const bigB = b * factor;
    const g = gcd(a, b);
    const simplA = a / g;
    const simplB = b / g;
    const answer = `${simplA}:${simplB}`;
    const wrongs = [
      `${simplA + 1}:${simplB}`,
      `${simplA}:${simplB + 1}`,
      `${a}:${b}`,
      `${bigA}:${bigB}`,
    ];
    const opts = [answer, ...wrongs.slice(0, 3)].sort(
      () => Math.random() - 0.5,
    );
    return { prompt: `Simplify: ${bigA} : ${bigB}`, answer, options: opts };
  }
  const a = Math.floor(Math.random() * 5) + 2;
  const b = Math.floor(Math.random() * 5) + 2;
  const factor = Math.floor(Math.random() * 3) + 2;
  const answer = a * factor;
  const prompt = `If ${a} : ${b} = ? : ${b * factor}`;
  const opts = [answer, answer + 1, answer - 1, answer + factor].sort(
    () => Math.random() - 0.5,
  );
  return { prompt, answer, options: opts.map(String) };
}

export function RatioRumble({
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

  const handleAnswer = (opt: string | number) => {
    if (feedback) return;
    const ans = String(opt);
    const total = correct + incorrect + 1;
    const isCorrect = ans === String(q.answer);
    if (isCorrect) {
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
        <div className="text-6xl animate-bounce-in">⚖️</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Ratio Rumble
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Simplify or complete ratios! Each correct answer scores a point. Level{" "}
          {level}: {config.total} questions.
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="card-neon rounded-2xl p-6 text-center w-full max-w-sm"
        >
          <span className="font-display text-3xl font-black text-foreground">
            {q.prompt}
          </span>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "⚖️ Balanced!"
          : feedback === "wrong"
            ? `✗ Answer: ${q.answer}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={String(opt)}
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
