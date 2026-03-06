import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import type { Screen } from "../App";
import type { PlayerProfile } from "../backend.d";
import { SHINCHEN_DAILY_CHALLENGES } from "../data/shinchen";
import {
  getCompletedChallengeIds,
  getWeeklyChallenges,
} from "../data/weeklyChallenge";
import { useTotalVisits } from "../hooks/useQueries";

interface HomeScreenProps {
  profile: PlayerProfile;
  onNavigate: (screen: Screen) => void;
}

const UTILITY_ITEMS: Array<{
  screen: Screen;
  icon: string;
  label: string;
  accent: string;
  wide?: boolean;
}> = [
  {
    screen: "shinchen",
    icon: "🌟",
    label: "Shinchen AI",
    accent: "oklch(0.7 0.22 280)",
  },
  {
    screen: "leaderboard",
    icon: "🏆",
    label: "Leaderboard",
    accent: "oklch(0.65 0.22 255)",
  },
  {
    screen: "profile",
    icon: "👤",
    label: "My Profile",
    accent: "oklch(0.78 0.2 195)",
  },
  {
    screen: "analytics",
    icon: "📊",
    label: "Analytics",
    accent: "oklch(0.72 0.22 155)",
  },
  {
    screen: "public-analytics",
    icon: "🌍",
    label: "Live Stats",
    accent: "oklch(0.72 0.22 25)",
    wide: true,
  },
  {
    screen: "admin-registry",
    icon: "🗂️",
    label: "Admin Registry",
    accent: "oklch(0.72 0.22 25)",
  },
];

// 30+ personalized daily messages
const DAILY_MESSAGES: string[] = [
  "Hey {name}! Grade {grade} math is your next adventure — let's conquer it today! 🚀",
  "Good day, {name}! Your streak is precious — protect it with at least one game! 🔥",
  "Psst, {name}! I've got new hints for Grade {grade} topics ready just for you! 🌟",
  "{name}, the math universe is waiting! Your Grade {grade} skills are getting stronger! ⚡",
  "Welcome back, {name}! A quick practice session keeps the brain sharp! 🧠",
  "Hey {name}! Did you know Grade {grade} math shows up in real life every day? Let's train! 🎯",
  "{name}, you're so close to leveling up! One more game and you'll feel the power! 💫",
  "Rise and calculate, {name}! Grade {grade} challenges await your brilliant mind! 🌌",
  "{name}, I believe in you today! Go show those numbers who's boss! 💪",
  "Another day, another chance to become a Grade {grade} legend, {name}! 🏆",
  "Hey {name}! Even 5 minutes of math practice compounds into greatness! ✨",
  "{name}, your dedication to Grade {grade} math is inspiring! Keep it going! 🌠",
  "The numbers are restless today, {name}! Only a true Grade {grade} hero can calm them! 🎮",
  "Bright mind alert! {name} is about to do great math things today! 🔮",
  "{name}, every problem you solve today is a step toward math mastery! 📚",
  "Hey there, {name}! Grade {grade} math mysteries await your discovery! 🔍",
  "Your brain is a muscle, {name}! Let's flex it with some Grade {grade} challenges! 💥",
  "{name}, I analyzed your patterns — you're actually incredible at this! Don't stop now! 📊",
  "Today is YOUR day, {name}! Grade {grade} math bows before your power! 👑",
  "Hello, future math champion {name}! Ready to claim your XP today? ⭐",
  "{name}, I've prepared special challenges tuned just for Grade {grade}! Let's go! 🎯",
  "The scoreboard is calling your name, {name}! Show the leaderboard who's best! 🏅",
  "Math is a superpower, {name}! Grade {grade} unlocks new abilities every session! ⚡",
  "Hey {name}! Consistent practice = unstoppable results. Today's session matters! 🔥",
  "{name}, I'm excited to help you tackle Grade {grade} together today! Let's roll! 🚀",
  "Numbers don't stand a chance against you, {name}! Grade {grade} champion incoming! 🌟",
  "Each equation you solve, {name}, makes you 1% smarter. Let's compound that! 📈",
  "Hey {name}! The bosses are waiting. Level {grade} math won't know what hit it! 👾",
  "Good vibes and great math, {name}! Your Grade {grade} journey continues now! ✨",
  "{name}, remember: every expert was once a beginner. You're doing amazing! 🌈",
  "The math galaxies of Grade {grade} are yours to explore, {name}! Adventure awaits! 🌌",
];

function getDailyMessage(profile: PlayerProfile): string {
  const dateStr = new Date().toDateString();
  const key = `mm_daily_msg_${dateStr}`;
  try {
    let idx = localStorage.getItem(key);
    if (idx === null) {
      // Pick a new one for today
      const newIdx = Math.floor(Math.random() * DAILY_MESSAGES.length);
      localStorage.setItem(key, String(newIdx));
      idx = String(newIdx);
    }
    const template =
      DAILY_MESSAGES[Number.parseInt(idx, 10) % DAILY_MESSAGES.length];
    return template
      .replace(/\{name\}/g, profile.name)
      .replace(/\{grade\}/g, String(profile.grade));
  } catch {
    return `Welcome back, ${profile.name}! Ready to melt some maths? 🚀`;
  }
}

function getStreakFreezeTokens(): number {
  try {
    const raw = localStorage.getItem("mm_streak_freeze_tokens");
    return raw ? Number.parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function spendStreakFreezeToken() {
  try {
    const tokens = getStreakFreezeTokens();
    if (tokens <= 0) return;
    localStorage.setItem("mm_streak_freeze_tokens", String(tokens - 1));
    localStorage.setItem("mm_streak_frozen", "true");
  } catch {
    /* noop */
  }
}

export function HomeScreen({ profile, onNavigate }: HomeScreenProps) {
  const xpLevel = Math.floor(Number(profile.xp) / 100);
  const xpProgress = Number(profile.xp) % 100;
  const [freezeTokens, setFreezeTokens] = useState(getStreakFreezeTokens);
  const {
    data: totalVisitsData,
    isError: visitsError,
    isLoading: visitsLoading,
  } = useTotalVisits();
  const visitsCount = useMotionValue(0);
  const visitsDisplay = useTransform(visitsCount, (v) =>
    Math.round(v).toLocaleString(),
  );

  const VISITS_OFFSET = 230;

  useEffect(() => {
    if (totalVisitsData !== undefined && totalVisitsData > BigInt(0)) {
      animate(visitsCount, Number(totalVisitsData) + VISITS_OFFSET, {
        duration: 1.6,
        ease: "easeOut",
      });
    } else if (totalVisitsData === BigInt(0)) {
      animate(visitsCount, VISITS_OFFSET, {
        duration: 1.6,
        ease: "easeOut",
      });
    }
  }, [totalVisitsData, visitsCount]);

  const dailyMessage = getDailyMessage(profile);
  const weeklyChallenges = getWeeklyChallenges();
  const completedIds = getCompletedChallengeIds();

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleUseFreezeToken = () => {
    spendStreakFreezeToken();
    setFreezeTokens((t) => Math.max(0, t - 1));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-xs tracking-widest uppercase">
                {getTimeGreeting()}
              </div>
              <h1 className="font-display text-3xl font-black text-glow-cyan leading-tight mt-0.5">
                {profile.name}!
              </h1>
            </div>
            {/* Wordmark */}
            <div className="text-right">
              <div className="font-display text-xs font-black tracking-[0.2em] uppercase gradient-text-cyan-purple opacity-70">
                MELTING
              </div>
              <div className="font-display text-xs font-black tracking-[0.2em] uppercase gradient-text-cyan-purple opacity-70">
                MATHS
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Shinchen Daily Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mx-6 mb-4 rounded-2xl p-4 flex items-start gap-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.03 280 / 0.7), oklch(0.08 0.02 265 / 0.8))",
          border: "1px solid oklch(0.7 0.22 280 / 0.25)",
        }}
        data-ocid="home.shinchen_message.card"
      >
        <div className="text-2xl animate-pulse-glow flex-shrink-0 mt-0.5">
          🌟
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xs font-bold text-neon-purple tracking-widest mb-1">
            SHINCHEN'S MESSAGE
          </div>
          <p className="text-foreground/85 text-sm leading-relaxed">
            {dailyMessage}
          </p>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.12 }}
        className="mx-6 mb-5 card-neon rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <div className="font-display text-lg font-bold text-neon-cyan tabular-nums">
              {Number(profile.xp).toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">XP</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-bold text-neon-purple">
              Lv.{xpLevel}
            </div>
            <div className="text-muted-foreground text-xs">Level</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-bold text-amber-400">
              🔥 {Number(profile.streakDays)}
            </div>
            <div className="text-muted-foreground text-xs">Streak</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-bold text-neon-blue">
              G{profile.grade}
            </div>
            <div className="text-muted-foreground text-xs">Grade</div>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Level {xpLevel}</span>
            <span>{xpProgress}/100 to next</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>

        {/* Streak Freeze */}
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🧊</span>
            <span className="text-xs text-muted-foreground">
              Freeze Tokens:{" "}
              <span className="text-neon-cyan font-bold">{freezeTokens}</span>
            </span>
          </div>
          {freezeTokens > 0 && (
            <button
              type="button"
              onClick={handleUseFreezeToken}
              className="text-xs px-3 py-1 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                background: "oklch(0.15 0.04 195 / 0.5)",
                border: "1px solid oklch(0.78 0.2 195 / 0.4)",
                color: "oklch(0.8 0.18 195)",
              }}
              data-ocid="home.streak_freeze.button"
            >
              Use Freeze
            </button>
          )}
        </div>
      </motion.div>

      {/* ── HERO: Play Games CTA ───────────────────────────────── */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.975 }}
        onClick={() => onNavigate("game-select")}
        className="mx-6 mb-4 rounded-3xl relative overflow-hidden cursor-pointer text-left"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.04 195 / 0.9), oklch(0.1 0.03 265 / 0.95))",
          border: "1px solid oklch(0.78 0.2 195 / 0.45)",
          boxShadow:
            "0 0 40px oklch(0.78 0.2 195 / 0.18), 0 0 80px oklch(0.7 0.22 280 / 0.1), inset 0 1px 0 oklch(0.78 0.2 195 / 0.15)",
        }}
        data-ocid="home.play_games.button"
      >
        {/* Ambient glow blobs */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ background: "oklch(0.78 0.2 195)" }}
        />
        <div
          className="absolute -bottom-6 left-8 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{ background: "oklch(0.7 0.22 280)" }}
        />

        <div className="relative flex items-center gap-5 p-5">
          {/* Animated icon */}
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="text-5xl flex-shrink-0 drop-shadow-[0_0_12px_oklch(0.78_0.2_195/0.7)]"
          >
            🎮
          </motion.div>

          <div className="flex-1">
            <div
              className="font-display text-2xl font-black mb-0.5"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.92 0.15 195) 0%, oklch(0.85 0.18 220) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Play Games
            </div>
            <div className="text-muted-foreground text-sm">
              Battle math challenges · Earn XP · Level up
            </div>
          </div>

          {/* Arrow */}
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="text-neon-cyan text-xl flex-shrink-0 pr-1"
          >
            →
          </motion.div>
        </div>

        {/* Animated bottom neon line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.2 195 / 0.7) 30%, oklch(0.7 0.22 280 / 0.7) 70%, transparent)",
          }}
        />
      </motion.button>

      {/* ── WEEKLY CHALLENGES ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.23 }}
        className="mx-6 mb-4 rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.11 0.04 50 / 0.7), oklch(0.09 0.02 265 / 0.8))",
          border: "1px solid oklch(0.82 0.18 70 / 0.3)",
        }}
        data-ocid="home.weekly_challenges.card"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📅</span>
          <div
            className="font-display text-xs font-bold tracking-widest"
            style={{ color: "oklch(0.9 0.18 70)" }}
          >
            WEEKLY CHALLENGES
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {weeklyChallenges.map((c, i) => {
            const done = completedIds.includes(c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: done
                    ? "oklch(0.72 0.22 155 / 0.1)"
                    : "oklch(0.1 0.02 265 / 0.5)",
                  border: done
                    ? "1px solid oklch(0.72 0.22 155 / 0.3)"
                    : "1px solid oklch(0.3 0.06 270 / 0.3)",
                }}
                data-ocid={`home.weekly_challenge.item.${i + 1}`}
              >
                <div className="text-lg flex-shrink-0">{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display font-bold text-xs leading-tight"
                    style={{
                      color: done
                        ? "oklch(0.72 0.22 155)"
                        : "oklch(0.88 0.08 265)",
                    }}
                  >
                    {c.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {c.description}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {done ? (
                    <span
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.72 0.22 155)" }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.85 0.18 70)" }}
                    >
                      {c.reward}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── TOTAL VISITS ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mx-6 mb-4 rounded-2xl p-4 flex items-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.11 0.04 195 / 0.7), oklch(0.09 0.02 265 / 0.8))",
          border: "1px solid oklch(0.78 0.2 195 / 0.25)",
          boxShadow:
            "0 0 24px oklch(0.78 0.2 195 / 0.1), inset 0 1px 0 oklch(0.78 0.2 195 / 0.08)",
        }}
        data-ocid="home.total_visits.card"
      >
        {/* Globe icon with pulsing glow */}
        <motion.div
          animate={
            (visitsLoading || totalVisitsData === undefined) && !visitsError
              ? {
                  opacity: [0.5, 1, 0.5],
                  scale: [0.95, 1.05, 0.95],
                }
              : { opacity: 1, scale: 1 }
          }
          transition={
            (visitsLoading || totalVisitsData === undefined) && !visitsError
              ? {
                  duration: 1.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          className="text-3xl flex-shrink-0"
          style={{
            filter: "drop-shadow(0 0 10px oklch(0.78 0.2 195 / 0.6))",
          }}
        >
          🌍
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="font-display text-xs font-bold text-neon-cyan tracking-widest mb-0.5">
            TOTAL VISITS
          </div>
          <div className="text-muted-foreground text-xs">
            Everyone who has visited this app
          </div>
        </div>

        {/* Count display */}
        <div className="flex-shrink-0 text-right">
          {visitsError ? (
            <div
              className="font-display text-2xl font-black"
              style={{ color: "oklch(0.7 0.08 265)" }}
            >
              --
            </div>
          ) : visitsLoading || totalVisitsData === undefined ? (
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                className="w-12 h-6 rounded-lg"
                style={{ background: "oklch(0.78 0.2 195 / 0.15)" }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="font-display text-2xl font-black"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.92 0.15 195) 0%, oklch(0.85 0.18 220) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 8px oklch(0.78 0.2 195 / 0.5))",
              }}
            >
              <motion.span>{visitsDisplay}</motion.span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── DAILY CHALLENGE ───────────────────────────────────── */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-6 mb-4 rounded-2xl p-4 flex items-center gap-3 cursor-pointer text-left w-[calc(100%-3rem)]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.11 0.04 280 / 0.8), oklch(0.09 0.03 195 / 0.7))",
          border: "1px solid oklch(0.7 0.22 280 / 0.35)",
          boxShadow:
            "0 0 20px oklch(0.7 0.22 280 / 0.12), 0 0 40px oklch(0.78 0.2 195 / 0.08)",
        }}
        onClick={() => onNavigate("shinchen")}
        aria-label="Daily challenge"
        data-ocid="home.daily_challenge.button"
      >
        <div className="text-2xl flex-shrink-0 animate-pulse-glow">🌟</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xs font-bold text-neon-purple tracking-widest mb-0.5">
            DAILY CHALLENGE
          </div>
          <p className="text-foreground/80 text-xs leading-snug line-clamp-2">
            {
              SHINCHEN_DAILY_CHALLENGES[
                new Date().getDate() % SHINCHEN_DAILY_CHALLENGES.length
              ]
            }
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("shinchen");
          }}
          className="flex-shrink-0 text-xs font-semibold text-neon-purple/80 hover:text-neon-purple transition-colors whitespace-nowrap px-2 py-1 rounded-lg"
          style={{ border: "1px solid oklch(0.7 0.22 280 / 0.3)" }}
          data-ocid="home.daily_challenge.view_button"
        >
          View →
        </button>
      </motion.button>

      {/* ── UTILITY GRID ──────────────────────────────────────── */}
      <div className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {UTILITY_ITEMS.map((item, i) => (
            <motion.button
              key={item.screen}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate(item.screen)}
              className={`card-neon rounded-2xl p-4 text-center cursor-pointer
                flex items-center justify-center gap-2
                border border-border/50 transition-all duration-200
                ${item.wide ? "col-span-2 min-h-[72px] flex-row" : "flex-col min-h-[96px]"}`}
              style={{
                ["--hover-accent" as string]: item.accent,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  `${item.accent.replace(")", " / 0.5)")}`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  `0 0 18px ${item.accent.replace(")", " / 0.2)")}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              }}
              data-ocid={`home.${item.screen}.link`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div
                className={`font-display font-bold text-xs text-foreground/80 leading-tight ${item.wide ? "flex-1 text-left" : ""}`}
              >
                {item.label}
              </div>
              {item.wide && (
                <div
                  className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"
                  style={{
                    background: "oklch(0.12 0.06 155 / 0.7)",
                    color: "oklch(0.72 0.22 155)",
                    border: "1px solid oklch(0.72 0.22 155 / 0.4)",
                  }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.72 0.22 155)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  LIVE
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-6 text-center">
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
