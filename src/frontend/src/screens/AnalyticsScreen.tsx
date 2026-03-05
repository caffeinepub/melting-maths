import { type Variants, motion } from "motion/react";
import type { PlayerProfile } from "../backend.d";
import {
  getAccuracyByGradeGroup,
  getActivityHeatmap,
  getDailyXpLast7Days,
  getGamesPlayedCount,
  getOverallAccuracy,
  getPerGameStats,
  getTopGames,
  getTotalTimePlayed,
  prettifyGameId,
} from "../utils/analyticsUtils";

interface AnalyticsScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const RANK_MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

// Stagger animation variants
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
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

export function AnalyticsScreen({ profile, onBack }: AnalyticsScreenProps) {
  // Compute all analytics data
  const dailyXp = getDailyXpLast7Days();
  const heatmap = getActivityHeatmap();
  const gradeAccuracy = getAccuracyByGradeGroup();
  const topGames = getTopGames(3);
  const perGameStats = getPerGameStats();
  const totalTimePlayed = getTotalTimePlayed();
  const gamesPlayed = getGamesPlayedCount();
  const overallAccuracy = getOverallAccuracy();

  const maxXp = Math.max(...dailyXp.map((d) => d.xp), 1);

  // Overview stats
  const overviewStats = [
    {
      label: "Total XP",
      value: Number(profile.xp).toLocaleString(),
      icon: "⚡",
      color: "oklch(0.78 0.2 195)",
    },
    {
      label: "Games Played",
      value: gamesPlayed.toLocaleString(),
      icon: "🎮",
      color: "oklch(0.7 0.22 280)",
    },
    {
      label: "Avg Accuracy",
      value: `${overallAccuracy}%`,
      icon: "🎯",
      color: "oklch(0.65 0.22 255)",
    },
    {
      label: "Time Played",
      value: totalTimePlayed,
      icon: "⏱",
      color: "oklch(0.82 0.18 70)",
    },
    {
      label: "Streak",
      value: `🔥 ${Number(profile.streakDays)}d`,
      icon: "🔥",
      color: "oklch(0.72 0.22 25)",
    },
    {
      label: "Badges",
      value: profile.badges.length.toString(),
      icon: "🏅",
      color: "oklch(0.72 0.22 155)",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-1"
          data-ocid="analytics.back.button"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-glow-cyan leading-tight">
            📊 Analytics
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Your performance overview
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-xs font-bold text-muted-foreground">
            {profile.name}
          </div>
          <div className="font-display text-xs text-neon-cyan">
            Grade {profile.grade}
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <motion.div
        className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Overview Strip ─────────────────────────────────────────────── */}
        <motion.div variants={cardVariants} data-ocid="analytics.overview.card">
          <SectionHeader icon="✨" title="Overview" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 flex flex-col gap-1"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
                  border: `1px solid ${stat.color.replace(")", " / 0.2)")}`,
                  boxShadow: `0 0 16px ${stat.color.replace(")", " / 0.06)")}`,
                }}
              >
                <div className="text-xl">{stat.icon}</div>
                <div
                  className="font-display text-xl font-black tabular-nums"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── XP Over Last 7 Days ────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="analytics.xp_chart.section"
        >
          <SectionHeader icon="📈" title="XP — Last 7 Days" />
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
          >
            {/* Bar chart */}
            <div className="flex items-end justify-between gap-1.5 h-28 mb-2">
              {dailyXp.map((day) => {
                const pct = maxXp > 0 ? (day.xp / maxXp) * 100 : 0;
                const minH = day.xp > 0 ? Math.max(pct, 8) : 4;
                return (
                  <div
                    key={day.dayLabel}
                    className="flex-1 flex flex-col items-center justify-end gap-1"
                  >
                    {/* XP label on top */}
                    {day.xp > 0 && (
                      <span
                        className="font-mono-game text-xs font-bold leading-none"
                        style={{
                          color: day.isToday
                            ? "oklch(0.78 0.2 195)"
                            : "oklch(0.6 0.04 270)",
                        }}
                      >
                        {day.xp}
                      </span>
                    )}
                    {/* Bar */}
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{
                        background: day.isToday
                          ? "linear-gradient(180deg, oklch(0.78 0.2 195), oklch(0.65 0.18 195 / 0.7))"
                          : "linear-gradient(180deg, oklch(0.5 0.14 280 / 0.8), oklch(0.4 0.1 280 / 0.4))",
                        boxShadow: day.isToday
                          ? "0 0 10px oklch(0.78 0.2 195 / 0.4)"
                          : undefined,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${minH}%` }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Day labels */}
            <div className="flex justify-between gap-1.5">
              {dailyXp.map((day) => (
                <div
                  key={day.dayLabel}
                  className="flex-1 text-center font-display text-xs"
                  style={{
                    color: day.isToday
                      ? "oklch(0.78 0.2 195)"
                      : "oklch(0.5 0.04 270)",
                    fontWeight: day.isToday ? "800" : "400",
                  }}
                >
                  {day.dayLabel}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Activity Heatmap ───────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="analytics.heatmap.section"
        >
          <SectionHeader icon="📅" title="Activity — Last 7 Days" />
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
          >
            <div className="flex justify-between gap-2">
              {heatmap.map((day) => (
                <div
                  key={day.dayLabel}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <motion.div
                    className="w-full aspect-square rounded-lg"
                    style={
                      day.played
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.78 0.2 195), oklch(0.68 0.18 215))",
                            boxShadow: "0 0 12px oklch(0.78 0.2 195 / 0.5)",
                            border: "1px solid oklch(0.78 0.2 195 / 0.6)",
                          }
                        : {
                            background: "oklch(0.14 0.02 270 / 0.8)",
                            border: "1px solid oklch(0.25 0.04 270 / 0.5)",
                          }
                    }
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  />
                  <span
                    className="font-display text-xs leading-none"
                    style={{
                      color: day.isToday
                        ? "oklch(0.78 0.2 195)"
                        : day.played
                          ? "oklch(0.7 0.08 270)"
                          : "oklch(0.45 0.04 270)",
                      fontWeight: day.isToday ? "800" : "400",
                    }}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 justify-end">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: "oklch(0.78 0.2 195)",
                  }}
                />
                <span className="text-xs text-muted-foreground">Played</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: "oklch(0.14 0.02 270 / 0.8)",
                    border: "1px solid oklch(0.25 0.04 270 / 0.5)",
                  }}
                />
                <span className="text-xs text-muted-foreground">Missed</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Accuracy by Grade Group ────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="analytics.accuracy_chart.section"
        >
          <SectionHeader icon="🎯" title="Accuracy by Grade Group" />
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
          >
            {gradeAccuracy.map((group) => (
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
                    {group.accuracy}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.15 0.02 270 / 0.8)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${group.color}, ${group.color.replace(")", " / 0.6)")})`,
                      boxShadow: `0 0 8px ${group.color.replace(")", " / 0.4)")}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${group.accuracy}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Top 3 Games ────────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          data-ocid="analytics.top_games.section"
        >
          <SectionHeader icon="🏆" title="Top Games" />
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
          >
            {topGames.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-4">
                No games played yet. Start playing to see your top games!
              </div>
            ) : (
              topGames.map((game, i) => {
                const rank = i + 1;
                return (
                  <div
                    key={game.gameId}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background:
                        rank === 1
                          ? "oklch(0.15 0.04 70 / 0.4)"
                          : rank === 2
                            ? "oklch(0.14 0.02 270 / 0.5)"
                            : "oklch(0.12 0.02 270 / 0.3)",
                      border:
                        rank === 1
                          ? "1px solid oklch(0.82 0.18 70 / 0.3)"
                          : "1px solid oklch(0.25 0.04 270 / 0.4)",
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">
                      {RANK_MEDALS[rank] ?? `#${rank}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-foreground truncate">
                        {prettifyGameId(game.gameId)}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div
                        className="font-mono-game text-sm font-bold"
                        style={{ color: "oklch(0.78 0.2 195)" }}
                      >
                        {game.count}×
                      </div>
                      <div className="text-muted-foreground text-xs">
                        played
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Per-Game Stats Table ──────────────────────────────────────── */}
        <motion.div variants={cardVariants}>
          <SectionHeader icon="📋" title="All Game Sessions" />
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid oklch(0.3 0.06 270 / 0.4)",
            }}
            data-ocid="analytics.game_stats.table"
          >
            {perGameStats.length === 0 ? (
              <div
                className="p-8 text-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
                }}
                data-ocid="analytics.game_stats.empty_state"
              >
                <div className="text-4xl mb-3">🎮</div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No game sessions recorded yet.
                  <br />
                  Start playing to see your stats!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Table header */}
                <div
                  className="grid gap-0 text-xs font-display font-bold tracking-wider uppercase px-4 py-3"
                  style={{
                    background: "oklch(0.12 0.02 270 / 0.9)",
                    color: "oklch(0.5 0.04 270)",
                    gridTemplateColumns: "1fr auto auto auto",
                  }}
                >
                  <span>Game</span>
                  <span className="text-right pr-3">Played</span>
                  <span className="text-right pr-3">Accuracy</span>
                  <span className="text-right">Last</span>
                </div>

                {/* Table rows */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.1 0.015 265), oklch(0.08 0.01 280))",
                    maxHeight: "320px",
                    overflowY: "auto",
                  }}
                >
                  {perGameStats
                    .sort((a, b) => b.timesPlayed - a.timesPlayed)
                    .map((stat, i) => (
                      <div
                        key={stat.gameId}
                        className="grid px-4 py-3 text-sm"
                        style={{
                          gridTemplateColumns: "1fr auto auto auto",
                          borderTop:
                            i === 0
                              ? "none"
                              : "1px solid oklch(0.2 0.03 270 / 0.5)",
                        }}
                        data-ocid={`analytics.game_stats.row.${i + 1}`}
                      >
                        <span
                          className="font-display font-semibold text-xs truncate pr-2"
                          style={{ color: "oklch(0.85 0.06 270)" }}
                        >
                          {prettifyGameId(stat.gameId)}
                        </span>
                        <span
                          className="font-mono-game text-xs text-right pr-3"
                          style={{ color: "oklch(0.65 0.08 265)" }}
                        >
                          {stat.timesPlayed}×
                        </span>
                        <span
                          className="font-mono-game text-xs font-bold text-right pr-3"
                          style={{
                            color:
                              stat.avgAccuracy >= 80
                                ? "oklch(0.72 0.22 155)"
                                : stat.avgAccuracy >= 60
                                  ? "oklch(0.78 0.2 195)"
                                  : "oklch(0.72 0.2 50)",
                          }}
                        >
                          {stat.avgAccuracy}%
                        </span>
                        <span
                          className="text-xs text-right"
                          style={{ color: "oklch(0.5 0.04 270)" }}
                        >
                          {stat.lastPlayed}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
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
