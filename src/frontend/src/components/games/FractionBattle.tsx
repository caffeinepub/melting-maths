import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { NeonButton } from "../NeonButton";

interface FractionBattleProps {
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

interface FractionPair {
  a: { num: number; den: number };
  b: { num: number; den: number };
  answer: "a" | "b";
  aLabel: string;
  bLabel: string;
}

function fractionToDecimal(num: number, den: number) {
  return num / den;
}

function generateSameDenominator(): FractionPair {
  const den = Math.floor(Math.random() * 8) + 2;
  let numA = Math.floor(Math.random() * (den - 1)) + 1;
  let numB = Math.floor(Math.random() * (den - 1)) + 1;
  while (numA === numB) {
    numA = Math.floor(Math.random() * (den - 1)) + 1;
    numB = Math.floor(Math.random() * (den - 1)) + 1;
  }
  return {
    a: { num: numA, den },
    b: { num: numB, den },
    answer: numA > numB ? "a" : "b",
    aLabel: `${numA}/${den}`,
    bLabel: `${numB}/${den}`,
  };
}

function generateDifferentDenominator(): FractionPair {
  const denA = Math.floor(Math.random() * 6) + 2;
  const denB = Math.floor(Math.random() * 6) + 2;
  const numA = Math.floor(Math.random() * (denA - 1)) + 1;
  const numB = Math.floor(Math.random() * (denB - 1)) + 1;
  const valA = fractionToDecimal(numA, denA);
  const valB = fractionToDecimal(numB, denB);
  if (valA === valB) return generateDifferentDenominator();
  return {
    a: { num: numA, den: denA },
    b: { num: numB, den: denB },
    answer: valA > valB ? "a" : "b",
    aLabel: `${numA}/${denA}`,
    bLabel: `${numB}/${denB}`,
  };
}

function generateMixedNumber(): FractionPair {
  const wholeA = Math.floor(Math.random() * 4) + 1;
  const wholeB = Math.floor(Math.random() * 4) + 1;
  const denA = Math.floor(Math.random() * 5) + 2;
  const denB = Math.floor(Math.random() * 5) + 2;
  const numA = Math.floor(Math.random() * (denA - 1)) + 1;
  const numB = Math.floor(Math.random() * (denB - 1)) + 1;
  const valA = wholeA + fractionToDecimal(numA, denA);
  const valB = wholeB + fractionToDecimal(numB, denB);
  if (Math.abs(valA - valB) < 0.001) return generateMixedNumber();
  return {
    a: { num: numA, den: denA },
    b: { num: numB, den: denB },
    answer: valA > valB ? "a" : "b",
    aLabel: `${wholeA} ${numA}/${denA}`,
    bLabel: `${wholeB} ${numB}/${denB}`,
  };
}

const GENERATORS: Record<number, () => FractionPair> = {
  1: generateSameDenominator,
  2: generateDifferentDenominator,
  3: generateMixedNumber,
};

const TOTAL_QUESTIONS = 10;

export function FractionBattle({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: FractionBattleProps) {
  const generate = GENERATORS[level] || generateSameDenominator;
  const [questions] = useState(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => generate()),
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const q = questions[currentQ];

  const handleChoice = (choice: "a" | "b") => {
    if (selected || done) return;
    setSelected(choice);
    const isCorrect = choice === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrect((c) => c + 1);
      onCorrect?.();
    } else {
      setIncorrect((i) => i + 1);
      onWrong?.();
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentQ + 1 >= TOTAL_QUESTIONS) {
        setDone(true);
        const newCorrect = isCorrect ? correct + 1 : correct;
        const newIncorrect = isCorrect ? incorrect : incorrect + 1;
        const score = Math.round((newCorrect / TOTAL_QUESTIONS) * 100);
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
    "Same Denominator",
    "Different Denominators",
    "Mixed Numbers",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">⚔️</div>
        <h2 className="font-display text-2xl font-bold text-glow-purple">
          Fraction Battle Arena
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Two fractions enter — only one wins! Pick the{" "}
          <strong className="text-neon-purple">LARGER fraction</strong>. Level{" "}
          {level}: {levelNames[level - 1]}. 10 rounds!
        </p>
        <NeonButton variant="purple" size="lg" onClick={() => setStarted(true)}>
          Enter the Arena!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Progress */}
      <div className="w-full flex items-center justify-between">
        <span className="font-mono-game text-sm text-muted-foreground">
          Q {currentQ + 1}/{TOTAL_QUESTIONS}
        </span>
        <span className="text-neon-purple font-semibold">
          ✓{correct} ✗{incorrect}
        </span>
      </div>

      <div className="text-center mb-2">
        <p className="text-muted-foreground text-sm">
          Which fraction is LARGER?
        </p>
      </div>

      {/* Battle cards */}
      <div className="flex items-center gap-4 w-full">
        {(["a", "b"] as const).map((side) => {
          const label = side === "a" ? q.aLabel : q.bLabel;
          const isSelected = selected === side;
          const isCorrect = q.answer === side;
          let borderClass = "border-border";
          if (isSelected && feedback === "correct")
            borderClass =
              "border-green-400 shadow-[0_0_20px_oklch(0.75_0.2_155/0.6)]";
          if (isSelected && feedback === "wrong")
            borderClass =
              "border-red-400 shadow-[0_0_20px_oklch(0.65_0.22_25/0.6)]";
          if (!isSelected && selected && isCorrect)
            borderClass = "border-green-400/50";

          return (
            <motion.button
              key={side}
              whileHover={!selected ? { scale: 1.04, y: -4 } : {}}
              whileTap={!selected ? { scale: 0.96 } : {}}
              className={`flex-1 rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300
                bg-gradient-to-br from-card to-secondary/50 ${borderClass}
                ${selected ? "pointer-events-none" : "hover:border-neon-purple"}
              `}
              onClick={() => handleChoice(side)}
              aria-label={`Choose fraction ${label}`}
            >
              <div className="font-display text-4xl font-bold text-center gradient-text-cyan-purple">
                {label}
              </div>
              {isSelected && feedback && (
                <div
                  className={`text-center mt-3 font-semibold ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}
                >
                  {feedback === "correct" ? "✓ Correct!" : "✗ Wrong!"}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="text-center text-2xl font-bold text-muted-foreground">
        VS
      </div>

      {done && (
        <div className="text-center animate-bounce-in">
          <div className="text-3xl">{correct >= 7 ? "🏆" : "💪"}</div>
          <div className="font-display text-lg font-bold text-neon-purple">
            {correct >= 7 ? "Battle Won!" : "Good Fight!"}
          </div>
        </div>
      )}
    </div>
  );
}
