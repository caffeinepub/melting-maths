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
  1: { total: 8, mode: "identify" },
  2: { total: 10, mode: "midpoint" },
  3: { total: 12, mode: "distance" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const mode = config.mode;

  if (mode === "identify") {
    const x = Math.floor(Math.random() * 11) - 5;
    const y = Math.floor(Math.random() * 11) - 5;
    const prompt = `Which coordinate is point (${x}, ${y}) in? (x then y)`;
    const answer = `(${x}, ${y})`;
    const fakeX = x + (Math.random() > 0.5 ? 1 : -1);
    const fakeY = y + (Math.random() > 0.5 ? 1 : -1);
    const opts = [
      answer,
      `(${fakeX}, ${y})`,
      `(${x}, ${fakeY})`,
      `(${fakeX}, ${fakeY})`,
    ].sort(() => Math.random() - 0.5);
    return { prompt, answer, options: opts };
  }
  if (mode === "midpoint") {
    const x1 = Math.floor(Math.random() * 8) - 4;
    const y1 = Math.floor(Math.random() * 8) - 4;
    const x2 = Math.floor(Math.random() * 8) - 4;
    const y2 = Math.floor(Math.random() * 8) - 4;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const answer = `(${mx}, ${my})`;
    const opts = [
      answer,
      `(${mx + 1}, ${my})`,
      `(${mx}, ${my + 1})`,
      `(${x1}, ${y2})`,
    ].sort(() => Math.random() - 0.5);
    return {
      prompt: `Midpoint of (${x1},${y1}) and (${x2},${y2})?`,
      answer,
      options: opts,
    };
  }
  const _x1 = 0;
  const _y1 = 0;
  const x2 = Math.floor(Math.random() * 5) + 3;
  const y2 = Math.floor(Math.random() * 5) + 3;
  const dist = Math.round(Math.sqrt(x2 * x2 + y2 * y2) * 10) / 10;
  const answer = String(dist);
  const opts = [
    answer,
    String(Math.round((dist + 1) * 10) / 10),
    String(Math.max(0.1, Math.round((dist - 1) * 10) / 10)),
    String(x2 + y2),
  ].sort(() => Math.random() - 0.5);
  return {
    prompt: `Distance from (0,0) to (${x2},${y2})? (round to 1dp)`,
    answer,
    options: opts,
  };
}

export function CoordinateQuest({
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
        <div className="text-6xl animate-bounce-in">🗺️</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Coordinate Quest
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Navigate the coordinate plane! Level {level}: {config.mode} questions.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Quest!
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
          <span className="font-display text-lg font-bold text-foreground">
            {q.prompt}
          </span>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "🗺️ Located!"
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
            className="py-4 rounded-xl font-display text-sm font-bold btn-neon-cyan transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
