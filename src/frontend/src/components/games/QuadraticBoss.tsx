import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface QuadraticBossProps {
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

interface QuadProblem {
  display: string;
  roots: [number, number];
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(roots: [number, number]): {
  options: string[];
  correctIndex: number;
} {
  const correct = `x = ${roots[0]}, x = ${roots[1]}`;
  const wrong1 = `x = ${roots[0] + 1}, x = ${roots[1] - 1}`;
  const wrong2 = `x = ${-roots[0]}, x = ${-roots[1]}`;
  const wrong3 = `x = ${roots[0] * 2}, x = ${roots[1]}`;
  const all = shuffle([correct, wrong1, wrong2, wrong3]);
  return { options: all, correctIndex: all.indexOf(correct) };
}

function generateLevel1(): QuadProblem[] {
  const pairs: [number, number][] = [
    [-2, -3],
    [2, 3],
    [-1, -5],
    [1, 5],
    [-2, 4],
  ];
  return pairs.map(([r1, r2]) => {
    const b = -(r1 + r2);
    const c = r1 * r2;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const { options, correctIndex } = makeOptions([r1, r2]);
    return {
      display: `x² ${bStr}x ${cStr} = 0`,
      roots: [r1, r2],
      options,
      correctIndex,
    };
  });
}

function generateLevel2(): QuadProblem[] {
  const pairs: [number, number][] = [
    [-4, -6],
    [3, 7],
    [-5, 2],
    [4, -9],
    [-3, 8],
  ];
  return pairs.map(([r1, r2]) => {
    const b = -(r1 + r2);
    const c = r1 * r2;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const { options, correctIndex } = makeOptions([r1, r2]);
    return {
      display: `x² ${bStr}x ${cStr} = 0`,
      roots: [r1, r2],
      options,
      correctIndex,
    };
  });
}

function generateLevel3(): QuadProblem[] {
  // Discriminant-solvable
  const problems: Array<{ display: string; roots: [number, number] }> = [
    { display: "2x² - 7x + 3 = 0", roots: [3, 0.5] },
    { display: "3x² + 5x - 2 = 0", roots: [0.33, -2] },
    { display: "x² - 6x + 9 = 0", roots: [3, 3] },
    { display: "2x² + x - 6 = 0", roots: [1.5, -2] },
    { display: "4x² - 1 = 0", roots: [0.5, -0.5] },
  ];
  return problems.map(({ display, roots }) => {
    const { options, correctIndex } = makeOptions(roots);
    return { display, roots, options, correctIndex };
  });
}

const GENERATORS: Record<number, () => QuadProblem[]> = {
  1: generateLevel1,
  2: generateLevel2,
  3: generateLevel3,
};

const TOTAL = 5;
const BOSS_MAX_HP = 100;

export function QuadraticBoss({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: QuadraticBossProps) {
  const [questions] = useState(() => GENERATORS[level]?.() ?? generateLevel1());
  const [currentQ, setCurrentQ] = useState(0);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [bossShaking, setBossShaking] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [bossDefeated, setBossDefeated] = useState(false);

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
      const newHp = Math.max(0, bossHp - 20);
      setBossHp(newHp);
      setBossShaking(true);
      setTimeout(() => setBossShaking(false), 500);
      if (newHp === 0) {
        setBossDefeated(true);
      }
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
          1200,
        );
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 1000);
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">👾</div>
        <h2 className="font-display text-2xl font-bold text-glow-purple">
          Quadratic Boss Fight
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          The Boss has <strong className="text-red-400">100 HP</strong>. Each
          correct answer deals{" "}
          <strong className="text-neon-cyan">20 damage</strong>! Solve
          quadratics to defeat it. Level {level}:{" "}
          {["Integer roots", "Harder roots", "Quadratic formula"][level - 1]}.
        </p>
        <NeonButton variant="purple" size="lg" onClick={() => setStarted(true)}>
          Start Boss Fight!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  const hpPercent = (bossHp / BOSS_MAX_HP) * 100;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Boss */}
      <motion.div
        animate={bossShaking ? { x: [-8, 8, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="text-7xl mb-2">
          {bossDefeated ? "💥" : bossHp < 40 ? "😤" : "👾"}
        </div>
        <div className="font-display text-sm font-bold text-red-400">
          {bossDefeated ? "DEFEATED!" : `BOSS HP: ${bossHp} / ${BOSS_MAX_HP}`}
        </div>
        <div className="hp-bar w-64 mt-2 mx-auto">
          <div className="hp-fill" style={{ width: `${hpPercent}%` }} />
        </div>
      </motion.div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="w-full text-center card-neon rounded-2xl p-4"
        >
          <p className="text-muted-foreground text-sm mb-2">Find the roots:</p>
          <div className="font-mono-game text-2xl font-bold text-neon-purple mb-4">
            {q.display}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
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
                  key={`qopt-${opt}`}
                  type="button"
                  onClick={() => handleChoice(i)}
                  disabled={selected !== null}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer
                    ${cls} ${selected === null ? "hover:scale-105 active:scale-95" : ""}
                    disabled:cursor-not-allowed min-h-[44px]
                  `}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="text-neon-cyan">✓ {correct * 20} damage dealt</span>
        <span>
          Q {currentQ + 1}/{TOTAL}
        </span>
      </div>
    </div>
  );
}
