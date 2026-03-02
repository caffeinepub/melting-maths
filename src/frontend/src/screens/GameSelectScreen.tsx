import { motion } from "motion/react";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import { useUnlockedLevels } from "../hooks/useQueries";

interface GameSelectScreenProps {
  profile: PlayerProfile;
  onSelectGame: (gameId: string) => void;
  onBack: () => void;
}

interface GradeGames {
  grades: number[];
  label: string;
  bossId: string;
  games: Array<{
    id: string;
    name: string;
    icon: string;
    topic: string;
    color: "cyan" | "purple" | "blue";
  }>;
}

const GRADE_GAMES: GradeGames[] = [
  {
    grades: [1, 2, 3],
    label: "Grades 1–3",
    bossId: "boss-1-3",
    games: [
      {
        id: "number-catcher",
        name: "Number Catcher",
        icon: "🎯",
        topic: "Addition",
        color: "cyan",
      },
      {
        id: "addition-rocket",
        name: "Addition Rocket",
        icon: "🚀",
        topic: "Addition",
        color: "purple",
      },
      {
        id: "subtraction-blocks",
        name: "Subtraction Blocks",
        icon: "🧊",
        topic: "Subtraction",
        color: "blue",
      },
      {
        id: "number-race",
        name: "Number Race",
        icon: "⭐",
        topic: "Counting",
        color: "cyan",
      },
      {
        id: "shape-sorter",
        name: "Shape Sorter",
        icon: "🔺",
        topic: "Shapes",
        color: "purple",
      },
      {
        id: "skip-counter",
        name: "Skip Counter",
        icon: "🔢",
        topic: "Skip Counting",
        color: "blue",
      },
    ],
  },
  {
    grades: [4, 5],
    label: "Grades 4–5",
    bossId: "boss-4-5",
    games: [
      {
        id: "fraction-battle",
        name: "Fraction Battle Arena",
        icon: "⚔️",
        topic: "Fractions",
        color: "purple",
      },
      {
        id: "decimal-dash",
        name: "Decimal Dash",
        icon: "💨",
        topic: "Decimals",
        color: "cyan",
      },
      {
        id: "time-master",
        name: "Time Master",
        icon: "⏰",
        topic: "Time",
        color: "blue",
      },
      {
        id: "multiplication-madness",
        name: "Multiplication Madness",
        icon: "⚡",
        topic: "Multiplication",
        color: "cyan",
      },
      {
        id: "division-dungeon",
        name: "Division Dungeon",
        icon: "🏰",
        topic: "Division",
        color: "purple",
      },
      {
        id: "word-problem-wizard",
        name: "Word Problem Wizard",
        icon: "🧙",
        topic: "Word Problems",
        color: "blue",
      },
    ],
  },
  {
    grades: [6, 7, 8],
    label: "Grades 6–8",
    bossId: "boss-6-8",
    games: [
      {
        id: "algebra-escape",
        name: "Algebra Escape Room",
        icon: "🔐",
        topic: "Algebra",
        color: "blue",
      },
      {
        id: "geometry-builder",
        name: "Geometry Builder",
        icon: "📐",
        topic: "Geometry",
        color: "cyan",
      },
      {
        id: "integer-war",
        name: "Integer War",
        icon: "⚡",
        topic: "Integers",
        color: "purple",
      },
      {
        id: "ratio-rumble",
        name: "Ratio Rumble",
        icon: "⚖️",
        topic: "Ratios",
        color: "cyan",
      },
      {
        id: "percentage-power",
        name: "Percentage Power",
        icon: "💯",
        topic: "Percentages",
        color: "blue",
      },
      {
        id: "pattern-detective",
        name: "Pattern Detective",
        icon: "🔍",
        topic: "Patterns",
        color: "purple",
      },
    ],
  },
  {
    grades: [9, 10],
    label: "Grades 9–10",
    bossId: "boss-9-10",
    games: [
      {
        id: "quadratic-boss",
        name: "Quadratic Boss Fight",
        icon: "👾",
        topic: "Quadratics",
        color: "purple",
      },
      {
        id: "graph-builder",
        name: "Graph Builder Challenge",
        icon: "📈",
        topic: "Graphs",
        color: "cyan",
      },
      {
        id: "trig-sniper",
        name: "Trigonometry Sniper",
        icon: "🎯",
        topic: "Trigonometry",
        color: "blue",
      },
      {
        id: "statistics-showdown",
        name: "Statistics Showdown",
        icon: "📊",
        topic: "Statistics",
        color: "cyan",
      },
      {
        id: "sequence-solver",
        name: "Sequence Solver",
        icon: "🧮",
        topic: "Sequences",
        color: "purple",
      },
      {
        id: "coordinate-quest",
        name: "Coordinate Quest",
        icon: "🗺️",
        topic: "Coordinates",
        color: "blue",
      },
    ],
  },
  {
    grades: [11, 12],
    label: "Grades 11–12",
    bossId: "boss-11-12",
    games: [
      {
        id: "calculus-runner",
        name: "Calculus Runner",
        icon: "🏃",
        topic: "Calculus",
        color: "cyan",
      },
      {
        id: "matrix-code",
        name: "Matrix Code Breaker",
        icon: "💻",
        topic: "Matrices",
        color: "blue",
      },
      {
        id: "probability-strategy",
        name: "Probability Strategy Game",
        icon: "🎲",
        topic: "Probability",
        color: "purple",
      },
      {
        id: "complex-clash",
        name: "Complex Clash",
        icon: "⚡",
        topic: "Complex Numbers",
        color: "cyan",
      },
      {
        id: "logarithm-lab",
        name: "Logarithm Lab",
        icon: "🧪",
        topic: "Logarithms",
        color: "purple",
      },
      {
        id: "vectors-voyage",
        name: "Vectors Voyage",
        icon: "🧭",
        topic: "Vectors",
        color: "blue",
      },
    ],
  },
];

function LevelDots({ gameId, color }: { gameId: string; color: string }) {
  const { data: unlocked = [1] } = useUnlockedLevels(gameId);
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: 3 }, (_, i) => {
        const lvl = i + 1;
        const isUnlocked = unlocked.includes(lvl);
        return (
          <div
            key={lvl}
            className={`w-2 h-2 rounded-full transition-all ${
              isUnlocked
                ? color === "cyan"
                  ? "bg-neon-cyan shadow-neon-sm-cyan"
                  : color === "purple"
                    ? "bg-neon-purple shadow-neon-sm-purple"
                    : "bg-neon-blue shadow-neon-sm-cyan"
                : "bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}

export function GameSelectScreen({
  profile,
  onSelectGame,
  onBack,
}: GameSelectScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            aria-label="Go back"
          >
            ← Back
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-black gradient-text-game">
            Game Select
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Grade {profile.grade} • Choose your battle! ⚔️
          </p>
        </motion.div>
      </header>

      <div className="flex-1 px-6 pb-8 space-y-6">
        {GRADE_GAMES.map((group, gi) => {
          const isCurrent = group.grades.includes(profile.grade);
          return (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <h2
                  className={`font-display text-sm font-bold ${isCurrent ? "text-neon-cyan" : "text-muted-foreground"}`}
                >
                  {group.label}
                </h2>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                    YOUR GRADE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {group.games.map((game, i) => (
                  <motion.button
                    type="button"
                    key={game.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.06 + i * 0.04 }}
                    className="w-full rounded-2xl border p-3 flex items-center gap-3 transition-all card-neon card-neon-hover card-pulse-hover cursor-pointer hover:border-neon-cyan/60 text-left"
                    onClick={() => onSelectGame(game.id)}
                  >
                    <div className="text-2xl flex-shrink-0">{game.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-foreground truncate">
                        {game.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {game.topic}
                      </div>
                      <LevelDots gameId={game.id} color={game.color} />
                    </div>
                    <NeonButton variant={game.color} size="sm">
                      {isCurrent ? "Play! ⭐" : "Play!"}
                    </NeonButton>
                  </motion.button>
                ))}

                {/* Boss Battle Card */}
                <motion.button
                  type="button"
                  key={group.bossId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.06 + group.games.length * 0.04 }}
                  className="w-full rounded-2xl p-3 flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.01] text-left"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.1 0.04 25 / 0.8), oklch(0.08 0.02 265))",
                    border: "1px solid oklch(0.75 0.2 50 / 0.5)",
                    boxShadow: "0 0 15px oklch(0.65 0.22 25 / 0.15)",
                  }}
                  onClick={() => onSelectGame(group.bossId)}
                >
                  <div className="text-2xl flex-shrink-0">⚔️</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display font-black text-sm"
                        style={{ color: "oklch(0.85 0.18 50)" }}
                      >
                        BOSS BATTLE
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-black"
                        style={{
                          background: "oklch(0.65 0.22 25 / 0.3)",
                          color: "oklch(0.85 0.18 50)",
                          border: "1px solid oklch(0.75 0.2 50 / 0.5)",
                        }}
                      >
                        ⚔️ BOSS
                      </span>
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "oklch(0.7 0.1 50)" }}
                    >
                      Ultimate {group.label} challenge
                    </div>
                  </div>
                  <span
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.2 0.06 25), oklch(0.15 0.04 265))",
                      border: "1px solid oklch(0.75 0.2 50 / 0.6)",
                      color: "oklch(0.85 0.18 50)",
                    }}
                  >
                    Fight!
                  </span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
