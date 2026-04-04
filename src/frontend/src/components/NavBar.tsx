import { motion } from "motion/react";
import type { Screen } from "../App";

interface NavBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const MAIN_TABS: Array<{
  screen: Screen;
  icon: string;
  label: string;
  activeScreens?: Screen[];
}> = [
  { screen: "home", icon: "🏠", label: "Home" },
  {
    screen: "game-select",
    icon: "🎮",
    label: "Games",
    activeScreens: ["game-select", "game"],
  },
  { screen: "leaderboard", icon: "🏆", label: "Leaderboard" },
  { screen: "profile", icon: "👤", label: "Profile" },
];

const SECONDARY_LINKS: Array<{ screen: Screen; label: string }> = [
  { screen: "about", label: "About" },
  { screen: "privacy", label: "Privacy Policy" },
  { screen: "terms", label: "Terms & Conditions" },
];

export function NavBar({ currentScreen, onNavigate }: NavBarProps) {
  function isTabActive(tab: (typeof MAIN_TABS)[number]): boolean {
    if (tab.activeScreens) {
      return tab.activeScreens.includes(currentScreen);
    }
    return currentScreen === tab.screen;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "oklch(0.08 0.02 265 / 0.97)",
        borderTop: "1px solid oklch(0.7 0.22 280 / 0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow:
          "0 -4px 32px oklch(0.7 0.22 280 / 0.12), 0 -1px 0 oklch(0.78 0.2 195 / 0.08)",
      }}
      data-ocid="nav.panel"
    >
      {/* Main tabs */}
      <div className="flex items-stretch px-2 pt-2 pb-1">
        {MAIN_TABS.map((tab) => {
          const active = isTabActive(tab);
          return (
            <motion.button
              key={tab.screen}
              type="button"
              onClick={() => onNavigate(tab.screen)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl relative transition-all duration-200"
              style={{
                background: active
                  ? "oklch(0.78 0.2 195 / 0.1)"
                  : "transparent",
              }}
              aria-current={active ? "page" : undefined}
              data-ocid={`nav.${tab.label.toLowerCase()}.link`}
            >
              {/* Active indicator top line */}
              {active && (
                <motion.div
                  layoutId="nav-active-indicator"
                  className="absolute top-0 left-2 right-2 h-0.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.78 0.2 195), oklch(0.7 0.22 280))",
                    boxShadow: "0 0 8px oklch(0.78 0.2 195 / 0.8)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <span
                className="text-xl leading-none transition-all duration-200"
                style={{
                  filter: active
                    ? "drop-shadow(0 0 6px oklch(0.78 0.2 195 / 0.9))"
                    : "none",
                }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-bold leading-none transition-all duration-200"
                style={{
                  color: active
                    ? "oklch(0.88 0.18 195)"
                    : "oklch(0.55 0.04 265)",
                  textShadow: active
                    ? "0 0 10px oklch(0.78 0.2 195 / 0.6)"
                    : "none",
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Secondary links */}
      <div className="flex items-center justify-center gap-4 px-4 pb-1">
        {SECONDARY_LINKS.map((link, i) => (
          <button
            key={link.screen}
            type="button"
            onClick={() => onNavigate(link.screen)}
            className="text-[10px] transition-all duration-200 hover:opacity-100"
            style={{
              color:
                currentScreen === link.screen
                  ? "oklch(0.78 0.2 195)"
                  : "oklch(0.45 0.04 265)",
              textShadow:
                currentScreen === link.screen
                  ? "0 0 8px oklch(0.78 0.2 195 / 0.5)"
                  : "none",
            }}
            data-ocid={`nav.${link.screen}.link`}
          >
            {link.label}
            {i < SECONDARY_LINKS.length - 1 && (
              <span className="ml-4" style={{ color: "oklch(0.3 0.03 265)" }}>
                |
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer copyright */}
      <div
        className="text-center pb-3 pt-0.5 text-[9px]"
        style={{ color: "oklch(0.35 0.03 265)" }}
      >
        © {new Date().getFullYear()} Melting Maths. All Rights Reserved.
      </div>
    </nav>
  );
}
