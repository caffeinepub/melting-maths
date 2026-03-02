import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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

interface ShinchenScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

interface ChatMessage {
  id: number;
  role: "user" | "shinchen";
  text: string;
  timestamp: Date;
}

type AvatarState = "thinking" | "happy" | "celebrating";

const QUICK_PROMPTS = [
  { label: "💡 Hint", message: "Give me a hint" },
  { label: "📚 Study tip", message: "Give me a study tip" },
  { label: "🏆 Daily challenge", message: "What's today's challenge?" },
  { label: "📊 My weak topics", message: "What are my weak topics?" },
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

function ShinchenAvatar({ state }: { state: AvatarState }) {
  const emoji = state === "thinking" ? "🤔" : state === "happy" ? "😊" : "🎉";
  const animClass =
    state === "thinking"
      ? "shinchen-thinking"
      : state === "happy"
        ? "shinchen-happy"
        : "shinchen-celebrating";

  return (
    <div className="relative">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.2 0.06 280), oklch(0.15 0.04 265))",
          border: `2px solid oklch(0.7 0.22 280 / ${state === "celebrating" ? "1" : "0.6"})`,
          boxShadow:
            state === "celebrating"
              ? "0 0 25px oklch(0.7 0.22 280 / 0.8), 0 0 50px oklch(0.78 0.2 195 / 0.4)"
              : "0 0 15px oklch(0.7 0.22 280 / 0.4)",
        }}
      >
        <span className={animClass}>{emoji}</span>
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
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
  };

  const handleDrillAnswer = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
    const q = drillQ[drillIdx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setDrillCorrect((c) => c + 1);

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

  const handleAnswer = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
    const q = questions[idx];
    const isCorrect = opt === q.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setCorrect((c) => c + 1);

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

export function ShinchenScreen({ profile, onBack }: ShinchenScreenProps) {
  const greeting =
    SHINCHEN_GREETINGS[Math.floor(Math.random() * SHINCHEN_GREETINGS.length)];
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeMsg("shinchen", `Hey ${profile.name}! 👋 ${greeting}`),
    makeMsg(
      "shinchen",
      `You're in Grade ${profile.grade} with ${Number(profile.xp)} XP. Looking great! How can I help you today? 😊`,
    ),
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("thinking");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      let response: string;
      const lower = text.toLowerCase();

      if (lower.includes("daily challenge") || lower.includes("challenge")) {
        response =
          SHINCHEN_DAILY_CHALLENGES[
            new Date().getDate() % SHINCHEN_DAILY_CHALLENGES.length
          ];
      } else if (lower.includes("weak topic")) {
        if (profile.weakTopics.length > 0) {
          response = `I've noticed you might want to practice: ${profile.weakTopics.join(", ")}. Try the Drill Mode tab! ${SHINCHEN_HINTS[profile.weakTopics[0]]?.[0] ?? "Keep practicing!"}`;
        } else {
          response =
            "You're doing great across all topics! No weak spots detected yet. Keep playing! 🌟";
        }
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
      } else {
        response = getShinchenResponse(text, profile.weakTopics);
      }

      setMessages((prev) => [...prev, makeMsg("shinchen", response)]);
      setIsTyping(false);
      setAvatarState(getAvatarState(response));
      setTimeout(() => setAvatarState("thinking"), 3000);
    }, delay);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-3 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 flex-1">
          <ShinchenAvatar state={avatarState} />
          <div>
            <div className="font-display font-bold text-base text-glow-purple">
              SHINCHEN
            </div>
            <div className="text-muted-foreground text-xs">
              Your Math AI Buddy • Online
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mb-2 bg-secondary border border-border/50">
          <TabsTrigger
            value="chat"
            className="flex-1 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan text-xs font-bold"
          >
            💬 Chat
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="flex-1 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-xs font-bold"
          >
            🧪 Daily Quiz
          </TabsTrigger>
          <TabsTrigger
            value="drill"
            className="flex-1 data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue text-xs font-bold"
          >
            💪 Drill
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
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
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
                        🌟
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "shinchen" ? "rounded-tl-sm bg-secondary border border-border/50 text-foreground" : "rounded-tr-sm text-foreground"}`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, oklch(0.2 0.06 195), oklch(0.15 0.04 265))",
                              border: "1px solid oklch(0.78 0.2 195 / 0.4)",
                            }
                          : {}
                      }
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
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
      </Tabs>
    </div>
  );
}
