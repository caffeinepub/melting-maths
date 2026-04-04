import { motion } from "motion/react";

interface AboutScreenProps {
  onBack: () => void;
}

const STATS = [
  { value: "40+", label: "Games" },
  { value: "G1–12", label: "Grades" },
  { value: "Free", label: "Forever" },
  { value: "AI", label: "Tutor" },
];

export function AboutScreen({ onBack }: AboutScreenProps) {
  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
          data-ocid="about.back.button"
        >
          ← Back
        </button>
      </header>

      <div className="px-6 space-y-5">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="font-display text-3xl font-black"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.92 0.15 195) 0%, oklch(0.85 0.18 220) 50%, oklch(0.78 0.2 280) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            About Us
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            The story behind Melting Maths
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-4 gap-2 rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.04 195 / 0.8), oklch(0.08 0.03 280 / 0.9))",
            border: "1px solid oklch(0.78 0.2 195 / 0.25)",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="font-display text-lg font-black"
                style={{ color: "oklch(0.88 0.18 195)" }}
              >
                {s.value}
              </div>
              <div className="text-muted-foreground text-[10px]">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Founder card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.04 280 / 0.7), oklch(0.08 0.02 265 / 0.8))",
            border: "1px solid oklch(0.7 0.22 280 / 0.3)",
            boxShadow: "0 0 24px oklch(0.7 0.22 280 / 0.1)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.2 195 / 0.2), oklch(0.7 0.22 280 / 0.2))",
                border: "2px solid oklch(0.78 0.2 195 / 0.4)",
                boxShadow: "0 0 16px oklch(0.78 0.2 195 / 0.25)",
              }}
            >
              🧑‍🎓
            </div>
            <div>
              <div className="font-display font-black text-base text-neon-cyan">
                Laksh Agarwal
              </div>
              <div className="text-muted-foreground text-xs">
                Grade 7 · Founder · India
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground/85 text-sm leading-relaxed">
              Hi! I'm Laksh Agarwal, a Grade 7 student from India. I'm the
              founder of Melting Maths — a free educational website built
              especially for students from Grade 1 to 12. I created this
              platform because I truly believe that maths doesn't have to be
              scary or boring. With interactive games and an AI tutor, learning
              numbers can actually be fun!
            </p>
            <p className="text-foreground/85 text-sm leading-relaxed">
              I started Melting Maths to give students across India and beyond a
              place to practice maths in a joyful, stress-free way — and totally
              free of cost. I enjoy coding, creating websites, and helping
              friends understand difficult topics.
            </p>
            <p className="text-foreground/85 text-sm leading-relaxed">
              My dream is to become a successful entrepreneur one day — someone
              who builds things that make learning and life easier for everyone.
              Melting Maths is my first step toward that dream.
            </p>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 195 / 0.6), oklch(0.08 0.02 265 / 0.7))",
              border: "1px solid oklch(0.78 0.2 195 / 0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <div
                className="font-display text-xs font-black tracking-widest"
                style={{ color: "oklch(0.88 0.18 195)" }}
              >
                OUR MISSION
              </div>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">
              To make maths fun, accessible, and engaging for every student from
              Grade 1 to 12 — through games, challenges, and an AI tutor that
              actually cares.
            </p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.04 280 / 0.6), oklch(0.08 0.02 265 / 0.7))",
              border: "1px solid oklch(0.7 0.22 280 / 0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌟</span>
              <div
                className="font-display text-xs font-black tracking-widest"
                style={{ color: "oklch(0.82 0.18 280)" }}
              >
                OUR VISION
              </div>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">
              A world where every student enjoys learning maths and never feels
              afraid of numbers — where education is a superpower, not a source
              of stress.
            </p>
          </div>
        </motion.div>

        {/* Taglines */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-2xl px-5 py-5 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.22 45 / 0.08), oklch(0.7 0.2 60 / 0.08))",
            border: "1px solid oklch(0.65 0.22 45 / 0.25)",
          }}
        >
          <p className="font-display font-black text-base text-orange-500">
            Let's melt the fear of maths — together!
          </p>
          <p className="text-sm mt-2 font-semibold text-orange-500">
            #CreatedByAStudentForAStudent
          </p>
        </motion.div>
      </div>
    </div>
  );
}
