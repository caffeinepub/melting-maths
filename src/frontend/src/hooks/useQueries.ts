import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type {
  ClassGroup,
  LeaderboardEntry,
  PlayerProfile,
  PublicStats,
  StudentRegistryEntry,
} from "../backend.d";
import { useActor } from "./useActor";

// Module-level flag so trackVisit() is only called once per page load
let visitTracked = false;

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
        // Only track the visit once per page load (module-level flag)
        if (!visitTracked) {
          await actor.trackVisit();
          visitTracked = true;
        }
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

  const statsQuery = useQuery<PublicStats>({
    queryKey: ["publicStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalVisits: BigInt(0),
          leaderboard: [],
          activeUsers: BigInt(0),
        };
      try {
        return await actor.getPublicStats();
      } catch {
        return {
          totalVisits: BigInt(0),
          leaderboard: [],
          activeUsers: BigInt(0),
        };
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000, // reduced from 15s -> 30s
    staleTime: 25_000,
    refetchOnWindowFocus: false, // don't spam on tab switch
  });

  return { statsQuery };
}

// ─── Active Users ─────────────────────────────────────────────────
export function useActiveUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["activeUsers"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getActiveUsers();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000, // reduced from 15s -> 30s
    staleTime: 25_000,
    refetchOnWindowFocus: false,
  });
}

// ─── Heartbeat ────────────────────────────────────────────────────
export function useHeartbeat(name: string) {
  const { actor, isFetching } = useActor();
  const nameRef = useRef(name);
  nameRef.current = name;

  useEffect(() => {
    if (!actor || isFetching || !nameRef.current) return;

    // Delay initial heartbeat by 5s so it doesn't fire during page load
    const initialTimer = setTimeout(() => {
      if (nameRef.current) {
        actor.heartbeat(nameRef.current).catch(() => {});
      }
    }, 5_000);

    // Then every 45 seconds (was 30s)
    const interval = setInterval(() => {
      if (nameRef.current) {
        actor.heartbeat(nameRef.current).catch(() => {});
      }
    }, 45_000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [actor, isFetching]);
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

// ─── Class Groups ─────────────────────────────────────────────────
export function useCreateClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      joinCode,
    }: { name: string; joinCode: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createClass(name, joinCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allClasses"] });
    },
  });
}

export function useGetAllClasses() {
  const { actor, isFetching } = useActor();
  return useQuery<ClassGroup[]>({
    queryKey: ["allClasses"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllClasses();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetClassByCode(joinCode: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ClassGroup | null>({
    queryKey: ["classByCode", joinCode],
    queryFn: async () => {
      if (!actor || !joinCode) return null;
      try {
        return await actor.getClassByCode(joinCode);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!joinCode,
    staleTime: 30_000,
  });
}

export function useJoinClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      joinCode,
      studentName,
    }: { joinCode: string; studentName: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.joinClass(joinCode, studentName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allClasses"] });
    },
  });
}

export function useRemoveStudentFromClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      joinCode,
      studentName,
    }: { joinCode: string; studentName: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.removeStudentFromClass(joinCode, studentName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allClasses"] });
    },
  });
}

export function useGetWeeklyTopPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<StudentRegistryEntry[]>({
    queryKey: ["weeklyTopPlayers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWeeklyTopPlayers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
