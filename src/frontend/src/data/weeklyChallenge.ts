export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  gameId: string;
  targetScore: number;
  reward: string;
  icon: string;
}

const ALL_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "c1",
    title: "Number Ninja",
    description: "Score 70%+ on Number Catcher",
    gameId: "number-catcher",
    targetScore: 70,
    reward: "+50 XP",
    icon: "🎯",
  },
  {
    id: "c2",
    title: "Rocket Fuel",
    description: "Score 80%+ on Addition Rocket",
    gameId: "addition-rocket",
    targetScore: 80,
    reward: "+60 XP",
    icon: "🚀",
  },
  {
    id: "c3",
    title: "Fraction Fighter",
    description: "Score 70%+ on Fraction Battle",
    gameId: "fraction-battle",
    targetScore: 70,
    reward: "+70 XP",
    icon: "⚔️",
  },
  {
    id: "c4",
    title: "Algebra Ace",
    description: "Score 80%+ on Algebra Escape",
    gameId: "algebra-escape",
    targetScore: 80,
    reward: "+80 XP",
    icon: "🔐",
  },
  {
    id: "c5",
    title: "Quadratic Quasher",
    description: "Score 70%+ on Quadratic Boss",
    gameId: "quadratic-boss",
    targetScore: 70,
    reward: "+90 XP",
    icon: "👾",
  },
  {
    id: "c6",
    title: "Calculus Champion",
    description: "Score 70%+ on Calculus Runner",
    gameId: "calculus-runner",
    targetScore: 70,
    reward: "+100 XP",
    icon: "🏃",
  },
  {
    id: "c7",
    title: "Decimal Daredevil",
    description: "Score 80%+ on Decimal Dash",
    gameId: "decimal-dash",
    targetScore: 80,
    reward: "+65 XP",
    icon: "💨",
  },
  {
    id: "c8",
    title: "Time Wizard",
    description: "Score 90%+ on Time Master",
    gameId: "time-master",
    targetScore: 90,
    reward: "+80 XP",
    icon: "⏰",
  },
  {
    id: "c9",
    title: "Geometry Guru",
    description: "Score 80%+ on Geometry Builder",
    gameId: "geometry-builder",
    targetScore: 80,
    reward: "+75 XP",
    icon: "📐",
  },
  {
    id: "c10",
    title: "Matrix Master",
    description: "Score 70%+ on Matrix Code Breaker",
    gameId: "matrix-code",
    targetScore: 70,
    reward: "+95 XP",
    icon: "💻",
  },
  {
    id: "c11",
    title: "Trig Sharpshooter",
    description: "Score 80%+ on Trig Sniper",
    gameId: "trig-sniper",
    targetScore: 80,
    reward: "+85 XP",
    icon: "🎯",
  },
  {
    id: "c12",
    title: "Probability Pro",
    description: "Score 70%+ on Probability Strategy",
    gameId: "probability-strategy",
    targetScore: 70,
    reward: "+90 XP",
    icon: "🎲",
  },
  {
    id: "c13",
    title: "Pattern Detective",
    description: "Score 90%+ on Pattern Detective",
    gameId: "pattern-detective",
    targetScore: 90,
    reward: "+85 XP",
    icon: "🔍",
  },
  {
    id: "c14",
    title: "Subtraction Slayer",
    description: "Score 80%+ on Subtraction Blocks",
    gameId: "subtraction-blocks",
    targetScore: 80,
    reward: "+55 XP",
    icon: "🧊",
  },
  {
    id: "c15",
    title: "Integer Warrior",
    description: "Score 80%+ on Integer War",
    gameId: "integer-war",
    targetScore: 80,
    reward: "+80 XP",
    icon: "⚡",
  },
  {
    id: "c16",
    title: "Graph Builder",
    description: "Score 70%+ on Graph Builder Challenge",
    gameId: "graph-builder",
    targetScore: 70,
    reward: "+85 XP",
    icon: "📈",
  },
  {
    id: "c17",
    title: "Vector Voyager",
    description: "Score 70%+ on Vectors Voyage",
    gameId: "vectors-voyage",
    targetScore: 70,
    reward: "+95 XP",
    icon: "🧭",
  },
  {
    id: "c18",
    title: "Sequence Solver",
    description: "Score 90%+ on Sequence Solver",
    gameId: "sequence-solver",
    targetScore: 90,
    reward: "+90 XP",
    icon: "🧮",
  },
];

export function getCurrentWeekNum(): number {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

export function getWeeklyChallenges(): WeeklyChallenge[] {
  const weekNum = getCurrentWeekNum();
  const seed = weekNum % ALL_CHALLENGES.length;
  // Pick 3 non-overlapping challenges based on week seed
  const indices = [
    seed % ALL_CHALLENGES.length,
    (seed + 6) % ALL_CHALLENGES.length,
    (seed + 12) % ALL_CHALLENGES.length,
  ];
  return indices.map((i) => ALL_CHALLENGES[i]);
}

export function getCompletedChallengeIds(): string[] {
  const weekNum = getCurrentWeekNum();
  const key = `mm_weekly_challenges_${weekNum}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markChallengeComplete(challengeId: string): void {
  const weekNum = getCurrentWeekNum();
  const key = `mm_weekly_challenges_${weekNum}`;
  try {
    const completed = getCompletedChallengeIds();
    if (!completed.includes(challengeId)) {
      completed.push(challengeId);
      localStorage.setItem(key, JSON.stringify(completed));
    }
  } catch {
    /* noop */
  }
}

export function checkAndCompleteChallenge(
  gameId: string,
  score: number,
): WeeklyChallenge | null {
  const challenges = getWeeklyChallenges();
  const completed = getCompletedChallengeIds();
  for (const c of challenges) {
    if (
      c.gameId === gameId &&
      score >= c.targetScore &&
      !completed.includes(c.id)
    ) {
      markChallengeComplete(c.id);
      return c;
    }
  }
  return null;
}
