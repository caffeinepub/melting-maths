import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
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

interface WordProblem {
  text: string;
  answer: number;
  options: number[];
}

const LEVEL_CONFIG = { 1: { total: 8 }, 2: { total: 10 }, 3: { total: 12 } };

function makeProblem(level: number): WordProblem {
  const templates = [
    () => {
      const apples = Math.floor(Math.random() * (level * 8)) + 2;
      const eaten = Math.floor(Math.random() * (apples - 1)) + 1;
      return {
        text: `Tom has ${apples} apples. He eats ${eaten}. How many does he have left?`,
        answer: apples - eaten,
      };
    },
    () => {
      const bags = Math.floor(Math.random() * 5) + 2;
      const perBag = Math.floor(Math.random() * (level * 3)) + 3;
      return {
        text: `There are ${bags} bags with ${perBag} candies each. How many candies total?`,
        answer: bags * perBag,
      };
    },
    () => {
      const total =
        (Math.floor(Math.random() * 5) + 2) *
        (Math.floor(Math.random() * 4) + 2);
      const groups = Math.floor(Math.random() * 3) + 2;
      const perGroup = total / groups;
      if (!Number.isInteger(perGroup)) return makeProblem(level);
      return {
        text: `${total} students sit in ${groups} equal rows. How many in each row?`,
        answer: perGroup,
      };
    },
    () => {
      const start = Math.floor(Math.random() * (level * 5)) + 5;
      const added = Math.floor(Math.random() * (level * 5)) + 3;
      return {
        text: `A book has ${start} pages. Sarah reads ${added} more. How many pages has she read?`,
        answer: start + added,
      };
    },
    () => {
      const price = Math.floor(Math.random() * (level * 3)) + 2;
      const qty = Math.floor(Math.random() * 4) + 2;
      return {
        text: `Each toy costs $${price}. Jake buys ${qty} toys. How much does he spend?`,
        answer: price * qty,
      };
    },
  ];

  const tpl = templates[Math.floor(Math.random() * templates.length)];
  const { text, answer } = tpl();
  const opts = [answer];
  while (opts.length < 4) {
    const wrong = Math.max(
      1,
      answer +
        (Math.random() > 0.5 ? 1 : -1) *
          (Math.floor(Math.random() * Math.max(3, Math.floor(answer * 0.3))) +
            1),
    );
    if (!opts.includes(wrong)) opts.push(wrong);
  }
  return { text, answer, options: opts.sort(() => Math.random() - 0.5) };
}

export function WordProblemWizard({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: Props) {
  const config =
    LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[1];
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState(() => makeProblem(level));
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const nextQ = useCallback(() => {
    setQ(makeProblem(level));
    setFeedback(null);
  }, [level]);

  const handleAnswer = (n: number) => {
    if (feedback) return;
    const total = correct + incorrect + 1;
    if (n === q.answer) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
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
          700,
        );
      } else setTimeout(nextQ, 700);
    } else {
      const newIncorrect = incorrect + 1;
      setIncorrect(newIncorrect);
      onWrong?.();
      setFeedback("wrong");
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
      } else setTimeout(nextQ, 900);
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">🧙</div>
        <h2 className="font-display text-2xl font-bold text-glow-cyan">
          Word Problem Wizard
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Read each story problem carefully and choose the correct answer! Level{" "}
          {level}: {config.total} problems.
        </p>
        <NeonButton variant="cyan" size="lg" onClick={() => setStarted(true)}>
          Cast the Spell!
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-4">
      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
        <span className="text-green-400">✓ {correct}</span>
        <span className="text-neon-cyan font-mono-game">
          {correct + incorrect}/{config.total}
        </span>
        <span className="text-red-400">✗ {incorrect}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.text}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="card-neon rounded-2xl p-5 w-full max-w-sm"
        >
          <p className="text-foreground text-base leading-relaxed">{q.text}</p>
        </motion.div>
      </AnimatePresence>

      <div
        className={`text-sm font-semibold ${feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400" : "text-transparent"}`}
      >
        {feedback === "correct"
          ? "✓ Wizardly!"
          : feedback === "wrong"
            ? `✗ Answer: ${q.answer}`
            : "·"}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            className="py-4 rounded-xl font-display text-xl font-bold btn-neon-purple transition-all hover:scale-105 disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
