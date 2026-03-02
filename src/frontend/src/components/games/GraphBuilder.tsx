import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface GraphBuilderProps {
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
  question: string;
  answer: string;
  options: string[];
  correctIndex: number;
}

function makeStrOptions(
  answer: string,
  wrongs: string[],
  idx: number,
): { options: string[]; correctIndex: number } {
  const all = [answer, ...wrongs.slice(0, 3)];
  const shuffled = [...all].sort(
    (a, b) =>
      ((a.charCodeAt(0) * 3 + idx * 7) % 11) -
      ((b.charCodeAt(0) * 3 + idx * 7) % 11),
  );
  return { options: shuffled, correctIndex: shuffled.indexOf(answer) };
}

function buildQuestions(level: number): Question[] {
  const slopes = [2, -3, 1, -1, 4, -2, 3, 5];
  const intercepts = [3, -2, 0, 5, -4, 1, -1, 6];

  return Array.from({ length: 8 }, (_, i) => {
    const m = slopes[i % slopes.length];
    const b = intercepts[i % intercepts.length];
    const bStr = b === 0 ? "" : b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
    const equation = `y = ${m === 1 ? "" : m === -1 ? "-" : m}x${bStr}`;

    if (level === 1) {
      const answer = String(m);
      const wrongs = [String(m + 1), String(m - 1), String(b)];
      const { options, correctIndex } = makeStrOptions(answer, wrongs, i);
      return {
        display: equation,
        question: `What is the slope (m) of: ${equation}?`,
        answer,
        options,
        correctIndex,
      };
    }
    if (level === 2) {
      const answer = String(b);
      const wrongs = [String(b + 1), String(b - 1), String(m)];
      const { options, correctIndex } = makeStrOptions(answer, wrongs, i);
      return {
        display: equation,
        question: `What is the y-intercept (b) of: ${equation}?`,
        answer,
        options,
        correctIndex,
      };
    }
    {
      // Which equation matches slope=m passing through (0, b)?
      const answer = equation;
      const m2 = slopes[(i + 1) % slopes.length];
      const m3 = slopes[(i + 2) % slopes.length];
      const b2 = intercepts[(i + 1) % intercepts.length];
      const b2Str = b2 === 0 ? "" : b2 > 0 ? ` + ${b2}` : ` - ${Math.abs(b2)}`;
      const b3 = intercepts[(i + 2) % intercepts.length];
      const b3Str = b3 === 0 ? "" : b3 > 0 ? ` + ${b3}` : ` - ${Math.abs(b3)}`;
      const wrongs = [
        `y = ${m2}x${b2Str}`,
        `y = ${m3}x${b3Str}`,
        `y = ${m}x${b2Str}`,
      ];
      const { options, correctIndex } = makeStrOptions(answer, wrongs, i);
      return {
        display: `slope = ${m}, y-intercept = ${b}`,
        question: `Which equation has slope ${m} and passes through (0, ${b})?`,
        answer,
        options,
        correctIndex,
      };
    }
  });
}

const TOTAL = 8;

export function GraphBuilder({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: GraphBuilderProps) {
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

  const levelNames = [
    "Identify Slope",
    "Identify Y-Intercept",
    "Match the Equation",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">📈</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Graph Builder Challenge
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Read and build linear equations! Level {level}:{" "}
          <strong className="text-neon-cyan">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Plot the Graph! 📈
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="w-full flex items-center justify-between">
        <span className="font-mono-game text-sm text-muted-foreground">
          Q {currentQ + 1}/{TOTAL}
        </span>
        <div className="text-2xl">📈</div>
        <span className="font-mono-game text-sm">
          <span className="text-green-400">✓{correct}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-red-400">✗{incorrect}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-6"
        >
          <p className="text-muted-foreground text-sm mb-2 text-center">
            {q.question}
          </p>
          <div className="font-mono-game text-2xl font-bold text-neon-cyan text-center mb-6">
            {q.display}
          </div>
          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
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
                  key={`graph-${opt}`}
                  type="button"
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                  className={`w-full p-3 rounded-xl border-2 text-left font-mono-game text-sm font-medium
                    bg-card transition-all cursor-pointer disabled:cursor-not-allowed min-h-[44px]
                    ${cls} ${selected === null ? "hover:scale-[1.01] active:scale-[0.99]" : ""}`}
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
        </motion.div>
      </AnimatePresence>

      {done && (
        <div className="text-center animate-bounce-in">
          <div className="text-3xl">{correct >= 6 ? "📊" : "📈"}</div>
          <div className="font-display text-lg font-bold text-neon-cyan">
            {correct >= 6 ? "Graph Master!" : "Good Progress!"}
          </div>
        </div>
      )}
    </div>
  );
}
