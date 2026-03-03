import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile } from "../backend.d";

interface TeacherDashboardProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const DEFAULT_PIN = "1234";
const PIN_STORAGE_KEY = "mm_teacher_pin";

function getStoredPin(): string {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) ?? DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

function setStoredPin(pin: string) {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin);
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
    const drillsDone = Number.parseInt(
      localStorage.getItem("mm_drills_done") || "0",
      10,
    );
    const completedRaw = localStorage.getItem("mm_completed_games");
    const completedGames: string[] = completedRaw
      ? JSON.parse(completedRaw)
      : [];
    return {
      gamesPlayed,
      uniqueGames: gamesSet.length,
      favGame,
      accuracy,
      drillsDone,
      completedGames: completedGames.length,
    };
  } catch {
    return {
      gamesPlayed: 0,
      uniqueGames: 0,
      favGame: "—",
      accuracy: 0,
      drillsDone: 0,
      completedGames: 0,
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

  // PIN change flow
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinStep, setPinStep] = useState<"new" | "confirm">("new");
  const newPinInputRef = useRef<HTMLInputElement>(null);
  const confirmPinInputRef = useRef<HTMLInputElement>(null);

  const correctPin = getStoredPin();

  const handlePinDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === correctPin) {
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

  const handleStartChangePIN = () => {
    setShowChangePIN(true);
    setNewPin("");
    setConfirmPin("");
    setPinStep("new");
    setTimeout(() => newPinInputRef.current?.focus(), 100);
  };

  const handleNewPinSubmit = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    setPinStep("confirm");
    setConfirmPin("");
    setTimeout(() => confirmPinInputRef.current?.focus(), 100);
  };

  const handleConfirmPinSubmit = () => {
    if (confirmPin !== newPin) {
      toast.error("PINs don't match. Try again.");
      setConfirmPin("");
      setPinStep("new");
      setNewPin("");
      setTimeout(() => newPinInputRef.current?.focus(), 100);
      return;
    }
    setStoredPin(newPin);
    toast.success("PIN updated successfully!");
    setShowChangePIN(false);
    setNewPin("");
    setConfirmPin("");
    setPinStep("new");
  };

  const handleCancelChangePIN = () => {
    setShowChangePIN(false);
    setNewPin("");
    setConfirmPin("");
    setPinStep("new");
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-muted-foreground hover:text-foreground text-sm mb-8"
          data-ocid="teacher.back.button"
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
          <div
            className="grid grid-cols-3 gap-3 w-full"
            data-ocid="teacher.pin.panel"
          >
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
                  data-ocid={
                    d === "⌫"
                      ? "teacher.pin.backspace.button"
                      : d !== ""
                        ? "teacher.pin.digit.button"
                        : undefined
                  }
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
          data-ocid="teacher.back.button"
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
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <div className="font-display text-2xl font-bold text-neon-purple">
                {profile.badges.length}
              </div>
              <div className="text-muted-foreground text-xs">Badges</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <div className="font-display text-2xl font-bold text-green-400">
                {stats.completedGames}
              </div>
              <div className="text-muted-foreground text-xs">Levels Done</div>
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
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan capitalize"
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
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-green-400">
                {stats.drillsDone}
              </div>
              <div className="text-muted-foreground text-xs">Drills Done</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="font-display text-2xl font-bold text-neon-purple">
                {stats.completedGames}
              </div>
              <div className="text-muted-foreground text-xs">Levels Beaten</div>
            </div>
          </div>
        </motion.div>

        {/* Change PIN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-neon rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-base mb-3">🔑 Security</h2>

          <AnimatePresence mode="wait">
            {!showChangePIN ? (
              <motion.div
                key="pin-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Teacher PIN
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Used to lock the teacher dashboard
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartChangePIN}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: "oklch(0.2 0.06 195 / 0.6)",
                      border: "1px solid oklch(0.78 0.2 195 / 0.5)",
                      color: "oklch(0.85 0.18 195)",
                    }}
                    data-ocid="teacher.change_pin.button"
                  >
                    Change PIN
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pin-change"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-sm font-semibold text-foreground">
                  {pinStep === "new" ? "Enter New PIN" : "Confirm New PIN"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pinStep === "new"
                    ? "Choose a new 4-digit PIN for the teacher dashboard."
                    : "Re-enter your new PIN to confirm."}
                </div>

                {pinStep === "new" ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={newPinInputRef}
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setNewPin(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNewPinSubmit();
                      }}
                      placeholder="••••"
                      className="flex-1 text-center text-2xl font-display font-bold tracking-widest bg-transparent border-b-2 outline-none text-foreground placeholder:text-muted-foreground/40"
                      style={{ borderColor: "oklch(0.78 0.2 195 / 0.8)" }}
                      data-ocid="teacher.new_pin.input"
                    />
                    <button
                      type="button"
                      onClick={handleNewPinSubmit}
                      className="px-3 py-2 rounded-lg text-sm font-bold"
                      style={{
                        background: "oklch(0.2 0.06 195 / 0.6)",
                        border: "1px solid oklch(0.78 0.2 195 / 0.5)",
                        color: "oklch(0.85 0.18 195)",
                      }}
                      data-ocid="teacher.new_pin.next_button"
                    >
                      Next →
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      ref={confirmPinInputRef}
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setConfirmPin(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmPinSubmit();
                      }}
                      placeholder="••••"
                      className="flex-1 text-center text-2xl font-display font-bold tracking-widest bg-transparent border-b-2 outline-none text-foreground placeholder:text-muted-foreground/40"
                      style={{ borderColor: "oklch(0.78 0.2 195 / 0.8)" }}
                      data-ocid="teacher.confirm_pin.input"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmPinSubmit}
                      className="px-3 py-2 rounded-lg text-sm font-bold"
                      style={{
                        background: "oklch(0.2 0.08 145 / 0.6)",
                        border: "1px solid oklch(0.72 0.2 145 / 0.5)",
                        color: "oklch(0.85 0.18 145)",
                      }}
                      data-ocid="teacher.confirm_pin.save_button"
                    >
                      Save
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCancelChangePIN}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  data-ocid="teacher.change_pin.cancel_button"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
