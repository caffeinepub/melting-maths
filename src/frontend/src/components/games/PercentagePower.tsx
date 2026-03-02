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
  1: { total: 8, mode: "of" },
  2: { total: 10, mode: "find_percent" },
  3: { total: 12, mode: "both" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const mode =
    config.mode === "both"
      ? Math.random() > 0.5
        ? "of"
        : "find_percent"
      : config.mode;

  if (mode === "of") {
    const pcts = [10, 20, 25, 50, 75, 5, 40, 60];
    const pct = pcts[Math.floor(Math.random() * pcts.length)];
    const base = (Math.floor(Math.random() * 15) + 2) * 10;
    const answer = Math.round((pct / 100) * base);
    const opts = [
      answer,
      answer + 5,
      Math.max(1, answer - 5),
      answer + 10,
    ].sort(() => Math.random() - 0.5);
    return { prompt: `What is ${pct}% of ${base}?`, answer, options: opts };
  }
  const part = Math.floor(Math.random() * 9) + 1;
  const whole = (Math.floor(Math.random() * 5) + 2) * 10;
  const answer = Math.round((part / whole) * 100);
  if (answer > 100 || answer === 0) return makeQ(level);
  const opts = [
    answer,
    Math.max(1, answer - 10),
    answer + 10,
    Math.max(1, answer - 5),
  ].sort(() => Math.random() - 0.5);
  return { prompt: `${part} is what % of ${whole}?`, answer, options: opts };
}

export function PercentagePower({
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
        <div className="text-6xl animate-bounce-in">💯</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Percentage Power
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Calculate percentages like a pro! Level {level}: {config.total}{" "}
          questions.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Power Up!
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
          className="card-neon rounded-2xl p-6 text-center w-full max-w-sm"
        >
          <span className="font-display text-2xl font-black text-foreground">
            {q.prompt}
          </span>
          <p className="text-muted-foreground text-xs mt-2">
            Choose the correct answer
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "💯 Powerful!"
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
