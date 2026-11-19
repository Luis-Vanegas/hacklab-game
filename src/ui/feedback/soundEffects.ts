// Sintetizador de efectos de sonido con Web Audio API (sin archivos de audio externos).
// Persiste la preferencia de silencio en localStorage y se degrada de forma segura
// en entornos sin AudioContext (como pruebas en JSDOM).

import { useSyncExternalStore } from "react";

export type SoundEffectKind = "key" | "objective" | "rank_up" | "trace_alarm";

const MUTE_STORAGE_KEY = "hacklab:sound-muted";
const KEY_COOLDOWN_MS = 25;

interface WebkitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

let sharedContext: AudioContext | null = null;
let lastKeyTimestamp = 0;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioCtx =
    typeof window.AudioContext === "function"
      ? window.AudioContext
      : (window as WebkitAudioWindow).webkitAudioContext;

  if (typeof AudioCtx !== "function") {
    return null;
  }

  try {
    if (!sharedContext || sharedContext.state === "closed") {
      sharedContext = new AudioCtx();
    }
    if (sharedContext.state === "suspended" && typeof sharedContext.resume === "function") {
      void sharedContext.resume().catch(() => undefined);
    }
    return sharedContext;
  } catch {
    return null;
  }
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "true" : "false");
    } catch {
      // Ignorar cuotas o almacenamiento bloqueado
    }
  }
  notifyListeners();
}

export function toggleSoundMuted(): boolean {
  const next = !isSoundMuted();
  setSoundMuted(next);
  return next;
}

export function subscribeSoundMuted(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MUTE_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSoundMute(): {
  readonly muted: boolean;
  readonly toggleMute: () => void;
  readonly setMuted: (muted: boolean) => void;
} {
  const muted = useSyncExternalStore(subscribeSoundMuted, isSoundMuted, () => false);
  return {
    muted,
    toggleMute: toggleSoundMuted,
    setMuted: setSoundMuted,
  };
}

function scheduleTone(
  ctx: AudioContext,
  options: {
    readonly type: OscillatorType;
    readonly freqStart: number;
    readonly freqEnd?: number;
    readonly startOffset: number;
    readonly duration: number;
    readonly gain: number;
  },
): void {
  const now = ctx.currentTime + options.startOffset;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = options.type;
  osc.frequency.setValueAtTime(options.freqStart, now);
  if (options.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, options.freqEnd),
      now + options.duration,
    );
  }

  amp.gain.setValueAtTime(options.gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);

  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + options.duration + 0.01);
}

export function playSound(kind: SoundEffectKind): void {
  if (isSoundMuted()) {
    return;
  }

  if (kind === "key") {
    const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (nowMs - lastKeyTimestamp < KEY_COOLDOWN_MS) {
      return;
    }
    lastKeyTimestamp = nowMs;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  try {
    switch (kind) {
      case "key":
        scheduleTone(ctx, {
          type: "triangle",
          freqStart: 680,
          freqEnd: 220,
          startOffset: 0,
          duration: 0.028,
          gain: 0.035,
        });
        break;
      case "objective":
        scheduleTone(ctx, {
          type: "sine",
          freqStart: 523.25,
          startOffset: 0,
          duration: 0.11,
          gain: 0.08,
        });
        scheduleTone(ctx, {
          type: "sine",
          freqStart: 783.99,
          startOffset: 0.11,
          duration: 0.14,
          gain: 0.08,
        });
        break;
      case "rank_up":
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          scheduleTone(ctx, {
            type: "triangle",
            freqStart: freq,
            startOffset: idx * 0.1,
            duration: 0.16,
            gain: 0.09,
          });
        });
        break;
      case "trace_alarm":
        scheduleTone(ctx, {
          type: "sawtooth",
          freqStart: 880,
          freqEnd: 620,
          startOffset: 0,
          duration: 0.16,
          gain: 0.07,
        });
        scheduleTone(ctx, {
          type: "sawtooth",
          freqStart: 880,
          freqEnd: 620,
          startOffset: 0.19,
          duration: 0.17,
          gain: 0.07,
        });
        break;
    }
  } catch {
    // Evitar errores si el navegador bloquea reproducción sin gesto previo
  }
}
