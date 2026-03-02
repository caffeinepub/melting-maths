import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { NeonButton } from "../NeonButton";

interface Props {
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

const LEVEL_CONFIG = {
  1: { maxFactor: 5, total: 10, timePerQ: 12 },
  2: { maxFactor: 9, total: 12, timePerQ: 10 },
  3: { maxFactor: 12, total: 15, timePerQ: 8 },
};

function makeQ(maxFactor: number) {
  const a = Math.floor(Math.random() * maxFactor) + 1;
  const b = Math.floor(Math.random() * maxFactor) + 1;
  const answer = a * b;
  const opts = [answer];
  while (opts.length < 4) {
    const wrong =
      answer +
      (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
  }
  return { a, b, answer, options: opts.sort(() => Math.random() - 0.5) };
}

export function MultiplicationMadness({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: Props) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState(() => makeQ(config.maxFactor));
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timePerQ);
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "timeout" | null
  >(null);
  const [combo, setCombo] = useState(0);

  const nextQ = useCallback(
    (wasCorrect: boolean) => {
      setQ(makeQ(config.maxFactor));
      setFeedback(null);
      setTimeLeft(config.timePerQ);
      if (!wasCorrect) setCombo(0);
    },
    [config.maxFactor, config.timePerQ],
  );

  useEffect(() => {
    if (!started || feedback) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          const total = correct + incorrect + 1;
          setIncorrect((i) => i + 1);
          setFeedback("timeout");
          setCombo(0);
          if (total >= config.total) {
            setTimeout(
              () =>
                onComplete({
                  score: Math.round((correct / config.total) * 100),
                  correct,
                  incorrect: incorrect + 1,
                }),
              900,
            );
          } else {
            setTimeout(() => nextQ(false), 900);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, feedback, correct, incorrect, config.total, nextQ, onComplete]);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (n === q.answer) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setCombo((c) => c + 1);
      onCorrect?.();
      setFeedback("correct");
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((newCorrect / config.total) * 100),
              correct: newCorrect,
              incorrect,
            }),
          600,
        );
      } else {
        setTimeout(() => nextQ(true), 600);
      }
    } else {
      const newIncorrect = incorrect + 1;
      setIncorrect(newIncorrect);
      onWrong?.();
      setFeedback("wrong");
      setCombo(0);
      if (total >= config.total) {
        setTimeout(
          () =>
            onComplete({
              score: Math.round((correct / config.total) * 100),
              correct,
              incorrect: newIncorrect,
            }),
          900,
        );
      } else {
        setTimeout(() => nextQ(false), 900);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">⚡</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Multiplication Madness
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Answer timed multiplication questions as fast as you can! Level{" "}
          {level}: up to {config.maxFactor} × {config.maxFactor}. You have{" "}
          {config.timePerQ}s per question!
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Start!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  const timerPct = (timeLeft / config.timePerQ) * 100;

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-4">
      <div className="flex items-center justify-between w-full text-sm">
        <span className="text-green-400 font-semibold">✓ {correct}</span>
        {combo >= 3 && (
          <span className="text-amber-400 font-bold animate-pulse-glow">
            🔥 {combo}x Combo!
          </span>
        )}
        <span className="text-red-400 font-semibold">✗ {incorrect}</span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${timerPct}%`,
            background:
              timerPct > 50
                ? "oklch(0.78 0.2 195)"
                : timerPct > 25
                  ? "oklch(0.75 0.2 50)"
                  : "oklch(0.65 0.22 25)",
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground -mt-3">{timeLeft}s</span>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${q.a}-${q.b}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="card-neon rounded-2xl p-8 flex flex-col items-center gap-2"
        >
          <span className="font-display text-5xl font-black text-foreground">
            {q.a} × {q.b}
          </span>
          <span className="text-muted-foreground text-sm">= ?</span>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" || feedback === "timeout" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "⚡ Fast!"
          : feedback === "wrong"
            ? `✗ Answer was ${q.answer}`
            : feedback === "timeout"
              ? `⏰ Too slow! Answer: ${q.answer}`
              : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            className="py-5 rounded-xl font-display text-2xl font-bold btn-neon-cyan transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>

      <span className="text-xs text-muted-foreground">
        {correct + incorrect}/{config.total} questions
      </span>
    </div>
  );
}
