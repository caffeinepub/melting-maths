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
export interface StudentRegistryEntry {
    xp: bigint;
    name: string;
    streakDays: bigint;
    grade: number;
    badgeCount: bigint;
    lastActive: Time;
}
export type Time = bigint;
export interface ClassGroup {
    id: string;
    joinCode: string;
    name: string;
    createdAt: Time;
    memberNames: Array<string>;
}
export interface PublicStats {
    activeUsers: bigint;
    leaderboard: Array<LeaderboardEntry>;
    totalVisits: bigint;
}
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
    createClass(name: string, joinCode: string): Promise<string>;
    createOrUpdateProfile(name: string, grade: number): Promise<void>;
    getActiveUsers(): Promise<bigint>;
    getAllClasses(): Promise<Array<ClassGroup>>;
    getAllStudentProfiles(): Promise<Array<StudentRegistryEntry>>;
    getClassByCode(joinCode: string): Promise<ClassGroup | null>;
    getProfile(): Promise<PlayerProfile | null>;
    getPublicStats(): Promise<PublicStats>;
    getTopLeaderboardEntries(): Promise<Array<LeaderboardEntry>>;
    getTotalVisits(): Promise<bigint>;
    getUnlockedLevels(gameId: string): Promise<Array<bigint>>;
    getWeeklyTopPlayers(): Promise<Array<StudentRegistryEntry>>;
    heartbeat(name: string): Promise<void>;
    joinClass(joinCode: string, studentName: string): Promise<boolean>;
    recordGameSession(gameId: string, level: bigint, score: bigint, correctAnswers: bigint, incorrectAnswers: bigint, topicId: string): Promise<void>;
    removeStudentFromClass(joinCode: string, studentName: string): Promise<void>;
    resetProgress(): Promise<void>;
    submitLeaderboardEntry(name: string, grade: number, xp: bigint, streakDays: bigint, badgeCount: bigint): Promise<void>;
    trackVisit(): Promise<void>;
}
