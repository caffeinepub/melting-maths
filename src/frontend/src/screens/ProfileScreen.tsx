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
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PlayerProfile } from "../backend.d";
import { ConfettiBurst } from "../components/ConfettiBurst";
import { GradeCertificate } from "../components/GradeCertificate";
import { NeonButton } from "../components/NeonButton";
import {
  useCreateOrUpdateProfile,
  useResetProgress,
} from "../hooks/useQueries";

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
  {
    id: "combo_king",
    icon: "🔥",
    label: "Combo King",
    desc: "Hit a 5x combo in any game",
  },
  {
    id: "time_attack",
    icon: "⏱️",
    label: "Speed Racer",
    desc: "Complete a game in Time Attack mode",
  },
];

const AVATARS = [
  { id: "brain", icon: "🧠", label: "Brain", xpRequired: 0 },
  { id: "rocket", icon: "🚀", label: "Rocket", xpRequired: 200 },
  { id: "wizard", icon: "🧙", label: "Wizard", xpRequired: 1000 },
  { id: "star", icon: "⭐", label: "Star", xpRequired: 500 },
  { id: "ninja", icon: "🥷", label: "Ninja", xpRequired: 2000 },
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

// --- Sound helpers ---
function getSoundSettings() {
  try {
    return {
      masterSound: localStorage.getItem("mm_sound_master") !== "false",
      sfx: localStorage.getItem("mm_sound_sfx") !== "false",
      music: localStorage.getItem("mm_sound_music") !== "false",
    };
  } catch {
    return { masterSound: true, sfx: true, music: true };
  }
}
function setSoundSetting(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* noop */
  }
}

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
function getColorMode(): string {
  try {
    return localStorage.getItem("mm_color_mode") ?? "dark";
  } catch {
    return "dark";
  }
}
function setColorModeStorage(mode: string) {
  try {
    localStorage.setItem("mm_color_mode", mode);
  } catch {
    /* noop */
  }
}
function getStreakFreezeTokens(): number {
  try {
    return Number.parseInt(
      localStorage.getItem("mm_streak_freeze_tokens") ?? "0",
      10,
    );
  } catch {
    return 0;
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

function getGradeGroup(grade: number): string {
  if (grade <= 3) return "1-3";
  if (grade <= 5) return "4-5";
  if (grade <= 8) return "6-8";
  if (grade <= 10) return "9-10";
  return "11-12";
}

const GRADE_GROUP_GAMES: Record<string, string[]> = {
  "1-3": [
    "number-catcher",
    "addition-rocket",
    "subtraction-blocks",
    "number-race",
    "shape-sorter",
    "skip-counter",
  ],
  "4-5": [
    "fraction-battle",
    "decimal-dash",
    "time-master",
    "multiplication-madness",
    "division-dungeon",
    "word-problem-wizard",
  ],
  "6-8": [
    "algebra-escape",
    "geometry-builder",
    "integer-war",
    "ratio-rumble",
    "percentage-power",
    "pattern-detective",
  ],
  "9-10": [
    "quadratic-boss",
    "graph-builder",
    "trig-sniper",
    "statistics-showdown",
    "sequence-solver",
    "coordinate-quest",
  ],
  "11-12": [
    "calculus-runner",
    "matrix-code",
    "probability-strategy",
    "complex-clash",
    "logarithm-lab",
    "vectors-voyage",
  ],
};

function checkCertificateEligibility(gradeGroup: string): boolean {
  try {
    const completedRaw = localStorage.getItem("mm_completed_games");
    const completed: string[] = completedRaw ? JSON.parse(completedRaw) : [];
    const games = GRADE_GROUP_GAMES[gradeGroup] ?? [];
    const beaten3 = games.filter((g) => completed.includes(`${g}_3`));
    return beaten3.length >= 3;
  } catch {
    return false;
  }
}

// Toggle row component
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  ocid,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ocid: string;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${disabled ? "opacity-40" : ""}`}
    >
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
          checked ? "bg-neon-cyan/80" : "bg-secondary"
        } border ${checked ? "border-neon-cyan" : "border-border/60"}`}
        style={
          checked ? { boxShadow: "0 0 8px oklch(0.78 0.2 195 / 0.5)" } : {}
        }
        data-ocid={ocid}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ProfileScreen({
  profile,
  onProfileUpdate,
  onBack,
  onTeacherView,
}: ProfileScreenProps) {
  const resetProgress = useResetProgress();
  const createOrUpdate = useCreateOrUpdateProfile();
  const xpNum = Number(profile.xp);
  const xpLevel = Math.floor(xpNum / 100);
  const xpProgress = xpNum % 100;
  const streakNum = Number(profile.streakDays);
  const [selectedAvatar, setSelectedAvatar] = useState(getAvatar);
  const [selectedTheme, setSelectedTheme] = useState(getTheme);
  const [colorMode, setColorMode] = useState(getColorMode);
  const stats = getLocalStats();
  const gradeGroup = getGradeGroup(profile.grade);
  const canDownloadCert = checkCertificateEligibility(gradeGroup);
  const [showCert, setShowCert] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const freezeTokens = getStreakFreezeTokens();

  // Sound settings
  const [soundSettings, setSoundSettings] = useState(getSoundSettings);

  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(profile.name);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [editGradeValue, setEditGradeValue] = useState(profile.grade);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Track previous badge count for confetti trigger
  const prevBadgeCountRef = useRef(profile.badges.length);
  useEffect(() => {
    if (profile.badges.length > prevBadgeCountRef.current) {
      setShowConfetti(true);
      prevBadgeCountRef.current = profile.badges.length;
    }
  }, [profile.badges.length]);

  // Apply theme on mount and change
  useEffect(() => {
    const theme = selectedTheme;
    if (theme === "neon-blue") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [selectedTheme]);

  // Apply color mode
  useEffect(() => {
    if (colorMode === "light") {
      document.documentElement.setAttribute("data-color-mode", "light");
    } else {
      document.documentElement.removeAttribute("data-color-mode");
    }
  }, [colorMode]);

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

  const handleColorModeToggle = () => {
    const next = colorMode === "dark" ? "light" : "dark";
    setColorMode(next);
    setColorModeStorage(next);
  };

  const handleSoundToggle = (
    key: "masterSound" | "sfx" | "music",
    value: boolean,
  ) => {
    const storageKey =
      key === "masterSound"
        ? "mm_sound_master"
        : key === "sfx"
          ? "mm_sound_sfx"
          : "mm_sound_music";
    setSoundSettings((prev) => ({ ...prev, [key]: value }));
    setSoundSetting(storageKey, value);
    toast.success(
      `${key === "masterSound" ? "Sound" : key === "sfx" ? "Sound effects" : "Music"} ${value ? "on" : "off"}`,
    );
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed === profile.name) {
      setIsEditingName(false);
      return;
    }
    const updated = { ...profile, name: trimmed };
    onProfileUpdate(updated);
    setIsEditingName(false);
    try {
      await createOrUpdate.mutateAsync({ name: trimmed, grade: profile.grade });
      toast.success("Name updated!");
    } catch {
      toast.error("Couldn't save to server — updated locally");
    }
  };

  const handleSaveGrade = async () => {
    if (editGradeValue === profile.grade) {
      setIsEditingGrade(false);
      return;
    }
    const updated = { ...profile, grade: editGradeValue };
    onProfileUpdate(updated);
    setIsEditingGrade(false);
    try {
      await createOrUpdate.mutateAsync({
        name: profile.name,
        grade: editGradeValue,
      });
      toast.success(`Grade updated to Grade ${editGradeValue}!`);
    } catch {
      toast.error("Couldn't save to server — updated locally");
    }
  };

  const handleResetGameProgress = () => {
    // Clear game-related local storage only
    const gameKeys = [
      "mm_games_played",
      "mm_games_played_set",
      "mm_game_play_counts",
      "mm_total_correct",
      "mm_total_questions",
      "mm_completed_games",
      "mm_drills_done",
    ];
    for (const key of gameKeys) {
      localStorage.removeItem(key);
    }
    toast.success("Game progress reset! XP and badges are kept.");
  };

  const handleResetAll = async () => {
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
      localStorage.removeItem("mm_games_played");
      localStorage.removeItem("mm_games_played_set");
      localStorage.removeItem("mm_game_play_counts");
      localStorage.removeItem("mm_total_correct");
      localStorage.removeItem("mm_total_questions");
      localStorage.removeItem("mm_completed_games");
      localStorage.removeItem("mm_drills_done");
      document.documentElement.removeAttribute("data-theme");
      toast.success("All progress reset successfully");
    } catch {
      toast.error("Failed to reset — try again");
    }
  };

  const currentAvatar =
    AVATARS.find((a) => a.id === selectedAvatar) ?? AVATARS[0];

  return (
    <>
      <ConfettiBurst
        show={showConfetti}
        onDone={() => setShowConfetti(false)}
      />

      <div className="min-h-screen flex flex-col">
        <header className="px-6 pt-10 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground text-sm"
              data-ocid="profile.back.button"
            >
              ← Back
            </button>
            <h1 className="font-display text-2xl font-black text-glow-cyan">
              My Profile
            </h1>
          </div>
          {/* Light/Dark mode toggle */}
          <button
            type="button"
            onClick={handleColorModeToggle}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{
              background: "oklch(0.15 0.03 265)",
              border: "1px solid oklch(0.35 0.06 270)",
            }}
            aria-label={`Switch to ${colorMode === "dark" ? "light" : "dark"} mode`}
            data-ocid="profile.color_mode.toggle"
          >
            {colorMode === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <div className="flex-1 px-6 pb-8 space-y-5">
          {/* === PROFILE SECTION === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-neon rounded-2xl p-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
              👤 Profile
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.2 0.06 195), oklch(0.15 0.04 280))",
                  border: "2px solid oklch(0.78 0.2 195 / 0.5)",
                  boxShadow: "0 0 20px oklch(0.78 0.2 195 / 0.3)",
                }}
              >
                {currentAvatar.icon}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                {/* Name editing */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Display Name
                  </div>
                  {isEditingName ? (
                    <div
                      className="flex items-center gap-2"
                      data-ocid="profile.name_edit.panel"
                    >
                      <input
                        ref={nameInputRef}
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setIsEditingName(false);
                        }}
                        className="flex-1 min-w-0 font-display text-base font-bold text-foreground bg-transparent border-b-2 outline-none"
                        style={{ borderColor: "oklch(0.78 0.2 195 / 0.8)" }}
                        maxLength={30}
                        data-ocid="profile.name.input"
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        className="text-xs px-2 py-1 rounded-lg font-bold"
                        style={{
                          background: "oklch(0.2 0.06 195 / 0.6)",
                          border: "1px solid oklch(0.78 0.2 195 / 0.5)",
                          color: "oklch(0.85 0.18 195)",
                        }}
                        data-ocid="profile.name.save_button"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(false);
                          setEditNameValue(profile.name);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        data-ocid="profile.name.cancel_button"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(true);
                        setEditNameValue(profile.name);
                        setTimeout(() => nameInputRef.current?.focus(), 50);
                      }}
                      className="flex items-center gap-2 group hover:opacity-80 transition-opacity text-left"
                      data-ocid="profile.name.edit_button"
                    >
                      <span className="font-display text-lg font-bold text-foreground">
                        {profile.name}
                      </span>
                      <span className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        ✏️
                      </span>
                    </button>
                  )}
                </div>

                {/* Grade editing */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Grade
                  </div>
                  {isEditingGrade ? (
                    <div
                      className="flex items-center gap-2"
                      data-ocid="profile.grade_edit.panel"
                    >
                      <select
                        value={editGradeValue}
                        onChange={(e) =>
                          setEditGradeValue(Number(e.target.value))
                        }
                        className="font-semibold text-sm text-foreground bg-transparent border-b-2 outline-none"
                        style={{ borderColor: "oklch(0.78 0.2 195 / 0.8)" }}
                        data-ocid="profile.grade.select"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (g) => (
                            <option
                              key={g}
                              value={g}
                              style={{ background: "oklch(0.12 0.03 265)" }}
                            >
                              Grade {g}
                            </option>
                          ),
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveGrade}
                        className="text-xs px-2 py-1 rounded-lg font-bold"
                        style={{
                          background: "oklch(0.2 0.06 195 / 0.6)",
                          border: "1px solid oklch(0.78 0.2 195 / 0.5)",
                          color: "oklch(0.85 0.18 195)",
                        }}
                        data-ocid="profile.grade.save_button"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingGrade(false);
                          setEditGradeValue(profile.grade);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        data-ocid="profile.grade.cancel_button"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingGrade(true);
                        setEditGradeValue(profile.grade);
                      }}
                      className="flex items-center gap-2 group hover:opacity-80 transition-opacity text-left"
                      data-ocid="profile.grade.edit_button"
                    >
                      <span className="font-semibold text-sm text-foreground">
                        Grade {profile.grade}
                      </span>
                      <span className="text-muted-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ✏️
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-amber-400">🔥</span>
                  <span className="text-sm text-amber-400 font-semibold">
                    {streakNum} day streak
                  </span>
                  {freezeTokens > 0 && (
                    <span className="text-xs text-neon-cyan ml-2">
                      🧊 {freezeTokens} freeze{freezeTokens > 1 ? "s" : ""}
                    </span>
                  )}
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

            {/* Grade Certificate */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => canDownloadCert && setShowCert(!showCert)}
                disabled={!canDownloadCert}
                className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all"
                style={
                  canDownloadCert
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.18 0.06 70 / 0.8), oklch(0.12 0.04 265))",
                        border: "1px solid oklch(0.82 0.18 70 / 0.5)",
                        color: "oklch(0.9 0.18 70)",
                        boxShadow: "0 0 16px oklch(0.82 0.18 70 / 0.15)",
                      }
                    : {
                        background: "oklch(0.12 0.02 265)",
                        border: "1px solid oklch(0.25 0.04 270 / 0.5)",
                        color: "oklch(0.45 0.03 270)",
                        cursor: "not-allowed",
                      }
                }
                data-ocid="profile.certificate.button"
              >
                {canDownloadCert
                  ? "🎓 Download Grade Certificate"
                  : "🎓 Certificate (Complete 3 games at Level 3)"}
              </button>

              <AnimatePresence>
                {showCert && canDownloadCert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <GradeCertificate
                      profile={profile}
                      gradeGroup={gradeGroup}
                      onClose={() => setShowCert(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* === AVATAR PICKER === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-neon rounded-2xl p-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              🎭 Avatar
            </h2>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((av) => {
                const isUnlocked = xpNum >= av.xpRequired;
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleAvatarChange(av.id)}
                    disabled={!isUnlocked}
                    className={`flex-1 min-w-[64px] flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all relative
                      ${isSelected ? "border-2 border-neon-cyan bg-neon-cyan/10" : "border border-border/50 bg-secondary/50"}
                      ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "hover:border-neon-cyan/60 cursor-pointer"}`}
                    data-ocid={`profile.avatar.button.${av.id}`}
                  >
                    <span className="text-2xl">{av.icon}</span>
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

          {/* === SOUND SETTINGS === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="card-neon rounded-2xl p-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              🔊 Sound & Audio
            </h2>
            <div className="divide-y divide-border/40">
              <ToggleRow
                label="Master Sound"
                description="Turn all sounds on or off"
                checked={soundSettings.masterSound}
                onChange={(v) => handleSoundToggle("masterSound", v)}
                ocid="profile.sound.master.toggle"
              />
              <ToggleRow
                label="Sound Effects"
                description="Game sounds, correct/wrong answers, combos"
                checked={soundSettings.sfx}
                onChange={(v) => handleSoundToggle("sfx", v)}
                disabled={!soundSettings.masterSound}
                ocid="profile.sound.sfx.toggle"
              />
              <ToggleRow
                label="Music"
                description="Background music during gameplay"
                checked={soundSettings.music}
                onChange={(v) => handleSoundToggle("music", v)}
                disabled={!soundSettings.masterSound}
                ocid="profile.sound.music.toggle"
              />
            </div>
          </motion.div>

          {/* === THEME PICKER === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="card-neon rounded-2xl p-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">
              🎨 Appearance
            </h2>

            {/* Dark/Light mode */}
            <div className="mb-4">
              <ToggleRow
                label="Light Mode"
                description="Switch to light theme"
                checked={colorMode === "light"}
                onChange={(v) => {
                  const next = v ? "light" : "dark";
                  setColorMode(next);
                  setColorModeStorage(next);
                }}
                ocid="profile.appearance.light_mode.toggle"
              />
            </div>

            <div className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">
              Color Themes
            </div>
            <div className="flex flex-col gap-3">
              {THEMES.map((th) => {
                const isUnlocked = xpNum >= th.xpRequired;
                const isSelected = selectedTheme === th.id;
                const xpProgress =
                  th.xpRequired > 0
                    ? Math.min(100, Math.round((xpNum / th.xpRequired) * 100))
                    : 100;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleThemeChange(th.id)}
                    disabled={!isUnlocked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                      ${isSelected ? "border-2 border-neon-cyan bg-neon-cyan/10" : "border border-border/50 bg-secondary/50"}
                      ${!isUnlocked ? "cursor-not-allowed" : "hover:border-neon-cyan/60 cursor-pointer"}`}
                    data-ocid={`profile.theme.button.${th.id}`}
                  >
                    <div
                      className="w-9 h-9 rounded-full border-2 border-white/20 flex-shrink-0"
                      style={{
                        background: th.color,
                        boxShadow: `0 0 12px ${th.color}`,
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {th.label}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-neon-cyan font-bold">
                            ✓ Active
                          </span>
                        )}
                        {!isUnlocked && <span className="text-xs">🔒</span>}
                      </div>
                      {!isUnlocked && (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                            <span>
                              {xpNum} / {th.xpRequired} XP
                            </span>
                            <span>{xpProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${xpProgress}%`,
                                background: th.color,
                                boxShadow: `0 0 6px ${th.color}`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* === BADGES === */}
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

          {/* === WEAK TOPICS === */}
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

          {/* === STATS === */}
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
                <div className="text-muted-foreground text-xs">
                  Badges Earned
                </div>
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
                <div className="text-muted-foreground text-xs">
                  Current Level
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="font-display text-2xl font-bold text-neon-cyan">
                  {stats.gamesPlayed}
                </div>
                <div className="text-muted-foreground text-xs">
                  Games Played
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="font-display text-2xl font-bold text-neon-purple">
                  {stats.uniqueGames}
                </div>
                <div className="text-muted-foreground text-xs">
                  Unique Games
                </div>
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
                <div className="text-muted-foreground text-xs">
                  Avg. Accuracy
                </div>
              </div>
            </div>

            {/* Streak freeze info */}
            <div
              className="mt-3 p-3 rounded-xl flex items-center justify-between"
              style={{
                background: "oklch(0.12 0.04 195 / 0.3)",
                border: "1px solid oklch(0.78 0.2 195 / 0.2)",
              }}
            >
              <div>
                <div className="text-xs font-semibold text-neon-cyan">
                  🧊 Streak Freeze Tokens
                </div>
                <div className="text-xs text-muted-foreground">
                  Earn 1 token every 7 days of streak
                </div>
              </div>
              <div
                className="font-display text-xl font-bold"
                style={{ color: "oklch(0.78 0.2 195)" }}
              >
                {freezeTokens}
              </div>
            </div>
          </motion.div>

          {/* === TEACHER VIEW BUTTON === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={onTeacherView}
              className="w-full p-4 rounded-2xl border border-neon-purple/30 text-neon-purple/70 hover:border-neon-purple hover:text-neon-purple hover:bg-neon-purple/5 transition-all text-sm font-semibold"
              data-ocid="profile.teacher_view.button"
            >
              🔒 Teacher / Parent View
            </button>
          </motion.div>

          {/* === RESET / PROGRESS === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="card-neon rounded-2xl p-5"
          >
            <h2 className="font-display font-bold text-base text-foreground mb-1">
              ⚠️ Reset Progress
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Choose what to reset. These actions cannot be undone.
            </p>

            <div className="space-y-3">
              {/* Reset game progress only */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full p-4 rounded-xl border border-amber-500/30 text-amber-400/80 hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 transition-all text-sm font-semibold text-left flex items-center gap-3"
                    data-ocid="profile.reset_game.button"
                  >
                    <span className="text-xl">🎮</span>
                    <div>
                      <div className="font-bold">Reset Game Progress</div>
                      <div className="text-xs opacity-70 font-normal">
                        Clears completed levels and scores. Keeps XP and badges.
                      </div>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-popover border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-foreground">
                      Reset Game Progress?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will clear your completed levels and scores. Your XP,
                      badges, and streak will be kept. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="bg-secondary border-border text-foreground hover:bg-muted"
                      data-ocid="profile.reset_game.cancel_button"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetGameProgress}
                      className="bg-amber-600 text-white hover:bg-amber-500"
                      data-ocid="profile.reset_game.confirm_button"
                    >
                      Reset Game Progress
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Reset everything */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full p-4 rounded-xl border border-destructive/30 text-destructive/70 hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all text-sm font-semibold text-left flex items-center gap-3"
                    data-ocid="profile.reset_all.button"
                  >
                    <span className="text-xl">🗑️</span>
                    <div>
                      <div className="font-bold">Reset Everything</div>
                      <div className="text-xs opacity-70 font-normal">
                        Wipes all XP, badges, streak, and game progress. Full
                        reset.
                      </div>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-popover border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-foreground">
                      Reset All Progress?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will delete all your XP, badges, streak, and game
                      progress. This action cannot be undone!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="bg-secondary border-border text-foreground hover:bg-muted"
                      data-ocid="profile.reset_all.cancel_button"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                      data-ocid="profile.reset_all.confirm_button"
                    >
                      Yes, Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
