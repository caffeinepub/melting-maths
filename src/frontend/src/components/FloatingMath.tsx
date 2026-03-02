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
  "±",
  "∂",
  "λ",
  "φ",
  "σ",
  "μ",
];

const COLORS = [
  "oklch(0.78 0.2 195 / 0.45)",
  "oklch(0.7 0.22 280 / 0.4)",
  "oklch(0.65 0.22 255 / 0.4)",
  "oklch(0.75 0.2 155 / 0.35)",
  "oklch(0.72 0.22 330 / 0.3)",
];

interface SymbolItem {
  id: number;
  symbol: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  color: string;
  layer: "slow" | "fast" | "alt";
}

export function FloatingMath() {
  const symbols = useMemo<SymbolItem[]>(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[i % SYMBOLS.length],
      left: `${(i * 3.6 + Math.sin(i * 1.3) * 4) % 97}%`,
      size: `${12 + (i % 6) * 7}px`,
      duration: i % 3 === 2 ? `${8 + (i % 5) * 2}s` : `${14 + (i % 7) * 3}s`,
      delay: `${(i * 1.1) % 12}s`,
      color: COLORS[i % COLORS.length],
      layer: i % 3 === 0 ? "fast" : i % 3 === 1 ? "alt" : "slow",
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
          className={
            item.layer === "fast"
              ? "animate-float-up"
              : item.layer === "alt"
                ? "animate-float-up-alt"
                : "animate-float-up"
          }
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
            opacity: item.layer === "slow" ? 0.6 : 1,
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}
