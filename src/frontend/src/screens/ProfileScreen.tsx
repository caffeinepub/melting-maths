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
import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";
import { useResetProgress } from "../hooks/useQueries";

interface ProfileScreenProps {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onBack: () => void;
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
    id: "speed_demon_v2",
    icon: "⚡",
    label: "Speed Pro",
    desc: "Finish Level 3 under 30s",
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
    desc: "Play all 15 games",
  },
];

export function ProfileScreen({
  profile,
  onProfileUpdate,
  onBack,
}: ProfileScreenProps) {
  const resetProgress = useResetProgress();
  const xpNum = Number(profile.xp);
  const xpLevel = Math.floor(xpNum / 100);
  const xpProgress = xpNum % 100;
  const streakNum = Number(profile.streakDays);

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
      toast.success("Progress reset successfully");
    } catch {
      toast.error("Failed to reset — try again");
    }
  };

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
              🧠
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

          {/* XP bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Level {xpLevel}</span>
              <span>
                {xpNum} XP total • {xpProgress}/100 to next
              </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/50">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
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
            🏅 Badges
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
                      ${
                        earned
                          ? "bg-neon-cyan/10 border border-neon-cyan/40 shadow-neon-sm-cyan"
                          : "bg-secondary border border-border/50 grayscale opacity-40"
                      }
                    `}
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

        {/* Stats quick view */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base text-foreground mb-4">
            📊 Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
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
                className="w-full p-4 rounded-2xl border border-destructive/30 text-destructive/70
                hover:border-destructive hover:text-destructive hover:bg-destructive/5
                transition-all text-sm font-semibold"
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
