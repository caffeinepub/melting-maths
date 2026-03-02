import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface GeometryBuilderProps {
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

interface Question {
  display: string;
  shape: string;
  answer: number;
  options: string[];
  correctIndex: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function makeNumOptions(
  answer: number,
  idx: number,
): { options: string[]; correctIndex: number } {
  const offsets = [1, 2, -1, 3, -2, 4, 5, -3];
  const wrongs: number[] = [];
  for (let i = 0; wrongs.length < 3; i++) {
    const w = round1(answer + offsets[(idx + i) % offsets.length]);
    if (w !== answer && w > 0 && !wrongs.includes(w)) wrongs.push(w);
  }
  const all = [answer, ...wrongs.slice(0, 3)].map((v) => String(v));
  const shuffled = [...all].sort(
    (a, b) =>
      ((Number.parseFloat(a) * 3 + idx * 5) % 11) -
      ((Number.parseFloat(b) * 3 + idx * 5) % 11),
  );
  return { options: shuffled, correctIndex: shuffled.indexOf(String(answer)) };
}

function buildQuestions(level: number): Question[] {
  return Array.from({ length: 8 }, (_, i) => {
    if (level === 1) {
      const w = (i % 9) + 2;
      const h = ((i * 2 + 3) % 9) + 2;
      const answer = w * h;
      const { options, correctIndex } = makeNumOptions(answer, i);
      return {
        display: `Width = ${w}, Height = ${h}`,
        shape: "📐 Rectangle Area",
        answer,
        options,
        correctIndex,
      };
    }
    if (level === 2) {
      const b = (i % 8) + 3;
      const h = ((i * 3 + 2) % 8) + 3;
      const answer = Math.round(0.5 * b * h * 10) / 10;
      const { options, correctIndex } = makeNumOptions(answer, i);
      return {
        display: `Base = ${b}, Height = ${h}`,
        shape: "△ Triangle Area (½ × b × h)",
        answer,
        options,
        correctIndex,
      };
    }
    const r = (i % 6) + 1;
    const answer = round1(Math.PI * r * r);
    const { options, correctIndex } = makeNumOptions(answer, i);
    return {
      display: `Radius = ${r}`,
      shape: "⭕ Circle Area (π × r²)",
      answer,
      options,
      correctIndex,
    };
  });
}

const TOTAL = 8;

export function GeometryBuilder({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: GeometryBuilderProps) {
  const [questions] = useState(() => buildQuestions(level));
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[currentQ];

  const handleChoice = (idx: number) => {
    if (selected !== null || done) return;
    setSelected(idx);
    const isCorrect = idx === q.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newIncorrect = isCorrect ? incorrect : incorrect + 1;
    if (isCorrect) {
      setCorrect(newCorrect);
      onCorrect?.();
    } else {
      setIncorrect(newIncorrect);
      onWrong?.();
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentQ + 1 >= TOTAL) {
        setDone(true);
        const score = Math.round((newCorrect / TOTAL) * 100);
        setTimeout(
          () =>
            onComplete({ score, correct: newCorrect, incorrect: newIncorrect }),
          1000,
        );
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 800);
  };

  const levelNames = ["Rectangle Areas", "Triangle Areas", "Circle Areas"];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">📐</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Geometry Builder
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Calculate the areas! Level {level}:{" "}
          <strong className="text-neon-cyan">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Build Shapes! 📐
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <span className="font-mono-game text-sm text-muted-foreground">
          Q {currentQ + 1}/{TOTAL}
        </span>
        <span className="font-display font-bold text-sm text-neon-cyan">
          {q.shape}
        </span>
        <span className="font-mono-game text-sm">
          <span className="text-green-400">✓{correct}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-red-400">✗{incorrect}</span>
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-6 text-center"
        >
          <p className="text-muted-foreground text-sm mb-2">Find the area:</p>
          <div className="font-display text-2xl font-bold gradient-text-cyan-purple mb-2">
            {q.shape}
          </div>
          <div className="font-mono-game text-lg text-foreground/80 mb-6">
            {q.display}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
              let cls = "btn-neon-cyan";
              if (isSelected && feedback === "correct")
                cls =
                  "border-green-400 bg-green-500/20 text-green-300 shadow-[0_0_15px_oklch(0.75_0.2_155/0.5)]";
              if (isSelected && feedback === "wrong")
                cls =
                  "border-red-400 bg-red-500/20 text-red-300 shadow-[0_0_15px_oklch(0.65_0.22_25/0.5)]";
              if (!isSelected && selected !== null && isCorrect)
                cls = "border-green-400/50 text-green-400/70";

              return (
                <button
                  key={`geo-${opt}`}
                  type="button"
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                  className={`p-4 rounded-xl border text-lg font-bold font-mono-game transition-all cursor-pointer
                    ${cls} ${selected === null ? "hover:scale-105 active:scale-95" : ""}
                    disabled:cursor-not-allowed min-h-[52px]`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {done && (
        <div className="text-center animate-bounce-in">
          <div className="text-3xl">{correct >= 6 ? "🏗️" : "📐"}</div>
          <div className="font-display text-lg font-bold text-neon-cyan">
            {correct >= 6 ? "Master Builder!" : "Keep Building!"}
          </div>
        </div>
      )}
    </div>
  );
}
