import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PlayerProfile } from "../backend.d";

interface TournamentScreenProps {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

const ROUND_QUESTIONS: Question[][] = [
  // Round 1: Basic arithmetic
  [
    {
      question: "What is 12 + 15?",
      options: ["25", "27", "28", "26"],
      answer: "27",
    },
    { question: "What is 48 ÷ 6?", options: ["7", "8", "9", "6"], answer: "8" },
    {
      question: "What is 7 × 8?",
      options: ["54", "56", "58", "52"],
      answer: "56",
    },
    {
      question: "What is 100 - 37?",
      options: ["63", "73", "67", "53"],
      answer: "63",
    },
    {
      question: "What is 9 × 9?",
      options: ["72", "81", "90", "78"],
      answer: "81",
    },
  ],
  // Round 2: Algebra and fractions
  [
    {
      question: "Solve: 2x + 5 = 13. What is x?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "What is 3/4 + 1/4?",
      options: ["4/8", "1", "1/2", "3/8"],
      answer: "1",
    },
    {
      question: "Simplify: 2/6",
      options: ["1/4", "1/3", "2/3", "1/6"],
      answer: "1/3",
    },
    {
      question: "If y = 3x and x = 4, what is y?",
      options: ["7", "10", "12", "15"],
      answer: "12",
    },
    {
      question: "What is 15% of 80?",
      options: ["10", "12", "15", "20"],
      answer: "12",
    },
  ],
  // Round 3: Advanced
  [
    {
      question: "Solve: x² = 49. Positive value of x?",
      options: ["5", "6", "7", "8"],
      answer: "7",
    },
    {
      question: "What is sin(90°)?",
      options: ["0", "1", "-1", "0.5"],
      answer: "1",
    },
    {
      question: "What is the derivative of x²?",
      options: ["x", "2x", "2", "x³"],
      answer: "2x",
    },
    {
      question: "Solve: x² - 5x + 6 = 0. One solution?",
      options: ["1", "2", "4", "5"],
      answer: "2",
    },
    {
      question: "What is log₁₀(1000)?",
      options: ["2", "3", "4", "10"],
      answer: "3",
    },
  ],
];

const ROUND_NAMES = ["Round 1", "Round 2", "Round 3"];
const ROUND_SUBTITLES = [
  "Basic Arithmetic",
  "Algebra & Fractions",
  "Advanced Challenge",
];
const ROUND_EMOJIS = ["⚔️", "🔥", "👑"];

function getPlayerTitle(profile: PlayerProfile): string {
  const xp = Number(profile.xp);
  const streak = Number(profile.streakDays);
  if (xp >= 2500) return "Math Genius";
  if (xp >= 1000) return "XP Legend";
  if (profile.badges.includes("boss_slayer_ultimate")) return "Boss Slayer";
  if (streak >= 7) return "Streak King";
  if (xp >= 500) return "Math Wizard";
  return "Apprentice";
}

function saveProfileChanges(
  profile: PlayerProfile,
  xpGain: number,
  badgeId?: string,
): PlayerProfile {
  const newXp = profile.xp + BigInt(xpGain);
  const newBadges =
    badgeId && !profile.badges.includes(badgeId)
      ? [...profile.badges, badgeId]
      : profile.badges;
  return { ...profile, xp: newXp, badges: newBadges };
}

export function TournamentScreen({
  profile,
  onProfileUpdate,
  onBack,
}: TournamentScreenProps) {
  const [phase, setPhase] = useState<
    "intro" | "playing" | "round-complete" | "champion"
  >("intro");
  const [currentRound, setCurrentRound] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        const questions = ROUND_QUESTIONS[currentRound];
        if (questionIdx + 1 >= questions.length) {
          setPhase("round-complete");
          setRoundsCompleted((r) => r + 1);
        } else {
          setQuestionIdx((i) => i + 1);
          setSelected(null);
          setFeedback(null);
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [feedback, questionIdx, currentRound]);

  const startRound = (roundIndex: number) => {
    setCurrentRound(roundIndex);
    setQuestionIdx(0);
    setRoundScore(0);
    setSelected(null);
    setFeedback(null);
    setPhase("playing");
  };

  const handleAnswer = (option: string) => {
    if (feedback) return;
    setSelected(option);
    const q = ROUND_QUESTIONS[currentRound][questionIdx];
    const isCorrect = option === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setRoundScore((s) => s + 1);
      setTotalScore((s) => s + 1);
    }
  };

  const handleRoundComplete = () => {
    // Award 50 XP per round
    const updatedProfile = saveProfileChanges(profile, 50);
    onProfileUpdate(updatedProfile);

    if (currentRound + 1 >= ROUND_QUESTIONS.length) {
      // All rounds done — award champion badge
      const championProfile = saveProfileChanges(
        updatedProfile,
        0,
        "tournament_champ",
      );
      onProfileUpdate(championProfile);
      setPhase("champion");
    } else {
      setCurrentRound((r) => r + 1);
      setPhase("intro");
    }
  };

  const currentQuestion =
    phase === "playing" ? ROUND_QUESTIONS[currentRound][questionIdx] : null;
  const progressPct =
    phase === "playing"
      ? (questionIdx / ROUND_QUESTIONS[currentRound].length) * 100
      : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          data-ocid="tournament.back.button"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-glow-cyan">
            ⚔️ Tournament
          </h1>
          <div className="text-muted-foreground text-xs">
            {ROUND_NAMES[currentRound]} — {getPlayerTitle(profile)}
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* ── INTRO / BRACKET VIEW ── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-5"
            >
              {/* Bracket visual */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.7), oklch(0.08 0.02 265 / 0.8))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                }}
              >
                <div className="text-center mb-4">
                  <div className="font-display text-xs font-bold text-neon-cyan tracking-widest mb-1">
                    TOURNAMENT BRACKET
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Win all 3 rounds to become Champion!
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ROUND_NAMES.map((name, i) => {
                    const isCompleted = i < roundsCompleted;
                    const isCurrent = i === currentRound;
                    const isLocked = i > currentRound;
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-2 flex-1"
                      >
                        <motion.div
                          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl"
                          animate={isCurrent ? { scale: [1, 1.03, 1] } : {}}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                          style={{
                            background: isCompleted
                              ? "oklch(0.72 0.22 155 / 0.15)"
                              : isCurrent
                                ? "oklch(0.14 0.06 195 / 0.7)"
                                : "oklch(0.1 0.02 265 / 0.4)",
                            border: isCompleted
                              ? "1px solid oklch(0.72 0.22 155 / 0.5)"
                              : isCurrent
                                ? "1px solid oklch(0.78 0.2 195 / 0.6)"
                                : "1px solid oklch(0.3 0.04 270 / 0.3)",
                          }}
                          data-ocid={`tournament.round.item.${i + 1}`}
                        >
                          <div className="text-xl">
                            {isCompleted
                              ? "✅"
                              : isLocked
                                ? "🔒"
                                : ROUND_EMOJIS[i]}
                          </div>
                          <div
                            className="font-display text-xs font-bold text-center leading-tight"
                            style={{
                              color: isCompleted
                                ? "oklch(0.72 0.22 155)"
                                : isCurrent
                                  ? "oklch(0.85 0.18 195)"
                                  : "oklch(0.5 0.04 270)",
                            }}
                          >
                            {name}
                          </div>
                          <div className="text-muted-foreground text-xs text-center leading-tight">
                            {ROUND_SUBTITLES[i]}
                          </div>
                        </motion.div>
                        {i < ROUND_NAMES.length - 1 && (
                          <div
                            className="text-lg flex-shrink-0"
                            style={{
                              color:
                                i < roundsCompleted - 1
                                  ? "oklch(0.72 0.22 155)"
                                  : "oklch(0.4 0.04 270)",
                            }}
                          >
                            →
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Champion trophy */}
                  <div className="flex items-center gap-2">
                    <div
                      className="text-lg"
                      style={{
                        color:
                          roundsCompleted >= 3
                            ? "oklch(0.82 0.18 70)"
                            : "oklch(0.4 0.04 270)",
                      }}
                    >
                      →
                    </div>
                    <div
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl flex-shrink-0"
                      style={{
                        background:
                          roundsCompleted >= 3
                            ? "oklch(0.18 0.06 70 / 0.6)"
                            : "oklch(0.1 0.02 265 / 0.4)",
                        border:
                          roundsCompleted >= 3
                            ? "1px solid oklch(0.82 0.18 70 / 0.5)"
                            : "1px solid oklch(0.3 0.04 270 / 0.3)",
                      }}
                    >
                      <div className="text-xl">🏆</div>
                      <div
                        className="font-display text-xs font-bold"
                        style={{
                          color:
                            roundsCompleted >= 3
                              ? "oklch(0.9 0.18 70)"
                              : "oklch(0.4 0.04 270)",
                        }}
                      >
                        Champ
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current round info */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-5 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.14 0.06 195 / 0.8), oklch(0.1 0.04 265 / 0.9))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.4)",
                  boxShadow: "0 0 30px oklch(0.78 0.2 195 / 0.12)",
                }}
              >
                <div className="text-5xl mb-3">
                  {ROUND_EMOJIS[currentRound]}
                </div>
                <div className="font-display text-2xl font-black text-glow-cyan mb-1">
                  {ROUND_NAMES[currentRound]}
                </div>
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: "oklch(0.78 0.2 195 / 0.8)" }}
                >
                  {ROUND_SUBTITLES[currentRound]}
                </div>
                <div className="text-muted-foreground text-xs mb-4">
                  5 questions · Answer correctly · Earn 50 XP
                </div>
                <motion.button
                  type="button"
                  onClick={() => startRound(currentRound)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full py-4 rounded-xl font-display font-black text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                    color: "oklch(0.08 0.02 265)",
                    boxShadow: "0 0 20px oklch(0.78 0.2 195 / 0.4)",
                  }}
                  data-ocid="tournament.start_round.button"
                >
                  ⚔️ Start {ROUND_NAMES[currentRound]}
                </motion.button>
              </motion.div>

              {/* Score summary */}
              {totalScore > 0 && (
                <div
                  className="rounded-xl p-3 flex items-center justify-between"
                  style={{
                    background: "oklch(0.12 0.04 70 / 0.5)",
                    border: "1px solid oklch(0.82 0.18 70 / 0.3)",
                  }}
                >
                  <span className="text-xs text-muted-foreground font-semibold">
                    Tournament Score
                  </span>
                  <span
                    className="font-display text-xl font-black"
                    style={{ color: "oklch(0.9 0.18 70)" }}
                  >
                    {totalScore}/{ROUND_QUESTIONS.length * 5}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── PLAYING ── */}
          {phase === "playing" && currentQuestion && (
            <motion.div
              key={`round-${currentRound}-q-${questionIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                    }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {questionIdx + 1}/5
                </span>
              </div>

              {/* Round & score badges */}
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "oklch(0.78 0.2 195 / 0.15)",
                    border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                    color: "oklch(0.85 0.18 195)",
                  }}
                >
                  {ROUND_EMOJIS[currentRound]} {ROUND_NAMES[currentRound]}
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "oklch(0.72 0.22 155 / 0.15)",
                    border: "1px solid oklch(0.72 0.22 155 / 0.3)",
                    color: "oklch(0.72 0.22 155)",
                  }}
                >
                  ✓ {roundScore}
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={questionIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-2xl p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.6), oklch(0.09 0.02 265 / 0.7))",
                    border: "1px solid oklch(0.78 0.2 195 / 0.25)",
                  }}
                >
                  <div className="text-xs text-neon-cyan font-bold tracking-widest mb-2">
                    {ROUND_SUBTITLES[currentRound].toUpperCase()}
                  </div>
                  <p className="font-display text-xl font-bold text-foreground leading-snug">
                    {currentQuestion.question}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Answer options */}
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, i) => {
                  let btnStyle = {};
                  let className =
                    "py-4 px-3 rounded-xl font-display font-bold text-sm transition-all text-center";

                  if (!feedback) {
                    btnStyle = {
                      background: "oklch(0.13 0.03 265 / 0.8)",
                      border: "1px solid oklch(0.35 0.06 270 / 0.5)",
                      color: "oklch(0.88 0.06 265)",
                    };
                    className += " hover:scale-[1.02] cursor-pointer";
                  } else if (opt === currentQuestion.answer) {
                    btnStyle = {
                      background: "oklch(0.72 0.22 155 / 0.2)",
                      border: "2px solid oklch(0.72 0.22 155)",
                      color: "oklch(0.85 0.2 155)",
                    };
                  } else if (
                    opt === selected &&
                    opt !== currentQuestion.answer
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
                      className={className}
                      style={btnStyle}
                      data-ocid={`tournament.answer.button.${i + 1}`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback banner */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
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
                      ? "✅ Correct! +1 point"
                      : `❌ Wrong! Answer: ${currentQuestion.answer}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── ROUND COMPLETE ── */}
          {phase === "round-complete" && (
            <motion.div
              key="round-complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-5 py-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.6 }}
                className="text-7xl"
              >
                {roundScore >= 4 ? "🏆" : roundScore >= 3 ? "⭐" : "📚"}
              </motion.div>

              <div>
                <div className="font-display text-3xl font-black text-glow-cyan mb-1">
                  {ROUND_NAMES[currentRound]} Complete!
                </div>
                <div
                  className="font-display text-5xl font-black mb-2"
                  style={{ color: "oklch(0.9 0.18 70)" }}
                >
                  {roundScore}/5
                </div>
                <div className="text-muted-foreground text-sm">
                  {roundScore >= 4
                    ? "Excellent! You dominated this round!"
                    : roundScore >= 3
                      ? "Good effort! Keep going!"
                      : "You passed! Prepare for the next round!"}
                </div>
              </div>

              <div
                className="rounded-xl px-6 py-3 flex items-center gap-3"
                style={{
                  background: "oklch(0.14 0.06 70 / 0.5)",
                  border: "1px solid oklch(0.82 0.18 70 / 0.4)",
                }}
              >
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-bold text-amber-400">+50 XP earned!</div>
                  <div className="text-xs text-muted-foreground">
                    Round completion reward
                  </div>
                </div>
              </div>

              {currentRound + 1 < ROUND_QUESTIONS.length ? (
                <motion.button
                  type="button"
                  onClick={handleRoundComplete}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full max-w-xs py-4 rounded-xl font-display font-black text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                    color: "oklch(0.08 0.02 265)",
                    boxShadow: "0 0 20px oklch(0.78 0.2 195 / 0.4)",
                  }}
                  data-ocid="tournament.next_round.button"
                >
                  Next Round →
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleRoundComplete}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full max-w-xs py-4 rounded-xl font-display font-black text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.82 0.18 70), oklch(0.72 0.22 50))",
                    color: "oklch(0.08 0.02 70)",
                    boxShadow: "0 0 20px oklch(0.82 0.18 70 / 0.4)",
                  }}
                  data-ocid="tournament.claim_title.button"
                >
                  🏆 Claim Champion Title!
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── CHAMPION ── */}
          {phase === "champion" && (
            <motion.div
              key="champion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-5 py-4 text-center"
            >
              {/* Stars */}
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: i * 0.15,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="text-4xl"
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-8xl"
              >
                🏆
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-display text-4xl font-black text-glow-cyan mb-2"
                >
                  CHAMPION!
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-muted-foreground text-sm"
                >
                  You conquered all 3 tournament rounds!
                  <br />
                  Total score: {totalScore}/{ROUND_QUESTIONS.length * 5}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="rounded-xl px-6 py-4 flex flex-col gap-2 items-center"
                style={{
                  background: "oklch(0.16 0.06 70 / 0.5)",
                  border: "1px solid oklch(0.82 0.18 70 / 0.5)",
                }}
              >
                <div className="text-3xl">🏅</div>
                <div className="font-display font-bold text-amber-400">
                  Tournament Champ badge!
                </div>
                <div className="text-xs text-muted-foreground">
                  +150 XP total earned
                </div>
              </motion.div>

              <motion.button
                type="button"
                onClick={onBack}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full max-w-xs py-4 rounded-xl font-display font-black text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                  color: "oklch(0.08 0.02 265)",
                }}
                data-ocid="tournament.finish.button"
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
