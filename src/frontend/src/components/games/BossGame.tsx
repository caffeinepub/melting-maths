import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { NeonButton } from "../NeonButton";

interface Props {
  level: number;
  gradeGroup: "1-3" | "4-5" | "6-8" | "9-10" | "11-12";
  onComplete: (result: {
    score: number;
    correct: number;
    incorrect: number;
  }) => void;
  onBack: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

interface BossQuestion {
  prompt: string;
  answer: string;
  options: string[];
  topic: string;
}

const BOSS_QUESTIONS: Record<string, BossQuestion[]> = {
  "1-3": [
    {
      prompt: "5 + 8 = ?",
      answer: "13",
      options: ["13", "12", "14", "11"],
      topic: "Addition",
    },
    {
      prompt: "15 - 7 = ?",
      answer: "8",
      options: ["8", "9", "7", "6"],
      topic: "Subtraction",
    },
    {
      prompt: "Count: how many ⭐⭐⭐⭐⭐⭐⭐?",
      answer: "7",
      options: ["7", "6", "8", "5"],
      topic: "Counting",
    },
    {
      prompt: "Skip by 2s: 2, 4, 6, 8, ?",
      answer: "10",
      options: ["10", "9", "12", "11"],
      topic: "Skip Counting",
    },
    {
      prompt: "9 + 6 = ?",
      answer: "15",
      options: ["15", "14", "16", "13"],
      topic: "Addition",
    },
    {
      prompt: "20 - 9 = ?",
      answer: "11",
      options: ["11", "12", "10", "9"],
      topic: "Subtraction",
    },
    {
      prompt: "Triangle has how many sides?",
      answer: "3",
      options: ["3", "4", "5", "6"],
      topic: "Shapes",
    },
    {
      prompt: "2 × 5 = ?",
      answer: "10",
      options: ["10", "8", "12", "15"],
      topic: "Multiplication",
    },
    {
      prompt: "What is half of 12?",
      answer: "6",
      options: ["6", "5", "7", "4"],
      topic: "Division",
    },
    {
      prompt: "Skip by 5s: 5, 10, 15, ?",
      answer: "20",
      options: ["20", "18", "25", "19"],
      topic: "Skip Counting",
    },
  ],
  "4-5": [
    {
      prompt: "3/4 + 1/4 = ?",
      answer: "1",
      options: ["1", "4/8", "2/4", "3/8"],
      topic: "Fractions",
    },
    {
      prompt: "0.5 + 0.75 = ?",
      answer: "1.25",
      options: ["1.25", "1.5", "1.0", "1.75"],
      topic: "Decimals",
    },
    {
      prompt: "7 × 8 = ?",
      answer: "56",
      options: ["56", "54", "58", "48"],
      topic: "Multiplication",
    },
    {
      prompt: "48 ÷ 6 = ?",
      answer: "8",
      options: ["8", "7", "9", "6"],
      topic: "Division",
    },
    {
      prompt: "2.5 × 4 = ?",
      answer: "10",
      options: ["10", "8", "12", "9"],
      topic: "Decimals",
    },
    {
      prompt: "1/2 of 24 = ?",
      answer: "12",
      options: ["12", "10", "14", "8"],
      topic: "Fractions",
    },
    {
      prompt: "9 × 9 = ?",
      answer: "81",
      options: ["81", "72", "90", "79"],
      topic: "Multiplication",
    },
    {
      prompt: "60 minutes = ? hours",
      answer: "1",
      options: ["1", "2", "0.5", "1.5"],
      topic: "Time",
    },
    {
      prompt: "3/5 as a decimal = ?",
      answer: "0.6",
      options: ["0.6", "0.5", "0.3", "0.7"],
      topic: "Fractions",
    },
    {
      prompt: "25% of 80 = ?",
      answer: "20",
      options: ["20", "25", "15", "40"],
      topic: "Percentages",
    },
  ],
  "6-8": [
    {
      prompt: "Solve: 2x + 3 = 11",
      answer: "4",
      options: ["4", "5", "3", "7"],
      topic: "Algebra",
    },
    {
      prompt: "Area of rectangle: 6×4 = ?",
      answer: "24",
      options: ["24", "20", "28", "18"],
      topic: "Geometry",
    },
    {
      prompt: "-5 + 8 = ?",
      answer: "3",
      options: ["3", "-3", "2", "13"],
      topic: "Integers",
    },
    {
      prompt: "Simplify: 4:6 = ?",
      answer: "2:3",
      options: ["2:3", "1:2", "4:6", "3:4"],
      topic: "Ratios",
    },
    {
      prompt: "20% of 150 = ?",
      answer: "30",
      options: ["30", "20", "25", "35"],
      topic: "Percentages",
    },
    {
      prompt: "3x = 15 → x = ?",
      answer: "5",
      options: ["5", "3", "12", "6"],
      topic: "Algebra",
    },
    {
      prompt: "Area of triangle base=8, h=6: ?",
      answer: "24",
      options: ["24", "48", "14", "20"],
      topic: "Geometry",
    },
    {
      prompt: "-3 × -4 = ?",
      answer: "12",
      options: ["12", "-12", "7", "-7"],
      topic: "Integers",
    },
    {
      prompt: "Next: 2, 4, 8, 16, ?",
      answer: "32",
      options: ["32", "24", "18", "30"],
      topic: "Patterns",
    },
    {
      prompt: "What % is 12 of 60?",
      answer: "20",
      options: ["20", "15", "25", "12"],
      topic: "Percentages",
    },
  ],
  "9-10": [
    {
      prompt: "x² - 5x + 6 = 0 → x = ?",
      answer: "2 or 3",
      options: ["2 or 3", "1 or 6", "-2 or -3", "2 or -3"],
      topic: "Quadratics",
    },
    {
      prompt: "sin(30°) = ?",
      answer: "0.5",
      options: ["0.5", "0.866", "1", "0.707"],
      topic: "Trigonometry",
    },
    {
      prompt: "Slope of y=3x+2 = ?",
      answer: "3",
      options: ["3", "2", "-3", "1/3"],
      topic: "Graphs",
    },
    {
      prompt: "Midpoint of (0,0) & (4,6)?",
      answer: "(2,3)",
      options: ["(2,3)", "(4,6)", "(1,2)", "(3,4)"],
      topic: "Coordinates",
    },
    {
      prompt: "Mean of 2,4,6,8,10 = ?",
      answer: "6",
      options: ["6", "5", "7", "4"],
      topic: "Statistics",
    },
    {
      prompt: "cos(60°) = ?",
      answer: "0.5",
      options: ["0.5", "0.866", "1", "0"],
      topic: "Trigonometry",
    },
    {
      prompt: "Arithmetic seq: a=3,d=4. Find 5th term",
      answer: "19",
      options: ["19", "15", "23", "20"],
      topic: "Sequences",
    },
    {
      prompt: "Factor: x² - 9 = ?",
      answer: "(x-3)(x+3)",
      options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x+3)²", "(x-3)²"],
      topic: "Quadratics",
    },
    {
      prompt: "tan(45°) = ?",
      answer: "1",
      options: ["1", "0.5", "√2", "0"],
      topic: "Trigonometry",
    },
    {
      prompt: "P(heads twice) = ?",
      answer: "1/4",
      options: ["1/4", "1/2", "1/8", "1/3"],
      topic: "Probability",
    },
  ],
  "11-12": [
    {
      prompt: "d/dx(x³) = ?",
      answer: "3x²",
      options: ["3x²", "x²", "3x", "x³/3"],
      topic: "Calculus",
    },
    {
      prompt: "(2+3i)(1-i) = ?",
      answer: "5+i",
      options: ["5+i", "2-3i", "5-i", "2+3i"],
      topic: "Complex",
    },
    {
      prompt: "log₂(8) = ?",
      answer: "3",
      options: ["3", "4", "2", "8"],
      topic: "Logarithms",
    },
    {
      prompt: "det([[1,2],[3,4]]) = ?",
      answer: "-2",
      options: ["-2", "2", "-10", "10"],
      topic: "Matrices",
    },
    {
      prompt: "d/dx(sin x) = ?",
      answer: "cos x",
      options: ["cos x", "-cos x", "sin x", "-sin x"],
      topic: "Calculus",
    },
    {
      prompt: "log(100) = ?",
      answer: "2",
      options: ["2", "10", "1", "100"],
      topic: "Logarithms",
    },
    {
      prompt: "Vector (3,4): magnitude = ?",
      answer: "5",
      options: ["5", "7", "√7", "√12"],
      topic: "Vectors",
    },
    {
      prompt: "P(A∩B) if P(A)=0.5, P(B)=0.4, indep.?",
      answer: "0.2",
      options: ["0.2", "0.45", "0.9", "0.1"],
      topic: "Probability",
    },
    {
      prompt: "d/dx(eˣ) = ?",
      answer: "eˣ",
      options: ["eˣ", "xeˣ", "eˣ⁻¹", "1"],
      topic: "Calculus",
    },
    {
      prompt: "|a·b| where a=(1,0), b=(0,1)?",
      answer: "0",
      options: ["0", "1", "√2", "2"],
      topic: "Vectors",
    },
  ],
};

const BOSS_NAMES: Record<string, string> = {
  "1-3": "The Arithmetic Ogre",
  "4-5": "The Fraction Dragon",
  "6-8": "The Algebra Golem",
  "9-10": "The Quadratic Demon",
  "11-12": "The Calculus Titan",
};

const BOSS_ICONS: Record<string, string> = {
  "1-3": "👹",
  "4-5": "🐉",
  "6-8": "🤖",
  "9-10": "💀",
  "11-12": "⚡",
};

function makeBossQ(
  gradeGroup: string,
  usedIndices: number[],
): BossQuestion & { idx: number } {
  const pool = BOSS_QUESTIONS[gradeGroup] || BOSS_QUESTIONS["1-3"];
  const available = pool
    .map((_, i) => i)
    .filter((i) => !usedIndices.includes(i));
  const idx =
    available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : Math.floor(Math.random() * pool.length);
  return {
    ...pool[idx],
    options: [...pool[idx].options].sort(() => Math.random() - 0.5),
    idx,
  };
}

export function BossGame({
  level,
  gradeGroup,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: Props) {
  const totalQ = 8 + level * 2; // 10, 12, 14 per level
  const [started, setStarted] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [q, setQ] = useState(() => makeBossQ(gradeGroup, []));
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [bossHp, setBossHp] = useState(100);
  const [shaking, setShaking] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);

  const bossName = BOSS_NAMES[gradeGroup] ?? "The Math Boss";
  const bossIcon = BOSS_ICONS[gradeGroup] ?? "👾";

  const nextQ = useCallback(
    (newUsed: number[]) => {
      const nq = makeBossQ(gradeGroup, newUsed);
      setQ(nq);
      setFeedback(null);
    },
    [gradeGroup],
  );

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (opt === q.answer) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      onCorrect?.();
      setFeedback("correct");
      const newBossHp = Math.max(0, bossHp - Math.round(100 / totalQ));
      setBossHp(newBossHp);
      const newUsed = [...usedIndices, q.idx];
      setUsedIndices(newUsed);
      if (total >= totalQ) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((newCorrect / totalQ) * 100),
              correct: newCorrect,
              incorrect,
            }),
          800,
        );
      } else {
        setTimeout(() => nextQ(newUsed), 700);
      }
    } else {
      const newIncorrect = incorrect + 1;
      setIncorrect(newIncorrect);
      onWrong?.();
      setFeedback("wrong");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      const newPlayerHp = Math.max(0, playerHp - 15);
      setPlayerHp(newPlayerHp);
      const newUsed = [...usedIndices, q.idx];
      setUsedIndices(newUsed);
      if (total >= totalQ) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((correct / totalQ) * 100),
              correct,
              incorrect: newIncorrect,
            }),
          900,
        );
      } else {
        setTimeout(() => nextQ(newUsed), 900);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-7xl"
        >
          {bossIcon}
        </motion.div>
        <h2
          className="font-display text-2xl font-black text-center"
          style={{ color: "oklch(0.75 0.2 50)" }}
        >
          ⚔️ BOSS BATTLE ⚔️
        </h2>
        <p
          className="font-display text-lg font-bold text-center"
          style={{ color: "oklch(0.65 0.22 25)" }}
        >
          {bossName}
        </p>
        <p className="text-muted-foreground text-center max-w-xs text-sm">
          Face the ultimate challenge! Answer {totalQ} questions to defeat the
          boss. Each wrong answer damages YOUR HP!
        </p>
        <NeonButton variant="purple" size="lg" onClick={() => setStarted(true)}>
          Fight! ⚔️
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-4 px-4 py-3"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.06 0.02 25 / 0.5), oklch(0.06 0.01 265 / 0.3))",
      }}
    >
      {/* Boss HP */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-bold" style={{ color: "oklch(0.65 0.22 25)" }}>
            {bossIcon} {bossName}
          </span>
          <span className="text-muted-foreground">{bossHp}%</span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden border"
          style={{
            background: "oklch(0.1 0.02 25)",
            borderColor: "oklch(0.4 0.15 25 / 0.5)",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${bossHp}%` }}
            style={{
              background:
                "linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.75 0.2 50))",
              boxShadow: "0 0 8px oklch(0.65 0.22 25 / 0.7)",
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Player HP */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neon-cyan font-bold">🛡️ Your HP</span>
          <span className="text-muted-foreground">{playerHp}%</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "oklch(0.1 0.02 265)" }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${playerHp}%` }}
            style={{
              background:
                "linear-gradient(90deg, oklch(0.65 0.22 255), oklch(0.78 0.2 195))",
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Boss avatar */}
      <motion.div
        animate={shaking ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="text-5xl"
      >
        {bossHp <= 0 ? "💥" : bossIcon}
      </motion.div>

      {/* Score + topic */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-400">⚔️ {correct}</span>
        <span className="text-muted-foreground font-mono-game">
          {correct + incorrect}/{totalQ}
        </span>
        <span className="text-red-400">💔 {incorrect}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.prompt}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="rounded-2xl p-5 text-center w-full max-w-sm"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.03 25 / 0.8), oklch(0.08 0.02 265))",
            border: "1px solid oklch(0.65 0.22 25 / 0.4)",
            boxShadow: "0 0 20px oklch(0.65 0.22 25 / 0.15)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "oklch(0.75 0.2 50)" }}
          >
            {q.topic}
          </span>
          <p className="font-display text-xl font-black text-foreground mt-1">
            {q.prompt}
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "⚔️ Boss hit!"
          : feedback === "wrong"
            ? `✗ Correct: ${q.answer}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => handleAnswer(String(opt))}
            disabled={!!feedback}
            className="py-4 rounded-xl font-display text-base font-bold transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.04 25 / 0.8), oklch(0.1 0.02 265))",
              border: "1px solid oklch(0.75 0.2 50 / 0.5)",
              color: "oklch(0.85 0.15 50)",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Wrapper components for specific boss games
function makeBossWrapper(gradeGroup: Props["gradeGroup"]) {
  return function BossWrapper(props: Omit<Props, "gradeGroup">) {
    return <BossGame {...props} gradeGroup={gradeGroup} />;
  };
}

export const Boss13 = makeBossWrapper("1-3");
export const Boss45 = makeBossWrapper("4-5");
export const Boss68 = makeBossWrapper("6-8");
export const Boss910 = makeBossWrapper("9-10");
export const Boss1112 = makeBossWrapper("11-12");
