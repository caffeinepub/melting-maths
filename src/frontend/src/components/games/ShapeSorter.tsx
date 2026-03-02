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

const SHAPES = [
  { name: "Circle", icon: "⭕", desc: "round with no corners" },
  { name: "Square", icon: "⬛", desc: "4 equal sides and corners" },
  { name: "Triangle", icon: "🔺", desc: "3 sides and 3 corners" },
  { name: "Rectangle", icon: "▬", desc: "4 sides, 2 pairs equal" },
  { name: "Diamond", icon: "🔷", desc: "4 equal sides like a kite" },
  { name: "Star", icon: "⭐", desc: "5 points radiating out" },
  { name: "Pentagon", icon: "⬠", desc: "5 sides and 5 corners" },
  { name: "Hexagon", icon: "⬡", desc: "6 sides like a honeycomb" },
];

const LEVEL_CONFIG = {
  1: { poolSize: 4, total: 8, hint: "name" },
  2: { poolSize: 6, total: 10, hint: "desc" },
  3: { poolSize: 8, total: 12, hint: "desc" },
};

function makeQ(level: number) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const pool = SHAPES.slice(0, config.poolSize);
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const distractors = pool
    .filter((s) => s.name !== correct.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  const prompt =
    config.hint === "name"
      ? `Which shape is a ${correct.name.toLowerCase()}?`
      : `Which shape is "${correct.desc}"?`;
  return { correct, options, prompt };
}

export function ShapeSorter({
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
  const [selected, setSelected] = useState<string | null>(null);

  const nextQ = useCallback(() => {
    setQ(makeQ(level));
    setFeedback(null);
    setSelected(null);
  }, [level]);

  const handlePick = (shapeName: string) => {
    if (feedback) return;
    setSelected(shapeName);
    const total = correct + incorrect + 1;
    if (shapeName === q.correct.name) {
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
      } else {
        setTimeout(nextQ, 700);
      }
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
      } else {
        setTimeout(nextQ, 900);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🔺</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Shape Sorter
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Read the description and pick the matching shape! Level {level}:{" "}
          {config.total} questions.
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
          className="card-neon rounded-2xl p-5 w-full max-w-sm text-center"
        >
          <p className="text-foreground text-base font-semibold">{q.prompt}</p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "✓ Correct!"
          : feedback === "wrong"
            ? `✗ It was ${q.correct.name} ${q.correct.icon}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((shape) => {
          const isSelected = selected === shape.name;
          const isCorrect = shape.name === q.correct.name;
          let borderClass = "border border-border/50";
          if (feedback && isSelected && !isCorrect)
            borderClass = "border border-red-400";
          if (feedback && isCorrect) borderClass = "border border-green-400";

          return (
            <button
              key={shape.name}
              type="button"
              onClick={() => handlePick(shape.name)}
              disabled={!!feedback}
              className={`py-5 rounded-xl flex flex-col items-center gap-2 bg-secondary/50 transition-all hover:scale-105 ${borderClass}`}
            >
              <span className="text-4xl">{shape.icon}</span>
              <span className="text-xs font-semibold text-foreground">
                {shape.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
