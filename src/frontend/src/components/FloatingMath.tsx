import { useMemo } from "react";

const SYMBOLS = [
  "+",
  "−",
  "×",
  "÷",
  "=",
  "π",
  "√",
  "∑",
  "∞",
  "²",
  "³",
  "Δ",
  "∫",
  "≈",
  "≠",
  "α",
  "β",
  "θ",
];
const COLORS = [
  "oklch(0.78 0.2 195 / 0.5)",
  "oklch(0.7 0.22 280 / 0.5)",
  "oklch(0.65 0.22 255 / 0.5)",
  "oklch(0.75 0.2 155 / 0.4)",
];

interface SymbolItem {
  id: number;
  symbol: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  color: string;
  alt: boolean;
}

export function FloatingMath() {
  const symbols = useMemo<SymbolItem[]>(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[i % SYMBOLS.length],
      left: `${(i * 4.5 + Math.sin(i) * 3) % 96}%`,
      size: `${14 + (i % 5) * 8}px`,
      duration: `${12 + (i % 8) * 3}s`,
      delay: `${(i * 1.3) % 10}s`,
      color: COLORS[i % COLORS.length],
      alt: i % 3 === 0,
    }));
  }, []);

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
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}
