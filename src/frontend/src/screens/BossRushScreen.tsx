import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PlayerProfile } from "../backend.d";

interface BossRushScreenProps {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
}

interface BossQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Boss {
  name: string;
  emoji: string;
  color: string;
  glowColor: string;
  questions: BossQuestion[];
}

const BOSSES: Boss[] = [
  {
    name: "Arithmetic Dragon",
    emoji: "🐉",
    color: "oklch(0.7 0.22 20)",
    glowColor: "oklch(0.7 0.22 20 / 0.4)",
    questions: [
      {
        question: "What is 13 × 14?",
        options: ["152", "172", "182", "192"],
        answer: "182",
      },
      {
        question: "What is 256 ÷ 16?",
        options: ["14", "16", "18", "20"],
        answer: "16",
      },
      {
        question: "What is 99 + 88?",
        options: ["177", "187", "197", "207"],
        answer: "187",
      },
      {
        question: "What is 150 - 67?",
        options: ["73", "83", "93", "103"],
        answer: "83",
      },
      {
        question: "What is 25 × 8?",
        options: ["180", "190", "200", "210"],
        answer: "200",
      },
    ],
  },
  {
    name: "Fraction Phantom",
    emoji: "👻",
    color: "oklch(0.78 0.2 195)",
    glowColor: "oklch(0.78 0.2 195 / 0.4)",
    questions: [
      {
        question: "What is 2/3 + 1/3?",
        options: ["3/6", "1", "2/6", "3/3"],
        answer: "1",
      },
      {
        question: "What is 3/4 - 1/4?",
        options: ["2/4", "1/2", "1/4", "3/8"],
        answer: "1/2",
      },
      {
        question: "What is 2/5 × 5?",
        options: ["1", "2", "5", "10"],
        answer: "2",
      },
      {
        question: "What is 3/4 of 40?",
        options: ["20", "25", "30", "35"],
        answer: "30",
      },
      {
        question: "Simplify 6/9",
        options: ["1/3", "2/3", "3/4", "1/2"],
        answer: "2/3",
      },
    ],
  },
  {
    name: "Algebra Witch",
    emoji: "🧙‍♀️",
    color: "oklch(0.7 0.22 280)",
    glowColor: "oklch(0.7 0.22 280 / 0.4)",
    questions: [
      {
        question: "Solve: 3x + 7 = 22. What is x?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "If a = 4 and b = 3, what is a² + b²?",
        options: ["24", "25", "16", "7"],
        answer: "25",
      },
      {
        question: "Expand: 2(x + 5)",
        options: ["2x + 5", "2x + 10", "x + 10", "2x + 7"],
        answer: "2x + 10",
      },
      {
        question: "Solve: 4y - 8 = 12. What is y?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "What is the coefficient of x in 7x + 3?",
        options: ["3", "7", "10", "x"],
        answer: "7",
      },
    ],
  },
  {
    name: "Quadratic Titan",
    emoji: "🤖",
    color: "oklch(0.72 0.22 155)",
    glowColor: "oklch(0.72 0.22 155 / 0.4)",
    questions: [
      {
        question: "Solve x² - 9 = 0. Positive x?",
        options: ["2", "3", "4", "5"],
        answer: "3",
      },
      {
        question: "What is the discriminant of x² + 4x + 3 = 0?",
        options: ["0", "4", "13", "16"],
        answer: "4",
      },
      {
        question: "Factor: x² - 5x + 6",
        options: ["(x-2)(x-3)", "(x+2)(x+3)", "(x-1)(x-6)", "(x-2)(x+3)"],
        answer: "(x-2)(x-3)",
      },
      {
        question: "What is the vertex x of y = x² - 4x + 1?",
        options: ["x=1", "x=2", "x=3", "x=4"],
        answer: "x=2",
      },
      {
        question: "Solve: x² = 81. Positive x?",
        options: ["7", "8", "9", "10"],
        answer: "9",
      },
    ],
  },
  {
    name: "Calculus God",
    emoji: "⚡",
    color: "oklch(0.82 0.18 70)",
    glowColor: "oklch(0.82 0.18 70 / 0.4)",
    questions: [
      {
        question: "What is d/dx of x³?",
        options: ["x²", "2x", "3x²", "3x"],
        answer: "3x²",
      },
      {
        question: "What is the integral of 2x dx?",
        options: ["x", "x²", "2x²", "x² + C"],
        answer: "x² + C",
      },
      {
        question: "What is the limit of (x²-1)/(x-1) as x→1?",
        options: ["0", "1", "2", "∞"],
        answer: "2",
      },
      {
        question: "What is d/dx of sin(x)?",
        options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
        answer: "cos(x)",
      },
      {
        question: "What is ∫₀¹ x dx?",
        options: ["0", "1/4", "1/2", "1"],
        answer: "1/2",
      },
    ],
  },
];

export function BossRushScreen({
  profile,
  onProfileUpdate,
  onBack,
}: BossRushScreenProps) {
  const [phase, setPhase] = useState<
    "intro" | "fighting" | "boss-defeated" | "victory"
  >("intro");
  const [bossIdx, setBossIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [bossHp, setBossHp] = useState(5);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [totalDefeated, setTotalDefeated] = useState(0);

  const currentBoss = BOSSES[bossIdx];

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      if (bossHp === 0) {
        setTotalDefeated((d) => d + 1);
        setPhase("boss-defeated");
      } else if (questionIdx + 1 >= currentBoss.questions.length) {
        // Out of questions for this boss but HP > 0 — restart questions
        setQuestionIdx(0);
        setSelected(null);
        setFeedback(null);
      } else {
        setQuestionIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [feedback, bossHp, questionIdx, currentBoss.questions.length]);

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
    const q = currentBoss.questions[questionIdx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setBossHp((hp) => Math.max(0, hp - 1));
    } else {
      setBossHp((hp) => Math.min(5, hp + 1));
    }
  };

  const handleNextBoss = () => {
    if (bossIdx + 1 >= BOSSES.length) {
      // Victory!
      const newXp = profile.xp + BigInt(200);
      const newBadges = profile.badges.includes("boss_slayer_ultimate")
        ? profile.badges
        : [...profile.badges, "boss_slayer_ultimate"];
      onProfileUpdate({ ...profile, xp: newXp, badges: newBadges });
      setPhase("victory");
    } else {
      setBossIdx((i) => i + 1);
      setQuestionIdx(0);
      setBossHp(5);
      setSelected(null);
      setFeedback(null);
      setPhase("fighting");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          data-ocid="bossrush.back.button"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-glow-cyan">
            👾 Boss Rush
          </h1>
          <div className="text-muted-foreground text-xs">
            {totalDefeated}/{BOSSES.length} bosses defeated
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-5"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.7), oklch(0.08 0.02 265 / 0.8))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                }}
              >
                <div className="text-6xl mb-4">👾</div>
                <div className="font-display text-2xl font-black text-glow-cyan mb-2">
                  Boss Rush Mode
                </div>
                <p className="text-muted-foreground text-sm mb-5">
                  Fight all 5 math bosses back to back!
                  <br />
                  Correct answers deal damage · Wrong answers heal the boss
                </p>

                {/* Boss lineup */}
                <div className="flex justify-center gap-2 mb-5">
                  {BOSSES.map((boss, i) => (
                    <div
                      key={boss.name}
                      className="flex flex-col items-center gap-1"
                      data-ocid={`bossrush.boss.item.${i + 1}`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{
                          background: `${boss.color.replace(")", " / 0.15)")}`,
                          border: `1px solid ${boss.glowColor}`,
                          boxShadow: `0 0 10px ${boss.glowColor}`,
                        }}
                      >
                        {boss.emoji}
                      </div>
                      <div className="text-xs text-muted-foreground text-center w-12 leading-tight">
                        {boss.name.split(" ")[0]}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl p-3 flex items-center gap-3 mb-5 text-left"
                  style={{
                    background: "oklch(0.14 0.06 70 / 0.4)",
                    border: "1px solid oklch(0.82 0.18 70 / 0.3)",
                  }}
                >
                  <span className="text-2xl">🏅</span>
                  <div>
                    <div className="font-bold text-amber-400 text-sm">
                      Defeat all 5 bosses
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +200 XP + Boss Slayer Ultimate badge
                    </div>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setPhase("fighting")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full py-4 rounded-xl font-display font-black text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.7 0.22 20), oklch(0.78 0.2 195))",
                    color: "oklch(0.95 0.02 265)",
                    boxShadow: "0 0 20px oklch(0.7 0.22 20 / 0.4)",
                  }}
                  data-ocid="bossrush.start.button"
                >
                  ⚔️ Begin Boss Rush
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── FIGHTING ── */}
          {phase === "fighting" && (
            <motion.div
              key={`boss-${bossIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-col gap-4"
            >
              {/* Boss arena */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{
                  background: `linear-gradient(135deg, ${currentBoss.color.replace(")", " / 0.1)")}, oklch(0.08 0.02 265 / 0.9))`,
                  border: `1px solid ${currentBoss.glowColor}`,
                  boxShadow: `0 0 30px ${currentBoss.glowColor}`,
                }}
              >
                <div
                  className="text-xs font-bold tracking-widest mb-1"
                  style={{ color: currentBoss.color }}
                >
                  BOSS {bossIdx + 1}/5
                </div>

                <motion.div
                  animate={{ scale: [1, 1.05, 1], y: [0, -4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="text-6xl mb-2"
                >
                  {currentBoss.emoji}
                </motion.div>

                <div
                  className="font-display text-xl font-black mb-3"
                  style={{ color: currentBoss.color }}
                >
                  {currentBoss.name}
                </div>

                {/* HP bars */}
                <div className="flex gap-1.5 justify-center">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((hpBar) => (
                    <motion.div
                      key={hpBar}
                      className="flex-1 h-4 rounded-full max-w-[40px]"
                      animate={{
                        background:
                          hpBar <= bossHp
                            ? currentBoss.color
                            : "oklch(0.2 0.03 270 / 0.5)",
                        boxShadow:
                          hpBar <= bossHp
                            ? `0 0 8px ${currentBoss.glowColor}`
                            : "none",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {bossHp}/5 HP remaining
                </div>
              </div>

              {/* Question */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.6), oklch(0.09 0.02 265 / 0.7))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.25)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={questionIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="font-display text-xl font-bold text-foreground leading-snug"
                  >
                    {
                      currentBoss.questions[
                        questionIdx % currentBoss.questions.length
                      ].question
                    }
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-2 gap-3">
                {currentBoss.questions[
                  questionIdx % currentBoss.questions.length
                ].options.map((opt, i) => {
                  const q =
                    currentBoss.questions[
                      questionIdx % currentBoss.questions.length
                    ];
                  let btnStyle = {};
                  let extraClass = "";

                  if (!feedback) {
                    btnStyle = {
                      background: "oklch(0.13 0.03 265 / 0.8)",
                      border: "1px solid oklch(0.35 0.06 270 / 0.5)",
                      color: "oklch(0.88 0.06 265)",
                    };
                    extraClass = "hover:scale-[1.02] cursor-pointer";
                  } else if (opt === q.answer) {
                    btnStyle = {
                      background: "oklch(0.72 0.22 155 / 0.2)",
                      border: "2px solid oklch(0.72 0.22 155)",
                      color: "oklch(0.85 0.2 155)",
                    };
                  } else if (opt === selected && opt !== q.answer) {
                    btnStyle = {
                      background: "oklch(0.6 0.2 20 / 0.2)",
                      border: "2px solid oklch(0.6 0.2 20)",
                      color: "oklch(0.8 0.18 20)",
                    };
                  } else {
                    btnStyle = {
                      background: "oklch(0.1 0.02 265 / 0.4)",
                      border: "1px solid oklch(0.2 0.03 270 / 0.3)",
                      color: "oklch(0.5 0.04 270)",
                    };
                  }

                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(opt)}
                      disabled={!!feedback}
                      whileHover={!feedback ? { scale: 1.03 } : {}}
                      whileTap={!feedback ? { scale: 0.97 } : {}}
                      className={`py-4 px-3 rounded-xl font-display font-bold text-sm transition-all text-center ${extraClass}`}
                      style={btnStyle}
                      data-ocid={`bossrush.answer.button.${i + 1}`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-3 px-5 rounded-xl text-center font-display font-bold text-sm"
                    style={{
                      background:
                        feedback === "correct"
                          ? "oklch(0.72 0.22 155 / 0.2)"
                          : "oklch(0.6 0.2 20 / 0.2)",
                      border: `1px solid ${feedback === "correct" ? "oklch(0.72 0.22 155 / 0.5)" : "oklch(0.6 0.2 20 / 0.5)"}`,
                      color:
                        feedback === "correct"
                          ? "oklch(0.8 0.2 155)"
                          : "oklch(0.8 0.18 20)",
                    }}
                  >
                    {feedback === "correct"
                      ? `⚔️ Hit! Boss HP: ${Math.max(0, bossHp)} remaining`
                      : `🛡️ Boss recovered! HP: ${Math.min(5, bossHp)}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── BOSS DEFEATED ── */}
          {phase === "boss-defeated" && (
            <motion.div
              key="boss-defeated"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-5 py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
                className="text-8xl"
              >
                💥
              </motion.div>

              <div>
                <div className="font-display text-3xl font-black text-glow-cyan mb-1">
                  Boss Defeated!
                </div>
                <div
                  className="text-xl font-bold mb-2"
                  style={{ color: currentBoss.color }}
                >
                  {currentBoss.emoji} {currentBoss.name} falls!
                </div>
                <div className="text-muted-foreground text-sm">
                  {bossIdx + 1 < BOSSES.length
                    ? `Next: ${BOSSES[bossIdx + 1].emoji} ${BOSSES[bossIdx + 1].name}`
                    : "That was the final boss!"}
                </div>
              </div>

              {/* Progress */}
              <div className="flex gap-2">
                {BOSSES.map((boss, i) => (
                  <div
                    key={boss.name}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                    style={{
                      background:
                        i <= bossIdx
                          ? `${boss.color.replace(")", " / 0.2)")}`
                          : "oklch(0.1 0.02 265 / 0.5)",
                      border:
                        i <= bossIdx
                          ? `1px solid ${boss.glowColor}`
                          : "1px solid oklch(0.3 0.04 270 / 0.3)",
                    }}
                  >
                    {i <= bossIdx ? "✅" : boss.emoji}
                  </div>
                ))}
              </div>

              <motion.button
                type="button"
                onClick={handleNextBoss}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full max-w-xs py-4 rounded-xl font-display font-black text-base"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.7 0.22 20), oklch(0.78 0.2 195))",
                  color: "oklch(0.95 0.02 265)",
                  boxShadow: "0 0 20px oklch(0.7 0.22 20 / 0.4)",
                }}
                data-ocid="bossrush.next_boss.button"
              >
                {bossIdx + 1 < BOSSES.length
                  ? `⚔️ Fight ${BOSSES[bossIdx + 1].name}`
                  : "🏆 Claim Victory!"}
              </motion.button>
            </motion.div>
          )}

          {/* ── VICTORY ── */}
          {phase === "victory" && (
            <motion.div
              key="victory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-5 py-4 text-center"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring" }}
                  className="absolute"
                  style={{
                    left: `${15 + i * 18}%`,
                    top: "15%",
                    fontSize: "1.5rem",
                  }}
                >
                  ⭐
                </motion.div>
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-8xl"
              >
                🏆
              </motion.div>

              <div>
                <div className="font-display text-4xl font-black text-glow-cyan mb-2">
                  BOSS RUSH COMPLETE!
                </div>
                <p className="text-muted-foreground text-sm">
                  You defeated all 5 legendary math bosses!
                  <br />
                  True Champion of Melting Maths!
                </p>
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {BOSSES.map((boss) => (
                  <div
                    key={boss.name}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `${boss.color.replace(")", " / 0.2)")}`,
                      border: `1px solid ${boss.glowColor}`,
                      boxShadow: `0 0 8px ${boss.glowColor}`,
                    }}
                  >
                    ✅
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl px-6 py-4 flex flex-col gap-1 items-center"
                style={{
                  background: "oklch(0.16 0.06 70 / 0.5)",
                  border: "1px solid oklch(0.82 0.18 70 / 0.5)",
                }}
              >
                <div className="text-3xl">🏅</div>
                <div className="font-display font-bold text-amber-400">
                  Boss Slayer Ultimate badge!
                </div>
                <div className="text-xs text-muted-foreground">
                  +200 XP total earned
                </div>
              </div>

              <motion.button
                type="button"
                onClick={onBack}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full max-w-xs py-4 rounded-xl font-display font-black text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                  color: "oklch(0.08 0.02 265)",
                }}
                data-ocid="bossrush.finish.button"
              >
                ← Back to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
