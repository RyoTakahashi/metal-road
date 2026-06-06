/**
 * BGM の再生管理（複数曲のプレイリスト）。
 * - ブラウザの自動再生制限に対応：最初のユーザー操作で再生開始する
 * - 曲が終わると次の曲へ。最後まで行ったら先頭へループ
 * - 音量、ミュート切替、手動の曲送りに対応
 * - 効果音(sfx)とは独立。BASE_URL 配下の音源を参照する
 */

export interface BgmTrack {
  id: string;
  title: string;
  src: string;
}

const BASE = import.meta.env.BASE_URL;

export const TRACKS: BgmTrack[] = [
  { id: 'main', title: 'METAL ROAD (Main Theme)', src: `${BASE}audio/main-theme.mp3` },
  { id: 'dice', title: 'Rolling Dice or Dead', src: `${BASE}audio/rolling-dice.mp3` },
  { id: 'cosmos', title: 'Isolated Cosmos', src: `${BASE}audio/isolated-cosmos.mp3` },
  { id: 'freedom', title: 'Freedom', src: `${BASE}audio/freedom.mp3` },
  { id: 'metropolis', title: 'Metropolis', src: `${BASE}audio/metropolis.mp3` },
];

/** BGM の実最大音量（スライダー 1.0 のときの HTMLAudioElement.volume）。 */
const MAX_VOLUME = 0.28;

let audio: HTMLAudioElement | null = null;
let enabled = true;
let started = false;
let index = 0;
/** スライダー値 0..1（1 = 最大 = MAX_VOLUME）。 */
let level = 1;
let volume = MAX_VOLUME;
/** 曲が変わったときに UI へ通知するためのリスナー。 */
const listeners = new Set<(track: BgmTrack) => void>();

function notify() {
  const t = TRACKS[index];
  listeners.forEach((fn) => fn(t));
}

function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(TRACKS[index].src);
    audio.loop = false; // プレイリストで送るので個別ループはしない
    audio.volume = volume;
    audio.preload = 'auto';
    // 1曲終わったら次の曲へ（最後なら先頭に戻る）
    audio.addEventListener('ended', () => {
      index = (index + 1) % TRACKS.length;
      loadAndPlay();
    });
  }
  return audio;
}

/** 現在の index の曲を読み込んで（enabled なら）再生する。 */
function loadAndPlay() {
  const a = el();
  a.src = TRACKS[index].src;
  a.load();
  notify();
  if (!enabled) return;
  const p = a.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      started = true;
    }).catch(() => {
      /* 自動再生ブロック時は次のユーザー操作で再試行される */
    });
  } else {
    started = true;
  }
}

/** 再生を試みる（ユーザー操作起点で呼ぶ）。失敗は握りつぶす。 */
export function startBgm() {
  if (!enabled) return;
  const a = el();
  const p = a.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      started = true;
    }).catch(() => {
      /* ブロック時は次の操作で再試行 */
    });
  } else {
    started = true;
  }
}

export function pauseBgm() {
  audio?.pause();
}

export function setBgmEnabled(on: boolean) {
  enabled = on;
  if (!on) {
    pauseBgm();
  } else {
    startBgm();
  }
}

export function isBgmEnabled() {
  return enabled;
}

/** 次の曲へ手動で送る（曲名トグル用）。 */
export function nextTrack() {
  index = (index + 1) % TRACKS.length;
  started = false;
  loadAndPlay();
}

export function currentTrack(): BgmTrack {
  return TRACKS[index];
}

/** 曲変更の購読（戻り値で解除）。 */
export function onTrackChange(fn: (track: BgmTrack) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** BGM 音量をスライダー値 0..1 で設定（1 = 最大）。 */
export function setBgmVolume(v: number) {
  level = Math.max(0, Math.min(1, v));
  volume = level * MAX_VOLUME;
  if (audio) audio.volume = volume;
}
export function getBgmVolume() {
  return level;
}

/** まだ再生開始していなければ開始する（任意のユーザー操作にフックする用）。 */
export function ensureBgmStarted() {
  if (enabled && !started) startBgm();
}
