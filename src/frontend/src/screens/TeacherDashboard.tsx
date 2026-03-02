import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PlayerProfile } from "../backend.d";
import { NeonButton } from "../components/NeonButton";

interface TeacherDashboardProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const CORRECT_PIN = "1234";

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
    const drillsDone = Number.parseInt(
      localStorage.getItem("mm_drills_done") || "0",
      10,
    );
    return {
      gamesPlayed,
      uniqueGames: gamesSet.length,
      favGame,
      accuracy,
      drillsDone,
    };
  } catch {
    return {
      gamesPlayed: 0,
      uniqueGames: 0,
      favGame: "—",
      accuracy: 0,
      drillsDone: 0,
    };
  }
}

export function TeacherDashboard({ profile, onBack }: TeacherDashboardProps) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const stats = getLocalStats();
  const xpNum = Number(profile.xp);
  const xpLevel = Math.floor(xpNum / 100);

  const handlePinDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        setTimeout(() => setUnlocked(true), 300);
      } else {
        setTimeout(() => {
          setPin("");
          setError(true);
        }, 400);
      }
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-muted-foreground hover:text-foreground text-sm mb-8"
        >
          ← Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 w-full max-w-xs"
        >
          <div className="text-5xl">🔒</div>
          <div className="text-center">
            <h2 className="font-display text-2xl font-black text-glow-cyan">
              Teacher View
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter 4-digit PIN to access
            </p>
          </div>

          {/* PIN dots */}
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={error ? { x: [-4, 4, -3, 3, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  i < pin.length
                    ? error
                      ? "bg-red-400 border-red-400"
                      : "bg-neon-cyan border-neon-cyan"
                    : "border-border/60 bg-transparent"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm font-semibold">
              Incorrect PIN. Try again!
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
              (d, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: static numpad layout
                  key={i}
                  type="button"
                  onClick={() =>
                    d === "⌫"
                      ? handleBackspace()
                      : d !== ""
                        ? handlePinDigit(d)
                        : undefined
                  }
                  disabled={d === ""}
                  className={`h-14 rounded-xl font-display text-xl font-bold transition-all
                  ${d === "" ? "opacity-0 pointer-events-none" : "btn-neon-cyan hover:scale-105 active:scale-95"}`}
                >
                  {d}
                </button>
              ),
            )}
          </div>
        </motion.div>
      </div>
    );
  }

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
        <div>
          <h1 className="font-display text-2xl font-black text-glow-cyan">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground text-xs">
            Read-only student view
          </p>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8 space-y-5">
        {/* Student info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-neon rounded-2xl p-5"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.06 195), oklch(0.15 0.04 280))",
                border: "2px solid oklch(0.78 0.2 195 / 0.5)",
              }}
            >
              🧑‍🎓
            </div>
            <div>
              <div className="font-display text-xl font-bold">
                {profile.name}
              </div>
              <div className="text-muted-foreground text-sm">
                Grade {profile.grade} • Level {xpLevel}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <div className="font-display text-2xl font-bold text-neon-cyan">
                {xpNum}
              </div>
              <div className="text-muted-foreground text-xs">Total XP</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <div className="font-display text-2xl font-bold text-amber-400">
                🔥 {Number(profile.streakDays)}
              </div>
              <div className="text-muted-foreground text-xs">Day Streak</div>
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
          <h2 className="font-display font-bold text-base mb-3">
            🏅 Badges Earned ({profile.badges.length})
          </h2>
          {profile.badges.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No badges yet — keep playing!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan"
                >
                  {badge.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weak topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base mb-3">
            📚 Areas Needing Practice
          </h2>
          {profile.weakTopics.length === 0 ? (
            <p className="text-sm text-green-400">
              ✓ No weak topics identified yet!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.weakTopics.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-400/30 text-red-400 capitalize"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Detailed stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base mb-3">
            📊 Session Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-purple">
                {stats.gamesPlayed}
              </div>
              <div className="text-muted-foreground text-xs">Games Played</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-blue">
                {stats.uniqueGames}
              </div>
              <div className="text-muted-foreground text-xs">Unique Games</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-cyan">
                {stats.accuracy}%
              </div>
              <div className="text-muted-foreground text-xs">Avg Accuracy</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-xl font-bold text-amber-400 truncate">
                {stats.favGame.replace(/-/g, " ")}
              </div>
              <div className="text-muted-foreground text-xs">
                Favourite Game
              </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center text-xs text-muted-foreground pt-2 pb-4">
          Default PIN: 1234 • Change in settings (coming soon)
        </div>
      </div>
    </div>
  );
}
