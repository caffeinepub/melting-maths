import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile } from "../backend.d";
import { LevelUpOverlay } from "../components/LevelUpOverlay";
import { NeonButton } from "../components/NeonButton";
import { AdditionRocket } from "../components/games/AdditionRocket";
import { AlgebraEscape } from "../components/games/AlgebraEscape";
import {
  Boss13,
  Boss45,
  Boss68,
  Boss910,
  Boss1112,
} from "../components/games/BossGame";
import { CalculusRunner } from "../components/games/CalculusRunner";
import { ComplexClash } from "../components/games/ComplexClash";
import { CoordinateQuest } from "../components/games/CoordinateQuest";
import { DecimalDash } from "../components/games/DecimalDash";
import { DivisionDungeon } from "../components/games/DivisionDungeon";
import { FractionBattle } from "../components/games/FractionBattle";
import { GeometryBuilder } from "../components/games/GeometryBuilder";
import { GraphBuilder } from "../components/games/GraphBuilder";
import { IntegerWar } from "../components/games/IntegerWar";
import { LogarithmLab } from "../components/games/LogarithmLab";
import { MatrixCode } from "../components/games/MatrixCode";
import { MultiplicationMadness } from "../components/games/MultiplicationMadness";
import { NumberCatcher } from "../components/games/NumberCatcher";
import { NumberRace } from "../components/games/NumberRace";
import { PatternDetective } from "../components/games/PatternDetective";
import { PercentagePower } from "../components/games/PercentagePower";
import { ProbabilityStrategy } from "../components/games/ProbabilityStrategy";
import { QuadraticBoss } from "../components/games/QuadraticBoss";
import { RatioRumble } from "../components/games/RatioRumble";
import { SequenceSolver } from "../components/games/SequenceSolver";
import { ShapeSorter } from "../components/games/ShapeSorter";
import { SkipCounter } from "../components/games/SkipCounter";
import { StatisticsShowdown } from "../components/games/StatisticsShowdown";
import { SubtractionBlocks } from "../components/games/SubtractionBlocks";
import { TimeMaster } from "../components/games/TimeMaster";
import { TrigSniper } from "../components/games/TrigSniper";
import { VectorsVoyage } from "../components/games/VectorsVoyage";
import { WordProblemWizard } from "../components/games/WordProblemWizard";
import {
  SHINCHEN_ENCOURAGEMENT_BAD,
  SHINCHEN_ENCOURAGEMENT_GOOD,
} from "../data/shinchen";
import { useRecordGameSession, useUnlockedLevels } from "../hooks/useQueries";
import { useSoundEffects } from "../hooks/useSoundEffects";

interface GameScreenProps {
  gameId: string;
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
}

const GAME_META: Record<
  string,
  { name: string; icon: string; topicId: string; xpPerCorrect: number }
> = {
  "number-catcher": {
    name: "Number Catcher",
    icon: "🎯",
    topicId: "addition",
    xpPerCorrect: 5,
  },
  "fraction-battle": {
    name: "Fraction Battle Arena",
    icon: "⚔️",
    topicId: "fractions",
    xpPerCorrect: 8,
  },
  "algebra-escape": {
    name: "Algebra Escape Room",
    icon: "🔐",
    topicId: "algebra",
    xpPerCorrect: 10,
  },
  "quadratic-boss": {
    name: "Quadratic Boss Fight",
    icon: "👾",
    topicId: "quadratics",
    xpPerCorrect: 12,
  },
  "calculus-runner": {
    name: "Calculus Runner",
    icon: "🏃",
    topicId: "calculus",
    xpPerCorrect: 15,
  },
  "addition-rocket": {
    name: "Addition Rocket",
    icon: "🚀",
    topicId: "addition",
    xpPerCorrect: 5,
  },
  "subtraction-blocks": {
    name: "Subtraction Blocks",
    icon: "🧊",
    topicId: "subtraction",
    xpPerCorrect: 5,
  },
  "decimal-dash": {
    name: "Decimal Dash",
    icon: "💨",
    topicId: "decimals",
    xpPerCorrect: 8,
  },
  "time-master": {
    name: "Time Master",
    icon: "⏰",
    topicId: "time",
    xpPerCorrect: 8,
  },
  "geometry-builder": {
    name: "Geometry Builder",
    icon: "📐",
    topicId: "geometry",
    xpPerCorrect: 10,
  },
  "integer-war": {
    name: "Integer War",
    icon: "⚡",
    topicId: "integers",
    xpPerCorrect: 10,
  },
  "graph-builder": {
    name: "Graph Builder Challenge",
    icon: "📈",
    topicId: "graphs",
    xpPerCorrect: 12,
  },
  "trig-sniper": {
    name: "Trigonometry Sniper",
    icon: "🎯",
    topicId: "trigonometry",
    xpPerCorrect: 12,
  },
  "matrix-code": {
    name: "Matrix Code Breaker",
    icon: "💻",
    topicId: "matrices",
    xpPerCorrect: 15,
  },
  "probability-strategy": {
    name: "Probability Strategy Game",
    icon: "🎲",
    topicId: "probability",
    xpPerCorrect: 15,
  },
  // New games
  "number-race": {
    name: "Number Race",
    icon: "⭐",
    topicId: "addition",
    xpPerCorrect: 5,
  },
  "shape-sorter": {
    name: "Shape Sorter",
    icon: "🔺",
    topicId: "geometry",
    xpPerCorrect: 5,
  },
  "skip-counter": {
    name: "Skip Counter",
    icon: "🔢",
    topicId: "addition",
    xpPerCorrect: 5,
  },
  "multiplication-madness": {
    name: "Multiplication Madness",
    icon: "⚡",
    topicId: "fractions",
    xpPerCorrect: 8,
  },
  "division-dungeon": {
    name: "Division Dungeon",
    icon: "🏰",
    topicId: "fractions",
    xpPerCorrect: 8,
  },
  "word-problem-wizard": {
    name: "Word Problem Wizard",
    icon: "🧙",
    topicId: "addition",
    xpPerCorrect: 8,
  },
  "ratio-rumble": {
    name: "Ratio Rumble",
    icon: "⚖️",
    topicId: "algebra",
    xpPerCorrect: 10,
  },
  "percentage-power": {
    name: "Percentage Power",
    icon: "💯",
    topicId: "algebra",
    xpPerCorrect: 10,
  },
  "pattern-detective": {
    name: "Pattern Detective",
    icon: "🔍",
    topicId: "algebra",
    xpPerCorrect: 10,
  },
  "statistics-showdown": {
    name: "Statistics Showdown",
    icon: "📊",
    topicId: "graphs",
    xpPerCorrect: 12,
  },
  "sequence-solver": {
    name: "Sequence Solver",
    icon: "🧮",
    topicId: "algebra",
    xpPerCorrect: 12,
  },
  "coordinate-quest": {
    name: "Coordinate Quest",
    icon: "🗺️",
    topicId: "graphs",
    xpPerCorrect: 12,
  },
  "complex-clash": {
    name: "Complex Clash",
    icon: "⚡",
    topicId: "calculus",
    xpPerCorrect: 15,
  },
  "logarithm-lab": {
    name: "Logarithm Lab",
    icon: "🧪",
    topicId: "calculus",
    xpPerCorrect: 15,
  },
  "vectors-voyage": {
    name: "Vectors Voyage",
    icon: "🧭",
    topicId: "calculus",
    xpPerCorrect: 15,
  },
  // Boss games
  "boss-1-3": {
    name: "Boss Battle: Grades 1-3",
    icon: "⚔️",
    topicId: "addition",
    xpPerCorrect: 10,
  },
  "boss-4-5": {
    name: "Boss Battle: Grades 4-5",
    icon: "⚔️",
    topicId: "fractions",
    xpPerCorrect: 12,
  },
  "boss-6-8": {
    name: "Boss Battle: Grades 6-8",
    icon: "⚔️",
    topicId: "algebra",
    xpPerCorrect: 14,
  },
  "boss-9-10": {
    name: "Boss Battle: Grades 9-10",
    icon: "⚔️",
    topicId: "quadratics",
    xpPerCorrect: 16,
  },
  "boss-11-12": {
    name: "Boss Battle: Grades 11-12",
    icon: "⚔️",
    topicId: "calculus",
    xpPerCorrect: 20,
  },
};

type GameState = "level-select" | "playing" | "result";

interface GameResult {
  score: number;
  correct: number;
  incorrect: number;
  level: number;
  xpEarned: number;
}

const LEVEL_META = [
  {
    num: 1,
    label: "Level 1",
    sub: "Beginner",
    stars: 1,
    xpRange: "5–25 XP",
    accent: "oklch(0.78 0.2 195)",
    accentMuted: "oklch(0.78 0.2 195 / 0.15)",
    accentBorder: "oklch(0.78 0.2 195 / 0.5)",
    gradient:
      "linear-gradient(135deg, oklch(0.14 0.04 195 / 0.6), oklch(0.1 0.02 265 / 0.8))",
  },
  {
    num: 2,
    label: "Level 2",
    sub: "Intermediate",
    stars: 2,
    xpRange: "10–50 XP",
    accent: "oklch(0.7 0.22 280)",
    accentMuted: "oklch(0.7 0.22 280 / 0.15)",
    accentBorder: "oklch(0.7 0.22 280 / 0.5)",
    gradient:
      "linear-gradient(135deg, oklch(0.14 0.04 280 / 0.6), oklch(0.1 0.02 265 / 0.8))",
  },
  {
    num: 3,
    label: "Level 3",
    sub: "Expert",
    stars: 3,
    xpRange: "20–90 XP",
    accent: "oklch(0.75 0.2 50)",
    accentMuted: "oklch(0.75 0.2 50 / 0.15)",
    accentBorder: "oklch(0.75 0.2 50 / 0.5)",
    gradient:
      "linear-gradient(135deg, oklch(0.14 0.04 50 / 0.6), oklch(0.1 0.02 265 / 0.8))",
  },
];

function DifficultyStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`text-xs ${n <= count ? "text-amber-400" : "text-border"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function LevelSelectCard({
  gameId,
  meta,
  onSelect,
  onBack,
}: {
  gameId: string;
  meta: (typeof GAME_META)[string];
  onSelect: (level: number) => void;
  onBack: () => void;
}) {
  const { data: unlocked = [1] } = useUnlockedLevels(gameId);
  const isBoss = gameId.startsWith("boss-");

  if (isBoss) {
    return (
      <div className="flex flex-col px-6 pt-10 pb-8 min-h-screen">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm mb-6 self-start"
        >
          ← Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="text-5xl text-center mb-3">⚔️</div>
          <h1
            className="font-display text-2xl font-black text-center"
            style={{ color: "oklch(0.85 0.18 50)" }}
          >
            {meta.name}
          </h1>
          <p className="text-muted-foreground text-sm text-center mt-1">
            Ultimate challenge — face the math boss!
          </p>
        </motion.div>
        <div className="flex flex-col gap-3">
          {LEVEL_META.map((lvl, i) => {
            const isUnlocked = unlocked.includes(lvl.num) || lvl.num === 1;
            return (
              <motion.div
                key={lvl.num}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09 }}
              >
                <button
                  type="button"
                  onClick={() => isUnlocked && onSelect(lvl.num)}
                  disabled={!isUnlocked}
                  className="w-full text-left relative overflow-hidden rounded-2xl transition-all duration-250 group disabled:cursor-not-allowed"
                  style={
                    isUnlocked
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.1 0.04 25 / 0.8), oklch(0.08 0.02 265))",
                          border: "1px solid oklch(0.75 0.2 50 / 0.5)",
                          boxShadow: "0 0 15px oklch(0.65 0.22 25 / 0.1)",
                        }
                      : {
                          background: "oklch(0.09 0.01 265)",
                          border: "1px solid oklch(0.2 0.02 265)",
                          opacity: 0.55,
                        }
                  }
                >
                  <div className="relative flex items-center gap-4 p-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-lg flex-shrink-0"
                      style={
                        isUnlocked
                          ? {
                              background: "oklch(0.15 0.04 25 / 0.5)",
                              border: "1px solid oklch(0.75 0.2 50 / 0.5)",
                              color: "oklch(0.85 0.18 50)",
                            }
                          : {
                              background: "oklch(0.12 0.01 265)",
                              border: "1px solid oklch(0.2 0.02 265)",
                              color: "oklch(0.4 0.02 265)",
                            }
                      }
                    >
                      {isUnlocked ? lvl.num : "🔒"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-foreground">
                          {lvl.label}
                        </span>
                        <DifficultyStars count={isUnlocked ? lvl.stars : 0} />
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {lvl.sub}
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="text-right">
                        <div
                          className="text-xs font-semibold font-mono-game"
                          style={{ color: "oklch(0.85 0.18 50)" }}
                        >
                          {lvl.xpRange}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          XP reward
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 pt-10 pb-8 min-h-screen">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground text-sm mb-6 self-start"
      >
        ← Back
      </button>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.04 195 / 0.8), oklch(0.1 0.02 265))",
              border: "1px solid oklch(0.78 0.2 195 / 0.35)",
              boxShadow: "0 0 20px oklch(0.78 0.2 195 / 0.15)",
            }}
          >
            {meta.icon}
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-glow-cyan leading-tight">
              {meta.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Choose difficulty
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        {LEVEL_META.map((lvl, i) => {
          const isUnlocked = unlocked.includes(lvl.num) || lvl.num === 1;
          return (
            <motion.div
              key={lvl.num}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.09 }}
            >
              <button
                type="button"
                onClick={() => isUnlocked && onSelect(lvl.num)}
                disabled={!isUnlocked}
                className="w-full text-left relative overflow-hidden rounded-2xl transition-all duration-250 group disabled:cursor-not-allowed"
                style={
                  isUnlocked
                    ? {
                        background: lvl.gradient,
                        border: `1px solid ${lvl.accentBorder}`,
                        boxShadow: `0 0 24px ${lvl.accentMuted}`,
                      }
                    : {
                        background:
                          "repeating-linear-gradient(45deg, oklch(0.09 0.01 265) 0px, oklch(0.09 0.01 265) 4px, oklch(0.1 0.015 265) 4px, oklch(0.1 0.015 265) 8px)",
                        border: "1px solid oklch(0.2 0.02 265)",
                        opacity: 0.55,
                      }
                }
              >
                {isUnlocked && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl"
                    style={{
                      background: `radial-gradient(ellipse at 30% 50%, ${lvl.accentMuted}, transparent 70%)`,
                    }}
                  />
                )}
                <div className="relative flex items-center gap-4 p-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-lg flex-shrink-0"
                    style={
                      isUnlocked
                        ? {
                            background: lvl.accentMuted,
                            border: `1px solid ${lvl.accentBorder}`,
                            color: lvl.accent,
                          }
                        : {
                            background: "oklch(0.12 0.01 265)",
                            border: "1px solid oklch(0.2 0.02 265)",
                            color: "oklch(0.4 0.02 265)",
                          }
                    }
                  >
                    {isUnlocked ? lvl.num : "🔒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-bold text-base text-foreground">
                        {lvl.label}
                      </span>
                      <DifficultyStars count={isUnlocked ? lvl.stars : 0} />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {lvl.sub}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {isUnlocked ? (
                      <>
                        <div
                          className="text-xs font-semibold font-mono-game mb-0.5"
                          style={{ color: lvl.accent }}
                        >
                          {lvl.xpRange}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          XP reward
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Complete prev. level
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  gameName,
  onNextLevel,
  onRetry,
  onBack,
}: {
  result: GameResult;
  gameName: string;
  onNextLevel: () => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const isGood = result.score >= 70;
  const isExcellent = result.score >= 90;
  const messages = isGood
    ? SHINCHEN_ENCOURAGEMENT_GOOD
    : SHINCHEN_ENCOURAGEMENT_BAD;
  const message = messages[Math.floor(Math.random() * messages.length)];

  const handleShare = () => {
    const text = `I scored ${result.score}% on ${gameName} Level ${result.level} in Melting Maths! Can you beat me? 🔥 #MeltingMaths`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(
          "Challenge copied to clipboard! Share it with a friend! 🤝",
        );
        // Track challenge badge
        try {
          const badges =
            JSON.parse(localStorage.getItem("meltingmaths_profile") || "{}")
              .badges ?? [];
          if (!badges.includes("challenge_accepted")) {
            const raw = localStorage.getItem("meltingmaths_profile");
            if (raw) {
              const p = JSON.parse(raw);
              p.badges = [...(p.badges ?? []), "challenge_accepted"];
              localStorage.setItem("meltingmaths_profile", JSON.stringify(p));
            }
          }
        } catch {
          /* noop */
        }
      })
      .catch(() => toast.error("Couldn't copy to clipboard"));
  };

  const getRankEmoji = (score: number) => {
    if (score >= 90) return "🏆";
    if (score >= 70) return "⭐";
    if (score >= 50) return "💪";
    return "📚";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-full max-w-sm flex flex-col items-center gap-6 relative"
      >
        {/* Excellent score burst particles */}
        {isExcellent && (
          <div className="score-burst">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const tx = `${Math.cos(rad) * 60}px`;
              const ty = `${Math.sin(rad) * 60}px`;
              return (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static burst animation
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                  className="absolute text-xl pointer-events-none"
                  style={{ left: "-10px", top: "-10px" }}
                >
                  ⭐
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-7xl animate-bounce-in">
          {getRankEmoji(result.score)}
        </div>
        <div className="text-center">
          <div className="font-display text-4xl font-black gradient-text-game">
            {result.score}%
          </div>
          <div className="text-muted-foreground text-sm mt-1">
            Level {result.level} Complete
          </div>
        </div>

        <div className="w-full card-neon rounded-2xl p-5 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-green-400">
              {result.correct}
            </div>
            <div className="text-muted-foreground text-xs">Correct</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-red-400">
              {result.incorrect}
            </div>
            <div className="text-muted-foreground text-xs">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-neon-cyan animate-xp-flash">
              +{result.xpEarned}
            </div>
            <div className="text-muted-foreground text-xs">XP Earned</div>
          </div>
        </div>

        <div
          className="w-full rounded-2xl p-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.03 280 / 0.8), oklch(0.08 0.02 265))",
            border: "1px solid oklch(0.7 0.22 280 / 0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl animate-pulse-glow flex-shrink-0">🌟</div>
            <div>
              <div className="font-display text-xs font-bold text-neon-purple mb-1">
                SHINCHEN
              </div>
              <p className="text-foreground/90 text-sm">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {result.level < 3 && isGood && (
            <NeonButton
              variant="cyan"
              size="lg"
              fullWidth
              onClick={onNextLevel}
            >
              Next Level! ⚡
            </NeonButton>
          )}
          {result.score >= 60 && (
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.04 155 / 0.8), oklch(0.1 0.02 265))",
                border: "1px solid oklch(0.72 0.22 155 / 0.5)",
                color: "oklch(0.82 0.18 155)",
              }}
            >
              🤝 Share Challenge
            </button>
          )}
          <NeonButton variant="purple" size="md" fullWidth onClick={onRetry}>
            Try Again 🔄
          </NeonButton>
          <NeonButton variant="ghost" size="md" fullWidth onClick={onBack}>
            Back to Games
          </NeonButton>
        </div>
      </motion.div>
    </div>
  );
}

function getSoundEnabled(): boolean {
  try {
    return localStorage.getItem("mm_sound") === "true";
  } catch {
    return false;
  }
}
function setSoundEnabled(v: boolean) {
  try {
    localStorage.setItem("mm_sound", v ? "true" : "false");
  } catch {
    /* noop */
  }
}
function incrementGamesPlayed(): number {
  try {
    const n =
      Number.parseInt(localStorage.getItem("mm_games_played") || "0", 10) + 1;
    localStorage.setItem("mm_games_played", String(n));
    return n;
  } catch {
    return 1;
  }
}
function addGameToPlayedSet(gId: string): Set<string> {
  try {
    const raw = localStorage.getItem("mm_games_played_set");
    const s = new Set<string>(raw ? JSON.parse(raw) : []);
    s.add(gId);
    localStorage.setItem("mm_games_played_set", JSON.stringify(Array.from(s)));
    return s;
  } catch {
    return new Set([gId]);
  }
}
function incrementGamePlayCount(gId: string) {
  try {
    const raw = localStorage.getItem("mm_game_play_counts");
    const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
    counts[gId] = (counts[gId] ?? 0) + 1;
    localStorage.setItem("mm_game_play_counts", JSON.stringify(counts));
  } catch {
    /* noop */
  }
}
function updateAccuracy(correct: number, total: number) {
  try {
    const prevCorrect = Number.parseInt(
      localStorage.getItem("mm_total_correct") || "0",
      10,
    );
    const prevTotal = Number.parseInt(
      localStorage.getItem("mm_total_questions") || "0",
      10,
    );
    localStorage.setItem("mm_total_correct", String(prevCorrect + correct));
    localStorage.setItem("mm_total_questions", String(prevTotal + total));
  } catch {
    /* noop */
  }
}
function markGameCompleted(gameId: string, level: number) {
  try {
    const raw = localStorage.getItem("mm_completed_games");
    const set: string[] = raw ? JSON.parse(raw) : [];
    const key = `${gameId}_${level}`;
    if (!set.includes(key)) {
      set.push(key);
      localStorage.setItem("mm_completed_games", JSON.stringify(set));
    }
  } catch {
    /* noop */
  }
}

export function GameScreen({
  gameId,
  profile,
  onProfileUpdate,
  onBack,
}: GameScreenProps) {
  const meta = GAME_META[gameId];
  const [gameState, setGameState] = useState<GameState>("level-select");
  const [level, setLevel] = useState(1);
  const [result, setResult] = useState<GameResult | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpValue, setLevelUpValue] = useState(1);
  const recordSession = useRecordGameSession();
  const queryClient = useQueryClient();
  const sounds = useSoundEffects(soundEnabled);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
  };

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚧</div>
          <p className="text-muted-foreground">Game not found</p>
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mt-4"
          >
            ← Back
          </NeonButton>
        </div>
      </div>
    );
  }

  const handleGameComplete = async (res: {
    score: number;
    correct: number;
    incorrect: number;
  }) => {
    const xpEarned = Math.round(
      res.correct * meta.xpPerCorrect * (1 + (level - 1) * 0.5),
    );
    const gameResult: GameResult = { ...res, level, xpEarned };
    setResult(gameResult);
    setGameState("result");

    if (res.score >= 70) sounds.playLevelComplete();
    sounds.playXpEarned();

    // Track stats
    const totalGames = incrementGamesPlayed();
    const gamesSet = addGameToPlayedSet(gameId);
    incrementGamePlayCount(gameId);
    updateAccuracy(res.correct, res.correct + res.incorrect);
    if (res.score >= 60) markGameCompleted(gameId, level);

    // XP update
    const prevXp = Number(profile.xp);
    const newXpNum = prevXp + xpEarned;
    const newXp = BigInt(newXpNum);

    // Level up check
    const prevLevel = Math.floor(prevXp / 100);
    const newLevel = Math.floor(newXpNum / 100);
    if (newLevel > prevLevel) {
      setLevelUpValue(newLevel);
      setTimeout(() => setShowLevelUp(true), 600);
    }

    // Badge checking
    const newBadges = [...profile.badges];
    const addBadge = (id: string) => {
      if (!newBadges.includes(id)) newBadges.push(id);
    };

    if (!newBadges.includes("first_win")) addBadge("first_win");
    if (newXpNum >= 100) addBadge("xp_100");
    if (newXpNum >= 500) addBadge("xp_500");
    if (newXpNum >= 1000) addBadge("xp_1000");
    if (newXpNum >= 2500) addBadge("xp_2500");
    if (res.score === 100) addBadge("perfect_score");
    if (res.score >= 90) addBadge("math_wizard");
    if (totalGames >= 10) addBadge("ten_games");
    if (gamesSet.size >= 36) addBadge("all_games");
    if (newXpNum >= 1500) addBadge("theme_collector");
    if (Number(profile.streakDays) >= 7) addBadge("week_warrior");
    if (gameId.startsWith("boss-") && res.score >= 60) addBadge("boss_slayer");

    // Explorer badge: playing game 2 grades above
    const gameGradeMap: Record<string, number> = {
      "number-race": 1,
      "number-catcher": 1,
      "addition-rocket": 1,
      "subtraction-blocks": 1,
      "shape-sorter": 1,
      "skip-counter": 1,
      "fraction-battle": 4,
      "decimal-dash": 4,
      "time-master": 4,
      "multiplication-madness": 4,
      "division-dungeon": 4,
      "word-problem-wizard": 4,
      "algebra-escape": 6,
      "geometry-builder": 6,
      "integer-war": 6,
      "ratio-rumble": 6,
      "percentage-power": 6,
      "pattern-detective": 6,
      "quadratic-boss": 9,
      "graph-builder": 9,
      "trig-sniper": 9,
      "statistics-showdown": 9,
      "sequence-solver": 9,
      "coordinate-quest": 9,
      "calculus-runner": 11,
      "matrix-code": 11,
      "probability-strategy": 11,
      "complex-clash": 11,
      "logarithm-lab": 11,
      "vectors-voyage": 11,
    };
    const gameMinGrade = gameGradeMap[gameId];
    if (gameMinGrade && profile.grade + 2 <= gameMinGrade) addBadge("explorer");

    // Drill sergeant badge
    const drillsDone = Number.parseInt(
      localStorage.getItem("mm_drills_done") || "0",
      10,
    );
    if (drillsDone >= 3) addBadge("drill_sergeant");

    const updatedProfile = { ...profile, xp: newXp, badges: newBadges };
    onProfileUpdate(updatedProfile);

    try {
      await recordSession.mutateAsync({
        gameId,
        level,
        score: res.score,
        correctAnswers: res.correct,
        incorrectAnswers: res.incorrect,
        topicId: meta.topicId,
      });
      queryClient.invalidateQueries({ queryKey: ["unlockedLevels", gameId] });
    } catch {
      /* noop */
    }
  };

  const handleNextLevel = () => {
    setLevel((l) => Math.min(l + 1, 3));
    setResult(null);
    setGameState("playing");
  };
  const handleRetry = () => {
    setResult(null);
    setGameState("playing");
  };
  const handleLevelSelect = (lvl: number) => {
    setLevel(lvl);
    setGameState("playing");
  };

  const gameProps = {
    level,
    onComplete: handleGameComplete,
    onBack: () => setGameState("level-select"),
    onCorrect: sounds.playCorrect,
    onWrong: sounds.playWrong,
  };

  const renderGame = () => {
    switch (gameId) {
      case "number-catcher":
        return <NumberCatcher {...gameProps} />;
      case "fraction-battle":
        return <FractionBattle {...gameProps} />;
      case "algebra-escape":
        return <AlgebraEscape {...gameProps} />;
      case "quadratic-boss":
        return <QuadraticBoss {...gameProps} />;
      case "calculus-runner":
        return <CalculusRunner {...gameProps} />;
      case "addition-rocket":
        return <AdditionRocket {...gameProps} />;
      case "subtraction-blocks":
        return <SubtractionBlocks {...gameProps} />;
      case "decimal-dash":
        return <DecimalDash {...gameProps} />;
      case "time-master":
        return <TimeMaster {...gameProps} />;
      case "geometry-builder":
        return <GeometryBuilder {...gameProps} />;
      case "integer-war":
        return <IntegerWar {...gameProps} />;
      case "graph-builder":
        return <GraphBuilder {...gameProps} />;
      case "trig-sniper":
        return <TrigSniper {...gameProps} />;
      case "matrix-code":
        return <MatrixCode {...gameProps} />;
      case "probability-strategy":
        return <ProbabilityStrategy {...gameProps} />;
      case "number-race":
        return <NumberRace {...gameProps} />;
      case "shape-sorter":
        return <ShapeSorter {...gameProps} />;
      case "skip-counter":
        return <SkipCounter {...gameProps} />;
      case "multiplication-madness":
        return <MultiplicationMadness {...gameProps} />;
      case "division-dungeon":
        return <DivisionDungeon {...gameProps} />;
      case "word-problem-wizard":
        return <WordProblemWizard {...gameProps} />;
      case "ratio-rumble":
        return <RatioRumble {...gameProps} />;
      case "percentage-power":
        return <PercentagePower {...gameProps} />;
      case "pattern-detective":
        return <PatternDetective {...gameProps} />;
      case "statistics-showdown":
        return <StatisticsShowdown {...gameProps} />;
      case "sequence-solver":
        return <SequenceSolver {...gameProps} />;
      case "coordinate-quest":
        return <CoordinateQuest {...gameProps} />;
      case "complex-clash":
        return <ComplexClash {...gameProps} />;
      case "logarithm-lab":
        return <LogarithmLab {...gameProps} />;
      case "vectors-voyage":
        return <VectorsVoyage {...gameProps} />;
      case "boss-1-3":
        return <Boss13 {...gameProps} />;
      case "boss-4-5":
        return <Boss45 {...gameProps} />;
      case "boss-6-8":
        return <Boss68 {...gameProps} />;
      case "boss-9-10":
        return <Boss910 {...gameProps} />;
      case "boss-11-12":
        return <Boss1112 {...gameProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <LevelUpOverlay
        show={showLevelUp}
        newLevel={levelUpValue}
        onDone={() => setShowLevelUp(false)}
      />

      <div className="min-h-screen flex flex-col">
        {gameState === "level-select" && (
          <LevelSelectCard
            gameId={gameId}
            meta={meta}
            onSelect={handleLevelSelect}
            onBack={onBack}
          />
        )}

        {gameState === "playing" && (
          <div className="min-h-screen flex flex-col">
            <div className="px-4 pt-8 pb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGameState("level-select")}
                className="text-muted-foreground hover:text-foreground text-sm"
                aria-label="Back to level select"
              >
                ←
              </button>
              <div className="text-xl">{meta.icon}</div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm text-foreground">
                  {meta.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  Level {level}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className="text-xl opacity-60 hover:opacity-100 transition-opacity"
                aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${gameId}-${level}-${gameState}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex-1"
              >
                {renderGame()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {gameState === "result" && result && (
          <ResultCard
            result={result}
            gameName={meta.name}
            onNextLevel={handleNextLevel}
            onRetry={handleRetry}
            onBack={onBack}
          />
        )}
      </div>
    </>
  );
}
