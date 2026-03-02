import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import { useResetProgress } from "../hooks/useQueries";

interface ProfileScreenProps {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
  onTeacherView?: () => void;
}

const ALL_BADGES: Array<{
  id: string;
  icon: string;
  label: string;
  desc: string;
}> = [
  {
    id: "first_win",
    icon: "🏆",
    label: "First Win",
    desc: "Complete your first game",
  },
  { id: "xp_100", icon: "⭐", label: "XP 100", desc: "Earn 100 XP" },
  { id: "xp_500", icon: "💫", label: "XP 500", desc: "Earn 500 XP" },
  {
    id: "streak_7",
    icon: "🔥",
    label: "7-Day Streak",
    desc: "Play 7 days in a row",
  },
  {
    id: "streak_30",
    icon: "🌟",
    label: "30-Day Streak",
    desc: "Play 30 days in a row",
  },
  {
    id: "algebra_master",
    icon: "🔐",
    label: "Algebra Master",
    desc: "Complete all algebra levels",
  },
  {
    id: "math_wizard",
    icon: "🧙",
    label: "Math Wizard",
    desc: "Score 90%+ on any game",
  },
  {
    id: "speed_demon",
    icon: "⚡",
    label: "Speed Demon",
    desc: "Complete Number Catcher under 15s",
  },
  {
    id: "perfect_score",
    icon: "💯",
    label: "Perfectionist",
    desc: "Score 100% on any game",
  },
  {
    id: "fraction_master",
    icon: "🍕",
    label: "Fraction Master",
    desc: "Complete all fraction levels",
  },
  {
    id: "calculus_legend",
    icon: "📉",
    label: "Calc Legend",
    desc: "Complete all calculus levels",
  },
  { id: "ten_games", icon: "🎮", label: "Gamer", desc: "Play 10 total games" },
  { id: "xp_1000", icon: "💰", label: "XP 1000", desc: "Earn 1000 XP" },
  { id: "xp_2500", icon: "💎", label: "XP 2500", desc: "Earn 2500 XP" },
  {
    id: "all_games",
    icon: "🌍",
    label: "All Games",
    desc: "Play all 36 games",
  },
  {
    id: "grade_up",
    icon: "🎓",
    label: "Grade Up",
    desc: "First grade promotion",
  },
  {
    id: "quiz_master",
    icon: "🧪",
    label: "Quiz Master",
    desc: "Perfect Shinchen daily quiz (5/5)",
  },
  {
    id: "theme_collector",
    icon: "🎨",
    label: "Theme Collector",
    desc: "Unlock all themes (XP ≥ 1500)",
  },
  {
    id: "boss_slayer",
    icon: "👑",
    label: "Boss Slayer",
    desc: "Beat any boss game",
  },
  {
    id: "week_warrior",
    icon: "🗡️",
    label: "Week Warrior",
    desc: "Play 7 different days",
  },
  {
    id: "challenge_accepted",
    icon: "🤝",
    label: "Challenger",
    desc: "Share a friend challenge",
  },
  {
    id: "drill_sergeant",
    icon: "💪",
    label: "Drill Sergeant",
    desc: "Complete 3 Shinchen drills",
  },
  {
    id: "explorer",
    icon: "🌐",
    label: "Explorer",
    desc: "Play a game 2 grades above yours",
  },
];

const AVATARS = [
  { id: "brain", icon: "🧠", label: "Brain", xpRequired: 0 },
  { id: "rocket", icon: "🚀", label: "Rocket", xpRequired: 200 },
  { id: "wizard", icon: "🧙", label: "Wizard", xpRequired: 1000 },
];

const THEMES = [
  {
    id: "neon-blue",
    label: "Neon Blue",
    color: "oklch(0.78 0.2 195)",
    xpRequired: 0,
  },
  {
    id: "cosmic-purple",
    label: "Cosmic Purple",
    color: "oklch(0.72 0.28 310)",
    xpRequired: 500,
  },
  {
    id: "solar-gold",
    label: "Solar Gold",
    color: "oklch(0.82 0.18 70)",
    xpRequired: 1500,
  },
];

function getAvatar(): string {
  try {
    return localStorage.getItem("mm_avatar") ?? "brain";
  } catch {
    return "brain";
  }
}
function setAvatarStorage(id: string) {
  try {
    localStorage.setItem("mm_avatar", id);
  } catch {
    /* noop */
  }
}
function getTheme(): string {
  try {
    return localStorage.getItem("mm_theme") ?? "neon-blue";
  } catch {
    return "neon-blue";
  }
}
function setThemeStorage(id: string) {
  try {
    localStorage.setItem("mm_theme", id);
  } catch {
    /* noop */
  }
}

function getLocalStats() {
  try {
    const gamesPlayed = Number.parseInt(
      localStorage.getItem("mm_games_played") || "0",
      10,
    );
    const gamesSetRaw = localStorage.getItem("mm_games_played_set");
    const gamesSet: string[] = gamesSetRaw ? JSON.parse(gamesSetRaw) : [];
    const playCountsRaw = localStorage.getItem("mm_game_play_counts");
    const playCounts: Record<string, number> = playCountsRaw
      ? JSON.parse(playCountsRaw)
      : {};
    const favGame =
      Object.entries(playCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const totalCorrect = Number.parseInt(
      localStorage.getItem("mm_total_correct") || "0",
      10,
    );
    const totalQuestions = Number.parseInt(
      localStorage.getItem("mm_total_questions") || "0",
      10,
    );
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;
    return { gamesPlayed, uniqueGames: gamesSet.length, favGame, accuracy };
  } catch {
    return { gamesPlayed: 0, uniqueGames: 0, favGame: "—", accuracy: 0 };
  }
}

export function ProfileScreen({
  profile,
  onProfileUpdate,
  onBack,
  onTeacherView,
}: ProfileScreenProps) {
  const resetProgress = useResetProgress();
  const xpNum = Number(profile.xp);
  const xpLevel = Math.floor(xpNum / 100);
  const xpProgress = xpNum % 100;
  const streakNum = Number(profile.streakDays);
  const [selectedAvatar, setSelectedAvatar] = useState(getAvatar);
  const [selectedTheme, setSelectedTheme] = useState(getTheme);
  const stats = getLocalStats();

  // Apply theme on mount and change
  useEffect(() => {
    const theme = selectedTheme;
    if (theme === "neon-blue") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [selectedTheme]);

  const handleAvatarChange = (id: string) => {
    const av = AVATARS.find((a) => a.id === id);
    if (!av || xpNum < av.xpRequired) return;
    setSelectedAvatar(id);
    setAvatarStorage(id);
  };

  const handleThemeChange = (id: string) => {
    const th = THEMES.find((t) => t.id === id);
    if (!th || xpNum < th.xpRequired) return;
    setSelectedTheme(id);
    setThemeStorage(id);
    toast.success(`Theme changed to ${th.label}!`);
  };

  const handleReset = async () => {
    try {
      await resetProgress.mutateAsync();
      const resetProfile: PlayerProfile = {
        ...profile,
        xp: BigInt(0),
        streakDays: BigInt(0),
        badges: [],
        weakTopics: [],
        lastPlayedEpoch: BigInt(0),
      };
      onProfileUpdate(resetProfile);
      localStorage.removeItem("meltingmaths_profile");
      localStorage.removeItem("mm_avatar");
      localStorage.removeItem("mm_theme");
      document.documentElement.removeAttribute("data-theme");
      toast.success("Progress reset successfully");
    } catch {
      toast.error("Failed to reset — try again");
    }
  };

  const currentAvatar =
    AVATARS.find((a) => a.id === selectedAvatar) ?? AVATARS[0];

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
        <h1 className="font-display text-2xl font-black text-glow-cyan">
          My Profile
        </h1>
      </header>

      <div className="flex-1 px-6 pb-8 space-y-5">
        {/* Avatar + info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-neon rounded-2xl p-5"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.06 195), oklch(0.15 0.04 280))",
                border: "2px solid oklch(0.78 0.2 195 / 0.5)",
                boxShadow: "0 0 20px oklch(0.78 0.2 195 / 0.3)",
              }}
            >
              {currentAvatar.icon}
            </div>
            <div>
              <div className="font-display text-xl font-bold text-foreground">
                {profile.name}
              </div>
              <div className="text-muted-foreground text-sm">
                Grade {profile.grade} • Level {xpLevel}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-400">🔥</span>
                <span className="text-sm text-amber-400 font-semibold">
                  {streakNum} day streak
                </span>
              </div>
            </div>
          </div>

          {/* XP bar with shimmer */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Level {xpLevel}</span>
              <span>
                {xpNum} XP total • {xpProgress}/100 to next
              </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/50">
              <motion.div
                className="h-full rounded-full xp-bar-shimmer"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Avatar Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            🎭 Avatar
          </h2>
          <div className="flex gap-3">
            {AVATARS.map((av) => {
              const isUnlocked = xpNum >= av.xpRequired;
              const isSelected = selectedAvatar === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => handleAvatarChange(av.id)}
                  disabled={!isUnlocked}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative
                    ${isSelected ? "border-2 border-neon-cyan bg-neon-cyan/10" : "border border-border/50 bg-secondary/50"}
                    ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "hover:border-neon-cyan/60 cursor-pointer"}`}
                >
                  <span className="text-3xl">{av.icon}</span>
                  <span className="text-xs font-semibold text-foreground">
                    {av.label}
                  </span>
                  {!isUnlocked && (
                    <span className="text-xs text-muted-foreground">
                      {av.xpRequired} XP
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="absolute top-1 right-1 text-xs">🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Theme Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-3">
            🎨 Theme
          </h2>
          <div className="flex gap-3">
            {THEMES.map((th) => {
              const isUnlocked = xpNum >= th.xpRequired;
              const isSelected = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleThemeChange(th.id)}
                  disabled={!isUnlocked}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all relative
                    ${isSelected ? "border-2 border-neon-cyan bg-neon-cyan/10" : "border border-border/50 bg-secondary/50"}
                    ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{
                      background: th.color,
                      boxShadow: `0 0 12px ${th.color}`,
                    }}
                  />
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">
                    {th.label}
                  </span>
                  {!isUnlocked && (
                    <span className="text-xs text-muted-foreground">
                      {th.xpRequired} XP
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="absolute top-1 right-1 text-xs">🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            🏅 Badges ({profile.badges.length}/{ALL_BADGES.length})
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = profile.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 text-center"
                  title={badge.desc}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all
                    ${earned ? "bg-neon-cyan/10 border border-neon-cyan/40 shadow-neon-sm-cyan" : "bg-secondary border border-border/50 grayscale opacity-40"}`}
                  >
                    {badge.icon}
                  </div>
                  <div
                    className={`text-xs leading-tight ${earned ? "text-foreground/80" : "text-muted-foreground"}`}
                  >
                    {badge.label}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weak topics */}
        {profile.weakTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-neon rounded-2xl p-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              📚 Practice Needed
            </h2>
            <div className="flex flex-col gap-2">
              {profile.weakTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border/50"
                >
                  <div>
                    <div className="font-semibold text-sm capitalize text-foreground">
                      {topic}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Keep practicing!
                    </div>
                  </div>
                  <NeonButton variant="cyan" size="sm">
                    Practice
                  </NeonButton>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            📊 Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-cyan">
                {xpNum}
              </div>
              <div className="text-muted-foreground text-xs">Total XP</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-purple">
                {profile.badges.length}
              </div>
              <div className="text-muted-foreground text-xs">Badges Earned</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-amber-400">
                {streakNum}🔥
              </div>
              <div className="text-muted-foreground text-xs">
                Current Streak
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-blue">
                Lv.{xpLevel}
              </div>
              <div className="text-muted-foreground text-xs">Current Level</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-cyan">
                {stats.gamesPlayed}
              </div>
              <div className="text-muted-foreground text-xs">Games Played</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-purple">
                {stats.uniqueGames}
              </div>
              <div className="text-muted-foreground text-xs">Unique Games</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-xl font-bold text-green-400 truncate">
                {stats.favGame.replace(/-/g, " ") || "—"}
              </div>
              <div className="text-muted-foreground text-xs">Fav. Game</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-amber-400">
                {stats.accuracy}%
              </div>
              <div className="text-muted-foreground text-xs">Avg. Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Teacher View Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={onTeacherView}
            className="w-full p-4 rounded-2xl border border-neon-purple/30 text-neon-purple/70 hover:border-neon-purple hover:text-neon-purple hover:bg-neon-purple/5 transition-all text-sm font-semibold"
          >
            🔒 Teacher / Parent View
          </button>
        </motion.div>

        {/* Reset */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="w-full p-4 rounded-2xl border border-destructive/30 text-destructive/70 hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all text-sm font-semibold"
              >
                🗑️ Reset All Progress
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-popover border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-foreground">
                  Reset Progress?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will delete all your XP, badges, and game progress. This
                  action cannot be undone!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-muted">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                >
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
}
