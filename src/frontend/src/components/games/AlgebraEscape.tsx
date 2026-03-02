import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface AlgebraEscapeProps {
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

interface Equation {
  display: string;
  answer: number;
  hint: string;
}

function generateLevel1(): Equation[] {
  return Array.from({ length: 5 }, () => {
    const x = Math.floor(Math.random() * 15) + 1;
    const a = Math.floor(Math.random() * 10) + 1;
    return {
      display: `x + ${a} = ${x + a}`,
      answer: x,
      hint: `Subtract ${a} from both sides.`,
    };
  });
}

function generateLevel2(): Equation[] {
  return Array.from({ length: 5 }, () => {
    const x = Math.floor(Math.random() * 10) + 1;
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const c = a * x + b;
    return {
      display: `${a}x + ${b} = ${c}`,
      answer: x,
      hint: `Subtract ${b}, then divide by ${a}.`,
    };
  });
}

function generateLevel3(): Equation[] {
  return Array.from({ length: 5 }, () => {
    const x = Math.floor(Math.random() * 8) + 1;
    const a = Math.floor(Math.random() * 4) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const c = Math.floor(Math.random() * 3) + 1;
    const d = (a - c) * x + b;
    if (a <= c) return generateLevel3()[0];
    return {
      display: `${a}x + ${b} = ${c}x + ${d}`,
      answer: x,
      hint: `Move x terms to one side: ${a - c}x = ${d - b}.`,
    };
  });
}

const GENERATORS: Record<number, () => Equation[]> = {
  1: generateLevel1,
  2: generateLevel2,
  3: generateLevel3,
};

const TOTAL = 5;

export function AlgebraEscape({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: AlgebraEscapeProps) {
  const [questions] = useState(() => GENERATORS[level]?.() ?? generateLevel1());
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[currentQ];

  const submitAnswer = () => {
    const num = Number.parseFloat(answer.trim());
    if (Number.isNaN(num)) return;
    const isCorrect = Math.abs(num - q.answer) < 0.01;
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
    setShowHint(false);

    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
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
    }, 1000);
  };

  const levelDescriptions = ["x + a = b", "ax + b = c", "ax + b = cx + d"];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🔐</div>
        <h2 className="font-display text-2xl font-bold text-glow-blue">
          Algebra Escape Room
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Solve each equation to unlock the door! Level {level}:{" "}
          <strong className="text-neon-blue">
            {levelDescriptions[level - 1]}
          </strong>
          . 5 equations to crack!
        </p>
        <NeonButton variant="blue" size="lg" onClick={() => setStarted(true)}>
          Enter Escape Room!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Progress doors */}
      <div className="flex gap-2">
        {(["d0", "d1", "d2", "d3", "d4"] as const)
          .slice(0, TOTAL)
          .map((doorKey, i) => (
            <div
              key={doorKey}
              className={`w-8 h-10 rounded-sm border flex items-center justify-center text-base transition-all
              ${
                i < correct + incorrect
                  ? i < correct
                    ? "bg-green-500/20 border-green-400 text-green-400"
                    : "bg-red-500/20 border-red-400 text-red-400"
                  : i === currentQ
                    ? "bg-neon-blue/10 border-neon-blue text-neon-blue animate-pulse-glow"
                    : "bg-card border-border text-muted-foreground"
              }
            `}
            >
              {i < correct + incorrect ? (i < correct ? "✓" : "✗") : "🚪"}
            </div>
          ))}
      </div>

      {/* Equation display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-6 text-center"
        >
          <p className="text-muted-foreground text-sm mb-2">Solve for x:</p>
          <div className="font-mono-game text-3xl font-bold gradient-text-cyan-purple mb-4">
            {q.display}
          </div>

          <div className="flex gap-3 items-center justify-center">
            <span className="text-muted-foreground font-mono-game text-lg">
              x =
            </span>
            <Input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              className="w-28 text-center font-mono-game text-lg bg-secondary border-border focus:border-neon-blue"
              placeholder="?"
              disabled={!!feedback || done}
              autoFocus
            />
          </div>

          {feedback && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-4 text-lg font-bold ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}
            >
              {feedback === "correct"
                ? "🔓 Door Unlocked!"
                : `✗ Answer was ${q.answer}`}
            </motion.div>
          )}

          {showHint && !feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-sm"
            >
              💡 {q.hint}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 w-full">
        <NeonButton
          variant="blue"
          size="md"
          onClick={submitAnswer}
          disabled={!answer || !!feedback || done}
          fullWidth
        >
          Unlock Door!
        </NeonButton>
        <NeonButton
          variant="ghost"
          size="md"
          onClick={() => setShowHint(!showHint)}
          disabled={!!feedback}
        >
          💡 Hint
        </NeonButton>
      </div>

      {done && (
        <div className="text-center animate-bounce-in">
          <div className="text-3xl">
            {correct >= 4 ? "🏆" : correct >= 3 ? "✨" : "💪"}
          </div>
          <div className="font-display text-lg font-bold text-neon-blue">
            {correct >= 4 ? "You Escaped!" : "Room Cracked!"}
          </div>
        </div>
      )}
    </div>
  );
}
