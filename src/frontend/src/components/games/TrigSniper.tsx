import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface TrigSniperProps {
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

// Level 1: exact trig values
const TRIG_VALUES: Array<{ q: string; a: string; w: string[] }> = [
  { q: "sin(0°)", a: "0", w: ["1", "1/2", "√3/2"] },
  { q: "sin(30°)", a: "1/2", w: ["0", "√3/2", "√2/2"] },
  { q: "sin(45°)", a: "√2/2", w: ["1/2", "√3/2", "1"] },
  { q: "sin(60°)", a: "√3/2", w: ["1/2", "√2/2", "1"] },
  { q: "sin(90°)", a: "1", w: ["0", "√3/2", "1/2"] },
  { q: "cos(0°)", a: "1", w: ["0", "1/2", "√3/2"] },
  { q: "cos(30°)", a: "√3/2", w: ["1/2", "√2/2", "1"] },
  { q: "cos(60°)", a: "1/2", w: ["√3/2", "√2/2", "0"] },
];

// Level 2: find opposite side (opp = hyp × sin(angle))
const SIDE_PROBLEMS: Array<{ q: string; a: string; w: string[] }> = [
  { q: "Hyp=10, angle=30°, find opposite", a: "5.0", w: ["8.7", "7.1", "6.0"] },
  {
    q: "Hyp=20, angle=45°, find opposite",
    a: "14.1",
    w: ["17.3", "10.0", "12.0"],
  },
  {
    q: "Hyp=12, angle=60°, find opposite",
    a: "10.4",
    w: ["8.5", "6.0", "9.0"],
  },
  {
    q: "Hyp=15, angle=30°, find opposite",
    a: "7.5",
    w: ["13.0", "10.6", "8.0"],
  },
  { q: "Hyp=8, angle=45°, find opposite", a: "5.7", w: ["6.9", "4.0", "7.0"] },
  { q: "Hyp=10, angle=60°, find opposite", a: "8.7", w: ["7.1", "5.0", "6.5"] },
  { q: "Hyp=6, angle=30°, find opposite", a: "3.0", w: ["5.2", "4.2", "2.5"] },
  {
    q: "Hyp=14, angle=45°, find opposite",
    a: "9.9",
    w: ["12.1", "7.0", "8.5"],
  },
];

// Level 3: inverse trig (find angle)
const ANGLE_PROBLEMS: Array<{ q: string; a: string; w: string[] }> = [
  {
    q: "sin(θ) = 0.5, find θ (nearest degree)",
    a: "30°",
    w: ["45°", "60°", "25°"],
  },
  { q: "cos(θ) = √3/2 ≈ 0.866, find θ", a: "30°", w: ["45°", "60°", "20°"] },
  { q: "tan(θ) = 1, find θ", a: "45°", w: ["30°", "60°", "50°"] },
  { q: "sin(θ) = √3/2 ≈ 0.866, find θ", a: "60°", w: ["30°", "45°", "70°"] },
  { q: "cos(θ) = 0.5, find θ", a: "60°", w: ["30°", "45°", "55°"] },
  { q: "tan(θ) = √3 ≈ 1.732, find θ", a: "60°", w: ["30°", "45°", "75°"] },
  { q: "sin(θ) = √2/2 ≈ 0.707, find θ", a: "45°", w: ["30°", "60°", "40°"] },
  { q: "cos(θ) = √2/2 ≈ 0.707, find θ", a: "45°", w: ["30°", "60°", "50°"] },
];

function buildQuestions(level: number): Question[] {
  const source =
    level === 1 ? TRIG_VALUES : level === 2 ? SIDE_PROBLEMS : ANGLE_PROBLEMS;
  return Array.from({ length: 8 }, (_, i) => {
    const item = source[i % source.length];
    const { options, correctIndex } = makeStrOptions(item.a, item.w, i);
    return { question: item.q, answer: item.a, options, correctIndex };
  });
}

const TOTAL = 8;

export function TrigSniper({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: TrigSniperProps) {
  const [questions] = useState(() => buildQuestions(level));
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [targets, setTargets] = useState(8);

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
      setTargets((t) => Math.max(0, t - 1));
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

  const levelNames = ["Exact Trig Values", "Find the Side", "Find the Angle"];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🎯</div>
        <h2 className="font-display text-2xl font-bold text-glow-blue">
          Trigonometry Sniper
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Hit the right trig values! Level {level}:{" "}
          <strong className="text-neon-blue">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="blue" size="lg" onClick={() => setStarted(true)}>
          Take Aim! 🎯
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Target display */}
      <div className="w-full flex items-center justify-between mb-1">
        <span className="font-mono-game text-sm text-muted-foreground">
          Q {currentQ + 1}/{TOTAL}
        </span>
        <div className="flex gap-1">
          {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((i) => (
            <span
              key={i}
              className={`text-sm ${i < 8 - targets ? "opacity-30" : "text-neon-blue"}`}
            >
              🎯
            </span>
          ))}
        </div>
        <span className="font-mono-game text-sm">
          <span className="text-green-400">✓{correct}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-red-400">✗{incorrect}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-6"
        >
          <p className="text-muted-foreground text-sm mb-2 text-center">
            Trigonometry:
          </p>
          <div className="font-mono-game text-xl font-bold text-neon-blue text-center mb-6">
            {q.question}
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
                  key={`trig-${opt}`}
                  type="button"
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                  className={`p-4 rounded-xl border text-base font-bold font-mono-game transition-all cursor-pointer
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
          <div className="text-3xl">{correct >= 6 ? "🎯" : "💪"}</div>
          <div className="font-display text-lg font-bold text-neon-blue">
            {correct >= 6 ? "Trig Master!" : "Good Aim!"}
          </div>
        </div>
      )}
    </div>
  );
}
