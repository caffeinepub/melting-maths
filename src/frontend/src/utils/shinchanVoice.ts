/**
 * Shinchan-style voice utility for Shinchen AI tutor.
 *
 * Mimics the energetic, high-pitched, fast-talking style of the
 * Shinchan cartoon character using the Web Speech API.
 *
 * Voice is globally enabled/disabled via localStorage key "mm_shinchen_voice".
 */

const VOICE_STORAGE_KEY = "mm_shinchen_voice";

export function isVoiceEnabled(): boolean {
  try {
    return localStorage.getItem(VOICE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setVoiceEnabled(v: boolean): void {
  try {
    localStorage.setItem(VOICE_STORAGE_KEY, v ? "true" : "false");
  } catch {
    /* noop */
  }
}

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Pick the best voice to sound like a cartoon kid (Shinchan-style).
 *
 * Priority:
 * 1. Any voice with "child" or "kid" in the name
 * 2. Known high-pitched voices: Google UK English Female, Samantha, Karen, Nicky, Victoria
 * 3. First available en-IN voice (Indian English — common in Shinchan dubs)
 * 4. Any en-US voice
 * 5. Fallback to the first available voice
 */
function getBestShinchanVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisAvailable()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 1. Child / kid voices
  const childVoice = voices.find((v) => /child|kid/i.test(v.name));
  if (childVoice) return childVoice;

  // 2. Preferred high-pitched voices
  const preferredNames = [
    "google uk english female",
    "samantha",
    "karen",
    "nicky",
    "victoria",
    "female",
    "zira",
  ];
  for (const name of preferredNames) {
    const found = voices.find((v) => v.name.toLowerCase().includes(name));
    if (found) return found;
  }

  // 3. Indian English (Shinchan dub locale)
  const inVoice = voices.find((v) => v.lang === "en-IN");
  if (inVoice) return inVoice;

  // 4. Any en-US voice
  const enUs = voices.filter((v) => v.lang.startsWith("en-US"));
  if (enUs.length > 1) return enUs[1]; // index 1 is often female
  if (enUs.length > 0) return enUs[0];

  // 5. Fallback
  return voices[0];
}

/**
 * Strip emojis and special symbols for cleaner TTS output.
 */
function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[★⭐🌟]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Speak a message in Shinchan's energetic kid voice.
 *
 * - rate: 1.15 (fast, energetic like Shinchan)
 * - pitch: 1.6 (high, cartoon-kid sound)
 * - volume: 0.9
 *
 * Cancels any ongoing speech before speaking new text.
 * Does nothing if voice is disabled or speech synthesis unavailable.
 */
export function shinchanSpeak(text: string, forceEvenIfDisabled = false): void {
  if (!isSpeechSynthesisAvailable()) return;
  if (!forceEvenIfDisabled && !isVoiceEnabled()) return;

  window.speechSynthesis.cancel();

  const clean = cleanForSpeech(text);
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);

  // Shinchan-like: fast, high pitch
  utterance.rate = 1.15;
  utterance.pitch = 1.6;
  utterance.volume = 0.9;

  // Try to assign best voice — if voices aren't loaded yet, retry once
  const voice = getBestShinchanVoice();
  if (voice) {
    utterance.voice = voice;
  } else {
    // Some browsers lazy-load voices; wait for voiceschanged then retry
    const retry = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", retry);
      const v = getBestShinchanVoice();
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    };
    window.speechSynthesis.addEventListener("voiceschanged", retry);
    return;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop all ongoing Shinchan speech immediately.
 */
export function shinchanStop(): void {
  if (isSpeechSynthesisAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Toggle Shinchen voice on/off and return the new state.
 */
export function toggleShinchanVoice(): boolean {
  const next = !isVoiceEnabled();
  setVoiceEnabled(next);
  if (!next) shinchanStop();
  return next;
}
