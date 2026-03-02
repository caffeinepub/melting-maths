import { useRef } from "react";

export function useSoundEffects(enabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext | null {
    if (!enabled) return null;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContext();
      } catch {
        return null;
      }
    }
    return audioCtxRef.current;
  }

  function playTone(
    frequency: number,
    startTime: number,
    duration: number,
    ctx: AudioContext,
    gainVal = 0.3,
    type: OscillatorType = "sine",
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function playCorrect() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(523, now, 0.1, ctx, 0.25); // C5
    playTone(659, now + 0.1, 0.1, ctx, 0.25); // E5
    playTone(784, now + 0.2, 0.15, ctx, 0.3); // G5
  }

  function playWrong() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(300, now, 0.08, ctx, 0.2, "sawtooth");
    playTone(220, now + 0.1, 0.15, ctx, 0.2, "sawtooth");
  }

  function playLevelComplete() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // 3-note fanfare
    playTone(523, now, 0.12, ctx, 0.3); // C5
    playTone(659, now + 0.13, 0.12, ctx, 0.3); // E5
    playTone(784, now + 0.26, 0.12, ctx, 0.3); // G5
    playTone(1047, now + 0.4, 0.25, ctx, 0.35); // C6 high note
  }

  function playXpEarned() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(880, now, 0.06, ctx, 0.2);
    playTone(1047, now + 0.07, 0.12, ctx, 0.25);
  }

  if (!enabled) {
    return {
      playCorrect: () => {},
      playWrong: () => {},
      playLevelComplete: () => {},
      playXpEarned: () => {},
    };
  }

  return { playCorrect, playWrong, playLevelComplete, playXpEarned };
}
