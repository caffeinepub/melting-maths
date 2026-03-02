import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../components/NeonButton";

interface OnboardingScreenProps {
  onComplete: (name: string, grade: number) => void;
}

type Step = "shinchen-intro" | "intro" | "form";

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>("shinchen-intro");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [nameError, setNameError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Please tell me your name!");
      return;
    }
    if (!grade) {
      return;
    }
    setNameError("");
    onComplete(name.trim(), Number.parseInt(grade));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Atmospheric mesh background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 20%, oklch(0.18 0.06 195 / 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, oklch(0.15 0.05 280 / 0.25) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 70%, oklch(0.12 0.04 255 / 0.2) 0%, transparent 50%)
          `,
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.9 0.05 265) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <AnimatePresence mode="wait">
        {step === "shinchen-intro" ? (
          <motion.div
            key="shinchen-intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-full relative"
          >
            {/* Animated Shinchen character */}
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 14,
              }}
            >
              {/* Outer pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.7 0.22 280 / 0.4), transparent 70%)",
                }}
              />
              {/* Second ring */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.2, 0, 0.2] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.78 0.2 195 / 0.3), transparent 70%)",
                }}
              />
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="text-8xl relative z-10 drop-shadow-[0_0_30px_oklch(0.7_0.22_280/0.6)]"
              >
                🌟
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1
                className="font-display font-black gradient-text-game leading-tight"
                style={{
                  fontSize: "clamp(2rem, 10vw, 2.8rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Meet Shinchen!
              </h1>
              <p className="text-foreground/70 text-sm mt-2 leading-relaxed">
                Your personal Math AI buddy who'll guide you through every
                challenge!
              </p>
            </motion.div>

            {/* Feature bullets */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full rounded-2xl p-4 flex flex-col gap-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.11 0.03 280 / 0.85), oklch(0.08 0.02 265 / 0.9))",
                border: "1px solid oklch(0.7 0.22 280 / 0.35)",
                boxShadow: "0 0 30px oklch(0.7 0.22 280 / 0.12)",
              }}
            >
              {[
                { icon: "💡", text: "Hints & step-by-step explanations" },
                { icon: "🏆", text: "Daily challenges to keep you sharp" },
                { icon: "🎯", text: "Personalized tips for your weak topics" },
              ].map((feat, i) => (
                <motion.div
                  key={feat.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl flex-shrink-0">{feat.icon}</span>
                  <span className="text-foreground/85 text-sm">
                    {feat.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full"
            >
              <NeonButton
                variant="purple"
                size="lg"
                fullWidth
                onClick={() => setStep("intro")}
              >
                Let's Go! 🚀
              </NeonButton>
            </motion.div>

            {/* Step indicators */}
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-purple" />
              <div className="w-2 h-2 rounded-full bg-border" />
            </div>
          </motion.div>
        ) : step === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-full relative"
          >
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 180,
                damping: 14,
              }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-50 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.78 0.2 195 / 0.4), oklch(0.7 0.22 280 / 0.2) 60%, transparent)",
                }}
              />
              <div className="relative text-7xl drop-shadow-[0_0_24px_oklch(0.78_0.2_195/0.5)]">
                🌌
              </div>
            </motion.div>

            {/* Logo text */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1
                className="font-display font-black leading-[0.88] gradient-text-game"
                style={{
                  fontSize: "clamp(3rem, 16vw, 4.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                MELTING
              </h1>
              <h1
                className="font-display font-black leading-[0.88] gradient-text-game"
                style={{
                  fontSize: "clamp(3rem, 16vw, 4.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                MATHS
              </h1>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-neon-cyan/40" />
                <span className="text-muted-foreground text-xs tracking-[0.25em] uppercase">
                  Math Gaming Universe
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-neon-purple/40" />
              </div>
            </motion.div>

            {/* Shinchen intro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.48 }}
              className="w-full relative rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.11 0.03 280 / 0.85), oklch(0.08 0.02 265 / 0.9))",
                border: "1px solid oklch(0.7 0.22 280 / 0.35)",
                boxShadow: "0 0 30px oklch(0.7 0.22 280 / 0.12)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl animate-pulse-glow flex-shrink-0">
                  🌟
                </div>
                <div>
                  <div className="font-display font-bold text-neon-purple text-xs tracking-widest mb-1">
                    SHINCHEN AI
                  </div>
                  <p className="text-foreground/90 text-sm leading-relaxed">
                    Hey! I'm Shinchen, your math buddy! Ready to unlock your
                    full potential? Let's go! 🚀
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full"
            >
              <NeonButton
                variant="cyan"
                size="lg"
                fullWidth
                onClick={() => setStep("form")}
              >
                Start Your Journey! ✨
              </NeonButton>
            </motion.div>

            {/* Step indicators */}
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-border" />
              <div className="w-2 h-2 rounded-full bg-neon-cyan" />
            </div>

            <button
              type="button"
              onClick={() => setStep("shinchen-intro")}
              className="text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col gap-6 w-full max-w-sm"
          >
            {/* Shinchen prompt */}
            <div className="card-neon rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl animate-pulse-glow flex-shrink-0">
                  🌟
                </div>
                <div>
                  <div className="font-display font-bold text-neon-cyan text-sm mb-1">
                    SHINCHEN
                  </div>
                  <p className="text-foreground/90 text-sm">
                    Hey! I'm Shinchen, your math buddy! What's your name? 😊
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-5">
              <div>
                <Label className="text-foreground/80 mb-2 block font-semibold">
                  Your Name
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && grade && handleSubmit()
                  }
                  className="bg-secondary border-border focus:border-neon-cyan text-foreground placeholder:text-muted-foreground text-base h-12 rounded-xl"
                  autoFocus
                  aria-label="Student name"
                />
                {nameError && (
                  <p className="text-red-400 text-sm mt-1">{nameError}</p>
                )}
              </div>

              <div>
                <Label className="text-foreground/80 mb-2 block font-semibold">
                  Your Grade
                </Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="bg-secondary border-border focus:border-neon-cyan h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select your grade..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <SelectItem
                        key={g}
                        value={String(g)}
                        className="focus:bg-secondary"
                      >
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <NeonButton
              variant="cyan"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={!name.trim() || !grade}
            >
              Let's Go! 🚀
            </NeonButton>

            <button
              type="button"
              onClick={() => setStep("intro")}
              className="text-muted-foreground text-sm text-center hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
