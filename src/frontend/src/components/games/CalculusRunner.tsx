import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface CalculusRunnerProps {
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

interface CalcProblem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function withAnswerOpts(
  question: string,
  correct: string,
  wrongs: string[],
  explanation: string,
): CalcProblem {
  const all = shuffle([correct, ...wrongs.slice(0, 3)]);
  return {
    question,
    options: all,
    correctIndex: all.indexOf(correct),
    explanation,
  };
}

const level1Problems: CalcProblem[] = [
  withAnswerOpts(
    "f(x) = 3x²",
    "f'(x) = 6x",
    ["f'(x) = 3x", "f'(x) = 3x³", "f'(x) = 6x²"],
    "Power rule: 2·3x^(2-1) = 6x",
  ),
  withAnswerOpts(
    "f(x) = 5x³",
    "f'(x) = 15x²",
    ["f'(x) = 15x³", "f'(x) = 5x²", "f'(x) = 3x²"],
    "Power rule: 3·5x^(3-1) = 15x²",
  ),
  withAnswerOpts(
    "f(x) = x⁴",
    "f'(x) = 4x³",
    ["f'(x) = 4x⁴", "f'(x) = x³", "f'(x) = 4x"],
    "Power rule: 4·x^(4-1) = 4x³",
  ),
  withAnswerOpts(
    "f(x) = 7x",
    "f'(x) = 7",
    ["f'(x) = 7x", "f'(x) = 7x²", "f'(x) = 14x"],
    "Derivative of ax is a",
  ),
  withAnswerOpts(
    "f(x) = x² + 4x",
    "f'(x) = 2x + 4",
    ["f'(x) = 2x + 4x", "f'(x) = x + 4", "f'(x) = 2x"],
    "Sum rule: d/dx(x²) + d/dx(4x)",
  ),
];

const level2Problems: CalcProblem[] = [
  withAnswerOpts(
    "f(x) = (2x + 1)³",
    "f'(x) = 6(2x + 1)²",
    ["f'(x) = 3(2x+1)²", "f'(x) = 6(2x+1)³", "f'(x) = 3·2(2x+1)"],
    "Chain rule: 3(2x+1)²·2",
  ),
  withAnswerOpts(
    "f(x) = sin(3x)",
    "f'(x) = 3cos(3x)",
    ["f'(x) = cos(3x)", "f'(x) = 3sin(3x)", "f'(x) = -3cos(3x)"],
    "Chain rule: cos(3x)·3",
  ),
  withAnswerOpts(
    "f(x) = (x² + 1)⁵",
    "f'(x) = 10x(x² + 1)⁴",
    ["f'(x) = 5(x²+1)⁴", "f'(x) = 10x(x²+1)⁵", "f'(x) = 5x(x²+1)⁴"],
    "Chain rule: 5(x²+1)⁴·2x",
  ),
  withAnswerOpts(
    "f(x) = e^(2x)",
    "f'(x) = 2e^(2x)",
    ["f'(x) = e^(2x)", "f'(x) = 2xe^(x)", "f'(x) = 2e^x"],
    "Chain rule: e^(2x)·2",
  ),
  withAnswerOpts(
    "f(x) = √(x + 1)",
    "f'(x) = 1/(2√(x+1))",
    ["f'(x) = √(x+1)/2", "f'(x) = 1/√(x+1)", "f'(x) = 2√(x+1)"],
    "Chain rule on (x+1)^(1/2)",
  ),
];

const level3Problems: CalcProblem[] = [
  withAnswerOpts(
    "f(x) = x·sin(x)",
    "f'(x) = sin(x) + x·cos(x)",
    ["f'(x) = cos(x)", "f'(x) = x·cos(x)", "f'(x) = sin(x) - x·cos(x)"],
    "Product rule: u'v + uv'",
  ),
  withAnswerOpts(
    "f(x) = x²·eˣ",
    "f'(x) = eˣ(x² + 2x)",
    ["f'(x) = 2x·eˣ", "f'(x) = x²·eˣ", "f'(x) = eˣ(2x + 1)"],
    "Product rule: 2x·eˣ + x²·eˣ",
  ),
  withAnswerOpts(
    "f(x) = x·ln(x)",
    "f'(x) = ln(x) + 1",
    ["f'(x) = 1/x", "f'(x) = ln(x)", "f'(x) = x/ln(x)"],
    "Product rule: 1·ln(x) + x·(1/x)",
  ),
  withAnswerOpts(
    "f(x) = x²·cos(x)",
    "f'(x) = 2x·cos(x) - x²·sin(x)",
    ["f'(x) = -x²·sin(x)", "f'(x) = 2x·cos(x)", "f'(x) = 2x·sin(x)"],
    "Product rule: 2x·cos(x) + x²·(-sin(x))",
  ),
  withAnswerOpts(
    "f(x) = (x+1)·(x-2)",
    "f'(x) = 2x - 1",
    ["f'(x) = x - 2", "f'(x) = x + 1", "f'(x) = 2x + 1"],
    "Expand then differentiate: x² - x - 2",
  ),
];

const LEVEL_PROBLEMS: Record<number, CalcProblem[]> = {
  1: level1Problems,
  2: level2Problems,
  3: level3Problems,
};
const TOTAL = 5;

export function CalculusRunner({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: CalculusRunnerProps) {
  const [questions] = useState(() => LEVEL_PROBLEMS[level] ?? level1Problems);
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 runner position

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
      setProgress((p) => Math.min(100, p + 20));
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
    }, 1100);
  };

  const levelNames = ["Power Rule", "Chain Rule Intro", "Product Rule"];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🏃</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Calculus Runner
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Race to the finish line! Pick the correct derivative to keep running.
          Level {level}:{" "}
          <strong className="text-neon-cyan">{levelNames[level - 1]}</strong>. 5
          problems!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Start Running!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Runner track */}
      <div className="w-full">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>🏁 START</span>
          <span>
            Q {currentQ + 1}/{TOTAL}
          </span>
          <span>FINISH 🏆</span>
        </div>
        <div className="w-full h-4 bg-secondary rounded-full border border-border overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="relative h-8 mt-1">
          <motion.div
            className="absolute top-0 text-xl"
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transform: "translateX(-50%)" }}
          >
            🏃
          </motion.div>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-5"
        >
          <p className="text-muted-foreground text-sm mb-1">
            Find the derivative:
          </p>
          <div className="font-mono-game text-xl font-bold text-neon-cyan mb-4">
            {q.question}
          </div>

          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              let cls =
                "border-border hover:border-neon-cyan hover:text-neon-cyan";
              if (isSelected && feedback === "correct")
                cls = "border-green-400 bg-green-500/20 text-green-300";
              if (isSelected && feedback === "wrong")
                cls = "border-red-400 bg-red-500/20 text-red-300";
              if (!isSelected && selected !== null && isCorrect)
                cls = "border-green-400/40 text-green-400/70";

              return (
                <button
                  key={`opt-${opt}`}
                  type="button"
                  onClick={() => handleChoice(i)}
                  disabled={selected !== null}
                  className={`w-full p-3 rounded-xl border-2 text-left font-mono-game text-sm font-medium
                    bg-card transition-all cursor-pointer disabled:cursor-not-allowed min-h-[44px]
                    ${cls} ${selected === null ? "hover:scale-[1.01] active:scale-[0.99]" : ""}
                  `}
                >
                  {opt}
                  {isSelected && feedback && (
                    <span className="ml-2">
                      {feedback === "correct" ? "✓" : "✗"}
                    </span>
                  )}
                  {!isSelected && selected !== null && isCorrect && (
                    <span className="ml-2 text-green-400/70">← correct</span>
                  )}
                </button>
              );
            })}
          </div>

          {selected !== null && feedback === "wrong" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue/80 text-xs"
            >
              💡 {q.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4 text-sm">
        <span className="text-green-400">✓ {correct}</span>
        <span className="text-red-400">✗ {incorrect}</span>
      </div>
    </div>
  );
}
