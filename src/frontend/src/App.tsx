import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import type { PlayerProfile } from "./backend.d";
import { Cutscene } from "./components/Cutscene";
import { FloatingMath } from "./components/FloatingMath";
import { GradeBackground } from "./components/GradeBackground";
import { GradePromotion } from "./components/GradePromotion";
import {
  useCreateOrUpdateProfile,
  useProfile,
  useRecordGameSession,
} from "./hooks/useQueries";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { GameScreen } from "./screens/GameScreen";
import { GameSelectScreen } from "./screens/GameSelectScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ShinchenScreen } from "./screens/ShinchenScreen";
import { TeacherDashboard } from "./screens/TeacherDashboard";

export type Screen =
  | "onboarding"
  | "home"
  | "game-select"
  | "game"
  | "shinchen"
  | "profile"
  | "leaderboard"
  | "teacher"
  | "analytics";

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

function AppContent() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
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

  // Determine starting screen
  useEffect(() => {
    if (!initialized || showCutscene) return;
    const profile = backendProfile ?? localProfile;
    if (!profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [initialized, backendProfile, localProfile, showCutscene]);

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

  const profile = backendProfile ?? localProfile;

  const handleOnboardingComplete = async (name: string, grade: number) => {
    const newProfile: PlayerProfile = {
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
  };

  const handleProfileUpdate = (updated: PlayerProfile) => {
    setLocalProfile(updated);
    saveCachedProfile(updated);
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
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
        {screen === "home" && profile && (
          <HomeScreen profile={profile} onNavigate={navigate} />
        )}
        {screen === "game-select" && profile && (
          <GameSelectScreen
            profile={profile}
            onSelectGame={(gameId) => {
              setSelectedGame(gameId);
              setScreen("game");
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
      </div>

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
