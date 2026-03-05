// Analytics utilities for Melting Maths
// All data is read from / written to localStorage

export interface SessionRecord {
  date: string; // ISO string
  gameId: string;
  durationMs: number;
  correct: number;
  total: number;
  xpEarned: number;
}

const SESSION_LOG_KEY = "mm_session_log";
const MAX_SESSION_ENTRIES = 500;

// ─── Read / Write session log ─────────────────────────────────────────────────

export function getSessionLog(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSION_LOG_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordSession(
  gameId: string,
  durationMs: number,
  correct: number,
  total: number,
  xpEarned: number,
): void {
  try {
    const log = getSessionLog();
    log.push({
      date: new Date().toISOString(),
      gameId,
      durationMs,
      correct,
      total,
      xpEarned,
    });
    // Keep max 500 entries (trim oldest)
    const trimmed = log.slice(-MAX_SESSION_ENTRIES);
    localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    /* noop */
  }
}

// ─── Daily XP for last 7 days ─────────────────────────────────────────────────

export interface DayXp {
  dayLabel: string; // e.g. "Mon"
  xp: number;
  isToday: boolean;
}

export function getDailyXpLast7Days(): DayXp[] {
  const log = getSessionLog();
  const result: DayXp[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toDateString();

    const xp = log
      .filter((s) => new Date(s.date).toDateString() === dateStr)
      .reduce((sum, s) => sum + s.xpEarned, 0);

    result.push({ dayLabel, xp, isToday: i === 0 });
  }

  return result;
}

// ─── Activity heatmap (last 7 days) ──────────────────────────────────────────

export interface HeatmapDay {
  dayLabel: string;
  played: boolean;
  isToday: boolean;
}

export function getActivityHeatmap(): HeatmapDay[] {
  const log = getSessionLog();
  const now = new Date();
  const result: HeatmapDay[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toDateString();
    const played = log.some((s) => new Date(s.date).toDateString() === dateStr);
    result.push({ dayLabel, played, isToday: i === 0 });
  }

  return result;
}

// ─── Accuracy by grade group ──────────────────────────────────────────────────

export interface GradeGroupAccuracy {
  label: string; // "Grades 1-3"
  key: string; // "1-3"
  accuracy: number; // 0–100
  color: string; // oklch string
}

const GRADE_GROUP_GAME_IDS: Record<string, string[]> = {
  "1-3": [
    "number-catcher",
    "addition-rocket",
    "subtraction-blocks",
    "number-race",
    "shape-sorter",
    "skip-counter",
    "boss-1-3",
  ],
  "4-5": [
    "fraction-battle",
    "decimal-dash",
    "time-master",
    "multiplication-madness",
    "division-dungeon",
    "word-problem-wizard",
    "boss-4-5",
  ],
  "6-8": [
    "algebra-escape",
    "geometry-builder",
    "integer-war",
    "ratio-rumble",
    "percentage-power",
    "pattern-detective",
    "boss-6-8",
  ],
  "9-10": [
    "quadratic-boss",
    "graph-builder",
    "trig-sniper",
    "statistics-showdown",
    "sequence-solver",
    "coordinate-quest",
    "boss-9-10",
  ],
  "11-12": [
    "calculus-runner",
    "matrix-code",
    "probability-strategy",
    "complex-clash",
    "logarithm-lab",
    "vectors-voyage",
    "boss-11-12",
  ],
};

const GRADE_GROUP_COLORS: Record<string, string> = {
  "1-3": "oklch(0.78 0.2 195)", // cyan
  "4-5": "oklch(0.7 0.22 280)", // purple
  "6-8": "oklch(0.65 0.22 255)", // blue
  "9-10": "oklch(0.82 0.18 70)", // amber
  "11-12": "oklch(0.72 0.22 155)", // green
};

export function getAccuracyByGradeGroup(): GradeGroupAccuracy[] {
  const log = getSessionLog();

  return Object.entries(GRADE_GROUP_GAME_IDS).map(([key, gameIds]) => {
    const sessions = log.filter((s) => gameIds.includes(s.gameId));
    let accuracy = 0;
    if (sessions.length > 0) {
      const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
      const totalQuestions = sessions.reduce((sum, s) => sum + s.total, 0);
      accuracy =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;
    }

    const labels: Record<string, string> = {
      "1-3": "Grades 1–3",
      "4-5": "Grades 4–5",
      "6-8": "Grades 6–8",
      "9-10": "Grades 9–10",
      "11-12": "Grades 11–12",
    };

    return {
      label: labels[key] ?? `Grades ${key}`,
      key,
      accuracy,
      color: GRADE_GROUP_COLORS[key] ?? "oklch(0.78 0.2 195)",
    };
  });
}

// ─── Top games ────────────────────────────────────────────────────────────────

export interface TopGame {
  gameId: string;
  count: number;
}

export function getTopGames(limit = 3): TopGame[] {
  try {
    const raw = localStorage.getItem("mm_game_play_counts");
    const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([gameId, count]) => ({ gameId, count }));
  } catch {
    return [];
  }
}

// ─── Total time played ────────────────────────────────────────────────────────

export function getTotalTimePlayed(): string {
  const log = getSessionLog();
  const totalMs = log.reduce((sum, s) => sum + s.durationMs, 0);
  const totalSec = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours === 0 && minutes === 0) return "<1m";
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// ─── Per-game stats ───────────────────────────────────────────────────────────

export interface GameStat {
  gameId: string;
  timesPlayed: number;
  avgAccuracy: number;
  lastPlayed: string; // formatted date string
}

export function getPerGameStats(): GameStat[] {
  const log = getSessionLog();
  const grouped: Record<string, SessionRecord[]> = {};

  for (const session of log) {
    if (!grouped[session.gameId]) grouped[session.gameId] = [];
    grouped[session.gameId].push(session);
  }

  return Object.entries(grouped).map(([gameId, sessions]) => {
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.total, 0);
    const avgAccuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    // Find most recent session
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const lastPlayed = sorted[0]
      ? new Date(sorted[0].date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—";

    return {
      gameId,
      timesPlayed: sessions.length,
      avgAccuracy,
      lastPlayed,
    };
  });
}

// ─── Avg accuracy overall ─────────────────────────────────────────────────────

export function getOverallAccuracy(): number {
  try {
    const correct = Number.parseInt(
      localStorage.getItem("mm_total_correct") || "0",
      10,
    );
    const total = Number.parseInt(
      localStorage.getItem("mm_total_questions") || "0",
      10,
    );
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  } catch {
    return 0;
  }
}

// ─── Games played count ───────────────────────────────────────────────────────

export function getGamesPlayedCount(): number {
  try {
    return Number.parseInt(localStorage.getItem("mm_games_played") || "0", 10);
  } catch {
    return 0;
  }
}

// ─── Prettify gameId → name ───────────────────────────────────────────────────

const GAME_NAMES: Record<string, string> = {
  "number-catcher": "Number Catcher",
  "fraction-battle": "Fraction Battle",
  "algebra-escape": "Algebra Escape",
  "quadratic-boss": "Quadratic Boss Fight",
  "calculus-runner": "Calculus Runner",
  "addition-rocket": "Addition Rocket",
  "subtraction-blocks": "Subtraction Blocks",
  "decimal-dash": "Decimal Dash",
  "time-master": "Time Master",
  "geometry-builder": "Geometry Builder",
  "integer-war": "Integer War",
  "graph-builder": "Graph Builder",
  "trig-sniper": "Trig Sniper",
  "matrix-code": "Matrix Code Breaker",
  "probability-strategy": "Probability Strategy",
  "number-race": "Number Race",
  "shape-sorter": "Shape Sorter",
  "skip-counter": "Skip Counter",
  "multiplication-madness": "Multiplication Madness",
  "division-dungeon": "Division Dungeon",
  "word-problem-wizard": "Word Problem Wizard",
  "ratio-rumble": "Ratio Rumble",
  "percentage-power": "Percentage Power",
  "pattern-detective": "Pattern Detective",
  "statistics-showdown": "Statistics Showdown",
  "sequence-solver": "Sequence Solver",
  "coordinate-quest": "Coordinate Quest",
  "complex-clash": "Complex Clash",
  "logarithm-lab": "Logarithm Lab",
  "vectors-voyage": "Vectors Voyage",
  "boss-1-3": "Boss: Grades 1–3",
  "boss-4-5": "Boss: Grades 4–5",
  "boss-6-8": "Boss: Grades 6–8",
  "boss-9-10": "Boss: Grades 9–10",
  "boss-11-12": "Boss: Grades 11–12",
};

export function prettifyGameId(gameId: string): string {
  return (
    GAME_NAMES[gameId] ??
    gameId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}
