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
  games: Array<{
    id: string;
    name: string;
    icon: string;
    topic: string;
    implemented: boolean;
    color: "cyan" | "purple" | "blue";
  }>;
}

const GRADE_GAMES: GradeGames[] = [
  {
    grades: [1, 2, 3],
    label: "Grades 1–3",
    games: [
      {
        id: "number-catcher",
        name: "Number Catcher",
        icon: "🎯",
        topic: "Addition",
        implemented: true,
        color: "cyan",
      },
      {
        id: "addition-rocket",
        name: "Addition Rocket",
        icon: "🚀",
        topic: "Addition",
        implemented: true,
        color: "purple",
      },
      {
        id: "subtraction-blocks",
        name: "Subtraction Blocks",
        icon: "🧊",
        topic: "Subtraction",
        implemented: true,
        color: "blue",
      },
    ],
  },
  {
    grades: [4, 5],
    label: "Grades 4–5",
    games: [
      {
        id: "fraction-battle",
        name: "Fraction Battle Arena",
        icon: "⚔️",
        topic: "Fractions",
        implemented: true,
        color: "purple",
      },
      {
        id: "decimal-dash",
        name: "Decimal Dash",
        icon: "💨",
        topic: "Decimals",
        implemented: true,
        color: "cyan",
      },
      {
        id: "time-master",
        name: "Time Master",
        icon: "⏰",
        topic: "Time",
        implemented: true,
        color: "blue",
      },
    ],
  },
  {
    grades: [6, 7, 8],
    label: "Grades 6–8",
    games: [
      {
        id: "algebra-escape",
        name: "Algebra Escape Room",
        icon: "🔐",
        topic: "Algebra",
        implemented: true,
        color: "blue",
      },
      {
        id: "geometry-builder",
        name: "Geometry Builder",
        icon: "📐",
        topic: "Geometry",
        implemented: true,
        color: "cyan",
      },
      {
        id: "integer-war",
        name: "Integer War",
        icon: "⚡",
        topic: "Integers",
        implemented: true,
        color: "purple",
      },
    ],
  },
  {
    grades: [9, 10],
    label: "Grades 9–10",
    games: [
      {
        id: "quadratic-boss",
        name: "Quadratic Boss Fight",
        icon: "👾",
        topic: "Quadratics",
        implemented: true,
        color: "purple",
      },
      {
        id: "graph-builder",
        name: "Graph Builder Challenge",
        icon: "📈",
        topic: "Graphs",
        implemented: true,
        color: "cyan",
      },
      {
        id: "trig-sniper",
        name: "Trigonometry Sniper",
        icon: "🎯",
        topic: "Trigonometry",
        implemented: true,
        color: "blue",
      },
    ],
  },
  {
    grades: [11, 12],
    label: "Grades 11–12",
    games: [
      {
        id: "calculus-runner",
        name: "Calculus Runner",
        icon: "🏃",
        topic: "Calculus",
        implemented: true,
        color: "cyan",
      },
      {
        id: "matrix-code",
        name: "Matrix Code Breaker",
        icon: "💻",
        topic: "Matrices",
        implemented: true,
        color: "blue",
      },
      {
        id: "probability-strategy",
        name: "Probability Strategy Game",
        icon: "🎲",
        topic: "Probability",
        implemented: true,
        color: "purple",
      },
    ],
  },
];

function LevelDots({ gameId, color }: { gameId: string; color: string }) {
  const { data: unlocked = [1] } = useUnlockedLevels(gameId);
  const totalLevels = 3;

  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: totalLevels }, (_, i) => {
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
  // Show all grades but highlight current
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

              <div className="grid grid-cols-1 gap-3">
                {group.games.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.06 + i * 0.05 }}
                    className={`rounded-2xl border p-4 flex items-center gap-4 transition-all
                      ${
                        game.implemented
                          ? "card-neon card-neon-hover cursor-pointer hover:border-neon-cyan/60"
                          : "opacity-50 cursor-not-allowed bg-card/30 border-border/50"
                      }
                    `}
                    onClick={() => game.implemented && onSelectGame(game.id)}
                    role={game.implemented ? "button" : undefined}
                    tabIndex={game.implemented ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && game.implemented)
                        onSelectGame(game.id);
                    }}
                  >
                    <div className="text-3xl flex-shrink-0">{game.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-foreground truncate">
                        {game.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {game.topic}
                      </div>
                      {game.implemented && (
                        <LevelDots gameId={game.id} color={game.color} />
                      )}
                    </div>
                    {game.implemented ? (
                      <NeonButton variant={game.color} size="sm">
                        {isCurrent ? "Play! ⭐" : "Play!"}
                      </NeonButton>
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold px-2 py-1 rounded-lg bg-border/50">
                        Soon
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
