import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface AdditionRocketProps {
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
  const offsets = [1, 2, 3, -1, -2, 4, 5, -3];
  for (let i = 0; wrongs.size < 3; i++) {
    const w = answer + offsets[(idx + i) % offsets.length];
    if (w !== answer && w >= 0) wrongs.add(w);
  }
  const all = [answer, ...Array.from(wrongs).slice(0, 3)];
  // deterministic shuffle based on idx
  return all.sort(
    (a, b) => ((a * 7 + idx * 3) % 11) - ((b * 7 + idx * 3) % 11),
  );
}

function buildQuestions(level: number): Question[] {
  return Array.from({ length: 8 }, (_, i) => {
    let a: number;
    let b: number;
    if (level === 1) {
      a = (i % 9) + 1;
      b = ((i * 3 + 2) % 9) + 1;
    } else if (level === 2) {
      a = (i % 9) + 10 + i;
      b = ((i * 2 + 1) % 9) + 1;
    } else {
      a = (i % 8) + 11 + i * 2;
      b = ((i * 3 + 5) % 29) + 11;
    }
    const answer = a + b;
    return { a, b, answer, options: genOptions(answer, i) };
  });
}

const TOTAL = 8;

export function AdditionRocket({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: AdditionRocketProps) {
  const [questions] = useState(() => buildQuestions(level));
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [fuel, setFuel] = useState(0);

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
      setFuel((f) => Math.min(100, f + 12.5));
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

  const levelNames = ["Single Digit", "Double + Single", "Double + Double"];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🚀</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Addition Rocket
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Fuel your rocket with correct additions! Level {level}:{" "}
          <strong className="text-neon-cyan">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Launch! 🚀
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Rocket + fuel */}
      <div className="w-full">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>🚀 Fuel</span>
          <span>
            Q {currentQ + 1}/{TOTAL} • ✓{correct} ✗{incorrect}
          </span>
          <span>{Math.round(fuel)}%</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full border border-border overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${fuel}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="relative h-8 mt-1">
          <motion.div
            className="absolute top-0 text-xl"
            animate={{ left: `${fuel}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transform: "translateX(-50%)" }}
          >
            🚀
          </motion.div>
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
          <p className="text-muted-foreground text-sm mb-3">
            What is the answer?
          </p>
          <div className="font-mono-game text-4xl font-bold gradient-text-cyan-purple mb-6">
            {q.a} + {q.b} = ?
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
          <div className="text-3xl">{correct >= 6 ? "🚀" : "💪"}</div>
          <div className="font-display text-lg font-bold text-neon-cyan">
            {correct >= 6 ? "Blast Off!" : "Keep Launching!"}
          </div>
        </div>
      )}
    </div>
  );
}
