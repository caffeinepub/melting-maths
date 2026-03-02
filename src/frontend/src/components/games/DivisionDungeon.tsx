import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { NeonButton } from "../NeonButton";

interface Props {
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

const LEVEL_CONFIG = {
  1: { maxDivisor: 5, total: 8 },
  2: { maxDivisor: 9, total: 10 },
  3: { maxDivisor: 12, total: 12 },
};

const MONSTERS = ["🐉", "👹", "💀", "🧟", "🦇", "🕷️", "🦑", "👾"];

function makeQ(maxDivisor: number) {
  const divisor = Math.floor(Math.random() * (maxDivisor - 1)) + 2;
  const quotient = Math.floor(Math.random() * maxDivisor) + 1;
  const dividend = divisor * quotient;
  const opts = [quotient];
  while (opts.length < 4) {
    const wrong = Math.floor(Math.random() * (maxDivisor + 2)) + 1;
    if (wrong !== quotient && !opts.includes(wrong)) opts.push(wrong);
  }
  return {
    dividend,
    divisor,
    quotient,
    options: opts.sort(() => Math.random() - 0.5),
  };
}

export function DivisionDungeon({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: Props) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState(() => makeQ(config.maxDivisor));
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [monsterHp, setMonsterHp] = useState(100);
  const [monster] = useState(
    () => MONSTERS[Math.floor(Math.random() * MONSTERS.length)],
  );
  const [shaking, setShaking] = useState(false);

  const nextQ = useCallback(() => {
    setQ(makeQ(config.maxDivisor));
    setFeedback(null);
  }, [config.maxDivisor]);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (n === q.quotient) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      onCorrect?.();
      setFeedback("correct");
      setMonsterHp((hp) => Math.max(0, hp - Math.round(100 / config.total)));
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((newCorrect / config.total) * 100),
              correct: newCorrect,
              incorrect,
            }),
          800,
        );
      } else {
        setTimeout(nextQ, 700);
      }
    } else {
      setIncorrect((i) => i + 1);
      onWrong?.();
      setFeedback("wrong");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((correct / config.total) * 100),
              correct,
              incorrect: incorrect + 1,
            }),
          900,
        );
      } else {
        setTimeout(nextQ, 900);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🏰</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Division Dungeon
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Defeat the dungeon monsters with division! Each correct answer damages
          the monster. Level {level}: dividing by up to {config.maxDivisor}.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Enter the Dungeon!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-4">
      <div className="flex items-center justify-between w-full text-sm">
        <span className="text-green-400 font-semibold">⚔️ {correct} kills</span>
        <span className="text-neon-cyan font-mono-game">
          {correct + incorrect}/{config.total}
        </span>
        <span className="text-red-400 font-semibold">💔 {incorrect}</span>
      </div>

      {/* Monster + HP */}
      <div
        className="card-neon rounded-2xl p-4 w-full max-w-sm flex flex-col items-center gap-3"
        style={{ border: "1px solid oklch(0.65 0.22 25 / 0.4)" }}
      >
        <motion.div
          animate={shaking ? { x: [-8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="text-6xl"
        >
          {monsterHp <= 0 ? "💥" : monster}
        </motion.div>
        <div className="w-full">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Monster HP</span>
            <span>{monsterHp}%</span>
          </div>
          <div className="hp-bar w-full">
            <motion.div
              className="hp-fill"
              animate={{ width: `${monsterHp}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${q.dividend}-${q.divisor}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="text-center"
        >
          <span className="font-display text-5xl font-black text-foreground">
            {q.dividend} ÷ {q.divisor}
          </span>
          <span className="block text-muted-foreground text-sm mt-1">= ?</span>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "⚔️ Monster hit!"
          : feedback === "wrong"
            ? `✗ Answer: ${q.quotient}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            className="py-5 rounded-xl font-display text-2xl font-bold btn-neon-cyan transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
