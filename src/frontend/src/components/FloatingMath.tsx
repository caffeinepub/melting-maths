import { useMemo } from "react";

const SYMBOLS = ["+", "−", "×", "π", "√", "∞", "Δ", "∫", "θ", "±", "²", "λ"];

const COLORS = [
  "oklch(0.78 0.2 195 / 0.35)",
  "oklch(0.7 0.22 280 / 0.3)",
  "oklch(0.65 0.22 255 / 0.3)",
  "oklch(0.75 0.2 155 / 0.28)",
  "oklch(0.72 0.22 330 / 0.25)",
];

// Pre-computed static positions -- no Math.sin or random on render
const STATIC_SYMBOLS = [
  {
    id: 0,
    left: "4%",
    size: "14px",
    duration: "22s",
    delay: "0s",
    color: COLORS[0],
    alt: false,
  },
  {
    id: 1,
    left: "12%",
    size: "18px",
    duration: "28s",
    delay: "4s",
    color: COLORS[1],
    alt: true,
  },
  {
    id: 2,
    left: "21%",
    size: "12px",
    duration: "20s",
    delay: "8s",
    color: COLORS[2],
    alt: false,
  },
  {
    id: 3,
    left: "31%",
    size: "22px",
    duration: "32s",
    delay: "2s",
    color: COLORS[3],
    alt: false,
  },
  {
    id: 4,
    left: "42%",
    size: "16px",
    duration: "25s",
    delay: "11s",
    color: COLORS[4],
    alt: true,
  },
  {
    id: 5,
    left: "53%",
    size: "14px",
    duration: "29s",
    delay: "6s",
    color: COLORS[0],
    alt: false,
  },
  {
    id: 6,
    left: "63%",
    size: "20px",
    duration: "24s",
    delay: "14s",
    color: COLORS[1],
    alt: true,
  },
  {
    id: 7,
    left: "72%",
    size: "12px",
    duration: "26s",
    delay: "3s",
    color: COLORS[2],
    alt: false,
  },
  {
    id: 8,
    left: "81%",
    size: "18px",
    duration: "30s",
    delay: "9s",
    color: COLORS[3],
    alt: true,
  },
  {
    id: 9,
    left: "90%",
    size: "15px",
    duration: "23s",
    delay: "7s",
    color: COLORS[4],
    alt: false,
  },
  {
    id: 10,
    left: "7%",
    size: "13px",
    duration: "27s",
    delay: "15s",
    color: COLORS[1],
    alt: false,
  },
  {
    id: 11,
    left: "47%",
    size: "19px",
    duration: "31s",
    delay: "12s",
    color: COLORS[0],
    alt: true,
  },
];

export function FloatingMath() {
  // useMemo not needed since array is static -- just reference it
  const symbols = useMemo(() => STATIC_SYMBOLS, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {symbols.map((item) => (
        <span
          key={item.id}
          className={item.alt ? "animate-float-up-alt" : "animate-float-up"}
          style={{
            position: "absolute",
            bottom: "-5vh",
            left: item.left,
            fontSize: item.size,
            color: item.color,
            animationDuration: item.duration,
            animationDelay: item.delay,
            fontFamily: '"Geist Mono", monospace',
            fontWeight: 700,
            userSelect: "none",
            willChange: "transform",
          }}
        >
          {SYMBOLS[item.id % SYMBOLS.length]}
        </span>
      ))}
    </div>
  );
}
