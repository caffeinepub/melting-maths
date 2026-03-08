import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PlayerProfile } from "../backend.d";

interface ChallengeScreenProps {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
}

interface ChallengeQuestion {
  question: string;
  options: string[];
  answer: string;
}

const CHALLENGE_GAMES: Array<{
  id: string;
  label: string;
  emoji: string;
  questions: ChallengeQuestion[];
}> = [
  {
    id: "arithmetic",
    label: "Arithmetic Blitz",
    emoji: "🔢",
    questions: [
      {
        question: "What is 17 × 8?",
        options: ["126", "136", "146", "116"],
        answer: "136",
      },
      {
        question: "What is 225 ÷ 15?",
        options: ["13", "14", "15", "16"],
        answer: "15",
      },
      {
        question: "What is 99 + 66?",
        options: ["155", "165", "175", "185"],
        answer: "165",
      },
      {
        question: "What is 50% of 340?",
        options: ["150", "160", "170", "180"],
        answer: "170",
      },
      {
        question: "What is 12³?",
        options: ["1428", "1638", "1728", "1828"],
        answer: "1728",
      },
    ],
  },
  {
    id: "algebra",
    label: "Algebra Arena",
    emoji: "🔡",
    questions: [
      {
        question: "Solve: 5x - 3 = 22. What is x?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "If f(x) = 2x + 3, what is f(7)?",
        options: ["15", "17", "19", "21"],
        answer: "17",
      },
      {
        question: "Expand: (x+3)(x+2)",
        options: ["x²+5x+6", "x²+6x+5", "x²+5x+5", "x²+6x+6"],
        answer: "x²+5x+6",
      },
      {
        question: "Solve: x/4 + 2 = 5. What is x?",
        options: ["8", "10", "12", "14"],
        answer: "12",
      },
      {
        question: "What is the slope of y = 3x + 7?",
        options: ["3", "7", "10", "21"],
        answer: "3",
      },
    ],
  },
  {
    id: "geometry",
    label: "Geometry Gauntlet",
    emoji: "📐",
    questions: [
      {
        question: "Area of a circle with radius 5? (use π=3.14)",
        options: ["75.4", "78.5", "81.6", "65.2"],
        answer: "78.5",
      },
      {
        question: "What is the hypotenuse of a 3-4-5 right triangle?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "Sum of interior angles of a hexagon?",
        options: ["540°", "620°", "720°", "800°"],
        answer: "720°",
      },
      {
        question: "Volume of a cube with side 4cm?",
        options: ["48", "56", "64", "72"],
        answer: "64",
      },
      {
        question: "What is the perimeter of an equilateral triangle side 9?",
        options: ["18", "24", "27", "36"],
        answer: "27",
      },
    ],
  },
];

function encodeChallenge(gameId: string, score: number): string {
  const timestamp = Date.now();
  const raw = `MM-${gameId}-${score}-${timestamp}`;
  try {
    return btoa(raw);
  } catch {
    return raw;
  }
}

function decodeChallenge(
  code: string,
): { gameId: string; score: number; timestamp: number } | null {
  try {
    const decoded = atob(code.trim());
    const parts = decoded.split("-");
    if (parts.length < 4 || parts[0] !== "MM") return null;
    return {
      gameId: parts[1],
      score: Number.parseInt(parts[2], 10),
      timestamp: Number.parseInt(parts[3], 10),
    };
  } catch {
    return null;
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
      style={{
        background: copied
          ? "oklch(0.72 0.22 155 / 0.2)"
          : "oklch(0.78 0.2 195 / 0.15)",
        border: `1px solid ${copied ? "oklch(0.72 0.22 155 / 0.5)" : "oklch(0.78 0.2 195 / 0.4)"}`,
        color: copied ? "oklch(0.8 0.2 155)" : "oklch(0.85 0.18 195)",
      }}
      data-ocid="challenge.copy.button"
    >
      {copied ? "✓ Copied!" : "📋 Copy"}
    </button>
  );
}

export function ChallengeScreen({
  profile,
  onProfileUpdate,
  onBack,
}: ChallengeScreenProps) {
  const [mode, setMode] = useState<
    | "menu"
    | "create-select"
    | "create-playing"
    | "create-result"
    | "accept-input"
    | "accept-playing"
    | "accept-result"
  >("menu");
  const [selectedGame, setSelectedGame] = useState<
    (typeof CHALLENGE_GAMES)[0] | null
  >(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [challengeCode, setChallengeCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [inputError, setInputError] = useState("");
  const [opponentScore, setOpponentScore] = useState(0);

  const handleAnswerCreate = (opt: string) => {
    if (feedback || !selectedGame) return;
    setSelected(opt);
    const q = selectedGame.questions[questionIdx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setMyScore((s) => s + 1);

    setTimeout(() => {
      if (questionIdx + 1 >= selectedGame.questions.length) {
        // Generate code
        const newScore = isCorrect ? myScore + 1 : myScore;
        const code = encodeChallenge(selectedGame.id, newScore);
        setChallengeCode(code);
        // Award badge if not already
        if (!profile.badges.includes("challenge_accepted")) {
          const newBadges = [...profile.badges, "challenge_accepted"];
          onProfileUpdate({ ...profile, badges: newBadges });
        }
        setMode("create-result");
      } else {
        setQuestionIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 800);
  };

  const handleAcceptCode = () => {
    setInputError("");
    const decoded = decodeChallenge(inputCode);
    if (!decoded) {
      setInputError("Invalid challenge code. Please check and try again.");
      return;
    }
    const game = CHALLENGE_GAMES.find((g) => g.id === decoded.gameId);
    if (!game) {
      setInputError("Unknown game in challenge code.");
      return;
    }
    setSelectedGame(game);
    setOpponentScore(decoded.score);
    setQuestionIdx(0);
    setMyScore(0);
    setSelected(null);
    setFeedback(null);
    setMode("accept-playing");
  };

  const handleAnswerAccept = (opt: string) => {
    if (feedback || !selectedGame) return;
    setSelected(opt);
    const q = selectedGame.questions[questionIdx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setMyScore((s) => s + 1);

    setTimeout(() => {
      if (questionIdx + 1 >= selectedGame.questions.length) {
        setMode("accept-result");
      } else {
        setQuestionIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 800);
  };

  const resetAll = () => {
    setMode("menu");
    setSelectedGame(null);
    setQuestionIdx(0);
    setSelected(null);
    setFeedback(null);
    setMyScore(0);
    setChallengeCode("");
    setInputCode("");
    setInputError("");
    setOpponentScore(0);
  };

  const finalMyScore =
    mode === "accept-result" && feedback === "correct" ? myScore : myScore;
  const resultLabel =
    finalMyScore > opponentScore
      ? "🏆 You Win!"
      : finalMyScore < opponentScore
        ? "😅 You Lose!"
        : "🤝 It's a Tie!";

  const resultColor =
    finalMyScore > opponentScore
      ? "oklch(0.82 0.18 70)"
      : finalMyScore < opponentScore
        ? "oklch(0.7 0.22 20)"
        : "oklch(0.78 0.2 195)";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={mode === "menu" ? onBack : resetAll}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          data-ocid="challenge.back.button"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-glow-cyan">
            🤝 Challenge Mode
          </h1>
          <div className="text-muted-foreground text-xs">
            Challenge your friends!
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* ── MENU ── */}
          {mode === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              <div
                className="rounded-2xl p-5 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.7), oklch(0.08 0.02 265 / 0.8))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                }}
              >
                <div className="text-6xl mb-3">🤝</div>
                <div className="font-display text-xl font-black text-glow-cyan mb-2">
                  Friend Challenges
                </div>
                <p className="text-muted-foreground text-sm mb-5">
                  Play a game, share your score code,
                  <br />
                  and see if your friend can beat you!
                </p>

                <div className="flex flex-col gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setMode("create-select")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-3"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.2 195 / 0.2), oklch(0.7 0.22 280 / 0.2))",
                      border: "1px solid oklch(0.78 0.2 195 / 0.5)",
                      color: "oklch(0.88 0.15 195)",
                    }}
                    data-ocid="challenge.create.button"
                  >
                    <span className="text-xl">🎯</span>
                    <div className="text-left">
                      <div className="font-bold">Create Challenge</div>
                      <div className="text-xs opacity-70 font-normal">
                        Play a game & share your score
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setMode("accept-input")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-3"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.7 0.22 280 / 0.2), oklch(0.72 0.22 155 / 0.2))",
                      border: "1px solid oklch(0.7 0.22 280 / 0.5)",
                      color: "oklch(0.85 0.18 280)",
                    }}
                    data-ocid="challenge.accept.button"
                  >
                    <span className="text-xl">📩</span>
                    <div className="text-left">
                      <div className="font-bold">Accept Challenge</div>
                      <div className="text-xs opacity-70 font-normal">
                        Enter a friend's code & beat their score
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CREATE: SELECT GAME ── */}
          {mode === "create-select" && (
            <motion.div
              key="create-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <div className="font-display text-sm font-bold text-neon-cyan tracking-widest mb-2">
                SELECT A GAME TO CHALLENGE
              </div>
              {CHALLENGE_GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    setSelectedGame(game);
                    setQuestionIdx(0);
                    setMyScore(0);
                    setSelected(null);
                    setFeedback(null);
                    setMode("create-playing");
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl flex items-center gap-4 text-left"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.03 265 / 0.8), oklch(0.09 0.02 265 / 0.9))",
                    border: "1px solid oklch(0.35 0.06 270 / 0.4)",
                  }}
                  data-ocid={`challenge.game.button.${i + 1}`}
                >
                  <span className="text-3xl flex-shrink-0">{game.emoji}</span>
                  <div>
                    <div className="font-display font-bold text-sm text-foreground">
                      {game.label}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      5 questions · Beat your friend's score
                    </div>
                  </div>
                  <div className="ml-auto text-neon-cyan text-sm">→</div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ── CREATE: PLAYING ── */}
          {(mode === "create-playing" || mode === "accept-playing") &&
            selectedGame && (
              <motion.div
                key={`playing-${questionIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "oklch(0.78 0.2 195 / 0.15)",
                      border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                      color: "oklch(0.85 0.18 195)",
                    }}
                  >
                    {selectedGame.emoji}{" "}
                    {mode === "accept-playing"
                      ? "Beat the Challenge"
                      : "Create Challenge"}
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "oklch(0.72 0.22 155 / 0.15)",
                      border: "1px solid oklch(0.72 0.22 155 / 0.3)",
                      color: "oklch(0.72 0.22 155)",
                    }}
                  >
                    Q {questionIdx + 1}/5 · ✓ {myScore}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(questionIdx / 5) * 100}%`,
                      background:
                        "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                    }}
                  />
                </div>

                {/* Opponent score hint (accept mode) */}
                {mode === "accept-playing" && (
                  <div
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-center"
                    style={{
                      background: "oklch(0.14 0.04 70 / 0.5)",
                      border: "1px solid oklch(0.82 0.18 70 / 0.3)",
                      color: "oklch(0.88 0.15 70)",
                    }}
                  >
                    🎯 Target to beat: {opponentScore}/5
                  </div>
                )}

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
                      {selectedGame.questions[questionIdx].question}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Answers */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedGame.questions[questionIdx].options.map((opt, i) => {
                    const q = selectedGame.questions[questionIdx];
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
                        onClick={() =>
                          mode === "create-playing"
                            ? handleAnswerCreate(opt)
                            : handleAnswerAccept(opt)
                        }
                        disabled={!!feedback}
                        whileHover={!feedback ? { scale: 1.03 } : {}}
                        whileTap={!feedback ? { scale: 0.97 } : {}}
                        className={`py-4 px-3 rounded-xl font-display font-bold text-sm transition-all text-center ${extraClass}`}
                        style={btnStyle}
                        data-ocid={`challenge.answer.button.${i + 1}`}
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
                        : `❌ Wrong! Answer: ${selectedGame.questions[questionIdx].answer}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          {/* ── CREATE: RESULT ── */}
          {mode === "create-result" && (
            <motion.div
              key="create-result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4"
            >
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🎯</div>
                <div className="font-display text-2xl font-black text-glow-cyan mb-1">
                  Challenge Created!
                </div>
                <div className="text-muted-foreground text-sm">
                  Your score: {myScore}/5
                </div>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.7), oklch(0.08 0.02 265 / 0.8))",
                  border: "1px solid oklch(0.78 0.2 195 / 0.3)",
                }}
              >
                <div className="font-display text-xs font-bold text-neon-cyan tracking-widest mb-3">
                  YOUR CHALLENGE CODE
                </div>
                <div
                  className="rounded-xl p-4 font-mono text-xs break-all select-all mb-3"
                  style={{
                    background: "oklch(0.08 0.02 265 / 0.8)",
                    border: "1px solid oklch(0.3 0.05 270 / 0.5)",
                    color: "oklch(0.85 0.18 195)",
                  }}
                >
                  {challengeCode}
                </div>
                <div className="flex gap-2">
                  <CopyButton text={challengeCode} />
                  <div className="text-xs text-muted-foreground flex-1 flex items-center">
                    Share this code with a friend — they'll play the same game
                    and try to beat your {myScore}/5!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAll}
                className="w-full py-3 rounded-xl font-display font-bold text-sm"
                style={{
                  background: "oklch(0.13 0.03 265 / 0.8)",
                  border: "1px solid oklch(0.35 0.06 270 / 0.4)",
                  color: "oklch(0.75 0.08 265)",
                }}
                data-ocid="challenge.create_another.button"
              >
                Create Another Challenge
              </button>
            </motion.div>
          )}

          {/* ── ACCEPT: INPUT ── */}
          {mode === "accept-input" && (
            <motion.div
              key="accept-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 195 / 0.7), oklch(0.08 0.02 265 / 0.8))",
                  border: "1px solid oklch(0.7 0.22 280 / 0.3)",
                }}
              >
                <div className="text-4xl text-center mb-3">📩</div>
                <div className="font-display text-xl font-black text-glow-cyan text-center mb-2">
                  Accept Challenge
                </div>
                <p className="text-muted-foreground text-sm text-center mb-5">
                  Enter the challenge code your friend shared with you
                </p>

                <div className="flex flex-col gap-3">
                  <textarea
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setInputError("");
                    }}
                    placeholder="Paste challenge code here..."
                    className="w-full p-4 rounded-xl font-mono text-xs resize-none h-24 focus:outline-none transition-all"
                    style={{
                      background: "oklch(0.08 0.02 265 / 0.9)",
                      border: `1px solid ${inputError ? "oklch(0.6 0.2 20 / 0.5)" : "oklch(0.3 0.05 270 / 0.5)"}`,
                      color: "oklch(0.85 0.18 195)",
                    }}
                    data-ocid="challenge.code.textarea"
                  />

                  {inputError && (
                    <div
                      className="text-xs font-semibold px-3 py-2 rounded-lg"
                      style={{
                        background: "oklch(0.6 0.2 20 / 0.15)",
                        border: "1px solid oklch(0.6 0.2 20 / 0.4)",
                        color: "oklch(0.8 0.18 20)",
                      }}
                      data-ocid="challenge.code.error_state"
                    >
                      {inputError}
                    </div>
                  )}

                  <motion.button
                    type="button"
                    onClick={handleAcceptCode}
                    disabled={!inputCode.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-display font-black text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.7 0.22 280), oklch(0.78 0.2 195))",
                      color: "oklch(0.95 0.02 265)",
                    }}
                    data-ocid="challenge.start_accept.button"
                  >
                    ⚡ Accept & Play
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ACCEPT: RESULT ── */}
          {mode === "accept-result" && (
            <motion.div
              key="accept-result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 py-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.6 }}
                className="text-7xl"
              >
                {myScore > opponentScore
                  ? "🏆"
                  : myScore < opponentScore
                    ? "😅"
                    : "🤝"}
              </motion.div>

              <div>
                <div
                  className="font-display text-4xl font-black mb-2"
                  style={{ color: resultColor }}
                >
                  {resultLabel}
                </div>
                <div className="text-muted-foreground text-sm">
                  Your score: {myScore}/5 vs Their score: {opponentScore}/5
                </div>
              </div>

              {/* Score comparison */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between items-center mb-2 text-sm font-bold">
                  <span className="text-neon-cyan">You: {myScore}/5</span>
                  <span className="text-neon-purple">
                    Them: {opponentScore}/5
                  </span>
                </div>
                <div className="flex gap-1 h-8">
                  <div
                    className="rounded-l-full flex items-center justify-end pr-2 text-xs font-bold transition-all"
                    style={{
                      width: `${(myScore / 5) * 100}%`,
                      background:
                        "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.72 0.22 155))",
                      color: "oklch(0.08 0.02 265)",
                      minWidth: "2rem",
                    }}
                  >
                    {myScore}
                  </div>
                  <div
                    className="rounded-r-full flex items-center justify-start pl-2 text-xs font-bold transition-all"
                    style={{
                      width: `${(opponentScore / 5) * 100}%`,
                      background:
                        "linear-gradient(90deg, oklch(0.7 0.22 280), oklch(0.6 0.2 310))",
                      color: "oklch(0.95 0.02 265)",
                      minWidth: "2rem",
                    }}
                  >
                    {opponentScore}
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={resetAll}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full max-w-xs py-4 rounded-xl font-display font-bold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                  color: "oklch(0.08 0.02 265)",
                }}
                data-ocid="challenge.play_again.button"
              >
                Play Another Challenge
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
