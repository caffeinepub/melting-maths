import { motion } from "motion/react";
import type { Screen } from "../App";
import type { PlayerProfile } from "../backend.d";
import { SHINCHEN_DAILY_CHALLENGES } from "../data/shinchen";

interface HomeScreenProps {
  profile: PlayerProfile;
  onNavigate: (screen: Screen) => void;
}

const UTILITY_ITEMS: Array<{
  screen: Screen;
  icon: string;
  label: string;
  accent: string;
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
];

export function HomeScreen({ profile, onNavigate }: HomeScreenProps) {
  const xpLevel = Math.floor(Number(profile.xp) / 100);
  const xpProgress = Number(profile.xp) % 100;

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
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
        >
          View →
        </button>
      </motion.button>

      {/* ── SHINCHEN STRIP ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.28 }}
        className="mx-6 mb-5 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.03 280 / 0.7), oklch(0.08 0.02 265 / 0.8))",
          border: "1px solid oklch(0.7 0.22 280 / 0.25)",
        }}
      >
        <div className="text-2xl animate-pulse-glow flex-shrink-0">🌟</div>
        <p className="text-foreground/80 text-sm leading-snug flex-1 min-w-0">
          {profile.streakDays > BigInt(0)
            ? `${profile.streakDays}-day streak! Incredible dedication 🔥`
            : `Welcome back, ${profile.name}! Ready to melt some maths? 🚀`}
        </p>
        <button
          type="button"
          onClick={() => onNavigate("shinchen")}
          className="flex-shrink-0 text-xs text-neon-purple/70 hover:text-neon-purple transition-colors whitespace-nowrap"
        >
          Chat →
        </button>
      </motion.div>

      {/* ── UTILITY 3-GRID ────────────────────────────────────── */}
      <div className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-3 gap-3">
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
              className="card-neon rounded-2xl p-4 text-center cursor-pointer
                flex flex-col items-center justify-center gap-2 min-h-[96px]
                border border-border/50 transition-all duration-200"
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
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-display font-bold text-xs text-foreground/80 leading-tight">
                {item.label}
              </div>
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
