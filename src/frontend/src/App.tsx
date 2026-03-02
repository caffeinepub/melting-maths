import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { PlayerProfile } from "./backend.d";
import { FloatingMath } from "./components/FloatingMath";
import { useCreateOrUpdateProfile, useProfile } from "./hooks/useQueries";
import { GameScreen } from "./screens/GameScreen";
import { GameSelectScreen } from "./screens/GameSelectScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ShinchenScreen } from "./screens/ShinchenScreen";

export type Screen =
  | "onboarding"
  | "home"
  | "game-select"
  | "game"
  | "shinchen"
  | "profile"
  | "leaderboard";

const STORAGE_KEY = "meltingmaths_profile";

function loadCachedProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    // Convert to proper types
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<PlayerProfile | null>(() =>
    loadCachedProfile(),
  );
  const [initialized, setInitialized] = useState(false);

  const { data: backendProfile, isLoading } = useProfile();
  const createOrUpdate = useCreateOrUpdateProfile();

  // Sync backend profile with local cache
  useEffect(() => {
    if (!isLoading) {
      if (backendProfile) {
        setLocalProfile(backendProfile);
        saveCachedProfile(backendProfile);
      }
      setInitialized(true);
    }
  }, [backendProfile, isLoading]);

  // Determine starting screen
  useEffect(() => {
    if (!initialized) return;
    const profile = backendProfile ?? localProfile;
    if (!profile) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, [initialized, backendProfile, localProfile]);

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
      // Backend unavailable, use local profile
    }
  };

  const handleProfileUpdate = (updated: PlayerProfile) => {
    setLocalProfile(updated);
    saveCachedProfile(updated);
  };

  const navigate = (s: Screen) => setScreen(s);

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

  return (
    <div className="min-h-screen relative">
      <FloatingMath />
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
          />
        )}
        {screen === "leaderboard" && profile && (
          <LeaderboardScreen
            profile={profile}
            onBack={() => setScreen("home")}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
