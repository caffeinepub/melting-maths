import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import { useLeaderboard } from "../hooks/useQueries";

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = [
  "text-amber-400 border-amber-400/40",
  "text-slate-300 border-slate-300/40",
  "text-amber-700 border-amber-700/40",
];

// Fake sample entries to show something interesting while backend loads
const SAMPLE_ENTRIES = [
  { name: "StarMath99", grade: 11, xp: BigInt(2450) },
  { name: "AlgebraKing", grade: 9, xp: BigInt(1820) },
  { name: "FractionQueen", grade: 5, xp: BigInt(1540) },
  { name: "CalculusAce", grade: 12, xp: BigInt(1200) },
  { name: "NumberNinja", grade: 3, xp: BigInt(980) },
  { name: "PiMaster", grade: 7, xp: BigInt(870) },
  { name: "MathWizard42", grade: 10, xp: BigInt(740) },
];

export function LeaderboardScreen({ profile, onBack }: LeaderboardScreenProps) {
  const { data: entries = [], isLoading } = useLeaderboard();

  // Use backend data if available, else sample
  const displayEntries = entries.length > 0 ? entries : SAMPLE_ENTRIES;

  // Check if current user is in leaderboard
  const isCurrentUser = (name: string) => name === profile.name;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-black gradient-text-game">
          Leaderboard
        </h1>
        <div className="text-2xl ml-auto">🏆</div>
      </header>

      {/* Top 3 podium */}
      {!isLoading && displayEntries.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-6"
        >
          <div className="flex items-end justify-center gap-3">
            {/* 2nd place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex-1 text-center"
            >
              <div className="text-2xl mb-1">🥈</div>
              <div
                className="rounded-t-2xl px-2 py-3 h-20 flex flex-col items-center justify-end"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0.25 0.04 270), oklch(0.12 0.02 270))",
                  border: "1px solid oklch(0.4 0.06 270 / 0.5)",
                }}
              >
                <div className="font-display font-bold text-xs text-slate-300 truncate w-full text-center">
                  {displayEntries[1].name}
                </div>
                <div className="text-slate-400 text-xs">
                  {Number(displayEntries[1].xp)} XP
                </div>
              </div>
            </motion.div>

            {/* 1st place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex-1 text-center"
            >
              <div className="text-3xl mb-1">🥇</div>
              <div
                className="rounded-t-2xl px-2 py-3 h-28 flex flex-col items-center justify-end"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0.25 0.08 65), oklch(0.15 0.04 65))",
                  border: "1px solid oklch(0.6 0.15 65 / 0.6)",
                  boxShadow: "0 0 20px oklch(0.6 0.15 65 / 0.25)",
                }}
              >
                <div className="font-display font-bold text-sm text-amber-300 truncate w-full text-center">
                  {displayEntries[0].name}
                </div>
                <div className="text-amber-400 text-xs font-semibold">
                  {Number(displayEntries[0].xp)} XP
                </div>
              </div>
            </motion.div>

            {/* 3rd place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center"
            >
              <div className="text-2xl mb-1">🥉</div>
              <div
                className="rounded-t-2xl px-2 py-3 h-16 flex flex-col items-center justify-end"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0.22 0.05 50), oklch(0.12 0.02 50))",
                  border: "1px solid oklch(0.45 0.08 50 / 0.5)",
                }}
              >
                <div className="font-display font-bold text-xs text-amber-700/90 truncate w-full text-center">
                  {displayEntries[2].name}
                </div>
                <div className="text-amber-800/80 text-xs">
                  {Number(displayEntries[2].xp)} XP
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Full list */}
      <div className="flex-1 px-6 pb-8 space-y-2">
        <h2 className="font-display text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
          Rankings
        </h2>

        {isLoading
          ? (["s0", "s1", "s2", "s3", "s4"] as const).map((sk) => (
              <Skeleton key={sk} className="h-16 w-full rounded-xl" />
            ))
          : displayEntries.map((entry, i) => {
              const isSelf = isCurrentUser(entry.name);
              const rank = i + 1;
              return (
                <motion.div
                  key={`${entry.name}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                  ${
                    isSelf
                      ? "border-neon-cyan/50 bg-neon-cyan/5"
                      : "card-neon border-border/50"
                  }
                `}
                  style={
                    isSelf
                      ? { boxShadow: "0 0 15px oklch(0.78 0.2 195 / 0.15)" }
                      : {}
                  }
                >
                  <div
                    className={`w-8 text-center font-mono-game font-bold text-sm ${rank <= 3 ? RANK_COLORS[rank - 1] : "text-muted-foreground"}`}
                  >
                    {rank <= 3 ? RANK_MEDALS[rank - 1] : `#${rank}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-display font-bold text-sm truncate ${isSelf ? "text-neon-cyan" : "text-foreground"}`}
                    >
                      {entry.name}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-neon-cyan/70">
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Grade {entry.grade}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono-game font-bold text-sm ${isSelf ? "text-neon-cyan" : "text-foreground/80"}`}
                    >
                      {Number(entry.xp).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-xs">XP</div>
                  </div>
                </motion.div>
              );
            })}

        {/* Current user stats if not in top list */}
        {!isLoading && !displayEntries.some((e) => isCurrentUser(e.name)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-4 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5"
            style={{ boxShadow: "0 0 15px oklch(0.78 0.2 195 / 0.1)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center font-mono-game text-sm text-muted-foreground">
                ...
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm text-neon-cyan">
                  {profile.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  Grade {profile.grade} • You
                </div>
              </div>
              <div className="font-mono-game font-bold text-sm text-neon-cyan">
                {Number(profile.xp).toLocaleString()} XP
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
