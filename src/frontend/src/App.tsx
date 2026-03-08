import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import type { PlayerProfile } from "./backend.d";
import { Cutscene } from "./components/Cutscene";
import { FloatingMath } from "./components/FloatingMath";
import { GameIntro } from "./components/GameIntro";
import { GradeBackground } from "./components/GradeBackground";
import { GradePromotion } from "./components/GradePromotion";
import {
  useCreateOrUpdateProfile,
  useHeartbeat,
  useProfile,
  useRecordGameSession,
  useSubmitLeaderboardEntry,
} from "./hooks/useQueries";
import { AdminRegistryScreen } from "./screens/AdminRegistryScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { BossRushScreen } from "./screens/BossRushScreen";
import { ChallengeScreen } from "./screens/ChallengeScreen";
import { DailyDungeonScreen } from "./screens/DailyDungeonScreen";
import { GameScreen } from "./screens/GameScreen";
import { GameSelectScreen } from "./screens/GameSelectScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { PublicAnalyticsScreen } from "./screens/PublicAnalyticsScreen";
import { ShinchenScreen } from "./screens/ShinchenScreen";
import { TeacherDashboard } from "./screens/TeacherDashboard";
import { TournamentScreen } from "./screens/TournamentScreen";

export type Screen =
  | "onboarding"
  | "home"
  | "game-select"
  | "game"
  | "shinchen"
  | "profile"
  | "leaderboard"
  | "teacher"
  | "analytics"
  | "public-analytics"
  | "admin-registry"
  | "tournament"
  | "daily-dungeon"
  | "boss-rush"
  | "challenge";

const STORAGE_KEY = "meltingmaths_profile";

function loadCachedProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      ...p,
      xp: BigInt(p.xp ?? 0),
      streakDays: BigInt(p.streakDays ?? 0),
      lastPlayedEpoch: BigInt(p.lastPlayedEpoch ?? 0),
    };
  } catch {
    return null;
  }
}

function saveCachedProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...profile,
        xp: String(profile.xp),
        streakDays: String(profile.streakDays),
        lastPlayedEpoch: String(profile.lastPlayedEpoch),
      }),
    );
  } catch {
    /* noop */
  }
}

function hasCutsceneShown(): boolean {
  try {
    return localStorage.getItem("mm_cutscene_shown") === "true";
  } catch {
    return false;
  }
}
function markCutsceneShown() {
  try {
    localStorage.setItem("mm_cutscene_shown", "true");
  } catch {
    /* noop */
  }
}

function applyStoredTheme() {
  try {
    const theme = localStorage.getItem("mm_theme");
    if (theme && theme !== "neon-blue") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {
    /* noop */
  }
}

function applyStoredColorMode() {
  try {
    const mode = localStorage.getItem("mm_color_mode");
    if (mode === "light") {
      document.documentElement.setAttribute("data-color-mode", "light");
    }
  } catch {
    /* noop */
  }
}

// Award streak freeze tokens based on streak days (1 token per 7-day milestone)
function awardStreakFreezeTokens(streakDays: number) {
  try {
    const milestones = Math.floor(streakDays / 7);
    const awarded = Number.parseInt(
      localStorage.getItem("mm_streak_freeze_awarded") ?? "0",
      10,
    );
    if (milestones > awarded) {
      const tokens = Number.parseInt(
        localStorage.getItem("mm_streak_freeze_tokens") ?? "0",
        10,
      );
      const newTokens = tokens + (milestones - awarded);
      localStorage.setItem("mm_streak_freeze_tokens", String(newTokens));
      localStorage.setItem("mm_streak_freeze_awarded", String(milestones));
    }
  } catch {
    /* noop */
  }
}

// Grade promotion helpers
const GRADE_GROUP_GAMES: Record<
  string,
  { games: string[]; minGrade: number; maxGrade: number }
> = {
  "1-3": {
    games: [
      "number-catcher",
      "addition-rocket",
      "subtraction-blocks",
      "number-race",
      "shape-sorter",
      "skip-counter",
    ],
    minGrade: 1,
    maxGrade: 3,
  },
  "4-5": {
    games: [
      "fraction-battle",
      "decimal-dash",
      "time-master",
      "multiplication-madness",
      "division-dungeon",
      "word-problem-wizard",
    ],
    minGrade: 4,
    maxGrade: 5,
  },
  "6-8": {
    games: [
      "algebra-escape",
      "geometry-builder",
      "integer-war",
      "ratio-rumble",
      "percentage-power",
      "pattern-detective",
    ],
    minGrade: 6,
    maxGrade: 8,
  },
  "9-10": {
    games: [
      "quadratic-boss",
      "graph-builder",
      "trig-sniper",
      "statistics-showdown",
      "sequence-solver",
      "coordinate-quest",
    ],
    minGrade: 9,
    maxGrade: 10,
  },
  "11-12": {
    games: [
      "calculus-runner",
      "matrix-code",
      "probability-strategy",
      "complex-clash",
      "logarithm-lab",
      "vectors-voyage",
    ],
    minGrade: 11,
    maxGrade: 12,
  },
};

function getGradeGroup(grade: number) {
  if (grade <= 3) return "1-3";
  if (grade <= 5) return "4-5";
  if (grade <= 8) return "6-8";
  if (grade <= 10) return "9-10";
  return "11-12";
}

function checkGradePromotion(grade: number): boolean {
  const groupKey = getGradeGroup(grade);
  const group = GRADE_GROUP_GAMES[groupKey];
  if (!group || grade >= group.maxGrade) return false;

  const alreadyPromoted =
    localStorage.getItem(`mm_grade_promoted_${groupKey}`) === "true";
  if (alreadyPromoted) return false;

  try {
    const completedRaw = localStorage.getItem("mm_completed_games");
    const completed: string[] = completedRaw ? JSON.parse(completedRaw) : [];
    // Need at least 3 games beaten at level 3
    const beaten3 = group.games.filter((g) => completed.includes(`${g}_3`));
    return beaten3.length >= 3;
  } catch {
    return false;
  }
}

// ─── Game Intro helpers ────────────────────────────────────────────
const GAME_INFO: Record<string, { name: string; gradeGroup: string }> = {
  "number-catcher": { name: "Number Catcher", gradeGroup: "1-3" },
  "addition-rocket": { name: "Addition Rocket", gradeGroup: "1-3" },
  "subtraction-blocks": { name: "Subtraction Blocks", gradeGroup: "1-3" },
  "number-race": { name: "Number Race", gradeGroup: "1-3" },
  "shape-sorter": { name: "Shape Sorter", gradeGroup: "1-3" },
  "skip-counter": { name: "Skip Counter", gradeGroup: "1-3" },
  "fraction-battle": { name: "Fraction Battle Arena", gradeGroup: "4-5" },
  "decimal-dash": { name: "Decimal Dash", gradeGroup: "4-5" },
  "time-master": { name: "Time Master", gradeGroup: "4-5" },
  "multiplication-madness": {
    name: "Multiplication Madness",
    gradeGroup: "4-5",
  },
  "division-dungeon": { name: "Division Dungeon", gradeGroup: "4-5" },
  "word-problem-wizard": { name: "Word Problem Wizard", gradeGroup: "4-5" },
  "algebra-escape": { name: "Algebra Escape Room", gradeGroup: "6-8" },
  "geometry-builder": { name: "Geometry Builder", gradeGroup: "6-8" },
  "integer-war": { name: "Integer War", gradeGroup: "6-8" },
  "ratio-rumble": { name: "Ratio Rumble", gradeGroup: "6-8" },
  "percentage-power": { name: "Percentage Power", gradeGroup: "6-8" },
  "pattern-detective": { name: "Pattern Detective", gradeGroup: "6-8" },
  "quadratic-boss": { name: "Quadratic Boss Fight", gradeGroup: "9-10" },
  "graph-builder": { name: "Graph Builder Challenge", gradeGroup: "9-10" },
  "trig-sniper": { name: "Trigonometry Sniper", gradeGroup: "9-10" },
  "statistics-showdown": { name: "Statistics Showdown", gradeGroup: "9-10" },
  "sequence-solver": { name: "Sequence Solver", gradeGroup: "9-10" },
  "coordinate-quest": { name: "Coordinate Quest", gradeGroup: "9-10" },
  "calculus-runner": { name: "Calculus Runner", gradeGroup: "11-12" },
  "matrix-code": { name: "Matrix Code Breaker", gradeGroup: "11-12" },
  "probability-strategy": { name: "Probability Strategy", gradeGroup: "11-12" },
  "complex-clash": { name: "Complex Clash", gradeGroup: "11-12" },
  "logarithm-lab": { name: "Logarithm Lab", gradeGroup: "11-12" },
  "vectors-voyage": { name: "Vectors Voyage", gradeGroup: "11-12" },
};

function AppContent() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [showGameIntro, setShowGameIntro] = useState(false);
  const [localProfile, setLocalProfile] = useState<PlayerProfile | null>(() =>
    loadCachedProfile(),
  );
  const [initialized, setInitialized] = useState(false);
  const [showCutscene, setShowCutscene] = useState(() => !hasCutsceneShown());
  const [showGradePromotion, setShowGradePromotion] = useState(false);
  const [promotionGrade, setPromotionGrade] = useState(0);

  const { data: backendProfile, isLoading } = useProfile();
  const createOrUpdate = useCreateOrUpdateProfile();
  const _recordSession = useRecordGameSession();
  const submitLeaderboard = useSubmitLeaderboardEntry();

  // Send heartbeat every 30s so active-user count stays accurate
  const profile = backendProfile ?? localProfile;
  useHeartbeat(profile?.name ?? "");

  // Apply stored theme and color mode on startup
  useEffect(() => {
    applyStoredTheme();
    applyStoredColorMode();
  }, []);

  // Sync backend profile
  useEffect(() => {
    if (!isLoading) {
      if (backendProfile) {
        setLocalProfile(backendProfile);
        saveCachedProfile(backendProfile);
        // Award streak freeze tokens
        awardStreakFreezeTokens(Number(backendProfile.streakDays));
      }
      setInitialized(true);
    }
  }, [backendProfile, isLoading]);

  // Determine starting screen - always show onboarding (name entry) on every visit
  useEffect(() => {
    if (!initialized || showCutscene) return;
    // Always show onboarding so user enters their name every visit
    setScreen("onboarding");
  }, [initialized, showCutscene]);

  // Check grade promotion when on home screen
  useEffect(() => {
    if (screen !== "home") return;
    const profile = backendProfile ?? localProfile;
    if (!profile) return;
    if (checkGradePromotion(profile.grade)) {
      const newGrade = profile.grade + 1;
      setPromotionGrade(newGrade);
      setTimeout(() => setShowGradePromotion(true), 1000);
    }
  }, [screen, backendProfile, localProfile]);

  const handleOnboardingComplete = async (name: string, grade: number) => {
    const existingProfile = backendProfile ?? localProfile;
    const newProfile: PlayerProfile = existingProfile
      ? {
          ...existingProfile,
          name,
          grade,
        }
      : {
          name,
          grade,
          xp: BigInt(0),
          streakDays: BigInt(0),
          badges: [],
          weakTopics: [],
          lastPlayedEpoch: BigInt(0),
        };
    setLocalProfile(newProfile);
    saveCachedProfile(newProfile);
    setScreen("home");
    try {
      await createOrUpdate.mutateAsync({ name, grade });
    } catch {
      /* Backend unavailable */
    }
    const localXp = Number(newProfile.xp ?? 0);
    const localStreak = Number(newProfile.streakDays ?? 0);
    const localBadges = (newProfile.badges ?? []).length;
    submitLeaderboard.mutate({
      name,
      grade,
      xp: localXp,
      streakDays: localStreak,
      badgeCount: localBadges,
    });
  };

  const handleProfileUpdate = (updated: PlayerProfile) => {
    setLocalProfile(updated);
    saveCachedProfile(updated);
    submitLeaderboard.mutate({
      name: updated.name,
      grade: updated.grade,
      xp: Number(updated.xp ?? 0),
      streakDays: Number(updated.streakDays ?? 0),
      badgeCount: (updated.badges ?? []).length,
    });
  };

  const handleGradePromotion = async () => {
    if (!profile) return;
    const groupKey = getGradeGroup(profile.grade);
    localStorage.setItem(`mm_grade_promoted_${groupKey}`, "true");

    const newBadges = profile.badges.includes("grade_up")
      ? profile.badges
      : [...profile.badges, "grade_up"];
    const updatedProfile: PlayerProfile = {
      ...profile,
      grade: promotionGrade,
      badges: newBadges,
    };
    handleProfileUpdate(updatedProfile);
    setShowGradePromotion(false);

    try {
      await createOrUpdate.mutateAsync({
        name: profile.name,
        grade: promotionGrade,
      });
    } catch {
      /* noop */
    }
  };

  const navigate = (s: Screen) => setScreen(s);

  // Show cutscene first
  if (showCutscene) {
    return (
      <div className="min-h-screen relative">
        <FloatingMath />
        <AnimatePresence>
          <Cutscene
            onComplete={() => {
              markCutsceneShown();
              setShowCutscene(false);
            }}
          />
        </AnimatePresence>
      </div>
    );
  }

  if (!initialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FloatingMath />
        <div className="text-center z-10">
          <div className="text-6xl mb-4 animate-pulse-glow">🌌</div>
          <div className="font-display text-2xl font-bold gradient-text-cyan-purple animate-neon-flicker">
            MELTING MATHS
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            Loading your universe...
          </div>
        </div>
      </div>
    );
  }

  // Determine grade for background (use profile grade or default 1)
  const gradeForBg = profile?.grade ?? 1;
  const showGradeBackground = screen === "game-select" || screen === "game";

  return (
    <div className="min-h-screen relative">
      <FloatingMath />
      {showGradeBackground && <GradeBackground grade={gradeForBg} />}
      <div className="relative z-10">
        {screen === "onboarding" && (
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            isReturning={!!(backendProfile ?? localProfile)}
          />
        )}
        {screen === "home" && profile && (
          <HomeScreen profile={profile} onNavigate={navigate} />
        )}
        {screen === "game-select" && profile && (
          <GameSelectScreen
            profile={profile}
            onSelectGame={(gameId) => {
              setPendingGameId(gameId);
              setShowGameIntro(true);
            }}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "game" && selectedGame && profile && (
          <GameScreen
            gameId={selectedGame}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={() => setScreen("game-select")}
          />
        )}
        {screen === "shinchen" && profile && (
          <ShinchenScreen profile={profile} onBack={() => setScreen("home")} />
        )}
        {screen === "profile" && profile && (
          <ProfileScreen
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={() => setScreen("home")}
            onTeacherView={() => setScreen("teacher")}
            onAdminRegistry={() => setScreen("admin-registry")}
            onDeleteAccount={() => {
              setLocalProfile(null);
              setScreen("onboarding");
            }}
          />
        )}
        {screen === "leaderboard" && profile && (
          <LeaderboardScreen
            profile={profile}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "teacher" && profile && (
          <TeacherDashboard
            profile={profile}
            onBack={() => setScreen("profile")}
          />
        )}
        {screen === "analytics" && profile && (
          <AnalyticsScreen profile={profile} onBack={() => setScreen("home")} />
        )}
        {screen === "public-analytics" && (
          <PublicAnalyticsScreen onBack={() => setScreen("home")} />
        )}
        {screen === "admin-registry" && (
          <AdminRegistryScreen onBack={() => setScreen("home")} />
        )}
        {screen === "tournament" && profile && (
          <TournamentScreen
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "daily-dungeon" && profile && (
          <DailyDungeonScreen
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "boss-rush" && profile && (
          <BossRushScreen
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "challenge" && profile && (
          <ChallengeScreen
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onBack={() => setScreen("home")}
          />
        )}
      </div>

      {/* Game Intro Cinematic */}
      <AnimatePresence>
        {showGameIntro && pendingGameId && (
          <GameIntro
            gameTitle={GAME_INFO[pendingGameId]?.name ?? pendingGameId}
            gradeGroup={GAME_INFO[pendingGameId]?.gradeGroup ?? "1-3"}
            onComplete={() => {
              setSelectedGame(pendingGameId);
              setPendingGameId(null);
              setShowGameIntro(false);
              setScreen("game");
            }}
          />
        )}
      </AnimatePresence>

      {/* Grade Promotion Overlay */}
      <AnimatePresence>
        {showGradePromotion && profile && (
          <GradePromotion
            currentGrade={profile.grade}
            newGrade={promotionGrade}
            onAccept={handleGradePromotion}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
