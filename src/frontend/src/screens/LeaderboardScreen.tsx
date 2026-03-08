import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { LeaderboardEntry, PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import { useLeaderboard } from "../hooks/useQueries";

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_GLOW: Record<number, string> = {
  1: "oklch(0.82 0.18 70)",
  2: "oklch(0.75 0.05 265)",
  3: "oklch(0.72 0.16 45)",
};

type GradeFilter = "all" | "1-3" | "4-5" | "6-8" | "9-10" | "11-12";
type SortMode = "xp" | "streak";

function getGradeGroupKey(grade: number): string {
  if (grade <= 3) return "1-3";
  if (grade <= 5) return "4-5";
  if (grade <= 8) return "6-8";
  if (grade <= 10) return "9-10";
  return "11-12";
}

const GRADE_GROUP_COLORS: Record<string, string> = {
  "1-3": "oklch(0.78 0.2 195)",
  "4-5": "oklch(0.7 0.22 280)",
  "6-8": "oklch(0.72 0.22 155)",
  "9-10": "oklch(0.82 0.18 70)",
  "11-12": "oklch(0.72 0.22 25)",
};

// Fake sample entries to show something interesting while backend loads
const SAMPLE_ENTRIES: LeaderboardEntry[] = [
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
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("xp");

  // Use backend data if available, else sample
  const sourceEntries = entries.length > 0 ? entries : SAMPLE_ENTRIES;

  const filteredEntries = useMemo(() => {
    return sourceEntries
      .filter((e) =>
        gradeFilter === "all"
          ? true
          : getGradeGroupKey(e.grade) === gradeFilter,
      )
      .sort((a, b) => (sortMode === "xp" ? Number(b.xp) - Number(a.xp) : 0));
  }, [sourceEntries, gradeFilter, sortMode]);

  // Check if current user is in leaderboard
  const isCurrentUser = (name: string) => name === profile.name;

  const maxXP = Math.max(...filteredEntries.map((e) => Number(e.xp)), 1);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm"
          data-ocid="leaderboard.back.button"
        >
          ← Back
        </button>
        <h1 className="font-display text-2xl font-black gradient-text-game">
          Leaderboard
        </h1>
        <div className="text-2xl ml-auto">🏆</div>
      </header>

      {/* Top 3 podium */}
      {!isLoading && filteredEntries.length >= 3 && (
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
                  {filteredEntries[1].name}
                </div>
                <div className="text-slate-400 text-xs">
                  {Number(filteredEntries[1].xp)} XP
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
                  {filteredEntries[0].name}
                </div>
                <div className="text-amber-400 text-xs font-semibold">
                  {Number(filteredEntries[0].xp)} XP
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
                  {filteredEntries[2].name}
                </div>
                <div className="text-amber-800/80 text-xs">
                  {Number(filteredEntries[2].xp)} XP
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Filters + Sort */}
      <div className="px-6 mb-4 space-y-2">
        {/* Grade filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {(["all", "1-3", "4-5", "6-8", "9-10", "11-12"] as const).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setGradeFilter(filter)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={
                  gradeFilter === filter
                    ? {
                        background:
                          filter === "all"
                            ? "oklch(0.78 0.2 195 / 0.2)"
                            : `${GRADE_GROUP_COLORS[filter].replace(")", " / 0.2)")}`,
                        border: `1px solid ${filter === "all" ? "oklch(0.78 0.2 195 / 0.6)" : `${GRADE_GROUP_COLORS[filter].replace(")", " / 0.6)")}`}`,
                        color:
                          filter === "all"
                            ? "oklch(0.85 0.18 195)"
                            : GRADE_GROUP_COLORS[filter],
                        boxShadow:
                          filter === "all"
                            ? "0 0 8px oklch(0.78 0.2 195 / 0.2)"
                            : `0 0 8px ${GRADE_GROUP_COLORS[filter].replace(")", " / 0.2)")}`,
                      }
                    : {
                        background: "oklch(0.12 0.02 265 / 0.6)",
                        border: "1px solid oklch(0.25 0.04 270 / 0.4)",
                        color: "oklch(0.5 0.04 270)",
                      }
                }
                data-ocid={`leaderboard.grade_filter.button.${filter}`}
              >
                {filter === "all" ? "All Grades" : `Gr ${filter}`}
              </button>
            ),
          )}
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid oklch(0.25 0.04 270 / 0.4)" }}
          >
            <button
              type="button"
              onClick={() => setSortMode("xp")}
              className="px-4 py-1.5 text-xs font-bold transition-all"
              style={
                sortMode === "xp"
                  ? {
                      background: "oklch(0.78 0.2 195 / 0.2)",
                      color: "oklch(0.85 0.18 195)",
                    }
                  : {
                      background: "oklch(0.1 0.02 265 / 0.6)",
                      color: "oklch(0.5 0.04 270)",
                    }
              }
              data-ocid="leaderboard.sort_xp.toggle"
            >
              ⚡ XP
            </button>
            <button
              type="button"
              onClick={() => setSortMode("streak")}
              className="px-4 py-1.5 text-xs font-bold transition-all"
              style={
                sortMode === "streak"
                  ? {
                      background: "oklch(0.82 0.18 70 / 0.2)",
                      color: "oklch(0.9 0.18 70)",
                    }
                  : {
                      background: "oklch(0.1 0.02 265 / 0.6)",
                      color: "oklch(0.5 0.04 270)",
                    }
              }
              data-ocid="leaderboard.sort_streak.toggle"
            >
              🔥 Streak
            </button>
          </div>
        </div>
      </div>

      {/* Full list */}
      <div className="flex-1 px-6 pb-8 space-y-2">
        <h2 className="font-display text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
          Rankings ({filteredEntries.length})
        </h2>

        {isLoading
          ? (["s0", "s1", "s2", "s3", "s4"] as const).map((sk) => (
              <Skeleton key={sk} className="h-16 w-full rounded-xl" />
            ))
          : filteredEntries.map((entry, i) => {
              const isSelf = isCurrentUser(entry.name);
              const rank = i + 1;
              const glowColor = RANK_GLOW[rank];
              const xpPct = maxXP > 0 ? (Number(entry.xp) / maxXP) * 100 : 0;
              const gradeColor =
                GRADE_GROUP_COLORS[getGradeGroupKey(entry.grade)];

              return (
                <motion.div
                  key={`${entry.name}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all
                  ${isSelf ? "border-neon-cyan/50 bg-neon-cyan/5" : "card-neon border-border/50"}
                  `}
                  style={
                    isSelf
                      ? { boxShadow: "0 0 15px oklch(0.78 0.2 195 / 0.15)" }
                      : rank <= 3 && glowColor
                        ? {
                            boxShadow: `0 0 12px ${glowColor.replace(")", " / 0.1)")}`,
                            borderColor: `${glowColor.replace(")", " / 0.3)")}`,
                          }
                        : {}
                  }
                  data-ocid={`leaderboard.item.${rank}`}
                >
                  <div className="w-8 text-center font-display font-bold text-sm flex-shrink-0">
                    {rank <= 3 ? (
                      <span className="text-xl">{RANK_MEDALS[rank - 1]}</span>
                    ) : (
                      <span className="text-muted-foreground">#{rank}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-display font-bold text-sm truncate ${isSelf ? "text-neon-cyan" : ""}`}
                        style={
                          !isSelf && rank <= 3 && glowColor
                            ? {
                                color: glowColor,
                                textShadow: `0 0 8px ${glowColor.replace(")", " / 0.4)")}`,
                              }
                            : !isSelf
                              ? { color: "oklch(0.88 0.06 265)" }
                              : {}
                        }
                      >
                        {entry.name}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-neon-cyan/70">
                            (you)
                          </span>
                        )}
                      </span>
                      {/* Grade badge */}
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{
                          background: `${gradeColor.replace(")", " / 0.12)")}`,
                          color: gradeColor,
                          border: `1px solid ${gradeColor.replace(")", " / 0.3)")}`,
                        }}
                      >
                        G{entry.grade}
                      </span>
                    </div>

                    {/* XP mini bar */}
                    <div
                      className="w-full h-1 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.14 0.02 270 / 0.7)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isSelf
                            ? "oklch(0.78 0.2 195)"
                            : rank <= 3 && glowColor
                              ? glowColor
                              : "oklch(0.65 0.22 255)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPct}%` }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          delay: i * 0.03,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className="font-mono-game font-bold text-sm tabular-nums"
                      style={{
                        color: isSelf
                          ? "oklch(0.78 0.2 195)"
                          : rank <= 3 && glowColor
                            ? glowColor
                            : "oklch(0.75 0.08 265)",
                      }}
                    >
                      {Number(entry.xp).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-xs">XP</div>
                  </div>
                </motion.div>
              );
            })}

        {/* Current user if not in filtered list */}
        {!isLoading && !filteredEntries.some((e) => isCurrentUser(e.name)) && (
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

        {/* Empty filtered state */}
        {!isLoading && filteredEntries.length === 0 && (
          <div
            className="py-10 text-center"
            data-ocid="leaderboard.empty_state"
          >
            <div className="text-4xl mb-3 opacity-40">📋</div>
            <p className="text-muted-foreground text-sm">
              No players in Grade {gradeFilter} yet
            </p>
            <button
              type="button"
              onClick={() => setGradeFilter("all")}
              className="mt-3 text-xs text-neon-cyan hover:underline"
            >
              Show all grades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
