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
  1: { total: 8, mode: "basic" },
  2: { total: 10, mode: "properties" },
  3: { total: 12, mode: "both" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const mode =
    config.mode === "both"
      ? Math.random() > 0.5
        ? "basic"
        : "properties"
      : config.mode;

  if (mode === "basic") {
    const bases = [2, 3, 5, 10];
    const base = bases[Math.floor(Math.random() * bases.length)];
    const exp = Math.floor(Math.random() * 4) + 1;
    const result = base ** exp;
    const answer = exp;
    const prompt = `log₍${base}₎(${result}) = ?`;
    const opts = [answer, answer + 1, Math.max(0, answer - 1), answer + 2].sort(
      () => Math.random() - 0.5,
    );
    return { prompt, answer: String(answer), options: opts.map(String) };
  }
  // log(a×b) = log(a) + log(b)
  const a = Math.floor(Math.random() * 4) + 2;
  const b = Math.floor(Math.random() * 4) + 2;
  const logA = Math.log10(a).toFixed(2);
  const logB = Math.log10(b).toFixed(2);
  const answer = (Number.parseFloat(logA) + Number.parseFloat(logB)).toFixed(2);
  const prompt = `If log(${a})≈${logA} and log(${b})≈${logB}, find log(${a * b})`;
  const n = Number.parseFloat(answer);
  const opts = [
    answer,
    (n + 0.1).toFixed(2),
    (n - 0.1).toFixed(2),
    (n + 0.2).toFixed(2),
  ].sort(() => Math.random() - 0.5);
  return { prompt, answer, options: opts };
}

export function LogarithmLab({
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

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (opt === q.answer) {
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
        <div className="text-6xl animate-bounce-in">🧪</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Logarithm Lab
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Evaluate logarithms and use log properties! Level {level}:{" "}
          {config.total} experiments.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Enter Lab!
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
          className="card-neon rounded-2xl p-5 w-full max-w-sm text-center"
        >
          <span className="font-display text-xl font-black text-foreground">
            {q.prompt}
          </span>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "🧪 Lab success!"
          : feedback === "wrong"
            ? `✗ Answer: ${q.answer}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => handleAnswer(String(opt))}
            disabled={!!feedback}
            className="py-5 rounded-xl font-display text-xl font-bold btn-neon-purple transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
