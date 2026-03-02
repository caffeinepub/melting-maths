import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import {
  SHINCHEN_DAILY_CHALLENGES,
  SHINCHEN_GREETINGS,
  SHINCHEN_HINTS,
  getShinchenResponse,
} from "../data/shinchen";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is a stable ref
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg = makeMsg("user", text.trim());
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      let response: string;

      // Special commands
      const lower = text.toLowerCase();
      if (
        lower.includes("daily challenge") ||
        lower.includes("today's challenge") ||
        lower.includes("challenge")
      ) {
        response =
          SHINCHEN_DAILY_CHALLENGES[
            new Date().getDate() % SHINCHEN_DAILY_CHALLENGES.length
          ];
      } else if (
        lower.includes("weak topic") ||
        lower.includes("weak topics")
      ) {
        if (profile.weakTopics.length > 0) {
          response = `I've noticed you might want to practice: ${profile.weakTopics.join(", ")}. Here's a tip for ${profile.weakTopics[0]}: ${SHINCHEN_HINTS[profile.weakTopics[0]]?.[0] ?? "Keep practicing!"}`;
        } else {
          response =
            "You're doing great across all topics! No weak spots detected yet. Keep playing to track your progress! 🌟";
        }
      } else if (lower.includes("hint") || lower.includes("study tip")) {
        // Give topic-relevant hint based on grade
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
    }, delay);
  };

  const handleSubmit = () => {
    if (input.trim()) sendMessage(input);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.06 280), oklch(0.15 0.04 265))",
                border: "2px solid oklch(0.7 0.22 280 / 0.6)",
                boxShadow: "0 0 15px oklch(0.7 0.22 280 / 0.4)",
              }}
            >
              🌟
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
          </div>
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

      {/* Quick prompts */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            type="button"
            onClick={() => sendMessage(qp.message)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold
              bg-secondary border border-border hover:border-neon-purple/60
              text-muted-foreground hover:text-neon-purple transition-all"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 px-4 pb-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 240px)" }}
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
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${
                      msg.role === "shinchen"
                        ? "rounded-tl-sm bg-secondary border border-border/50 text-foreground"
                        : "rounded-tr-sm text-foreground"
                    }
                  `}
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

      {/* Input */}
      <div className="px-4 pb-8 pt-2 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask Shinchen anything..."
            className="flex-1 bg-secondary border-border focus:border-neon-purple text-base h-12 rounded-xl"
            disabled={isTyping}
          />
          <NeonButton
            variant="purple"
            size="md"
            onClick={handleSubmit}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0"
          >
            Send
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
