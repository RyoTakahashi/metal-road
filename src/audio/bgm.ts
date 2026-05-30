/**
 * BGM（メインテーマ）の再生管理。
 * - ブラウザの自動再生制限に対応：最初のユーザー操作で再生開始する
 * - ループ再生、音量、ミュート切替
 * - 効果音(sfx)とは独立。BASE_URL 配下の音源を参照する
 */

const SRC = `${import.meta.env.BASE_URL}audio/main-theme.mp3`;
const DEFAULT_VOLUME = 0.45;

let audio: HTMLAudioElement | null = null;
let enabled = true;
let started = false;

function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = DEFAULT_VOLUME;
    audio.preload = 'auto';
  }
  return audio;
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
      /* 自動再生がブロックされた場合は次の操作で再試行される */
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

export function setBgmVolume(v: number) {
  el().volume = Math.max(0, Math.min(1, v));
}

/** まだ再生開始していなければ開始する（任意のユーザー操作にフックする用）。 */
export function ensureBgmStarted() {
  if (enabled && !started) startBgm();
}
