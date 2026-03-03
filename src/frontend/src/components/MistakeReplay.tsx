import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";

export interface Mistake {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
}

interface MistakeReplayProps {
  mistakes: Mistake[];
  open: boolean;
  onClose: () => void;
}

export function MistakeReplay({ mistakes, open, onClose }: MistakeReplayProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm mx-auto border-0 p-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.09 0.02 265), oklch(0.07 0.015 280))",
          border: "1px solid oklch(0.7 0.22 280 / 0.3)",
          boxShadow:
            "0 0 40px oklch(0.7 0.22 280 / 0.2), 0 20px 60px oklch(0 0 0 / 0.5)",
        }}
        data-ocid="mistake_replay.dialog"
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="font-display text-lg font-black flex items-center gap-2">
            <span>📚</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.85 0.18 280), oklch(0.78 0.2 195))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Review Mistakes
            </span>
            <span
              className="ml-auto font-mono-game text-xs font-normal"
              style={{
                color: "oklch(0.65 0.22 25)",
                WebkitTextFillColor: "unset",
              }}
            >
              {mistakes.length} wrong
            </span>
          </DialogTitle>
        </DialogHeader>

        {mistakes.length === 0 ? (
          <div
            className="px-5 pb-6 text-center"
            data-ocid="mistake_replay.empty_state"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p
              className="font-display font-bold text-base"
              style={{ color: "oklch(0.78 0.2 155)" }}
            >
              No mistakes! Perfect!
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] px-5 pb-5">
            <div className="flex flex-col gap-3">
              {mistakes.map((m, i) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: ordered list of mistakes
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl p-4"
                  style={{
                    background: "oklch(0.1 0.02 265)",
                    border: "1px solid oklch(0.3 0.06 270 / 0.5)",
                  }}
                  data-ocid={`mistake_replay.item.${i + 1}`}
                >
                  {/* Question */}
                  <div className="text-muted-foreground text-xs mb-2 font-semibold tracking-wide uppercase">
                    Question {i + 1}
                  </div>
                  <div className="text-foreground text-sm font-semibold mb-3 leading-snug">
                    {m.question}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Wrong answer */}
                    <div
                      className="rounded-lg px-3 py-2 text-center"
                      style={{
                        background: "oklch(0.65 0.22 25 / 0.1)",
                        border: "1px solid oklch(0.65 0.22 25 / 0.4)",
                      }}
                    >
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Your answer
                      </div>
                      <div
                        className="font-display font-bold text-sm"
                        style={{ color: "oklch(0.72 0.22 25)" }}
                      >
                        ✗ {m.yourAnswer}
                      </div>
                    </div>

                    {/* Correct answer */}
                    <div
                      className="rounded-lg px-3 py-2 text-center"
                      style={{
                        background: "oklch(0.78 0.2 155 / 0.1)",
                        border: "1px solid oklch(0.78 0.2 155 / 0.4)",
                      }}
                    >
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Correct
                      </div>
                      <div
                        className="font-display font-bold text-sm"
                        style={{ color: "oklch(0.78 0.2 155)" }}
                      >
                        ✓ {m.correctAnswer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Close button */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.04 280 / 0.8), oklch(0.1 0.02 265))",
              border: "1px solid oklch(0.7 0.22 280 / 0.5)",
              color: "oklch(0.85 0.18 280)",
            }}
            data-ocid="mistake_replay.close_button"
          >
            Got it! I'll do better 💪
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
