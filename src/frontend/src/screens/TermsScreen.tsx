import { motion } from "motion/react";

interface TermsScreenProps {
  onBack: () => void;
}

const SECTIONS = [
  {
    icon: "✅",
    title: "Acceptance of Terms",
    content:
      "By accessing or using Melting Maths, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use this platform.",
  },
  {
    icon: "©️",
    title: "Content Ownership",
    content:
      "All content on Melting Maths — including games, designs, text, graphics, logic, questions, and branding — is the intellectual property of Melting Maths (Laksh Agarwal). Unauthorized copying, reproduction, or distribution is strictly prohibited.",
  },
  {
    icon: "🚫",
    title: "No Copying",
    content:
      "You may not copy, reproduce, distribute, scrape, or create derivative works from any content on this platform without prior written permission from Melting Maths. This includes game mechanics, question sets, UI designs, and any other proprietary elements.",
  },
  {
    icon: "👤",
    title: "User Responsibility",
    content:
      "Users are responsible for providing accurate information when setting up their profile. Any misuse of the platform — including attempts to manipulate leaderboards, access admin tools without authorization, or disrupt the service — may result in immediate access revocation.",
  },
  {
    icon: "📚",
    title: "Educational Use Only",
    content:
      "Melting Maths is intended exclusively for educational purposes. It must not be used for commercial gain, resale, or any purpose other than personal learning and student engagement.",
  },
  {
    icon: "📢",
    title: "Advertising",
    content:
      "Melting Maths displays advertisements via Google AdSense to support the free operation of the platform. Clicking on ads is subject to Google's terms of service. We do not control the content of third-party advertisements.",
  },
  {
    icon: "⚠️",
    title: "Disclaimer",
    content:
      'Melting Maths is provided "as is" without warranties of any kind, either express or implied. We do not guarantee uninterrupted access, error-free operation, or that the platform will meet every user\'s needs. Use the platform at your own discretion.',
  },
  {
    icon: "🔄",
    title: "Changes to Terms",
    content:
      "These Terms & Conditions may be updated at any time without prior notice. Continued use of Melting Maths after any changes constitutes your acceptance of the revised terms. We encourage you to review this page periodically.",
  },
  {
    icon: "✉️",
    title: "Contact",
    content:
      "For questions about these Terms & Conditions, please contact: Lakshagarwalsaturday1223@gmail.com",
  },
];

export function TermsScreen({ onBack }: TermsScreenProps) {
  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
          data-ocid="terms.back.button"
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
                "linear-gradient(90deg, oklch(0.85 0.18 50) 0%, oklch(0.82 0.2 70) 50%, oklch(0.78 0.2 280) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Terms & Conditions
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
                  "linear-gradient(135deg, oklch(0.1 0.04 25 / 0.5), oklch(0.08 0.02 265 / 0.7))",
                border: "1px solid oklch(0.75 0.2 50 / 0.2)",
              }}
              data-ocid={`terms.section.${i + 1}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{section.icon}</span>
                <h2
                  className="font-display text-xs font-black tracking-wide"
                  style={{ color: "oklch(0.85 0.18 60)" }}
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
