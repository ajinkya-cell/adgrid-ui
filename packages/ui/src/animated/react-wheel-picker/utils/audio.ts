let audioContext: AudioContext | null = null;
let lastPlayTime = 0;
const MIN_PLAY_INTERVAL = 45;

export interface ClickSoundConfig {
  frequencyStart: number;
  frequencyEnd: number;
  duration: number;
  volume: number;
  type: OscillatorType;
}

export const DEFAULT_CLICK_CONFIG: ClickSoundConfig = {
  frequencyStart: 1400,
  frequencyEnd: 120,
  duration: 0.007,
  volume: 0.04,
  type: "sine",
};

export const SUBTLE_CLICK_CONFIG: ClickSoundConfig = {
  frequencyStart: 1200,
  frequencyEnd: 100,
  duration: 0.006,
  volume: 0.03,
  type: "sine",
};

export const MECHANICAL_CLICK_CONFIG: ClickSoundConfig = {
  frequencyStart: 1600,
  frequencyEnd: 150,
  duration: 0.008,
  volume: 0.05,
  type: "triangle",
};

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

export function playClickSound(config: ClickSoundConfig = DEFAULT_CLICK_CONFIG): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = Date.now();
  if (now - lastPlayTime < MIN_PLAY_INTERVAL) return;
  lastPlayTime = now;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequencyStart, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      config.frequencyEnd,
      ctx.currentTime + config.duration
    );

    gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + config.duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + config.duration);
  } catch (e) {
    console.warn("Failed to play click sound:", e);
  }
}

export function playHoverSound(volume: number = 0.015): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.003);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.003);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.004);
  } catch (e) {
    console.warn("Failed to play hover sound:", e);
  }
}

export function playClickSoundWithVolume(volume: number): void {
  playClickSound({ ...DEFAULT_CLICK_CONFIG, volume });
}

export function createClickSound(config: ClickSoundConfig = DEFAULT_CLICK_CONFIG): () => void {
  let lastPlay = 0;
  const interval = MIN_PLAY_INTERVAL;

  return () => {
    const now = Date.now();
    if (now - lastPlay < interval) return;
    lastPlay = now;
    playClickSound(config);
  };
}

export function suspendAudio(): void {
  if (audioContext && audioContext.state === "running") {
    audioContext.suspend();
  }
}

export function resumeAudio(): void {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

export function closeAudio(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

export function setClickVolume(volume: number): void {
  if (audioContext) {
    audioContext.destination.gain.value = Math.max(0, Math.min(1, volume));
  }
}