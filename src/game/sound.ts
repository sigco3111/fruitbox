/**
 * Tiny Web Audio synthesizer. No asset files needed.
 * Three cues:
 *  - success: rising two-note chime on valid clear
 *  - error: low buzz on invalid selection
 *  - tick:  soft click on cell pickup
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!Ctx) return null;
  ctx = new Ctx();
  return ctx;
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.15, when = 0) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.05);
}

let enabled = true;
export function setSoundEnabled(v: boolean) { enabled = v; }

export function playSuccess() {
  if (!enabled) return;
  tone(660, 120, 'triangle', 0.18, 0);
  tone(990, 160, 'triangle', 0.16, 0.08);
}

export function playError() {
  if (!enabled) return;
  tone(180, 180, 'sawtooth', 0.1, 0);
}

export function playTick() {
  if (!enabled) return;
  tone(1200, 30, 'sine', 0.05, 0);
}

export function playHint() {
  if (!enabled) return;
  tone(520, 100, 'sine', 0.12, 0);
  tone(780, 120, 'sine', 0.12, 0.06);
}