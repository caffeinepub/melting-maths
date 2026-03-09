import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import {
  SHINCHEN_DAILY_CHALLENGES,
  SHINCHEN_GREETINGS,
  SHINCHEN_HINTS,
  getShinchenResponse,
} from "../data/shinchen";
import { SHINCHEN_QUIZ_QUESTIONS } from "../data/shinchenQuiz";
import {
  isSpeechSynthesisAvailable,
  isVoiceEnabled,
  shinchanSpeak,
  shinchanStop,
  toggleShinchanVoice,
} from "../utils/shinchanVoice";
import { searchWikipediaMath } from "../utils/wikipediaMath";

interface ShinchenScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

interface ChatMessage {
  id: number;
  role: "user" | "shinchen";
  text: string;
  timestamp: Date;
  isWiki?: boolean;
  wikiUrl?: string;
  wikiTitle?: string;
}

type AvatarState = "thinking" | "happy" | "celebrating";
type ShinchenMood = "calm" | "excited" | "energized";

function getShinchenMood(streakDays: number): ShinchenMood {
  if (streakDays >= 7) return "energized";
  if (streakDays >= 3) return "excited";
  return "calm";
}

function getMoodEmoji(mood: ShinchenMood): string {
  if (mood === "energized") return "🤩";
  if (mood === "excited") return "😄";
  return "😐";
}

function getMoodGlow(mood: ShinchenMood): string {
  if (mood === "energized")
    return "0 0 25px oklch(0.7 0.22 280 / 0.9), 0 0 50px oklch(0.78 0.2 195 / 0.6)";
  if (mood === "excited")
    return "0 0 20px oklch(0.7 0.22 280 / 0.6), 0 0 35px oklch(0.78 0.2 195 / 0.3)";
  return "0 0 12px oklch(0.7 0.22 280 / 0.3)";
}

const WEEKLY_TIPS = [
  "BODMAS/PEMDAS: Always solve Brackets first, then Orders (powers), then Division/Multiplication left to right, then Addition/Subtraction.",
  "Fractions tip: To add fractions, find a common denominator first. 1/3 + 1/4 = 4/12 + 3/12 = 7/12",
  "Algebra tip: Whatever you do to one side of an equation, do to the other. Keep it balanced!",
  "Geometry tip: The angles in any triangle always add up to 180 degrees.",
  "Multiplication trick: To multiply by 9, multiply by 10 then subtract the number. 9×7 = 70-7 = 63",
  "Statistics tip: Mean = sum of all values ÷ count. Median = middle value when sorted.",
  "Calculus tip: A derivative tells you the rate of change (slope) at any point on a curve.",
];

function getWeeklyTip(): string {
  const weekIdx =
    Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % WEEKLY_TIPS.length;
  return WEEKLY_TIPS[weekIdx];
}

function useTypedText(fullText: string, active: boolean, speedMs = 15): string {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) {
      setDisplayed(fullText);
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, speedMs);
    return () => clearInterval(interval);
  }, [fullText, active, speedMs]);
  return displayed;
}

const QUICK_PROMPTS = [
  { label: "💡 Hint", message: "Give me a hint" },
  { label: "📚 Study tip", message: "Give me a study tip" },
  { label: "🏆 Daily challenge", message: "What's today's challenge?" },
  { label: "📊 My weak topics", message: "What are my weak topics?" },
  { label: "📖 What is Pi?", message: "What is Pi?" },
  { label: "🔍 Pythagorean theorem", message: "Pythagorean theorem" },
];

let msgId = 0;
function makeMsg(role: ChatMessage["role"], text: string): ChatMessage {
  return { id: msgId++, role, text, timestamp: new Date() };
}

function getAvatarState(text: string): AvatarState {
  const lower = text.toLowerCase();
  if (
    lower.includes("boom") ||
    lower.includes("yes!") ||
    lower.includes("great") ||
    lower.includes("🎉") ||
    lower.includes("amazing")
  ) {
    return "celebrating";
  }
  if (
    lower.includes("✓") ||
    lower.includes("correct") ||
    lower.includes("perfect") ||
    lower.includes("⭐") ||
    lower.includes("awesome")
  ) {
    return "happy";
  }
  return "thinking";
}

function ShinchenAvatar({
  state,
  mood,
}: { state: AvatarState; mood?: ShinchenMood }) {
  const currentMood = mood ?? "calm";
  let emoji: string;
  if (state === "celebrating") {
    emoji = "🎉";
  } else if (state === "happy") {
    emoji =
      currentMood === "energized"
        ? "🤩"
        : currentMood === "excited"
          ? "😄"
          : "😊";
  } else {
    emoji = getMoodEmoji(currentMood);
  }

  const animClass =
    state === "thinking"
      ? "shinchen-thinking"
      : state === "happy"
        ? "shinchen-happy"
        : "shinchen-celebrating";

  const glowIntensity =
    state === "celebrating"
      ? getMoodGlow("energized")
      : getMoodGlow(currentMood);

  return (
    <div className="relative">
      <motion.div
        className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
        animate={
          currentMood === "energized"
            ? {
                scale: [1, 1.04, 1],
                boxShadow: [
                  glowIntensity,
                  glowIntensity.replace("0.9", "0.5"),
                  glowIntensity,
                ],
              }
            : {}
        }
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(135deg, oklch(0.2 0.06 280), oklch(0.15 0.04 265))",
          border: `2px solid oklch(0.7 0.22 280 / ${state === "celebrating" ? "1" : currentMood === "energized" ? "0.9" : "0.6"})`,
          boxShadow: glowIntensity,
        }}
      >
        <span className={animClass}>{emoji}</span>
      </motion.div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
      {/* Mood indicator */}
      {currentMood !== "calm" && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
          style={{
            background:
              currentMood === "energized"
                ? "oklch(0.82 0.18 70)"
                : "oklch(0.78 0.2 195)",
            fontSize: "0.55rem",
          }}
        >
          {currentMood === "energized" ? "⚡" : "✨"}
        </div>
      )}
    </div>
  );
}

function DrillModes({ profile }: { profile: PlayerProfile }) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [drillQ, setDrillQ] = useState<(typeof SHINCHEN_QUIZ_QUESTIONS)[0][]>(
    [],
  );
  const [drillIdx, setDrillIdx] = useState(0);
  const [drillCorrect, setDrillCorrect] = useState(0);
  const [drillDone, setDrillDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Speak drill question when it changes
  useEffect(() => {
    if (activeTopic && !drillDone && drillQ[drillIdx]) {
      shinchanSpeak(drillQ[drillIdx].question);
    }
  }, [drillIdx, activeTopic, drillDone, drillQ]);

  const startDrill = (topic: string) => {
    const questions = SHINCHEN_QUIZ_QUESTIONS.filter(
      (q) => q.topic === topic || topic === "all",
    );
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 5);
    setActiveTopic(topic);
    setDrillQ(shuffled);
    setDrillIdx(0);
    setDrillCorrect(0);
    setDrillDone(false);
    setSelected(null);
    setFeedback(null);
    shinchanSpeak(`Okay! Let's drill ${topic} together! Here we go!`);
  };

  const handleDrillAnswer = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
    const q = drillQ[drillIdx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setDrillCorrect((c) => c + 1);
      shinchanSpeak("Yes yes yes! You got it!");
    } else {
      shinchanSpeak(`Hmm, the answer is ${q.answer}. Let's keep going!`);
    }

    setTimeout(() => {
      if (drillIdx + 1 >= drillQ.length) {
        setDrillDone(true);
        // Track drills done
        try {
          const prev = Number.parseInt(
            localStorage.getItem("mm_drills_done") || "0",
            10,
          );
          localStorage.setItem("mm_drills_done", String(prev + 1));
        } catch {
          /* noop */
        }
      } else {
        setDrillIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 800);
  };

  if (!activeTopic) {
    if (profile.weakTopics.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="text-4xl">💪</div>
          <p className="text-muted-foreground text-sm max-w-xs">
            No weak topics yet — keep playing games to unlock drill mode!
          </p>
          <NeonButton
            variant="cyan"
            size="sm"
            onClick={() => startDrill("all")}
          >
            Try a General Drill
          </NeonButton>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 py-2">
        <p className="text-muted-foreground text-sm">
          Select a topic to practice:
        </p>
        {profile.weakTopics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => startDrill(topic)}
            className="w-full p-4 rounded-2xl flex items-center justify-between card-neon card-neon-hover"
          >
            <div>
              <div className="font-display font-bold text-sm capitalize text-foreground">
                {topic}
              </div>
              <div className="text-muted-foreground text-xs">
                5 targeted questions
              </div>
            </div>
            <span className="text-neon-cyan text-xs font-semibold">
              Drill →
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (drillDone) {
    const pct = Math.round((drillCorrect / 5) * 100);
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-4 text-center"
      >
        <div className="text-5xl">{pct >= 80 ? "💪" : "📚"}</div>
        <div>
          <div className="font-display text-3xl font-black text-neon-cyan">
            {pct}%
          </div>
          <div className="text-muted-foreground text-sm mt-1">
            Drill Complete — {drillCorrect}/5 correct
          </div>
        </div>
        <p className="text-foreground/80 text-sm">
          {pct >= 80
            ? "Excellent drilling! You're getting stronger! 💪"
            : "Keep practicing! Every drill builds your skills! 📚"}
        </p>
        <div className="flex gap-3">
          <NeonButton
            variant="cyan"
            size="sm"
            onClick={() => startDrill(activeTopic)}
          >
            Drill Again
          </NeonButton>
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={() => setActiveTopic(null)}
          >
            ← Topics
          </NeonButton>
        </div>
      </motion.div>
    );
  }

  const current = drillQ[drillIdx];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="capitalize text-neon-purple font-semibold">
          {activeTopic} drill
        </span>
        <span>{drillIdx + 1}/5</span>
      </div>
      <Progress value={(drillIdx / 5) * 100} className="h-1" />

      <AnimatePresence mode="wait">
        <motion.div
          key={drillIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card-neon rounded-2xl p-4 text-sm font-semibold text-foreground leading-relaxed"
        >
          {current.question}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-2">
        {current.options.map((opt) => {
          let className =
            "w-full py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all ";
          if (!feedback) {
            className +=
              "bg-secondary border border-border/50 hover:border-neon-purple/60 text-foreground";
          } else if (opt === current.answer) {
            className +=
              "bg-green-500/20 border border-green-400 text-green-300";
          } else if (opt === selected && opt !== current.answer) {
            className += "bg-red-500/20 border border-red-400 text-red-300";
          } else {
            className +=
              "bg-secondary border border-border/50 text-muted-foreground opacity-50";
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleDrillAnswer(opt)}
              disabled={!!feedback}
              className={className}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DailyQuiz({ profile: _profile }: { profile: PlayerProfile }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions] = useState(() =>
    SHINCHEN_QUIZ_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 5),
  );
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Speak the current question when it changes
  useEffect(() => {
    if (quizStarted && !done && questions[idx]) {
      shinchanSpeak(`Question ${idx + 1}: ${questions[idx].question}`);
    }
  }, [idx, quizStarted, done, questions]);

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
    const q = questions[idx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrect((c) => c + 1);
      shinchanSpeak("Yeah! That's correct! Awesome!");
    } else {
      shinchanSpeak(
        `Oops! The correct answer was ${q.answer}. Don't worry, try the next one!`,
      );
    }

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setDone(true);
      } else {
        setIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 700);
  };

  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="text-5xl animate-bounce-in">🧪</div>
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">
            Daily Quiz
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            5 questions • +10 XP each correct answer
          </p>
        </div>
        <NeonButton
          variant="cyan"
          size="md"
          onClick={() => setQuizStarted(true)}
        >
          Start Quiz!
        </NeonButton>
      </div>
    );
  }

  if (done) {
    const xpEarned = correct * 10;
    const pct = Math.round((correct / 5) * 100);
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-4 text-center"
      >
        <div className="text-5xl">
          {correct === 5 ? "🏆" : correct >= 3 ? "⭐" : "📚"}
        </div>
        <div>
          <div className="font-display text-3xl font-black text-neon-cyan">
            {pct}%
          </div>
          <div className="text-sm text-muted-foreground">
            {correct}/5 correct
          </div>
        </div>
        <div className="card-neon rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <div className="font-bold text-neon-cyan">
              +{xpEarned} XP earned!
            </div>
            {correct === 5 && (
              <div className="text-xs text-amber-400">
                🧪 Quiz Master badge unlocked!
              </div>
            )}
          </div>
        </div>
        <NeonButton
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuizStarted(false);
            setIdx(0);
            setCorrect(0);
            setDone(false);
            setSelected(null);
            setFeedback(null);
          }}
        >
          Try Again
        </NeonButton>
      </motion.div>
    );
  }

  const q = questions[idx];

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-neon-cyan font-semibold">
          Question {idx + 1} of 5
        </span>
        <span className="text-green-400">✓ {correct}</span>
      </div>
      <Progress value={(idx / 5) * 100} className="h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="card-neon rounded-2xl p-4"
        >
          <span className="text-xs text-neon-purple font-semibold uppercase">
            {q.topic}
          </span>
          <p className="text-foreground font-semibold text-sm mt-2 leading-relaxed">
            {q.question}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt) => {
          let className =
            "w-full py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all ";
          if (!feedback) {
            className +=
              "bg-secondary border border-border/50 hover:border-neon-cyan/60 text-foreground";
          } else if (opt === q.answer) {
            className +=
              "bg-green-500/20 border border-green-400 text-green-300";
          } else if (opt === selected && opt !== q.answer) {
            className += "bg-red-500/20 border border-red-400 text-red-300";
          } else {
            className +=
              "bg-secondary border border-border/50 text-muted-foreground opacity-50";
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={className}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypedChatMessage({
  msg,
  useTyping,
}: { msg: ChatMessage; useTyping: boolean }) {
  const displayedText = useTypedText(msg.text, useTyping, 15);
  const isTypingComplete = displayedText === msg.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
    >
      {msg.role === "shinchen" && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.15 0.04 280), oklch(0.1 0.02 265))",
            border: "1px solid oklch(0.7 0.22 280 / 0.4)",
          }}
        >
          {msg.isWiki ? "📖" : "🌟"}
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "shinchen" ? "rounded-tl-sm text-foreground" : "rounded-tr-sm text-foreground"}`}
        style={
          msg.role === "user"
            ? {
                background:
                  "linear-gradient(135deg, oklch(0.2 0.06 195), oklch(0.15 0.04 265))",
                border: "1px solid oklch(0.78 0.2 195 / 0.4)",
              }
            : msg.isWiki
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.04 60 / 0.5), oklch(0.08 0.02 55 / 0.8))",
                  border: "1px solid oklch(0.7 0.15 60 / 0.45)",
                  boxShadow: "0 0 12px oklch(0.7 0.15 60 / 0.12)",
                }
              : {
                  background: "oklch(0.12 0.02 265 / 0.6)",
                  border: "1px solid oklch(0.2 0.03 270 / 0.5)",
                }
        }
      >
        <span style={{ whiteSpace: "pre-wrap" }}>{displayedText}</span>
        {useTyping && !isTypingComplete && (
          <span className="inline-block w-1 h-3 bg-neon-purple ml-0.5 animate-pulse" />
        )}
        {/* Wikipedia source badge — shown only after typing completes */}
        {msg.isWiki && msg.wikiUrl && isTypingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-3 pt-2.5 flex items-center gap-2"
            style={{
              borderTop: "1px solid oklch(0.7 0.15 60 / 0.25)",
            }}
          >
            <span
              className="text-xs font-bold tracking-wide px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.7 0.15 60 / 0.2)",
                color: "oklch(0.82 0.18 60)",
                border: "1px solid oklch(0.7 0.15 60 / 0.35)",
              }}
            >
              📖 Wikipedia
            </span>
            <a
              href={msg.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs font-semibold transition-colors"
              style={{ color: "oklch(0.78 0.16 60)" }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.color =
                  "oklch(0.9 0.2 60)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.color =
                  "oklch(0.78 0.16 60)";
              }}
            >
              Read more →
            </a>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Voice Narration ──────────────────────────────────────────────
// All voice logic is handled by ../utils/shinchanVoice

function WeeklyTipTab() {
  const tip = getWeeklyTip();
  const weekIdx =
    Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % WEEKLY_TIPS.length;
  const topics = [
    "Order of Operations",
    "Fractions",
    "Algebra",
    "Geometry",
    "Multiplication",
    "Statistics",
    "Calculus",
  ];
  const topicIcons = ["📊", "🍕", "🔡", "📐", "✖️", "📈", "📉"];

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="text-3xl">💡</div>
        <div>
          <div className="font-display font-bold text-sm text-foreground">
            This Week's Tip
          </div>
          <div className="text-muted-foreground text-xs">
            Changes every Monday · Tip {weekIdx + 1}/{WEEKLY_TIPS.length}
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.06 280 / 0.7), oklch(0.08 0.03 265 / 0.9))",
          border: "1px solid oklch(0.7 0.22 280 / 0.35)",
          boxShadow: "0 0 20px oklch(0.7 0.22 280 / 0.1)",
        }}
      >
        <div
          className="font-display text-xs font-bold tracking-widest mb-3 flex items-center gap-2"
          style={{ color: "oklch(0.7 0.22 280)" }}
        >
          <span>{topicIcons[weekIdx]}</span>
          {topics[weekIdx].toUpperCase()}
        </div>
        <p className="text-foreground text-sm leading-relaxed font-semibold">
          {tip}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-display text-xs font-bold text-muted-foreground tracking-widest">
          ALL TOPICS
        </div>
        {topics.map((topic, i) => (
          <div
            key={topic}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background:
                i === weekIdx
                  ? "oklch(0.7 0.22 280 / 0.12)"
                  : "oklch(0.1 0.02 265 / 0.4)",
              border:
                i === weekIdx
                  ? "1px solid oklch(0.7 0.22 280 / 0.4)"
                  : "1px solid oklch(0.2 0.03 270 / 0.3)",
            }}
          >
            <span className="text-lg">{topicIcons[i]}</span>
            <span
              className="text-sm font-semibold"
              style={{
                color:
                  i === weekIdx ? "oklch(0.8 0.18 280)" : "oklch(0.6 0.05 270)",
              }}
            >
              {topic}
            </span>
            {i === weekIdx && (
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.7 0.22 280 / 0.2)",
                  color: "oklch(0.8 0.18 280)",
                }}
              >
                This week ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShinchenScreen({ profile, onBack }: ShinchenScreenProps) {
  const mood = getShinchenMood(Number(profile.streakDays));
  const greeting =
    SHINCHEN_GREETINGS[Math.floor(Math.random() * SHINCHEN_GREETINGS.length)];
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeMsg(
      "shinchen",
      `Hey ${profile.name}! ${getMoodEmoji(mood)} ${greeting}`,
    ),
    makeMsg(
      "shinchen",
      `You're in Grade ${profile.grade} with ${Number(profile.xp)} XP. Looking great! How can I help you today? 😊`,
    ),
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("thinking");
  const [lastMsgId, setLastMsgId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice narration state (persisted in localStorage via shinchanVoice util)
  const [voiceEnabled, setVoiceEnabledState] = useState(isVoiceEnabled);
  const speechAvailable = isSpeechSynthesisAvailable();
  const voiceEnabledRef = useRef(voiceEnabled);

  const toggleVoice = useCallback(() => {
    const next = toggleShinchanVoice();
    voiceEnabledRef.current = next;
    setVoiceEnabledState(next);
    toast.success(next ? "🔊 Shinchen voice ON" : "🔇 Shinchen voice OFF");
  }, []);

  // Speak greeting on mount if voice is enabled (profile.name is stable at mount)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    if (voiceEnabledRef.current) {
      const greetText = `Hey ${profile.name}! I'm Shinchen! Let's melt some maths together!`;
      shinchanSpeak(greetText);
    }
    return () => shinchanStop();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is stable
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages((prev) => [...prev, makeMsg("user", text.trim())]);
    setInput("");
    setIsTyping(true);
    setAvatarState("thinking");

    const lower = text.toLowerCase();

    (async () => {
      const delay = 600 + Math.random() * 400;
      await new Promise<void>((r) => setTimeout(r, delay));

      let response: string;
      let wikiUrl: string | undefined;
      let wikiTitle: string | undefined;
      let isWiki = false;

      if (lower.includes("daily challenge") || lower.includes("challenge")) {
        response =
          SHINCHEN_DAILY_CHALLENGES[
            new Date().getDate() % SHINCHEN_DAILY_CHALLENGES.length
          ];
        if (voiceEnabledRef.current) shinchanSpeak(response);
      } else if (lower.includes("weak topic")) {
        if (profile.weakTopics.length > 0) {
          response = `I've noticed you might want to practice: ${profile.weakTopics.join(", ")}. Try the Drill Mode tab! ${SHINCHEN_HINTS[profile.weakTopics[0]]?.[0] ?? "Keep practicing!"}`;
        } else {
          response =
            "You're doing great across all topics! No weak spots detected yet. Keep playing! 🌟";
        }
        if (voiceEnabledRef.current) shinchanSpeak(response);
      } else if (lower.includes("hint") || lower.includes("study tip")) {
        const gradeToTopic: Record<number, string> = {
          1: "addition",
          2: "addition",
          3: "addition",
          4: "fractions",
          5: "fractions",
          6: "algebra",
          7: "algebra",
          8: "algebra",
          9: "quadratics",
          10: "quadratics",
          11: "calculus",
          12: "calculus",
        };
        const topic = gradeToTopic[profile.grade] ?? "algebra";
        const hints = SHINCHEN_HINTS[topic];
        response =
          hints?.[Math.floor(Math.random() * hints.length)] ??
          getShinchenResponse(text, profile.weakTopics);
        if (voiceEnabledRef.current) shinchanSpeak(response);
      } else {
        // Try Wikipedia for custom questions
        const wikiResult = await searchWikipediaMath(text);
        if (wikiResult) {
          response = `📖 Here's what I found!\n\n${wikiResult.summary}`;
          wikiUrl = wikiResult.url;
          wikiTitle = wikiResult.title;
          isWiki = true;
          // Speak just the summary (skip emoji prefix)
          if (voiceEnabledRef.current) shinchanSpeak(wikiResult.summary);
        } else {
          response = getShinchenResponse(text, profile.weakTopics);
          if (voiceEnabledRef.current) shinchanSpeak(response);
        }
      }

      const newMsg: ChatMessage = {
        ...makeMsg("shinchen", response),
        isWiki,
        wikiUrl,
        wikiTitle,
      };
      setMessages((prev) => [...prev, newMsg]);
      setLastMsgId(newMsg.id);
      setIsTyping(false);
      setAvatarState(getAvatarState(response));
      setTimeout(() => setAvatarState("thinking"), 3000);
    })();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-3 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm"
          data-ocid="shinchen.back.button"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 flex-1">
          <ShinchenAvatar state={avatarState} mood={mood} />
          <div>
            <div className="font-display font-bold text-base text-glow-purple">
              SHINCHEN
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-1">
              Your Math AI Buddy •{" "}
              <span
                style={{
                  color:
                    mood === "energized"
                      ? "oklch(0.82 0.18 70)"
                      : mood === "excited"
                        ? "oklch(0.78 0.2 195)"
                        : "oklch(0.72 0.22 155)",
                }}
              >
                {mood === "energized"
                  ? "⚡ Super Energized"
                  : mood === "excited"
                    ? "✨ Excited"
                    : "😐 Calm"}
              </span>
            </div>
          </div>
        </div>

        {/* Voice toggle (only shown if speech synthesis is available) */}
        {speechAvailable && (
          <button
            type="button"
            onClick={toggleVoice}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110 flex-shrink-0"
            style={
              voiceEnabled
                ? {
                    background: "oklch(0.2 0.06 280 / 0.8)",
                    border: "1px solid oklch(0.7 0.22 280 / 0.7)",
                    color: "oklch(0.85 0.18 280)",
                    boxShadow: "0 0 10px oklch(0.7 0.22 280 / 0.35)",
                  }
                : {
                    background: "oklch(0.12 0.02 265)",
                    border: "1px solid oklch(0.3 0.04 270 / 0.5)",
                    color: "oklch(0.55 0.04 270)",
                  }
            }
            aria-label={voiceEnabled ? "Turn off voice" : "Turn on voice"}
            title={
              voiceEnabled
                ? "Voice ON – click to mute"
                : "Voice OFF – click to enable"
            }
            data-ocid="shinchen.voice.toggle"
          >
            {voiceEnabled ? "🔊" : "🔇"}
          </button>
        )}
      </header>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mb-2 bg-secondary border border-border/50">
          <TabsTrigger
            value="chat"
            className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan text-xs font-bold"
            data-ocid="shinchen.chat.tab"
          >
            💬 Chat
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="flex-1 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-xs font-bold"
            data-ocid="shinchen.quiz.tab"
          >
            🧪 Quiz
          </TabsTrigger>
          <TabsTrigger
            value="drill"
            className="flex-1 data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue text-xs font-bold"
            data-ocid="shinchen.drill.tab"
          >
            💪 Drill
          </TabsTrigger>
          <TabsTrigger
            value="tip"
            className="flex-1 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-xs font-bold"
            data-ocid="shinchen.tip.tab"
          >
            💡 Tip
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="chat"
          className="flex-1 flex flex-col mt-0 data-[state=active]:flex data-[state=inactive]:hidden"
        >
          {/* Quick prompts */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => sendMessage(qp.message)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary border border-border hover:border-neon-purple/60 text-muted-foreground hover:text-neon-purple transition-all"
              >
                {qp.label}
              </button>
            ))}
          </div>

          <div
            ref={scrollRef}
            className="flex-1 px-4 pb-4 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isLatestShinchen =
                    msg.role === "shinchen" && msg.id === lastMsgId;
                  return (
                    <TypedChatMessage
                      key={msg.id}
                      msg={msg}
                      useTyping={isLatestShinchen}
                    />
                  );
                })}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 items-center"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.15 0.04 280), oklch(0.1 0.02 265))",
                      border: "1px solid oklch(0.7 0.22 280 / 0.4)",
                    }}
                  >
                    🌟
                  </div>
                  <div className="bg-secondary border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-neon-purple"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="px-4 pb-8 pt-2 border-t border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && input.trim() && sendMessage(input)
                }
                placeholder="Ask Shinchen anything..."
                className="flex-1 bg-secondary border-border focus:border-neon-purple text-base h-12 rounded-xl"
                disabled={isTyping}
              />
              <NeonButton
                variant="purple"
                size="md"
                onClick={() => input.trim() && sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="flex-shrink-0"
              >
                Send
              </NeonButton>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="quiz"
          className="flex-1 px-4 pb-8 mt-0 overflow-y-auto"
        >
          <DailyQuiz profile={profile} />
        </TabsContent>

        <TabsContent
          value="drill"
          className="flex-1 px-4 pb-8 mt-0 overflow-y-auto"
        >
          <DrillModes profile={profile} />
        </TabsContent>

        <TabsContent
          value="tip"
          className="flex-1 px-4 pb-8 mt-0 overflow-y-auto"
        >
          <WeeklyTipTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
