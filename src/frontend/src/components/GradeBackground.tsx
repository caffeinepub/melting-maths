interface GradeBackgroundProps {
  grade: number;
}

interface GradeConfig {
  symbols: string[];
  primaryColor: string;
  secondaryColor: string;
  bgGradient: string;
}

function getGradeConfig(grade: number): GradeConfig {
  if (grade <= 3) {
    return {
      symbols: ["+", "−", "×", "1", "2", "3", "=", "0"],
      primaryColor: "oklch(0.75 0.2 50 / 0.08)",
      secondaryColor: "oklch(0.82 0.18 70 / 0.06)",
      bgGradient:
        "radial-gradient(ellipse at 20% 30%, oklch(0.75 0.2 50 / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, oklch(0.82 0.18 70 / 0.03) 0%, transparent 50%)",
    };
  }
  if (grade <= 5) {
    return {
      symbols: ["÷", "½", "%", "¼", "¾", "0.5", "×", "="],
      primaryColor: "oklch(0.78 0.2 195 / 0.08)",
      secondaryColor: "oklch(0.72 0.2 170 / 0.06)",
      bgGradient:
        "radial-gradient(ellipse at 30% 20%, oklch(0.78 0.2 195 / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, oklch(0.72 0.2 170 / 0.03) 0%, transparent 50%)",
    };
  }
  if (grade <= 8) {
    return {
      symbols: ["x", "y", "π", "∞", "α", "β", "≠", "≈"],
      primaryColor: "oklch(0.7 0.22 280 / 0.08)",
      secondaryColor: "oklch(0.65 0.22 300 / 0.06)",
      bgGradient:
        "radial-gradient(ellipse at 25% 40%, oklch(0.7 0.22 280 / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 75% 60%, oklch(0.65 0.22 300 / 0.03) 0%, transparent 50%)",
    };
  }
  if (grade <= 10) {
    return {
      symbols: ["²", "√", "θ", "∠", "Δ", "∝", "≡", "⊥"],
      primaryColor: "oklch(0.78 0.2 195 / 0.08)",
      secondaryColor: "oklch(0.75 0.2 155 / 0.06)",
      bgGradient:
        "radial-gradient(ellipse at 60% 25%, oklch(0.78 0.2 195 / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 40% 75%, oklch(0.75 0.2 155 / 0.03) 0%, transparent 50%)",
    };
  }
  // Grades 11-12
  return {
    symbols: ["∫", "∑", "Δ", "∂", "∇", "λ", "∞", "ℝ"],
    primaryColor: "oklch(0.82 0.18 70 / 0.08)",
    secondaryColor: "oklch(0.75 0.2 50 / 0.06)",
    bgGradient:
      "radial-gradient(ellipse at 50% 20%, oklch(0.82 0.18 70 / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, oklch(0.75 0.2 50 / 0.03) 0%, transparent 50%)",
  };
}

// Pre-generate deterministic positions so there's no hydration mismatch
const SYMBOL_POSITIONS = [
  { left: 8, top: 15, delay: 0, duration: 14 },
  { left: 18, top: 45, delay: 2, duration: 18 },
  { left: 28, top: 70, delay: 5, duration: 16 },
  { left: 40, top: 25, delay: 1, duration: 20 },
  { left: 52, top: 60, delay: 3.5, duration: 15 },
  { left: 62, top: 10, delay: 6, duration: 17 },
  { left: 72, top: 80, delay: 4, duration: 19 },
  { left: 82, top: 35, delay: 2.5, duration: 13 },
  { left: 92, top: 55, delay: 7, duration: 21 },
  { left: 14, top: 90, delay: 8, duration: 16 },
  { left: 35, top: 5, delay: 1.5, duration: 22 },
  { left: 55, top: 95, delay: 9, duration: 14 },
];

export function GradeBackground({ grade }: GradeBackgroundProps) {
  const config = getGradeConfig(grade);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Ambient background gradient */}
      <div
        className="absolute inset-0"
        style={{ background: config.bgGradient }}
      />

      {/* Floating symbols */}
      {SYMBOL_POSITIONS.map((pos, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative elements
          key={i}
          className="absolute text-xl select-none grade-float-symbol"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            color: i % 2 === 0 ? config.primaryColor : config.secondaryColor,
            animationDelay: `${pos.delay}s`,
            animationDuration: `${pos.duration}s`,
            fontSize: `${0.9 + (i % 3) * 0.3}rem`,
          }}
        >
          {config.symbols[i % config.symbols.length]}
        </div>
      ))}
    </div>
  );
}
