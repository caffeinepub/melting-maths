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
  2: { total: 10, mode: "magnitude" },
  3: { total: 12, mode: "dot" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const { mode } = config;

  const a = [
    Math.floor(Math.random() * 6) - 3,
    Math.floor(Math.random() * 6) - 3,
  ];
  const b = [
    Math.floor(Math.random() * 6) - 3,
    Math.floor(Math.random() * 6) - 3,
  ];

  if (mode === "add") {
    const sum = [a[0] + b[0], a[1] + b[1]];
    const answer = `(${sum[0]}, ${sum[1]})`;
    const opts = [
      answer,
      `(${sum[0] + 1}, ${sum[1]})`,
      `(${sum[0]}, ${sum[1] + 1})`,
      `(${a[0]}, ${b[1]})`,
    ];
    return {
      prompt: `a=(${a[0]},${a[1]}) b=(${b[0]},${b[1]})\nFind a + b`,
      answer,
      options: opts.sort(() => Math.random() - 0.5),
    };
  }
  if (mode === "magnitude") {
    const mag = Math.round(Math.sqrt(a[0] ** 2 + a[1] ** 2) * 10) / 10;
    const answer = String(mag);
    const opts = [
      answer,
      String(Math.round((mag + 0.5) * 10) / 10),
      String(Math.max(0.1, Math.round((mag - 0.5) * 10) / 10)),
      String(Math.abs(a[0]) + Math.abs(a[1])),
    ];
    return {
      prompt: `a=(${a[0]},${a[1]})\nFind |a| (magnitude, 1dp)`,
      answer,
      options: [...new Set(opts)].slice(0, 4).sort(() => Math.random() - 0.5),
    };
  }
  const dot = a[0] * b[0] + a[1] * b[1];
  const answer = String(dot);
  const opts = [
    answer,
    String(dot + 2),
    String(dot - 2),
    String(a[0] * b[0]),
  ].sort(() => Math.random() - 0.5);
  return {
    prompt: `a=(${a[0]},${a[1]}) b=(${b[0]},${b[1]})\nFind a · b (dot product)`,
    answer,
    options: opts,
  };
}

export function VectorsVoyage({
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
        <div className="text-6xl animate-bounce-in">🧭</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Vectors Voyage
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Navigate with vectors! Level {level}:{" "}
          {config.mode === "add"
            ? "vector addition"
            : config.mode === "magnitude"
              ? "magnitude"
              : "dot products"}
          .
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Set Sail!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  const [line1, line2] = q.prompt.split("\n");

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
          className="card-neon rounded-2xl p-5 w-full max-w-sm flex flex-col gap-2 text-center"
        >
          <p className="text-neon-cyan font-mono-game text-sm">{line1}</p>
          <p className="text-foreground font-semibold">{line2}</p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "🧭 On course!"
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
            className="py-4 rounded-xl font-display text-base font-bold btn-neon-blue transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
