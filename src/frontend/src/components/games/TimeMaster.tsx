import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NeonButton } from "../NeonButton";

interface TimeMasterProps {
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

interface Question {
  display: string;
  answer: string;
  options: string[];
  correctIndex: number;
}

function padTime(h: number, m: number): string {
  return `${h}:${String(m).padStart(2, "0")}`;
}

function makeTimeOptions(
  answer: string,
  idx: number,
): { options: string[]; correctIndex: number } {
  const [ah, am] = answer.split(":").map(Number);
  const totalMins = ah * 60 + am;
  const offsets = [15, 30, -15, 45, -30, 60, -45, 90];
  const wrongs: string[] = [];
  for (let i = 0; wrongs.length < 3; i++) {
    const w =
      (((totalMins + offsets[(idx + i) % offsets.length]) % (24 * 60)) +
        24 * 60) %
      (24 * 60);
    const wStr = padTime(Math.floor(w / 60) % 12 || 12, w % 60);
    if (wStr !== answer && !wrongs.includes(wStr)) wrongs.push(wStr);
  }
  const all = [answer, ...wrongs.slice(0, 3)];
  const shuffled = [...all].sort(
    (a, b) =>
      ((a.charCodeAt(0) * 3 + idx * 7) % 11) -
      ((b.charCodeAt(0) * 3 + idx * 7) % 11),
  );
  return { options: shuffled, correctIndex: shuffled.indexOf(answer) };
}

function makeMinuteOptions(
  answer: number,
  idx: number,
): { options: string[]; correctIndex: number } {
  const offsets = [15, 30, -15, 45, -30, 5, -10, 20];
  const wrongs: number[] = [];
  for (let i = 0; wrongs.length < 3; i++) {
    const w = answer + offsets[(idx + i) % offsets.length];
    if (w !== answer && w > 0 && !wrongs.includes(w)) wrongs.push(w);
  }
  const all = [answer, ...wrongs.slice(0, 3)].map(String);
  const shuffled = [...all].sort(
    (a, b) =>
      ((Number.parseInt(a) * 3 + idx * 7) % 11) -
      ((Number.parseInt(b) * 3 + idx * 7) % 11),
  );
  return { options: shuffled, correctIndex: shuffled.indexOf(String(answer)) };
}

function buildQuestions(level: number): Question[] {
  return Array.from({ length: 8 }, (_, i) => {
    if (level === 1) {
      const startHour = (i % 12) + 1;
      const addMins = (((i * 15 + 15) % 4) + 1) * 15;
      const totalMins = startHour * 60 + addMins;
      const endH = Math.floor(totalMins / 60) % 12 || 12;
      const endM = totalMins % 60;
      const answer = padTime(endH, endM);
      const { options, correctIndex } = makeTimeOptions(answer, i);
      return {
        display: `What time is ${addMins} minutes after ${startHour}:00?`,
        answer,
        options,
        correctIndex,
      };
    }
    if (level === 2) {
      const startH = (i % 8) + 1;
      const endH = startH + ((i % 3) + 1);
      const startM = (i % 4) * 15;
      const endM = startM + 30;
      const diff = (endH - startH) * 60 + (endM - startM);
      const answer = String(diff);
      const { options, correctIndex } = makeMinuteOptions(diff, i);
      return {
        display: `How many minutes between ${padTime(startH, startM)} and ${padTime(endH % 12 || 12, endM % 60)}?`,
        answer,
        options,
        correctIndex,
      };
    }
    const hours = (i % 5) + 1;
    const mins = ((i * 10 + 15) % 55) + 5;
    const total = hours * 60 + mins;
    const answer = String(total);
    const { options, correctIndex } = makeMinuteOptions(total, i);
    return {
      display: `${hours} hours ${mins} minutes = ? total minutes`,
      answer,
      options,
      correctIndex,
    };
  });
}

const TOTAL = 8;

export function TimeMaster({
  level,
  onComplete,
  onBack,
  onCorrect,
  onWrong,
}: TimeMasterProps) {
  const [questions] = useState(() => buildQuestions(level));
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[currentQ];

  const handleChoice = (idx: number) => {
    if (selected !== null || done) return;
    setSelected(idx);
    const isCorrect = idx === q.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newIncorrect = isCorrect ? incorrect : incorrect + 1;
    if (isCorrect) {
      setCorrect(newCorrect);
      onCorrect?.();
    } else {
      setIncorrect(newIncorrect);
      onWrong?.();
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentQ + 1 >= TOTAL) {
        setDone(true);
        const score = Math.round((newCorrect / TOTAL) * 100);
        setTimeout(
          () =>
            onComplete({ score, correct: newCorrect, incorrect: newIncorrect }),
          1000,
        );
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 800);
  };

  const levelNames = [
    "Add Minutes to Hours",
    "Minutes Between Times",
    "Hours to Total Minutes",
  ];

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-6xl animate-bounce-in">⏰</div>
        <h2 className="font-display text-2xl font-bold text-glow-purple">
          Time Master
        </h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Master the clock! Level {level}:{" "}
          <strong className="text-neon-purple">{levelNames[level - 1]}</strong>.
          8 questions!
        </p>
        <NeonButton variant="purple" size="lg" onClick={() => setStarted(true)}>
          Set the Clock! ⏰
        </NeonButton>
        <NeonButton variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Clock face header */}
      <div className="w-full flex items-center justify-between">
        <span className="font-mono-game text-sm text-muted-foreground">
          Q {currentQ + 1}/{TOTAL}
        </span>
        <div className="text-3xl">⏰</div>
        <span className="font-mono-game text-sm">
          <span className="text-green-400">✓{correct}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-red-400">✗{incorrect}</span>
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full card-neon rounded-2xl p-6 text-center"
        >
          <p className="text-muted-foreground text-sm mb-2">Time Problem:</p>
          <div className="font-display text-xl font-bold gradient-text-cyan-purple mb-6 leading-snug">
            {q.display}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
              let cls = "btn-neon-cyan";
              if (isSelected && feedback === "correct")
                cls =
                  "border-green-400 bg-green-500/20 text-green-300 shadow-[0_0_15px_oklch(0.75_0.2_155/0.5)]";
              if (isSelected && feedback === "wrong")
                cls =
                  "border-red-400 bg-red-500/20 text-red-300 shadow-[0_0_15px_oklch(0.65_0.22_25/0.5)]";
              if (!isSelected && selected !== null && isCorrect)
                cls = "border-green-400/50 text-green-400/70";

              return (
                <button
                  key={`time-${opt}`}
                  type="button"
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                  className={`p-4 rounded-xl border text-lg font-bold font-mono-game transition-all cursor-pointer
                    ${cls} ${selected === null ? "hover:scale-105 active:scale-95" : ""}
                    disabled:cursor-not-allowed min-h-[52px]`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {done && (
        <div className="text-center animate-bounce-in">
          <div className="text-3xl">{correct >= 6 ? "⏰" : "💪"}</div>
          <div className="font-display text-lg font-bold text-neon-purple">
            {correct >= 6 ? "Time Master!" : "Keep Practicing!"}
          </div>
        </div>
      )}
    </div>
  );
}
