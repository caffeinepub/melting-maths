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
  1: { total: 8, mode: "add" },
  2: { total: 10, mode: "multiply" },
  3: { total: 12, mode: "both" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const mode =
    config.mode === "both"
      ? Math.random() > 0.5
        ? "add"
        : "multiply"
      : config.mode;

  const r1 = Math.floor(Math.random() * 5) + 1;
  const i1 = Math.floor(Math.random() * 5) + 1;
  const r2 = Math.floor(Math.random() * 5) + 1;
  const i2 = Math.floor(Math.random() * 5) + 1;

  const s1 = `${r1}+${i1}i`;
  const s2 = `${r2}+${i2}i`;

  let answer: string;
  let prompt: string;

  if (mode === "add") {
    const ar = r1 + r2;
    const ai = i1 + i2;
    answer = `${ar}+${ai}i`;
    prompt = `(${s1}) + (${s2})`;
    const opts = [
      answer,
      `${ar + 1}+${ai}i`,
      `${ar}+${ai + 1}i`,
      `${ar - 1}+${ai}i`,
    ];
    return { prompt, answer, options: opts.sort(() => Math.random() - 0.5) };
  }
  // (r1+i1·i)(r2+i2·i) = r1r2 - i1i2 + (r1i2 + i1r2)i
  const ar = r1 * r2 - i1 * i2;
  const ai = r1 * i2 + i1 * r2;
  const sign = ai >= 0 ? "+" : "";
  answer = `${ar}${sign}${ai}i`;
  prompt = `(${s1}) × (${s2})`;
  const opts = [
    answer,
    `${ar + 1}${sign}${ai}i`,
    `${r1 * r2}+${i1 * i2}i`,
    `${ar}+${ai + 1}i`,
  ];
  return { prompt, answer, options: opts.sort(() => Math.random() - 0.5) };
}

export function ComplexClash({
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
        <div className="text-6xl animate-bounce-in">⚡</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Complex Clash
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Operate with complex numbers (a+bi)! Level {level}:{" "}
          {config.mode === "add"
            ? "addition"
            : config.mode === "multiply"
              ? "multiplication"
              : "both"}
          .
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Clash!
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
          <p className="text-muted-foreground text-xs mb-2">Compute:</p>
          <span className="font-display text-3xl font-black text-foreground">
            {q.prompt}
          </span>
          <p className="text-muted-foreground text-xs mt-2">
            Remember: i² = -1
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "⚡ Clashed!"
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
            className="py-4 rounded-xl font-display text-base font-bold btn-neon-cyan transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
