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
  1: { total: 8, size: 5, mode: "mean" },
  2: { total: 10, size: 7, mode: "all" },
  3: { total: 12, size: 9, mode: "all" },
};

type StatMode = "mean" | "median" | "mode";

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const modes: StatMode[] =
    config.mode === "all" ? ["mean", "median", "mode"] : ["mean"];
  const statMode = modes[Math.floor(Math.random() * modes.length)];

  let data: number[];
  let answer: number;

  if (statMode === "mean") {
    data = Array.from(
      { length: config.size },
      () => Math.floor(Math.random() * 10) + 1,
    );
    answer = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
  } else if (statMode === "median") {
    data = Array.from(
      { length: config.size },
      () => Math.floor(Math.random() * 20) + 1,
    ).sort((a, b) => a - b);
    answer = data[Math.floor(data.length / 2)];
  } else {
    // mode
    const repeated = Math.floor(Math.random() * 8) + 2;
    data = [
      repeated,
      repeated,
      ...Array.from({ length: config.size - 2 }, () => {
        let n: number;
        do {
          n = Math.floor(Math.random() * 10) + 1;
        } while (n === repeated);
        return n;
      }),
    ].sort(() => Math.random() - 0.5);
    answer = repeated;
  }

  const label =
    statMode === "mean"
      ? "mean (average)"
      : statMode === "median"
        ? "median (middle value)"
        : "mode (most frequent)";
  const prompt = `Data: [${data.join(", ")}]\nFind the ${label}`;
  const opts = [
    answer,
    Math.max(1, answer - 1),
    answer + 1,
    Math.max(1, answer + 2),
  ];
  return {
    prompt,
    answer,
    options: [...new Set(opts)].slice(0, 4).sort(() => Math.random() - 0.5),
    statMode,
  };
}

export function StatisticsShowdown({
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
        <div className="text-6xl animate-bounce-in">📊</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Statistics Showdown
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Calculate mean, median, and mode from data sets! Level {level}:{" "}
          {config.size} numbers per question.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Show Down!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  const [dataLine, promptLine] = q.prompt.split("\n");

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
          <p className="text-neon-cyan font-mono-game text-sm">{dataLine}</p>
          <p className="text-foreground font-semibold text-base">
            {promptLine}
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "📊 Statistically correct!"
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
            className="py-5 rounded-xl font-display text-2xl font-bold btn-neon-purple transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
