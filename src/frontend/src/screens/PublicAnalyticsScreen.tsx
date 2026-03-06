import {
  type Variants,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { LeaderboardEntry } from "../backend.d";
import { usePublicStats } from "../hooks/useQueries";

interface PublicAnalyticsScreenProps {
  onBack: () => void;
}

// Stagger animation variants
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Animated counting number
function AnimatedNumber({ value, color }: { value: number; color: string }) {
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

  return <motion.span style={{ color }}>{display}</motion.span>;
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
      <motion.div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: "oklch(0.72 0.22 155)" }}
        animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
        transition={{
          duration: 1.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
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

// Medal colors for top 3
const RANK_MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const RANK_GLOW: Record<number, string> = {
  1: "oklch(0.82 0.18 70)", // gold
  2: "oklch(0.75 0.05 265)", // silver
  3: "oklch(0.72 0.16 45)", // bronze
};

export function PublicAnalyticsScreen({ onBack }: PublicAnalyticsScreenProps) {
  const { statsQuery } = usePublicStats();
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());

  // Track seconds since last data refresh
  useEffect(() => {
    if (statsQuery.dataUpdatedAt > 0) {
      lastUpdateRef.current = statsQuery.dataUpdatedAt;
      setSecondsSinceUpdate(0);
    }
  }, [statsQuery.dataUpdatedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdateRef.current) / 1000);
      setSecondsSinceUpdate(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const VISITS_OFFSET = 230;
  const totalVisits =
    Number(statsQuery.data?.totalVisits ?? BigInt(0)) + VISITS_OFFSET;
  const leaderboard: LeaderboardEntry[] = statsQuery.data?.leaderboard ?? [];

  // Derived stats
  const totalPlayers = leaderboard.length;
  const totalXP = leaderboard.reduce((sum, e) => sum + Number(e.xp), 0);
  const topGrade =
    leaderboard.length > 0 ? Math.max(...leaderboard.map((e) => e.grade)) : 0;

  const maxXP =
    leaderboard.length > 0
      ? Math.max(...leaderboard.map((e) => Number(e.xp)), 1)
      : 1;

  // Grade distribution
  const gradeGroups = ["1-3", "4-5", "6-8", "9-10", "11-12"];
  const gradeDistribution = gradeGroups.map((key) => {
    const count = leaderboard.filter(
      (e) => getGradeGroupKey(e.grade) === key,
    ).length;
    return { key, count, label: `Gr ${key}`, color: GRADE_GROUP_COLORS[key] };
  });
  const maxGradeCount = Math.max(...gradeDistribution.map((g) => g.count), 1);

  const isLoading = statsQuery.isLoading;

  // Stat card definitions
  const statCards = [
    {
      label: "Total Visits",
      value: totalVisits,
      icon: "🌍",
      color: "oklch(0.78 0.2 195)",
      ocid: "public_analytics.visits.card",
    },
    {
      label: "Total Players",
      value: totalPlayers,
      icon: "👥",
      color: "oklch(0.7 0.22 280)",
      ocid: "public_analytics.players.card",
    },
    {
      label: "Total XP Earned",
      value: totalXP,
      icon: "⚡",
      color: "oklch(0.82 0.18 70)",
      ocid: "public_analytics.xp.card",
    },
    {
      label: "Top Grade",
      value: topGrade,
      icon: "🎓",
      color: "oklch(0.72 0.22 155)",
      ocid: "public_analytics.top_grade.card",
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
            {isLoading
              ? "Fetching latest data..."
              : `Last updated: ${secondsSinceUpdate}s ago · Refreshes every 15s`}
          </p>
        </div>
      </header>

      {/* Scrollable content */}
      <motion.div
        className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Stat Cards Grid ──────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.stats.card"
        >
          <SectionHeader icon="📊" title="Global Overview" />
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl p-4 flex flex-col gap-1 cursor-default transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
                  border: `1px solid ${stat.color.replace(")", " / 0.2)")}`,
                  boxShadow: `0 0 16px ${stat.color.replace(")", " / 0.05)")}`,
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 0 28px ${stat.color.replace(")", " / 0.3)")}`,
                  borderColor: `${stat.color.replace(")", " / 0.5)")}`,
                }}
                data-ocid={stat.ocid}
              >
                <div className="text-xl">{stat.icon}</div>
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
                  <div className="font-display text-2xl font-black tabular-nums">
                    <AnimatedNumber value={stat.value} color={stat.color} />
                  </div>
                )}
                <div className="text-muted-foreground text-xs leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Top 10 Players Leaderboard ───────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="public_analytics.leaderboard.section"
        >
          <SectionHeader icon="🏆" title="Top Players" />
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
            ) : leaderboard.length === 0 ? (
              <div
                className="p-8 text-center"
                data-ocid="public_analytics.leaderboard.empty_state"
              >
                <div className="text-4xl mb-3">🌍</div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No players yet — be the first to join!
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {leaderboard.slice(0, 10).map((entry, i) => {
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
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom:
                          i < Math.min(leaderboard.length - 1, 9)
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
                          {/* Grade badge */}
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
                              delay: 0.15 + i * 0.04,
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

        {/* ── Grade Distribution ───────────────────────────────────────── */}
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
              <div key={group.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
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
                  className="w-full h-2 rounded-full overflow-hidden"
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
                        : maxGradeCount > 0
                          ? `${(group.count / maxGradeCount) * 100}%`
                          : "0%",
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

            {!isLoading && leaderboard.length === 0 && (
              <p
                className="text-center text-xs py-2"
                style={{ color: "oklch(0.5 0.04 270)" }}
              >
                No players registered yet
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Info footer ──────────────────────────────────────────── */}
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
              This page shows live data from all Melting Maths players. Data
              refreshes automatically every 15 seconds.
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
