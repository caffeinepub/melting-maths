import { motion } from "motion/react";

interface PrivacyScreenProps {
  onBack: () => void;
}

const SECTIONS = [
  {
    icon: "📋",
    title: "Introduction",
    content:
      "Melting Maths is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data. By using Melting Maths, you agree to the practices described in this policy.",
  },
  {
    icon: "📝",
    title: "Information We Collect",
    content:
      "We collect the following information to provide our service: your display name, grade level, game scores, XP points, badges earned, and streak data. We do not require an email address or password. No sensitive personal information is collected.",
  },
  {
    icon: "🔧",
    title: "How We Use Your Information",
    content:
      "Your data is used to: personalize your learning experience, display leaderboards and rankings, generate teacher and admin reports for educational purposes, and track your progress across sessions.",
  },
  {
    icon: "🍪",
    title: "Cookies & Local Storage",
    content:
      "We use browser localStorage to remember your preferences, session data, and game progress. Google AdSense may also use cookies to serve relevant advertisements based on your browsing history. You can manage cookie settings in your browser preferences.",
  },
  {
    icon: "📢",
    title: "Google AdSense & Advertising",
    content:
      "This site uses Google AdSense to display ads. Google may use cookies and similar technologies to personalize ads based on your browsing. You can opt out of personalized advertising by visiting Google Ad Settings at adssettings.google.com. Clicking on ads is subject to Google's own terms and privacy policies.",
  },
  {
    icon: "🔗",
    title: "Third-Party Services",
    content:
      "We use Google Analytics (Measurement ID: G-KKGRY2T1BK) to analyze traffic and understand how users interact with the app. Google Forms is used to collect user feedback. These services have their own privacy policies independent of Melting Maths.",
  },
  {
    icon: "👶",
    title: "Children's Privacy",
    content:
      "Melting Maths is designed for students of all ages. We collect minimal data and do not require personal contact information. Student game data (name, grade, XP, badges, streak) may be viewed by authorized teachers and administrators for educational purposes only. We do not sell or share student data with third parties.",
  },
  {
    icon: "⚖️",
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your data at any time. You can delete your account and all associated data from the Profile screen using the 'Delete Account' option. Upon deletion, all your data is permanently removed from our systems.",
  },
  {
    icon: "✉️",
    title: "Contact",
    content:
      "If you have any questions or concerns about this Privacy Policy, please contact us at: Lakshagarwalsaturday1223@gmail.com",
  },
];

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
          data-ocid="privacy.back.button"
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Last updated: April 2026
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.04 }}
              className="rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.1 0.03 280 / 0.6), oklch(0.08 0.02 265 / 0.7))",
                border: "1px solid oklch(0.7 0.22 280 / 0.2)",
              }}
              data-ocid={`privacy.section.${i + 1}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{section.icon}</span>
                <h2
                  className="font-display text-xs font-black tracking-wide"
                  style={{ color: "oklch(0.82 0.18 195)" }}
                >
                  {section.title}
                </h2>
              </div>
              <p className="text-foreground/75 text-sm leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
