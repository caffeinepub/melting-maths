import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface DecimalDashProps {
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
  answer: number;
  options: string[];
  correctIndex: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function makeDecimalOptions(
  answer: number,
  idx: number,
): { options: string[]; correctIndex: number } {
  const offsets = [0.1, 0.2, 0.3, -0.1, 0.5, -0.2, 1.0, -0.5];
  const wrongs: number[] = [];
  for (let i = 0; wrongs.length < 3; i++) {
    const w = round2(answer + offsets[(idx + i) % offsets.length]);
    if (w !== answer && w > 0 && !wrongs.includes(w)) wrongs.push(w);
  }
  const correct = answer.toFixed(2);
  const all = [correct, ...wrongs.slice(0, 3).map((w) => w.toFixed(2))];
  // deterministic shuffle
  const shuffled = all.sort(
    (a, b) =>
      ((Number.parseFloat(a) * 3 + idx * 7) % 11) -
      ((Number.parseFloat(b) * 3 + idx * 7) % 11),
  );
  return { options: shuffled, correctIndex: shuffled.indexOf(correct) };
}

function buildQuestions(level: number): Question[] {
  return Array.from({ length: 8 }, (_, i) => {
    if (level === 1) {
      const a = round2(1 + (i % 9) * 0.1 + (i % 3) * 0.5);
      const b = round2(0.1 + (i % 5) * 0.2);
      const answer = round2(a + b);
      const { options, correctIndex } = makeDecimalOptions(answer, i);
      return {
        display: `${a.toFixed(1)} + ${b.toFixed(1)}`,
        answer,
        options,
        correctIndex,
      };
    }
    if (level === 2) {
      const a = round2(3 + (i % 7) * 0.13 + i * 0.05);
      const b = round2(0.5 + (i % 4) * 0.11);
      const answer = round2(a - b);
      const { options, correctIndex } = makeDecimalOptions(answer, i);
      return {
        display: `${a.toFixed(2)} − ${b.toFixed(2)}`,
        answer,
        options,
        correctIndex,
      };
    }
    const a = round2(0.2 + (i % 5) * 0.1 + (i % 3) * 0.05);
    const b = round2(0.1 + (i % 4) * 0.1);
    const answer = round2(a * b);
    const { options, correctIndex } = makeDecimalOptions(answer, i);
    return {
      display: `${a.toFixed(2)} × ${b.toFixed(2)}`,
      answer,
      options,
      correctIndex,
    };
  });
}

const TOTAL = 8;

export function DecimalDash({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: DecimalDashProps) {
  const [questions] = useState(() => buildQuestions(level));
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState(0);

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
      setSpeed((s) => Math.min(100, s + 12.5));
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

  const levelNames = [
    "Decimal Addition",
    "Decimal Subtraction",
    "Decimal Multiplication",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">💨</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Decimal Dash
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Speed through decimal calculations! Level {level}:{" "}
          <strong className="text-neon-cyan">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Start Dashing! 💨
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Speed gauge */}
      <div className="w-full">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>💨 Speed</span>
          <span>
            Q {currentQ + 1}/{TOTAL} • ✓{correct} ✗{incorrect}
          </span>
          <span>{Math.round(speed)}%</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full border border-border overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.65 0.22 255))",
            }}
            animate={{ width: `${speed}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-6 text-center"
        >
          <p className="text-muted-foreground text-sm mb-3">Calculate:</p>
          <div className="font-mono-game text-3xl font-bold gradient-text-cyan-purple mb-6">
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
                  key={`dopt-${opt}`}
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
          <div className="text-3xl">{correct >= 6 ? "🏁" : "💨"}</div>
          <div className="font-display text-lg font-bold text-neon-cyan">
            {correct >= 6 ? "Finish Line!" : "Keep Dashing!"}
          </div>
        </div>
      )}
    </div>
  );
}
