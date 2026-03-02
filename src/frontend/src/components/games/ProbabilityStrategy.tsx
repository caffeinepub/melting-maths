import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface ProbabilityStrategyProps {
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

// Level 1: basic probability as fractions
const BASIC_PROBS: Array<{ q: string; a: string; w: string[] }> = [
  { q: "Flip a fair coin. P(Heads) = ?", a: "1/2", w: ["1/3", "1/4", "2/3"] },
  {
    q: "Roll a fair die. P(rolling a 3) = ?",
    a: "1/6",
    w: ["1/3", "1/4", "1/2"],
  },
  {
    q: "Roll a fair die. P(even number) = ?",
    a: "1/2",
    w: ["1/3", "2/3", "1/4"],
  },
  {
    q: "Pick a card from 4 red, 4 blue. P(red) = ?",
    a: "1/2",
    w: ["1/4", "3/4", "2/3"],
  },
  { q: "Roll a die. P(number > 4) = ?", a: "1/3", w: ["1/2", "1/6", "2/3"] },
  {
    q: "Bag has 3 red, 1 blue marble. P(blue) = ?",
    a: "1/4",
    w: ["1/3", "3/4", "1/2"],
  },
  {
    q: "Roll a die. P(rolling 1 or 2) = ?",
    a: "1/3",
    w: ["1/6", "1/2", "2/6"],
  },
  { q: "Flip a coin twice. P(HH) = ?", a: "1/4", w: ["1/2", "1/3", "3/4"] },
];

// Level 2: P(A and B) independent
const COMBINED_PROBS: Array<{ q: string; a: string; w: string[] }> = [
  { q: "Flip 2 coins. P(both heads) = ?", a: "1/4", w: ["1/2", "1/8", "3/4"] },
  {
    q: "Roll 2 dice. P(both show 1) = ?",
    a: "1/36",
    w: ["1/6", "2/36", "1/12"],
  },
  {
    q: "P(A)=1/2, P(B)=1/3, independent. P(A and B) = ?",
    a: "1/6",
    w: ["5/6", "1/3", "2/6"],
  },
  {
    q: "P(A)=1/4, P(B)=1/2, independent. P(A and B) = ?",
    a: "1/8",
    w: ["3/8", "1/4", "1/6"],
  },
  {
    q: "Draw 2 cards (with replacement). P(both red from half-red deck) = ?",
    a: "1/4",
    w: ["1/2", "3/4", "1/8"],
  },
  {
    q: "P(A)=2/3, P(B)=1/4. P(A and B) = ?",
    a: "1/6",
    w: ["11/12", "2/12", "3/8"],
  },
  {
    q: "Roll die and flip coin. P(6 and heads) = ?",
    a: "1/12",
    w: ["1/6", "1/2", "1/8"],
  },
  {
    q: "P(A)=1/3, P(B)=1/3. P(both A and B) = ?",
    a: "1/9",
    w: ["2/3", "2/9", "1/6"],
  },
];

// Level 3: conditional probability P(A|B)
const COND_PROBS: Array<{ q: string; a: string; w: string[] }> = [
  { q: "P(A∩B)=1/4, P(B)=1/2. P(A|B) = ?", a: "1/2", w: ["1/4", "3/4", "1/8"] },
  { q: "P(A∩B)=1/6, P(B)=1/3. P(A|B) = ?", a: "1/2", w: ["1/6", "2/3", "1/3"] },
  { q: "P(A∩B)=1/8, P(B)=1/4. P(A|B) = ?", a: "1/2", w: ["1/4", "3/8", "1/8"] },
  {
    q: "P(A∩B)=1/12, P(B)=1/4. P(A|B) = ?",
    a: "1/3",
    w: ["1/4", "1/6", "1/2"],
  },
  {
    q: "P(B|A)=1/2, P(A)=1/4. P(A and B) = ?",
    a: "1/8",
    w: ["3/4", "1/4", "1/6"],
  },
  { q: "P(A∩B)=2/9, P(B)=2/3. P(A|B) = ?", a: "1/3", w: ["2/3", "1/6", "4/9"] },
  {
    q: "P(A∩B)=3/16, P(B)=3/4. P(A|B) = ?",
    a: "1/4",
    w: ["1/2", "3/8", "3/16"],
  },
  {
    q: "P(A∩B)=1/10, P(B)=2/5. P(A|B) = ?",
    a: "1/4",
    w: ["1/2", "1/5", "3/10"],
  },
];

function buildQuestions(level: number): Question[] {
  const source =
    level === 1 ? BASIC_PROBS : level === 2 ? COMBINED_PROBS : COND_PROBS;
  return Array.from({ length: 8 }, (_, i) => {
    const item = source[i % source.length];
    const { options, correctIndex } = makeStrOptions(item.a, item.w, i);
    return { question: item.q, answer: item.a, options, correctIndex };
  });
}

const TOTAL = 8;

export function ProbabilityStrategy({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: ProbabilityStrategyProps) {
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
    "Basic Probability",
    "Combined Events",
    "Conditional Probability",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🎲</div>
        <h2 className="font-display text-2xl font-bold text-glow-purple">
          Probability Strategy
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Calculate the odds! Level {level}:{" "}
          <strong className="text-neon-purple">{levelNames[level - 1]}</strong>.
          8 questions!
        </p>
        <NeonButton variant="purple" size="lg" onClick={() => setStarted(true)}>
          Roll the Dice! 🎲
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
        <div className="text-2xl">🎲</div>
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
          <p className="text-muted-foreground text-sm mb-3 text-center">
            Find the probability:
          </p>
          <div className="font-display text-base font-bold text-neon-purple text-center mb-6 leading-snug">
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
                  key={`prob-${opt}`}
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
          <div className="text-3xl">{correct >= 6 ? "🎲" : "💪"}</div>
          <div className="font-display text-lg font-bold text-neon-purple">
            {correct >= 6 ? "Probability Master!" : "Good Strategy!"}
          </div>
        </div>
      )}
    </div>
  );
}
