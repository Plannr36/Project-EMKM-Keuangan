/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API pure synthesizer sound effects for POS & ERP actions
// No external assets or sound files needed

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isAudioMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_sound_muted', muted ? 'true' : 'false');
  }
}

export function getSoundMuted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('erp_sound_muted') === 'true';
  }
  return isAudioMuted;
}

/**
 * Short subtle click / tap sound when selecting items or changing counts
 */
export function playTapSound() {
  if (getSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Audio context may fail if user hasn't interacted yet
  }
}

/**
 * Pleasant POS Cash Register Chime when order is completed
 */
export function playCashRegisterSound() {
  if (getSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTone = (freq: number, start: number, duration: number, vol = 0.12) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Upbeat bell chime sequence
    playTone(523.25, 0.0, 0.15); // C5
    playTone(659.25, 0.08, 0.18); // E5
    playTone(783.99, 0.16, 0.22); // G5
    playTone(1046.5, 0.24, 0.45, 0.15); // C6 bell ring
  } catch {
    // Ignore error
  }
}

/**
 * Subtle alert warning sound
 */
export function playWarningSound() {
  if (getSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Ignore
  }
}
