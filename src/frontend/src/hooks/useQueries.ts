import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type {
  LeaderboardEntry,
  PlayerProfile,
  PublicStats,
  StudentRegistryEntry,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Profile ────────────────────────────────────────────────────
export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, grade }: { name: string; grade: number }) => {
      if (!actor) throw new Error("No actor");
      await actor.createOrUpdateProfile(name, grade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useResetProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.resetProgress();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["unlockedLevels"] });
    },
  });
}

// ─── Leaderboard ────────────────────────────────────────────────
export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTopLeaderboardEntries();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ─── Game session ────────────────────────────────────────────────
export function useRecordGameSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameId,
      level,
      score,
      correctAnswers,
      incorrectAnswers,
      topicId,
    }: {
      gameId: string;
      level: number;
      score: number;
      correctAnswers: number;
      incorrectAnswers: number;
      topicId: string;
    }) => {
      if (!actor) return;
      try {
        await actor.recordGameSession(
          gameId,
          BigInt(level),
          BigInt(Math.round(score)),
          BigInt(correctAnswers),
          BigInt(incorrectAnswers),
          topicId,
        );
      } catch {
        // Swallow backend errors — game already played
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// ─── Total Visits ─────────────────────────────────────────────────
export function useTotalVisits() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalVisits"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        await actor.trackVisit();
        return await actor.getTotalVisits();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ─── Public Stats (for Public Analytics page) ────────────────────
export function usePublicStats() {
  const { actor, isFetching } = useActor();
  const hasTrackedRef = useRef(false);

  // Track visit once when actor is ready
  useEffect(() => {
    if (actor && !isFetching && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      actor.trackVisit().catch(() => {});
    }
  }, [actor, isFetching]);

  const statsQuery = useQuery<PublicStats>({
    queryKey: ["publicStats"],
    queryFn: async () => {
      if (!actor) return { totalVisits: BigInt(0), leaderboard: [] };
      try {
        return await actor.getPublicStats();
      } catch {
        return { totalVisits: BigInt(0), leaderboard: [] };
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });

  return { statsQuery };
}

// ─── Submit Leaderboard Entry ─────────────────────────────────────
export function useSubmitLeaderboardEntry() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      grade,
      xp,
      streakDays,
      badgeCount,
    }: {
      name: string;
      grade: number;
      xp: number;
      streakDays: number;
      badgeCount: number;
    }) => {
      if (!actor) return;
      try {
        await actor.submitLeaderboardEntry(
          name,
          grade,
          BigInt(xp),
          BigInt(streakDays),
          BigInt(badgeCount),
        );
      } catch {
        // swallow - non-critical
      }
    },
  });
}

// ─── Student Registry (Admin) ─────────────────────────────────────
export function useAllStudentProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<StudentRegistryEntry[]>({
    queryKey: ["allStudentProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllStudentProfiles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Unlocked levels ─────────────────────────────────────────────
export function useUnlockedLevels(gameId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<number[]>({
    queryKey: ["unlockedLevels", gameId],
    queryFn: async () => {
      if (!actor) return [1];
      try {
        const result = await actor.getUnlockedLevels(gameId);
        return result.map(Number);
      } catch {
        return [1];
      }
    },
    enabled: !!actor && !isFetching && !!gameId,
    staleTime: 30_000,
  });
}
