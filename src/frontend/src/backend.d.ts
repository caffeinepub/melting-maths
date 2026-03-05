import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    xp: bigint;
    name: string;
    grade: number;
}
export type Time = bigint;
export interface PlayerProfile {
    xp: bigint;
    name: string;
    badges: Array<string>;
    streakDays: bigint;
    weakTopics: Array<string>;
    lastPlayedEpoch: Time;
    grade: number;
}
export interface backendInterface {
    createOrUpdateProfile(name: string, grade: number): Promise<void>;
    getProfile(): Promise<PlayerProfile | null>;
    getTopLeaderboardEntries(): Promise<Array<LeaderboardEntry>>;
    getTotalVisits(): Promise<bigint>;
    getUnlockedLevels(gameId: string): Promise<Array<bigint>>;
    recordGameSession(gameId: string, level: bigint, score: bigint, correctAnswers: bigint, incorrectAnswers: bigint, topicId: string): Promise<void>;
    resetProgress(): Promise<void>;
    trackVisit(): Promise<void>;
}
