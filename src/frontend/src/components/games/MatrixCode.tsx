import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface MatrixCodeProps {
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

type Matrix2x2 = [[number, number], [number, number]];

interface Question {
  display: string;
  matA?: Matrix2x2;
  matB?: Matrix2x2;
  scalar?: number;
  answer: Matrix2x2;
  options: Matrix2x2[];
  correctIndex: number;
}

function matStr(m: Matrix2x2): string {
  return `[[${m[0][0]},${m[0][1]}],[${m[1][0]},${m[1][1]}]]`;
}

function matAdd(a: Matrix2x2, b: Matrix2x2): Matrix2x2 {
  return [
    [a[0][0] + b[0][0], a[0][1] + b[0][1]],
    [a[1][0] + b[1][0], a[1][1] + b[1][1]],
  ];
}

function matScale(s: number, a: Matrix2x2): Matrix2x2 {
  return [
    [s * a[0][0], s * a[0][1]],
    [s * a[1][0], s * a[1][1]],
  ];
}

function matMul(a: Matrix2x2, b: Matrix2x2): Matrix2x2 {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ];
}

function makeWrongMatrix(correct: Matrix2x2, variant: number): Matrix2x2 {
  return [
    [
      correct[0][0] + (variant % 2 === 0 ? 1 : -1),
      correct[0][1] + (variant > 1 ? 1 : 0),
    ],
    [
      correct[1][0] + (variant % 3 === 0 ? 1 : 0),
      correct[1][1] + (variant % 2 === 0 ? -1 : 1),
    ],
  ];
}

function buildQuestions(level: number): Question[] {
  const bases: Matrix2x2[] = [
    [
      [1, 2],
      [3, 4],
    ],
    [
      [2, 0],
      [1, 3],
    ],
    [
      [0, 1],
      [2, 2],
    ],
    [
      [3, 1],
      [0, 2],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [2, 3],
      [1, 0],
    ],
    [
      [1, 0],
      [0, 1],
    ],
    [
      [3, 2],
      [1, 4],
    ],
  ];

  return Array.from({ length: 8 }, (_, i) => {
    const matA = bases[i % bases.length];
    const matB = bases[(i + 1) % bases.length];
    const scalar = (i % 4) + 2;

    if (level === 1) {
      const answer = matAdd(matA, matB);
      const options: Matrix2x2[] = [
        answer,
        makeWrongMatrix(answer, 1),
        makeWrongMatrix(answer, 2),
        makeWrongMatrix(answer, 3),
      ];
      const shuffled = [...options].sort(
        (a, b) =>
          ((matStr(a).charCodeAt(0) * 3 + i * 7) % 11) -
          ((matStr(b).charCodeAt(0) * 3 + i * 7) % 11),
      );
      return {
        display: "A + B",
        matA,
        matB,
        answer,
        options: shuffled,
        correctIndex: shuffled.findIndex((o) => matStr(o) === matStr(answer)),
      };
    }
    if (level === 2) {
      const answer = matScale(scalar, matA);
      const options: Matrix2x2[] = [
        answer,
        makeWrongMatrix(answer, 1),
        makeWrongMatrix(answer, 2),
        makeWrongMatrix(answer, 3),
      ];
      const shuffled = [...options].sort(
        (a, b) =>
          ((matStr(a).charCodeAt(0) * 3 + i * 7) % 11) -
          ((matStr(b).charCodeAt(0) * 3 + i * 7) % 11),
      );
      return {
        display: `${scalar} × A`,
        matA,
        scalar,
        answer,
        options: shuffled,
        correctIndex: shuffled.findIndex((o) => matStr(o) === matStr(answer)),
      };
    }
    const answer = matMul(matA, matB);
    const options: Matrix2x2[] = [
      answer,
      makeWrongMatrix(answer, 1),
      makeWrongMatrix(answer, 2),
      makeWrongMatrix(answer, 3),
    ];
    const shuffled = [...options].sort(
      (a, b) =>
        ((matStr(a).charCodeAt(0) * 3 + i * 7) % 11) -
        ((matStr(b).charCodeAt(0) * 3 + i * 7) % 11),
    );
    return {
      display: "A × B",
      matA,
      matB,
      answer,
      options: shuffled,
      correctIndex: shuffled.findIndex((o) => matStr(o) === matStr(answer)),
    };
  });
}

function MatrixDisplay({
  mat,
  label,
  color = "cyan",
}: { mat: Matrix2x2; label?: string; color?: string }) {
  const borderColor =
    color === "cyan"
      ? "oklch(0.78 0.2 195 / 0.4)"
      : "oklch(0.7 0.22 280 / 0.4)";
  const textColor = color === "cyan" ? "text-neon-cyan" : "text-neon-purple";
  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className={`text-xs font-bold ${textColor}`}>{label}</span>
      )}
      <div
        className="rounded-lg p-2 font-mono-game text-sm"
        style={{
          border: `1px solid ${borderColor}`,
          background: "oklch(0.1 0.02 265 / 0.5)",
        }}
      >
        <div className="flex gap-3">
          <span className="text-muted-foreground text-lg">⎡</span>
          <div className="flex flex-col gap-1">
            <div className="flex gap-3">
              <span className="w-6 text-center text-foreground/90">
                {mat[0][0]}
              </span>
              <span className="w-6 text-center text-foreground/90">
                {mat[0][1]}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="w-6 text-center text-foreground/90">
                {mat[1][0]}
              </span>
              <span className="w-6 text-center text-foreground/90">
                {mat[1][1]}
              </span>
            </div>
          </div>
          <span className="text-muted-foreground text-lg">⎦</span>
        </div>
      </div>
    </div>
  );
}

const TOTAL = 8;

export function MatrixCode({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: MatrixCodeProps) {
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
    "Matrix Addition",
    "Scalar Multiplication",
    "Matrix Multiplication",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">💻</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Matrix Code Breaker
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Crack the matrix code! Level {level}:{" "}
          <strong className="text-neon-cyan">{levelNames[level - 1]}</strong>. 8
          questions!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Enter the Matrix! 💻
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
        <span className="font-display font-bold text-sm text-neon-cyan">
          {q.display}
        </span>
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
          className="w-full card-neon rounded-2xl p-5"
        >
          {/* Show operand matrices */}
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            {q.matA && <MatrixDisplay mat={q.matA} label="A" color="cyan" />}
            {q.display.includes("×") && q.matB && (
              <>
                <span className="text-neon-purple font-bold text-xl">
                  {q.scalar ? `${q.scalar}×` : "×"}
                </span>
                <MatrixDisplay mat={q.matB} label="B" color="purple" />
              </>
            )}
            {q.display.includes("+") && q.matB && (
              <>
                <span className="text-neon-cyan font-bold text-xl">+</span>
                <MatrixDisplay mat={q.matB} label="B" color="purple" />
              </>
            )}
          </div>
          <p className="text-muted-foreground text-xs text-center mb-4">
            Choose the correct result:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
              let borderCls = "border-border hover:border-neon-cyan";
              let bgCls = "bg-card";
              if (isSelected && feedback === "correct") {
                borderCls = "border-green-400";
                bgCls = "bg-green-500/10";
              }
              if (isSelected && feedback === "wrong") {
                borderCls = "border-red-400";
                bgCls = "bg-red-500/10";
              }
              if (!isSelected && selected !== null && isCorrect) {
                borderCls = "border-green-400/50";
                bgCls = "bg-green-500/5";
              }

              return (
                <button
                  key={matStr(opt)}
                  type="button"
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-not-allowed
                    ${borderCls} ${bgCls} ${selected === null ? "hover:scale-105 active:scale-95" : ""}`}
                >
                  <MatrixDisplay mat={opt} />
                  {isSelected && feedback && (
                    <div
                      className={`text-center text-sm font-bold mt-1 ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}
                    >
                      {feedback === "correct" ? "✓" : "✗"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {done && (
        <div className="text-center animate-bounce-in">
          <div className="text-3xl">{correct >= 6 ? "💻" : "🧮"}</div>
          <div className="font-display text-lg font-bold text-neon-cyan">
            {correct >= 6 ? "Code Cracked!" : "Matrix Complete!"}
          </div>
        </div>
      )}
    </div>
  );
}
