/**
 * Retro Arcade Synthesizer using Web Audio API
 * No download files required, completely offline-compatible and ultra-fast.
 */

let isMutedGlobal = false;

export const setMutedStatus = (status: boolean) => {
  isMutedGlobal = status;
};

export const getMutedStatus = (): boolean => {
  return isMutedGlobal;
};

// Lazy creation of AudioContext to avoid Chrome/Safari user-interaction restrictions before play
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Standard audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play POP sound (soft bubble pop for general button click)
export const playPopSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = "sine";
  // Pitch rises and drops quickly to sound like a bubble
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

  osc.start(now);
  osc.stop(now + 0.14);
};

// 2. Play COIN sound (classic 8-bit coin sound when adding items)
export const playCoinSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First Tone of standard arcade coin
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "square";
  osc1.frequency.setValueAtTime(987.77, now); // B5 Note
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  gain1.gain.setValueAtTime(0.12, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  osc1.start(now);
  osc1.stop(now + 0.08);

  // Second Tone slightly delayed
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6 Note
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(0.12, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

  osc2.start(now + 0.08);
  osc2.stop(now + 0.35);
};

// 3. Play SUCCESS sound (escalating arpeggio for order completed!)
export const playSuccessSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio
  const duration = 0.07;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(0.15, now + idx * duration);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * duration + 0.15);

    osc.start(now + idx * duration);
    osc.stop(now + idx * duration + 0.2);
  });
};

// 4. Play FAV SPARKLE sound (Chime of a star favorited!)
export const playFavoritedSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6 slide

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  osc.start(now);
  osc.stop(now + 0.25);
};

// 5. Play WHEEL sound (short arcade tick)
export const playWheelTickSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.setValueAtTime(150, now + 0.02);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

  osc.start(now);
  osc.stop(now + 0.04);
};
