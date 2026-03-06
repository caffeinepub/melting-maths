import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { StudentRegistryEntry } from "../backend.d";
import { useAllStudentProfiles } from "../hooks/useQueries";

interface AdminRegistryScreenProps {
  onBack: () => void;
}

const DEFAULT_PIN = "1234";
const PIN_STORAGE_KEY = "mm_teacher_pin";

function getStoredPin(): string {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) ?? DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

function formatRelativeTime(lastActiveNs: bigint): string {
  const nowMs = Date.now();
  const lastActiveMs = Number(lastActiveNs) / 1_000_000;
  const diffMs = nowMs - lastActiveMs;

  if (diffMs < 0) return "just now";
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

function getGradeColor(grade: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (grade <= 3)
    return {
      bg: "oklch(0.15 0.05 155 / 0.4)",
      text: "oklch(0.72 0.22 155)",
      border: "oklch(0.72 0.22 155 / 0.4)",
    };
  if (grade <= 5)
    return {
      bg: "oklch(0.15 0.05 195 / 0.4)",
      text: "oklch(0.78 0.2 195)",
      border: "oklch(0.78 0.2 195 / 0.4)",
    };
  if (grade <= 8)
    return {
      bg: "oklch(0.15 0.06 280 / 0.4)",
      text: "oklch(0.7 0.22 280)",
      border: "oklch(0.7 0.22 280 / 0.4)",
    };
  if (grade <= 10)
    return {
      bg: "oklch(0.15 0.06 50 / 0.4)",
      text: "oklch(0.82 0.18 70)",
      border: "oklch(0.82 0.18 70 / 0.4)",
    };
  return {
    bg: "oklch(0.15 0.06 310 / 0.4)",
    text: "oklch(0.72 0.25 310)",
    border: "oklch(0.72 0.25 310 / 0.4)",
  };
}

type SortKey = "xp" | "name" | "grade" | "streak" | "badges";

// ─── PIN Gate ─────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const correctPin = getStoredPin();

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === correctPin) {
        setTimeout(() => onUnlock(), 300);
      } else {
        setTimeout(() => {
          setPin("");
          setError(true);
        }, 400);
      }
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 w-full max-w-xs"
        data-ocid="admin_registry.pin.panel"
      >
        <div className="text-5xl">🗂️</div>
        <div className="text-center">
          <h2 className="font-display text-2xl font-black text-glow-cyan">
            Admin Registry
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Enter 4-digit PIN to access
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [-4, 4, -3, 3, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? error
                    ? "bg-red-400 border-red-400"
                    : "bg-neon-cyan border-neon-cyan"
                  : "border-border/60 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-semibold"
          >
            Incorrect PIN. Try again!
          </motion.p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
            (d, i) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: static numpad layout
                key={i}
                type="button"
                onClick={() =>
                  d === "⌫"
                    ? handleBackspace()
                    : d !== ""
                      ? handleDigit(d)
                      : undefined
                }
                disabled={d === ""}
                className={`h-14 rounded-xl font-display text-xl font-bold transition-all
                  ${d === "" ? "opacity-0 pointer-events-none" : "btn-neon-cyan hover:scale-105 active:scale-95"}`}
                data-ocid={
                  d === "⌫"
                    ? "admin_registry.pin.backspace.button"
                    : d !== ""
                      ? "admin_registry.pin.digit.button"
                      : undefined
                }
              >
                {d}
              </button>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Skeleton Rows ─────────────────────────────────────────────────
function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{
        background: "oklch(0.1 0.02 265 / 0.4)",
        border: "1px solid oklch(0.25 0.04 270 / 0.3)",
      }}
      data-ocid="admin_registry.loading_state"
    >
      <div
        className="w-8 h-8 rounded-lg animate-pulse"
        style={{ background: "oklch(0.2 0.04 270 / 0.6)" }}
      />
      <div className="flex-1 space-y-1.5">
        <div
          className="h-3.5 rounded-md animate-pulse w-32"
          style={{ background: "oklch(0.22 0.04 270 / 0.5)" }}
        />
        <div
          className="h-2.5 rounded-md animate-pulse w-20"
          style={{ background: "oklch(0.18 0.03 270 / 0.4)" }}
        />
      </div>
      <div
        className="w-10 h-3.5 rounded-md animate-pulse"
        style={{ background: "oklch(0.2 0.04 270 / 0.5)" }}
      />
      <div
        className="w-10 h-3.5 rounded-md animate-pulse"
        style={{ background: "oklch(0.2 0.04 270 / 0.5)" }}
      />
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────
function RegistryDashboard({
  onBack,
  students,
  isLoading,
}: {
  onBack: () => void;
  students: StudentRegistryEntry[];
  isLoading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("xp");

  const totalXP = useMemo(
    () => students.reduce((sum, s) => sum + Number(s.xp), 0),
    [students],
  );
  const avgStreak = useMemo(
    () =>
      students.length > 0
        ? Math.round(
            students.reduce((sum, s) => sum + Number(s.streakDays), 0) /
              students.length,
          )
        : 0,
    [students],
  );
  const mostPopularGrade = useMemo(() => {
    if (students.length === 0) return "—";
    const counts: Record<number, number> = {};
    for (const s of students) {
      counts[s.grade] = (counts[s.grade] ?? 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? `Grade ${top[0]}` : "—";
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = q
      ? students.filter((s) => s.name.toLowerCase().includes(q))
      : [...students];
    list = list.sort((a, b) => {
      switch (sortKey) {
        case "xp":
          return Number(b.xp) - Number(a.xp);
        case "name":
          return a.name.localeCompare(b.name);
        case "grade":
          return a.grade - b.grade;
        case "streak":
          return Number(b.streakDays) - Number(a.streakDays);
        case "badges":
          return Number(b.badgeCount) - Number(a.badgeCount);
        default:
          return 0;
      }
    });
    return list;
  }, [students, search, sortKey]);

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "xp", label: "XP" },
    { value: "name", label: "Name" },
    { value: "grade", label: "Grade" },
    { value: "streak", label: "Streak" },
    { value: "badges", label: "Badges" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-1"
        >
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            data-ocid="admin_registry.back.button"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2 flex-1">
            <h1 className="font-display text-2xl font-black text-glow-cyan">
              Admin Registry
            </h1>
            <motion.div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.12 0.06 155 / 0.7)",
                color: "oklch(0.72 0.22 155)",
                border: "1px solid oklch(0.72 0.22 155 / 0.4)",
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "oklch(0.72 0.22 155)" }}
              />
              LIVE
            </motion.div>
          </div>
          {/* Student count badge */}
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "oklch(0.15 0.04 195 / 0.6)",
              border: "1px solid oklch(0.78 0.2 195 / 0.4)",
              color: "oklch(0.85 0.15 195)",
            }}
          >
            {isLoading ? "…" : `${students.length} students`}
          </div>
        </motion.div>
        <p className="text-muted-foreground text-xs pl-[3.75rem]">
          All registered students from the backend
        </p>
      </header>

      <div className="flex-1 px-6 pb-8 space-y-4">
        {/* ── Summary Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            {
              label: "Total Students",
              value: isLoading ? "…" : students.length.toString(),
              color: "oklch(0.78 0.2 195)",
              glow: "oklch(0.78 0.2 195 / 0.2)",
              icon: "👥",
            },
            {
              label: "Total XP Earned",
              value: isLoading ? "…" : totalXP.toLocaleString(),
              color: "oklch(0.72 0.22 155)",
              glow: "oklch(0.72 0.22 155 / 0.2)",
              icon: "⭐",
            },
            {
              label: "Avg. Streak",
              value: isLoading ? "…" : `${avgStreak}🔥`,
              color: "oklch(0.82 0.18 70)",
              glow: "oklch(0.82 0.18 70 / 0.2)",
              icon: "🔥",
            },
            {
              label: "Top Grade",
              value: isLoading ? "…" : mostPopularGrade,
              color: "oklch(0.7 0.22 280)",
              glow: "oklch(0.7 0.22 280 / 0.2)",
              icon: "🎓",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.1 0.03 265 / 0.8), oklch(0.08 0.02 265 / 0.9))",
                border: `1px solid ${stat.color.replace(")", " / 0.25)")}`,
                boxShadow: `0 0 20px ${stat.glow}`,
              }}
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <div
                className="font-display text-xl font-black"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs mt-0.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Search + Sort ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
              style={{
                background: "oklch(0.12 0.03 265 / 0.8)",
                border: "1px solid oklch(0.3 0.05 270 / 0.5)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.78 0.2 195 / 0.7)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.3 0.05 270 / 0.5)";
              }}
              data-ocid="admin_registry.search.input"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground outline-none cursor-pointer"
            style={{
              background: "oklch(0.12 0.03 265 / 0.8)",
              border: "1px solid oklch(0.3 0.05 270 / 0.5)",
            }}
            data-ocid="admin_registry.sort.select"
          >
            {SORT_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                style={{ background: "oklch(0.12 0.03 265)" }}
              >
                Sort: {o.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* ── Student List ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid oklch(0.25 0.04 270 / 0.4)",
            background: "oklch(0.09 0.02 265 / 0.6)",
          }}
        >
          {/* Table header */}
          <div
            className="grid gap-2 px-4 py-3 text-xs font-bold text-muted-foreground tracking-wider uppercase"
            style={{
              gridTemplateColumns: "2rem 1fr auto auto auto auto",
              borderBottom: "1px solid oklch(0.2 0.04 270 / 0.4)",
              background: "oklch(0.11 0.03 270 / 0.5)",
            }}
          >
            <span>#</span>
            <span>Student</span>
            <span
              className="text-right"
              style={{ color: "oklch(0.78 0.2 195)" }}
            >
              XP
            </span>
            <span
              className="text-right"
              style={{ color: "oklch(0.82 0.18 70)" }}
            >
              Streak
            </span>
            <span
              className="text-right"
              style={{ color: "oklch(0.7 0.22 280)" }}
            >
              Badges
            </span>
            <span className="text-right text-muted-foreground">Active</span>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="divide-y divide-border/20">
              {Array.from({ length: 5 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <SkeletonRow key={i} index={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12 px-6 text-center"
              data-ocid="admin_registry.empty_state"
            >
              <div className="text-5xl opacity-40">📋</div>
              <div className="text-muted-foreground text-sm">
                {search
                  ? `No students match "${search}"`
                  : "No students registered yet. Students register when they first log in."}
              </div>
            </motion.div>
          )}

          {/* Student rows */}
          {!isLoading && filtered.length > 0 && (
            <div className="divide-y divide-border/10">
              <AnimatePresence>
                {filtered.map((student, index) => {
                  const gradeColors = getGradeColor(student.grade);
                  return (
                    <motion.div
                      key={`${student.name}-${student.grade}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: index * 0.03, duration: 0.25 }}
                      whileHover={{
                        backgroundColor: "oklch(0.13 0.03 265 / 0.6)",
                      }}
                      className="grid gap-2 px-4 py-3 items-center cursor-default transition-colors"
                      style={{
                        gridTemplateColumns: "2rem 1fr auto auto auto auto",
                      }}
                      data-ocid={`admin_registry.student.row.${index + 1}`}
                    >
                      {/* Rank */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background:
                            index < 3
                              ? `oklch(${index === 0 ? "0.82 0.18 70" : index === 1 ? "0.72 0.08 270" : "0.65 0.12 30"} / 0.15)`
                              : "oklch(0.15 0.03 265 / 0.5)",
                          color:
                            index < 3
                              ? `oklch(${index === 0 ? "0.85 0.18 70" : index === 1 ? "0.75 0.08 270" : "0.68 0.12 30"})`
                              : "oklch(0.5 0.05 270)",
                          border: `1px solid ${
                            index < 3
                              ? `oklch(${index === 0 ? "0.82 0.18 70" : index === 1 ? "0.72 0.08 270" : "0.65 0.12 30"} / 0.3)`
                              : "oklch(0.25 0.04 270 / 0.3)"
                          }`,
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Name + Grade badge */}
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm text-foreground truncate">
                          {student.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                            style={{
                              background: gradeColors.bg,
                              color: gradeColors.text,
                              border: `1px solid ${gradeColors.border}`,
                            }}
                          >
                            G{student.grade}
                          </span>
                        </div>
                      </div>

                      {/* XP */}
                      <div
                        className="font-display text-sm font-bold text-right tabular-nums"
                        style={{ color: "oklch(0.78 0.2 195)" }}
                      >
                        {Number(student.xp).toLocaleString()}
                      </div>

                      {/* Streak */}
                      <div className="font-semibold text-sm text-right text-amber-400 tabular-nums">
                        🔥{Number(student.streakDays)}
                      </div>

                      {/* Badges */}
                      <div
                        className="font-semibold text-sm text-right tabular-nums"
                        style={{ color: "oklch(0.7 0.22 280)" }}
                      >
                        🏅{Number(student.badgeCount)}
                      </div>

                      {/* Last Active */}
                      <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                        {formatRelativeTime(student.lastActive)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        {!isLoading && students.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Showing {filtered.length} of {students.length} registered students
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Entry Point ───────────────────────────────────────────────────
export function AdminRegistryScreen({ onBack }: AdminRegistryScreenProps) {
  const [unlocked, setUnlocked] = useState(false);
  const { data: students = [], isLoading } = useAllStudentProfiles();

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="px-6 pt-10 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            data-ocid="admin_registry.back.button"
          >
            ← Back
          </button>
        </div>
        <PinGate onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <RegistryDashboard
      onBack={onBack}
      students={students}
      isLoading={isLoading}
    />
  );
}
