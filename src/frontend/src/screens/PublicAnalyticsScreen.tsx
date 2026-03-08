import {
  type Variants,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../backend.d";
import {
  useGetWeeklyTopPlayers,
  useLeaderboard,
  usePublicStats,
} from "../hooks/useQueries";

interface PublicAnalyticsScreenProps {
  onBack: () => void;
}

// Stagger animation variants
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Animated counting number
function AnimatedNumber({
  value,
  color,
  className,
}: {
  value: number;
  color: string;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.6,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <motion.span style={{ color }} className={className}>
      {display}
    </motion.span>
  );
}

// Pulsing LIVE badge
function LiveBadge() {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: "oklch(0.12 0.06 155 / 0.8)",
        border: "1px solid oklch(0.72 0.22 155 / 0.5)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse-glow"
        style={{ background: "oklch(0.72 0.22 155)" }}
      />
      <span
        className="font-display text-xs font-black tracking-widest"
        style={{ color: "oklch(0.72 0.22 155)" }}
      >
        LIVE
      </span>
    </div>
  );
}

// Section header
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h2
        className="font-display text-xs font-bold tracking-widest uppercase"
        style={{ color: "oklch(0.6 0.04 270)" }}
      >
        {title}
      </h2>
    </div>
  );
}

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

const GRADE_GROUP_GAMES: Record<string, string[]> = {
  "1-3": ["Number Catcher", "Addition Rocket", "Subtraction Blocks"],
  "4-5": ["Fraction Battle", "Decimal Dash", "Time Master"],
  "6-8": ["Algebra Escape", "Geometry Builder", "Integer War"],
  "9-10": ["Quadratic Boss", "Graph Builder", "Trig Sniper"],
  "11-12": ["Calculus Runner", "Matrix Code", "Probability"],
};

// Medal colors for top 3
const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const RANK_GLOW: Record<number, string> = {
  1: "oklch(0.82 0.18 70)",
  2: "oklch(0.75 0.05 265)",
  3: "oklch(0.72 0.16 45)",
};
const RANK_CROWN: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🏅" };
const RANK_LABEL: Record<number, string> = {
  1: "Gold",
  2: "Silver",
  3: "Bronze",
};

type GradeFilter = "all" | "1-3" | "4-5" | "6-8" | "9-10" | "11-12";
type SortMode = "xp" | "streak";

export function PublicAnalyticsScreen({ onBack }: PublicAnalyticsScreenProps) {
  const { statsQuery } = usePublicStats();
  const { data: leaderboardData = [] } = useLeaderboard();
  const { data: weeklyTop = [] } = useGetWeeklyTopPlayers();
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("xp");

  const VISITS_OFFSET = 230;
  const totalVisits =
    Number(statsQuery.data?.totalVisits ?? BigInt(0)) + VISITS_OFFSET;

  // Use leaderboard from either source, prefer richer one
  const leaderboard: LeaderboardEntry[] =
    leaderboardData.length > 0
      ? leaderboardData
      : (statsQuery.data?.leaderboard ?? []);

  // Derived stats
  const totalPlayers = leaderboard.length;
  const totalXP = leaderboard.reduce((sum, e) => sum + Number(e.xp), 0);
  const activeUsers = Number(statsQuery.data?.activeUsers ?? BigInt(0));

  // Grade distribution
  const gradeGroups = ["1-3", "4-5", "6-8", "9-10", "11-12"];
  const gradeDistribution = gradeGroups.map((key) => {
    const count = leaderboard.filter(
      (e) => getGradeGroupKey(e.grade) === key,
    ).length;
    return { key, count, label: `Gr ${key}`, color: GRADE_GROUP_COLORS[key] };
  });
  const maxGradeCount = Math.max(...gradeDistribution.map((g) => g.count), 1);

  // Filtered leaderboard
  const filteredLeaderboard = leaderboard
    .filter((e) =>
      gradeFilter === "all" ? true : getGradeGroupKey(e.grade) === gradeFilter,
    )
    .sort((a, b) => (sortMode === "xp" ? Number(b.xp) - Number(a.xp) : 0))
    .slice(0, 20);

  const maxXP = Math.max(...leaderboard.map((e) => Number(e.xp)), 1);

  const isLoading = statsQuery.isLoading;

  const statCards = [
    {
      label: "Total Visits",
      value: totalVisits,
      icon: "🌍",
      color: "oklch(0.78 0.2 195)",
      ocid: "public_analytics.visits.card",
      wide: false,
    },
    {
      label: "Total Players",
      value: totalPlayers,
      icon: "👥",
      color: "oklch(0.7 0.22 280)",
      ocid: "public_analytics.players.card",
      wide: false,
    },
    {
      label: "Total XP Earned",
      value: totalXP,
      icon: "⚡",
      color: "oklch(0.82 0.18 70)",
      ocid: "public_analytics.xp.card",
      wide: false,
    },
    {
      label: "Active Now",
      value: activeUsers,
      icon: "🟢",
      color: "oklch(0.72 0.22 155)",
      ocid: "public_analytics.active_users.card",
      wide: false,
      isLive: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-1 flex-shrink-0"
          data-ocid="public_analytics.back.button"
        >
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl font-black text-glow-cyan leading-tight">
              🌍 LIVE STATS
            </h1>
            <LiveBadge />
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            {isLoading ? "Fetching latest data..." : "Auto-refreshes every 30s"}
          </p>
        </div>
      </header>

      {/* Scrollable content */}
      <motion.div
        className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Stat Cards 2x2 grid ─────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.stats.card"
        >
          <SectionHeader icon="📊" title="Global Overview" />
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl p-4 flex flex-col gap-1.5 cursor-default"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
                  border: `1px solid ${stat.color.replace(")", " / 0.25)")}`,
                  boxShadow: `0 0 16px ${stat.color.replace(")", " / 0.06)")}`,
                }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 0 28px ${stat.color.replace(")", " / 0.3)")}`,
                  borderColor: `${stat.color.replace(")", " / 0.5)")}`,
                }}
                data-ocid={stat.ocid}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl">{stat.icon}</div>
                  {stat.isLive && (
                    <div
                      className="w-2 h-2 rounded-full animate-pulse-glow"
                      style={{ background: "oklch(0.72 0.22 155)" }}
                    />
                  )}
                </div>
                {isLoading ? (
                  <motion.div
                    className="h-7 w-20 rounded-lg"
                    style={{
                      background: `${stat.color.replace(")", " / 0.1)")}`,
                    }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{
                      duration: 1.4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                ) : (
                  <div className="font-display font-black text-2xl tabular-nums">
                    <AnimatedNumber value={stat.value} color={stat.color} />
                  </div>
                )}
                <div className="text-muted-foreground text-xs">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Grade Distribution ────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.grade_distribution.section"
        >
          <SectionHeader icon="🎓" title="Players by Grade Group" />
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
          >
            {gradeDistribution.map((group, i) => (
              <div key={group.key}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-display text-xs font-semibold"
                    style={{ color: group.color }}
                  >
                    {group.label}
                  </span>
                  <span
                    className="font-mono-game text-xs font-bold"
                    style={{ color: group.color }}
                  >
                    {isLoading
                      ? "--"
                      : `${group.count} player${group.count !== 1 ? "s" : ""}`}
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.15 0.02 270 / 0.8)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${group.color}, ${group.color.replace(")", " / 0.5)")})`,
                      boxShadow: `0 0 8px ${group.color.replace(")", " / 0.4)")}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: isLoading
                        ? "0%"
                        : `${(group.count / maxGradeCount) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.2 + i * 0.08,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Per-Game Heatmap ──────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.heatmap.section"
        >
          <SectionHeader icon="🎮" title="Games by Grade Group" />
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
          >
            <div className="flex flex-col gap-2">
              {gradeGroups.map((groupKey) => {
                const groupData = gradeDistribution.find(
                  (g) => g.key === groupKey,
                )!;
                const games = GRADE_GROUP_GAMES[groupKey] ?? [];
                const intensity =
                  maxGradeCount > 0 ? groupData.count / maxGradeCount : 0;
                return (
                  <div key={groupKey} className="flex flex-col gap-1">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: groupData.color }}
                    >
                      Gr {groupKey}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {games.map((gameName) => (
                        <div
                          key={gameName}
                          className="rounded-xl px-2 py-2 text-center"
                          style={{
                            background: `${groupData.color.replace(")", ` / ${Math.max(0.08, intensity * 0.4)})`)}`,
                            border: `1px solid ${groupData.color.replace(")", " / 0.25)")}`,
                          }}
                        >
                          <div
                            className="text-xs font-bold leading-tight truncate"
                            style={{ color: groupData.color }}
                          >
                            {gameName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Darker = more players in that grade group
            </p>
          </div>
        </motion.div>

        {/* ── Weekly Hall of Fame ───────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.hall_of_fame.section"
        >
          <SectionHeader icon="🏆" title="Weekly Hall of Fame" />
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.04 70 / 0.4), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.82 0.18 70 / 0.3)",
              boxShadow: "0 0 24px oklch(0.82 0.18 70 / 0.08)",
            }}
          >
            {weeklyTop.length === 0 ? (
              <div
                className="py-8 text-center"
                data-ocid="public_analytics.hall_of_fame.empty_state"
              >
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-muted-foreground text-sm">
                  No weekly data yet — play games to appear here!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {weeklyTop.slice(0, 3).map((player, i) => {
                  const rank = i + 1;
                  const glowColor = RANK_GLOW[rank];
                  return (
                    <motion.div
                      key={player.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{
                        background: `${glowColor.replace(")", " / 0.06)")}`,
                        border: `1px solid ${glowColor.replace(")", " / 0.25)")}`,
                        boxShadow: `0 0 12px ${glowColor.replace(")", " / 0.15)")}`,
                      }}
                      data-ocid={`public_analytics.hall_of_fame.item.${rank}`}
                    >
                      <div className="text-2xl">{RANK_CROWN[rank]}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-display font-black text-sm truncate"
                          style={{ color: glowColor }}
                        >
                          {player.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Grade {player.grade} · 🔥 {Number(player.streakDays)}{" "}
                          streak
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="font-display font-black text-base tabular-nums"
                          style={{ color: glowColor }}
                        >
                          {Number(player.xp).toLocaleString()}
                        </div>
                        <div
                          className="text-xs font-bold"
                          style={{
                            color: `${glowColor.replace(")", " / 0.7)")}`,
                          }}
                        >
                          {RANK_LABEL[rank]}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Global Leaderboard ────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.leaderboard.section"
        >
          <SectionHeader icon="📋" title="Global Leaderboard" />

          {/* Filter + Sort controls */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Grade filter */}
            <div className="flex flex-wrap gap-1">
              {(["all", "1-3", "4-5", "6-8", "9-10", "11-12"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setGradeFilter(filter)}
                    className="px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                    style={
                      gradeFilter === filter
                        ? {
                            background:
                              filter === "all"
                                ? "oklch(0.78 0.2 195 / 0.2)"
                                : `${GRADE_GROUP_COLORS[filter].replace(")", " / 0.2)")}`,
                            border: `1px solid ${filter === "all" ? "oklch(0.78 0.2 195 / 0.5)" : `${GRADE_GROUP_COLORS[filter].replace(")", " / 0.5)")}`}`,
                            color:
                              filter === "all"
                                ? "oklch(0.85 0.18 195)"
                                : GRADE_GROUP_COLORS[filter],
                          }
                        : {
                            background: "oklch(0.12 0.02 265 / 0.6)",
                            border: "1px solid oklch(0.25 0.04 270 / 0.4)",
                            color: "oklch(0.5 0.04 270)",
                          }
                    }
                    data-ocid={`public_analytics.grade_filter.button.${filter}`}
                  >
                    {filter === "all" ? "All" : `Gr ${filter}`}
                  </button>
                ),
              )}
            </div>
            {/* Sort toggle */}
            <div
              className="ml-auto flex rounded-xl overflow-hidden"
              style={{ border: "1px solid oklch(0.25 0.04 270 / 0.4)" }}
            >
              <button
                type="button"
                onClick={() => setSortMode("xp")}
                className="px-3 py-1.5 text-xs font-bold transition-all"
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
                data-ocid="public_analytics.sort_xp.toggle"
              >
                XP
              </button>
              <button
                type="button"
                onClick={() => setSortMode("streak")}
                className="px-3 py-1.5 text-xs font-bold transition-all"
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
                data-ocid="public_analytics.sort_streak.toggle"
              >
                Streak
              </button>
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
            }}
          >
            {isLoading ? (
              <div className="p-6 flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-12 rounded-xl"
                    style={{ background: "oklch(0.12 0.02 270 / 0.5)" }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{
                      duration: 1.3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div
                className="p-8 text-center"
                data-ocid="public_analytics.leaderboard.empty_state"
              >
                <div className="text-4xl mb-3">🌍</div>
                <p className="text-muted-foreground text-sm">
                  No players yet — be the first to join!
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredLeaderboard.map((entry, i) => {
                  const rank = i + 1;
                  const xpPct =
                    maxXP > 0 ? (Number(entry.xp) / maxXP) * 100 : 0;
                  const glowColor = RANK_GLOW[rank];
                  const gradeGroupColor =
                    GRADE_GROUP_COLORS[getGradeGroupKey(entry.grade)];

                  return (
                    <motion.div
                      key={`${entry.name}-${i}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom:
                          i < filteredLeaderboard.length - 1
                            ? "1px solid oklch(0.2 0.03 270 / 0.4)"
                            : "none",
                        background:
                          rank <= 3
                            ? `${(glowColor ?? "oklch(0.78 0.2 195)").replace(")", " / 0.05)")}`
                            : "transparent",
                      }}
                      data-ocid={`public_analytics.leaderboard.item.${rank}`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex-shrink-0 text-center">
                        {rank <= 3 ? (
                          <span className="text-xl">{RANK_MEDALS[rank]}</span>
                        ) : (
                          <span
                            className="font-display text-sm font-bold"
                            style={{ color: "oklch(0.5 0.04 270)" }}
                          >
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Name + XP bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="font-display font-bold text-sm truncate pr-2"
                            style={{
                              color:
                                rank === 1
                                  ? "oklch(0.92 0.16 70)"
                                  : rank === 2
                                    ? "oklch(0.88 0.05 265)"
                                    : rank === 3
                                      ? "oklch(0.82 0.12 45)"
                                      : "oklch(0.88 0.06 265)",
                              ...(rank <= 3 && glowColor
                                ? {
                                    textShadow: `0 0 10px ${glowColor.replace(")", " / 0.5)")}`,
                                  }
                                : {}),
                            }}
                          >
                            {entry.name}
                          </span>
                          <span
                            className="font-display text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                            style={{
                              background: `${gradeGroupColor.replace(")", " / 0.15)")}`,
                              color: gradeGroupColor,
                              border: `1px solid ${gradeGroupColor.replace(")", " / 0.3)")}`,
                            }}
                          >
                            G{entry.grade}
                          </span>
                        </div>
                        {/* XP bar */}
                        <div
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ background: "oklch(0.14 0.02 270 / 0.8)" }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background:
                                rank <= 3 && glowColor
                                  ? `linear-gradient(90deg, ${glowColor}, ${glowColor.replace(")", " / 0.6)")})`
                                  : "linear-gradient(90deg, oklch(0.65 0.22 255), oklch(0.65 0.22 255 / 0.5))",
                              boxShadow:
                                rank <= 3 && glowColor
                                  ? `0 0 6px ${glowColor.replace(")", " / 0.4)")}`
                                  : undefined,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPct}%` }}
                            transition={{
                              duration: 0.7,
                              ease: "easeOut",
                              delay: 0.1 + i * 0.04,
                            }}
                          />
                        </div>
                      </div>

                      {/* XP number */}
                      <div className="flex-shrink-0 text-right w-16">
                        <div
                          className="font-mono-game text-sm font-bold tabular-nums"
                          style={{
                            color:
                              rank <= 3 && glowColor
                                ? glowColor
                                : "oklch(0.78 0.2 195)",
                          }}
                        >
                          {Number(entry.xp).toLocaleString()}
                        </div>
                        <div className="text-muted-foreground text-xs">XP</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Info footer ── */}
        <motion.div variants={cardVariants}>
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "oklch(0.1 0.015 265 / 0.6)",
              border: "1px solid oklch(0.25 0.04 270 / 0.4)",
            }}
          >
            <div className="text-xl flex-shrink-0">ℹ️</div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Live data from all Melting Maths players. Refreshes automatically
              every 15 seconds.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="px-6 pb-6 pt-2 text-center">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan/70 hover:text-neon-cyan transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
