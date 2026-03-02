import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import type { PlayerProfile } from "../backend.d";
import { LevelUpOverlay } from "../components/LevelUpOverlay";
import { NeonButton } from "../components/NeonButton";
import { AdditionRocket } from "../components/games/AdditionRocket";
import { AlgebraEscape } from "../components/games/AlgebraEscape";
import { CalculusRunner } from "../components/games/CalculusRunner";
import { DecimalDash } from "../components/games/DecimalDash";
import { FractionBattle } from "../components/games/FractionBattle";
import { GeometryBuilder } from "../components/games/GeometryBuilder";
import { GraphBuilder } from "../components/games/GraphBuilder";
import { IntegerWar } from "../components/games/IntegerWar";
import { MatrixCode } from "../components/games/MatrixCode";
import { NumberCatcher } from "../components/games/NumberCatcher";
import { ProbabilityStrategy } from "../components/games/ProbabilityStrategy";
import { QuadraticBoss } from "../components/games/QuadraticBoss";
import { SubtractionBlocks } from "../components/games/SubtractionBlocks";
import { TimeMaster } from "../components/games/TimeMaster";
import { TrigSniper } from "../components/games/TrigSniper";
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
  {
    name: string;
    icon: string;
    topicId: string;
    xpPerCorrect: number;
  }
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
  onNextLevel,
  onRetry,
  onBack,
}: {
  result: GameResult;
  onNextLevel: () => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const isGood = result.score >= 70;
  const messages = isGood
    ? SHINCHEN_ENCOURAGEMENT_GOOD
    : SHINCHEN_ENCOURAGEMENT_BAD;
  const message = messages[Math.floor(Math.random() * messages.length)];

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
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
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

function getGamesPlayed(): number {
  try {
    return Number.parseInt(localStorage.getItem("mm_games_played") || "0", 10);
  } catch {
    return 0;
  }
}

function incrementGamesPlayed(): number {
  const n = getGamesPlayed() + 1;
  try {
    localStorage.setItem("mm_games_played", String(n));
  } catch {
    /* noop */
  }
  return n;
}

function getGamesPlayedSet(): Set<string> {
  try {
    const raw = localStorage.getItem("mm_games_played_set");
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* noop */
  }
  return new Set();
}

function addGameToPlayedSet(gId: string): Set<string> {
  const s = getGamesPlayedSet();
  s.add(gId);
  try {
    localStorage.setItem("mm_games_played_set", JSON.stringify(Array.from(s)));
  } catch {
    /* noop */
  }
  return s;
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

    // Sound effects
    if (res.score >= 70) sounds.playLevelComplete();
    sounds.playXpEarned();

    // Track games played
    const totalGames = incrementGamesPlayed();
    const gamesSet = addGameToPlayedSet(gameId);

    // Update local profile optimistically
    const prevXp = Number(profile.xp);
    const newXpNum = prevXp + xpEarned;
    const newXp = BigInt(newXpNum);

    // Check XP level-up
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

    // Existing badges check
    if (newBadges.length === 0 || !newBadges.includes("first_win"))
      addBadge("first_win");
    if (newXpNum >= 100) addBadge("xp_100");
    if (newXpNum >= 500) addBadge("xp_500");
    if (newXpNum >= 1000) addBadge("xp_1000");
    if (newXpNum >= 2500) addBadge("xp_2500");
    if (res.score === 100) addBadge("perfect_score");
    if (res.score >= 90) addBadge("math_wizard");
    if (totalGames >= 10) addBadge("ten_games");
    if (gamesSet.size >= 15) addBadge("all_games");

    const updatedProfile = { ...profile, xp: newXp, badges: newBadges };
    onProfileUpdate(updatedProfile);

    // Record to backend
    await recordSession.mutateAsync({
      gameId,
      level,
      score: res.score,
      correctAnswers: res.correct,
      incorrectAnswers: res.incorrect,
      topicId: meta.topicId,
    });

    queryClient.invalidateQueries({ queryKey: ["unlockedLevels", gameId] });
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
            {/* Game header */}
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
              {/* Sound toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="text-xl opacity-60 hover:opacity-100 transition-opacity"
                aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
                title={soundEnabled ? "Sound ON" : "Sound OFF"}
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
            onNextLevel={handleNextLevel}
            onRetry={handleRetry}
            onBack={onBack}
          />
        )}
      </div>
    </>
  );
}
