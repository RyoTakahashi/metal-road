/**
 * 効果音。音源ファイルを持たず Web Audio API で合成する。
 * メタルっぽい歪み・パワーコード風の音を簡易生成。
 */

let ctx: AudioContext | null = null;
let enabled = true;

function ac(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setSfxEnabled(v: boolean) {
  enabled = v;
}
export function isSfxEnabled() {
  return enabled;
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  /** 終了時の周波数（スイープ） */
  toFreq?: number;
  delay?: number;
}

function tone({ freq, duration, type = 'sawtooth', gain = 0.15, toFreq, delay = 0 }: ToneOptions) {
  if (!enabled) return;
  const c = ac();
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  // ほんのり歪ませるためのウェーブシェイパー
  const shaper = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = Math.tanh(x * 3);
  }
  shaper.curve = curve;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (toFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, toFreq), t0 + duration);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(shaper);
  shaper.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noise(duration: number, gain = 0.2) {
  if (!enabled) return;
  const c = ac();
  const t0 = c.currentTime;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(g);
  g.connect(c.destination);
  src.start(t0);
}

export const sfx = {
  /** サイコロを振る */
  dice() {
    noise(0.12, 0.12);
    tone({ freq: 220, toFreq: 440, duration: 0.12, type: 'square', gain: 0.08 });
  },
  /** コマが1マス進む */
  step() {
    tone({ freq: 330, duration: 0.06, type: 'triangle', gain: 0.06 });
  },
  /** ファン/ステータス上昇（パワーコード上昇） */
  good() {
    tone({ freq: 196, duration: 0.5, type: 'sawtooth', gain: 0.14 });
    tone({ freq: 294, duration: 0.5, type: 'sawtooth', gain: 0.12, delay: 0.0 });
    tone({ freq: 392, duration: 0.45, type: 'sawtooth', gain: 0.1, delay: 0.08 });
  },
  /** ステータス下降 */
  bad() {
    tone({ freq: 300, toFreq: 90, duration: 0.5, type: 'sawtooth', gain: 0.16 });
  },
  /** ライブ成功（ジャーン） */
  live() {
    [130.8, 196, 261.6, 329.6].forEach((f, i) =>
      tone({ freq: f, duration: 0.8, type: 'sawtooth', gain: 0.12, delay: i * 0.04 }),
    );
    noise(0.3, 0.08);
  },
  /** ゲームオーバー */
  gameover() {
    tone({ freq: 200, toFreq: 50, duration: 1.2, type: 'sawtooth', gain: 0.18 });
  },
  /** ゴール（勝利ファンファーレ） */
  victory() {
    [261.6, 329.6, 392, 523.3].forEach((f, i) =>
      tone({ freq: f, duration: 0.9, type: 'sawtooth', gain: 0.14, delay: i * 0.12 }),
    );
  },
  /** ボタン */
  click() {
    tone({ freq: 660, duration: 0.05, type: 'square', gain: 0.05 });
  },
};
