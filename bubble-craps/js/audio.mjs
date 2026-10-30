/** Tiny WebAudio cues. Starts only after a user gesture. */

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = !!value;
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, t, dur, type, gain) {
  const a = ac();
  if (!a || muted) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type || "sine";
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(t, dur, gain) {
  const a = ac();
  if (!a || muted) return;
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(a.destination);
  src.start(t);
}

export function unlock() {
  ac();
}

export function chip() {
  const a = ac();
  if (!a || muted) return;
  tone(880, a.currentTime, 0.04, "square", 0.04);
  tone(1320, a.currentTime + 0.02, 0.05, "sine", 0.03);
}

export function pop() {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime;
  noise(t, 0.18, 0.08);
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(420, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.22);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + 0.26);
}

export function rattle() {
  const a = ac();
  if (!a || muted) return;
  noise(a.currentTime, 0.35, 0.05);
}

export function win() {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.07, 0.28, "sine", 0.055));
  tone(1568, t + 0.28, 0.18, "triangle", 0.03);
  noise(t + 0.02, 0.1, 0.025);
}

export function seven() {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime;
  tone(196, t, 0.28, "sawtooth", 0.04);
  tone(146, t + 0.08, 0.4, "sine", 0.06);
}

export function press() {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime;
  tone(520, t, 0.08, "triangle", 0.05);
  tone(780, t + 0.06, 0.12, "sine", 0.04);
}
