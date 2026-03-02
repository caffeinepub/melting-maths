import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface SubtractionBlocksProps {
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
  a: number;
  b: number;
  answer: number;
  options: number[];
}

function genOptions(answer: number, idx: number): number[] {
  const wrongs = new Set<number>();
  const offsets = [1, 2, 3, -1, 4, -2, 5, -3];
  for (let i = 0; wrongs.size < 3; i++) {
    const w = answer + offsets[(idx + i) % offsets.length];
    if (w !== answer && w >= 0) wrongs.add(w);
  }
  const all = [answer, ...Array.from(wrongs).slice(0, 3)];
  return all.sort(
    (a, b) => ((a * 5 + idx * 7) % 13) - ((b * 5 + idx * 7) % 13),
  );
}

function buildQuestions(level: number): Question[] {
  return Array.from({ length: 8 }, (_, i) => {
    let a: number;
    let b: number;
    if (level === 1) {
      b = (i % 4) + 1;
      a = b + (i % 5) + 1;
    } else if (level === 2) {
      b = (i % 7) + 1;
      a = 10 + ((i * 2 + 1) % 9);
    } else {
      b = (i % 9) + 10 + (i % 3);
      a = b + (i % 9) + 5 + i;
    }
    const answer = a - b;
    return { a, b, answer, options: genOptions(answer, i) };
  });
}

const TOTAL = 8;

export function SubtractionBlocks({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: SubtractionBlocksProps) {
  const [questions] = useState(() => buildQuestions(level));
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [blocksLeft, setBlocksLeft] = useState(8);

  const q = questions[currentQ];

  const handleChoice = (opt: number) => {
    if (selected !== null || done) return;
    setSelected(opt);
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newIncorrect = isCorrect ? incorrect : incorrect + 1;
    if (isCorrect) {
      setCorrect(newCorrect);
      setBlocksLeft((b) => Math.max(0, b - 1));
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
    "Single Digit",
    "Teens − Single",
    "Two Digit − Two Digit",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🧊</div>
        <h2 className="font-display text-2xl font-bold text-glow-blue">
          Subtraction Blocks
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Smash the blocks! Pick the correct difference. Level {level}:{" "}
          <strong className="text-neon-blue">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="blue" size="lg" onClick={() => setStarted(true)}>
          Smash Blocks! 🧊
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Block progress */}
      <div className="w-full flex items-center justify-between mb-2">
        <span className="font-mono-game text-sm text-muted-foreground">
          Q {currentQ + 1}/{TOTAL}
        </span>
        <div className="flex gap-1">
          {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-sm border transition-all ${
                i < TOTAL - blocksLeft
                  ? "bg-green-500/20 border-green-400"
                  : "bg-neon-blue/10 border-neon-blue/40 animate-pulse-glow"
              }`}
            >
              <span className="text-xs flex items-center justify-center h-full">
                {i < TOTAL - blocksLeft ? "✓" : "🧊"}
              </span>
            </div>
          ))}
        </div>
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
          <p className="text-muted-foreground text-sm mb-3">
            What is the answer?
          </p>
          <div className="font-mono-game text-4xl font-bold gradient-text-cyan-purple mb-6">
            {q.a} − {q.b} = ?
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === q.answer;
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
                  key={opt}
                  type="button"
                  onClick={() => handleChoice(opt)}
                  disabled={selected !== null}
                  className={`p-4 rounded-xl border text-xl font-bold transition-all cursor-pointer
                    ${cls} ${selected === null ? "hover:scale-105 active:scale-95" : ""}
                    disabled:cursor-not-allowed min-h-[56px]`}
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
          <div className="text-3xl">{correct >= 6 ? "💥" : "🧊"}</div>
          <div className="font-display text-lg font-bold text-neon-blue">
            {correct >= 6 ? "All Blocks Smashed!" : "Good Work!"}
          </div>
        </div>
      )}
    </div>
  );
}
