import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PlayerProfile } from "../backend.d";

interface DailyDungeonScreenProps {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
  topic: string;
}

// Seeded question bank — use date seed to pick 10 deterministic questions each day
const QUESTION_BANK: Question[] = [
  {
    question: "What is 8 × 9?",
    options: ["63", "72", "81", "64"],
    answer: "72",
    topic: "Multiplication",
  },
  {
    question: "Solve: x + 14 = 27. What is x?",
    options: ["11", "12", "13", "14"],
    answer: "13",
    topic: "Algebra",
  },
  {
    question: "What is the area of a rectangle 6cm × 4cm?",
    options: ["20", "24", "18", "28"],
    answer: "24",
    topic: "Geometry",
  },
  {
    question: "What is 3/5 + 1/5?",
    options: ["4/10", "4/5", "2/5", "5/5"],
    answer: "4/5",
    topic: "Fractions",
  },
  {
    question: "What is 25% of 200?",
    options: ["25", "40", "50", "75"],
    answer: "50",
    topic: "Percentages",
  },
  {
    question: "What is 144 ÷ 12?",
    options: ["11", "12", "13", "14"],
    answer: "12",
    topic: "Division",
  },
  {
    question: "What is 2³?",
    options: ["6", "8", "9", "16"],
    answer: "8",
    topic: "Powers",
  },
  {
    question: "Solve: 2x = 18. What is x?",
    options: ["7", "8", "9", "10"],
    answer: "9",
    topic: "Algebra",
  },
  {
    question: "What is the perimeter of a square with side 7cm?",
    options: ["21", "28", "35", "49"],
    answer: "28",
    topic: "Geometry",
  },
  {
    question: "What is 0.5 × 0.5?",
    options: ["0.1", "0.25", "0.5", "1"],
    answer: "0.25",
    topic: "Decimals",
  },
  {
    question: "What is 15 × 15?",
    options: ["175", "200", "225", "250"],
    answer: "225",
    topic: "Multiplication",
  },
  {
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    answer: "8",
    topic: "Square Roots",
  },
  {
    question: "What is 1/4 of 80?",
    options: ["15", "16", "20", "25"],
    answer: "20",
    topic: "Fractions",
  },
  {
    question: "Simplify: 4x + 3x",
    options: ["7x", "7x²", "12x", "x⁷"],
    answer: "7x",
    topic: "Algebra",
  },
  {
    question: "What is 7² ?",
    options: ["14", "42", "49", "56"],
    answer: "49",
    topic: "Powers",
  },
  {
    question: "What is 60% of 150?",
    options: ["75", "80", "90", "100"],
    answer: "90",
    topic: "Percentages",
  },
  {
    question: "What is 9 × 11?",
    options: ["89", "99", "100", "108"],
    answer: "99",
    topic: "Multiplication",
  },
  {
    question: "What is the next prime after 13?",
    options: ["14", "15", "16", "17"],
    answer: "17",
    topic: "Primes",
  },
  {
    question: "Solve: 3x - 6 = 9. What is x?",
    options: ["3", "4", "5", "6"],
    answer: "5",
    topic: "Algebra",
  },
  {
    question: "What is 1000 ÷ 25?",
    options: ["20", "30", "40", "50"],
    answer: "40",
    topic: "Division",
  },
];

const DUNGEON_TIME = 30; // seconds per question

function getDailyQuestions(dateStr: string): Question[] {
  // Seeded shuffle
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 2147483647;
  }
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  // Shuffle indices
  const indices = Array.from({ length: QUESTION_BANK.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, 10).map((i) => QUESTION_BANK[i]);
}

function hasCompletedToday(): boolean {
  try {
    const key = `mm_dungeon_completed_${new Date().toDateString()}`;
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function markCompletedToday() {
  try {
    const key = `mm_dungeon_completed_${new Date().toDateString()}`;
    localStorage.setItem(key, "true");
  } catch {
    /* noop */
  }
}

export function DailyDungeonScreen({
  profile,
  onProfileUpdate,
  onBack,
}: DailyDungeonScreenProps) {
  const dateStr = new Date().toDateString();
  const questions = getDailyQuestions(dateStr);

  const [phase, setPhase] = useState<"intro" | "playing" | "done">(() =>
    hasCompletedToday() ? "done" : "intro",
  );
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "timeout" | null
  >(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DUNGEON_TIME);
  const [completedToday] = useState(hasCompletedToday);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: clearTimer is a stable ref-based helper
  useEffect(() => {
    if (phase !== "playing" || feedback) return;

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setFeedback("timeout");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return stopTimer;
  }, [phase, feedback]);

  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      if (questionIdx + 1 >= questions.length) {
        // Done!
        markCompletedToday();
        // Award badge + XP
        const newXp = profile.xp + BigInt(100);
        const newBadges = profile.badges.includes("dungeon_master")
          ? profile.badges
          : [...profile.badges, "dungeon_master"];
        onProfileUpdate({ ...profile, xp: newXp, badges: newBadges });
        setPhase("done");
      } else {
        setQuestionIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
        setTimeLeft(DUNGEON_TIME);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [feedback, questionIdx, questions.length, profile, onProfileUpdate]);

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    // Stop the countdown timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSelected(opt);
    const q = questions[questionIdx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const timerPct = (timeLeft / DUNGEON_TIME) * 100;
  const timerColor =
    timeLeft > 15
      ? "oklch(0.72 0.22 155)"
      : timeLeft > 8
        ? "oklch(0.82 0.18 70)"
        : "oklch(0.6 0.2 20)";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          data-ocid="dungeon.back.button"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-glow-cyan">
            🏰 Daily Dungeon
          </h1>
          <div className="text-muted-foreground text-xs">{dateStr}</div>
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
              <motion.div
                className="rounded-2xl p-6 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.7), oklch(0.08 0.02 265 / 0.8))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="text-7xl mb-4"
                >
                  🏰
                </motion.div>
                <div className="font-display text-2xl font-black text-glow-cyan mb-2">
                  Daily Dungeon
                </div>
                <div className="text-muted-foreground text-sm mb-4">
                  10 timed questions · 30 seconds each · New dungeon every day
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: "❓", label: "10 Questions" },
                    { icon: "⏱️", label: "30s Each" },
                    { icon: "💎", label: "+100 XP" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-3 flex flex-col items-center gap-1"
                      style={{
                        background: "oklch(0.1 0.03 265 / 0.6)",
                        border: "1px solid oklch(0.3 0.05 270 / 0.4)",
                      }}
                    >
                      <div className="text-xl">{item.icon}</div>
                      <div className="text-xs font-semibold text-foreground/80">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={() => setPhase("playing")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full py-4 rounded-xl font-display font-black text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                    color: "oklch(0.08 0.02 265)",
                    boxShadow: "0 0 20px oklch(0.78 0.2 195 / 0.4)",
                  }}
                  data-ocid="dungeon.start.button"
                >
                  ⚡ Enter the Dungeon
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── PLAYING ── */}
          {phase === "playing" && (
            <motion.div
              key={`q-${questionIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Question progress */}
              <div className="flex items-center justify-between">
                <div
                  className="font-display font-bold text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "oklch(0.78 0.2 195 / 0.15)",
                    border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                    color: "oklch(0.85 0.18 195)",
                  }}
                >
                  Question {questionIdx + 1}/10
                </div>
                <div
                  className="font-display font-bold text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "oklch(0.72 0.22 155 / 0.15)",
                    border: "1px solid oklch(0.72 0.22 155 / 0.3)",
                    color: "oklch(0.72 0.22 155)",
                  }}
                >
                  ✓ {correctCount}
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(questionIdx / 10) * 100}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                  }}
                />
              </div>

              {/* Countdown timer */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Time left</span>
                  <span
                    className="font-display font-bold tabular-nums"
                    style={{ color: timerColor }}
                  >
                    {timeLeft}s
                  </span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${timerPct}%`,
                      background: `linear-gradient(90deg, ${timerColor}, ${timerColor})`,
                      boxShadow: `0 0 8px ${timerColor}`,
                    }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.6), oklch(0.09 0.02 265 / 0.7))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.25)",
                }}
              >
                <div className="text-xs text-neon-cyan font-bold tracking-widest mb-2">
                  {questions[questionIdx].topic.toUpperCase()}
                </div>
                <p className="font-display text-xl font-bold text-foreground leading-snug">
                  {questions[questionIdx].question}
                </p>
              </div>

              {/* Answer options */}
              <div className="grid grid-cols-2 gap-3">
                {questions[questionIdx].options.map((opt, i) => {
                  let btnStyle = {};
                  let extraClass = "";

                  if (!feedback) {
                    btnStyle = {
                      background: "oklch(0.13 0.03 265 / 0.8)",
                      border: "1px solid oklch(0.35 0.06 270 / 0.5)",
                      color: "oklch(0.88 0.06 265)",
                    };
                    extraClass = "hover:scale-[1.02] cursor-pointer";
                  } else if (opt === questions[questionIdx].answer) {
                    btnStyle = {
                      background: "oklch(0.72 0.22 155 / 0.2)",
                      border: "2px solid oklch(0.72 0.22 155)",
                      color: "oklch(0.85 0.2 155)",
                    };
                  } else if (
                    opt === selected &&
                    opt !== questions[questionIdx].answer
                  ) {
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
                      data-ocid={`dungeon.answer.button.${i + 1}`}
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
                      ? "✅ Correct!"
                      : feedback === "timeout"
                        ? `⏰ Time's up! Answer: ${questions[questionIdx].answer}`
                        : `❌ Wrong! Answer: ${questions[questionIdx].answer}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── DONE (first time or already completed) ── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 py-4 text-center"
            >
              {completedToday && questionIdx === 0 ? (
                // Already completed today on load
                <>
                  <div className="text-6xl">🌙</div>
                  <div>
                    <div className="font-display text-2xl font-black text-glow-cyan mb-2">
                      Already Completed!
                    </div>
                    <p className="text-muted-foreground text-sm">
                      You've already conquered today's dungeon.
                      <br />
                      Come back tomorrow for a new challenge!
                    </p>
                  </div>
                  <div
                    className="rounded-xl px-6 py-3 text-sm font-semibold"
                    style={{
                      background: "oklch(0.14 0.04 195 / 0.5)",
                      border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                      color: "oklch(0.78 0.2 195)",
                    }}
                  >
                    📅 Resets in {24 - new Date().getHours()}h
                  </div>
                </>
              ) : (
                // Just completed
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                    className="text-8xl"
                  >
                    {correctCount >= 8 ? "🏆" : correctCount >= 6 ? "⭐" : "🎯"}
                  </motion.div>

                  <div>
                    <div className="font-display text-3xl font-black text-glow-cyan mb-1">
                      Dungeon Cleared!
                    </div>
                    <div
                      className="font-display text-5xl font-black mb-2"
                      style={{ color: "oklch(0.9 0.18 70)" }}
                    >
                      {correctCount}/10
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {correctCount >= 8
                        ? "Incredible! You obliterated this dungeon!"
                        : correctCount >= 6
                          ? "Strong performance! Keep it up!"
                          : "You survived! Practice more for next time!"}
                    </div>
                  </div>

                  <div
                    className="rounded-xl px-6 py-3 flex items-center gap-3"
                    style={{
                      background: "oklch(0.14 0.06 70 / 0.5)",
                      border: "1px solid oklch(0.82 0.18 70 / 0.4)",
                    }}
                  >
                    <span className="text-2xl">💎</span>
                    <div>
                      <div className="font-bold text-amber-400">
                        +100 XP + Dungeon Master badge!
                      </div>
                      <div className="text-xs text-muted-foreground">
                        First dungeon completion
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-xs">
                    Come back tomorrow for a new dungeon challenge!
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={onBack}
                className="mt-2 w-full max-w-xs py-4 rounded-xl font-display font-bold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                  color: "oklch(0.08 0.02 265)",
                }}
                data-ocid="dungeon.back_home.button"
              >
                ← Back to Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
