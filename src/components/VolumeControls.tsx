import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getSfxVolume, isSfxEnabled, setSfxEnabled, setSfxVolume, sfx } from '../audio/sfx';
import {
  currentTrack,
  getBgmVolume,
  isBgmEnabled,
  nextTrack,
  onTrackChange,
  setBgmEnabled,
  setBgmVolume,
} from '../audio/bgm';

/**
 * 音量設定ポップオーバー。⚙ ボタンで開き、BGM/SE の ON/OFF と
 * 0〜MAX のスライダー、BGM の曲送り・曲名表示を提供する。
 */
export function VolumeControls() {
  const [open, setOpen] = useState(false);
  const [bgmOn, setBgmOn] = useState(isBgmEnabled());
  const [seOn, setSeOn] = useState(isSfxEnabled());
  const [bgmVol, setBgmVol] = useState(Math.round(getBgmVolume() * 100));
  const [seVol, setSeVol] = useState(Math.round(getSfxVolume() * 100));
  const [track, setTrack] = useState(currentTrack().title);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => onTrackChange((t) => setTrack(t.title)), []);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onBgmVol = (v: number) => {
    setBgmVol(v);
    setBgmVolume(v / 100);
    if (!bgmOn && v > 0) {
      setBgmOn(true);
      setBgmEnabled(true);
    }
  };
  const onSeVol = (v: number) => {
    setSeVol(v);
    setSfxVolume(v / 100);
  };
  const toggleBgm = () => {
    const n = !bgmOn;
    setBgmOn(n);
    setBgmEnabled(n);
  };
  const toggleSe = () => {
    const n = !seOn;
    setSeOn(n);
    setSfxEnabled(n);
    if (n) sfx.click();
  };

  return (
    <div className="vol-wrap" ref={ref}>
      <button className="btn" style={{ padding: '6px 12px' }} onClick={() => setOpen((o) => !o)} title="音量設定">
        🎚️ 音量
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="vol-popover"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {/* BGM */}
            <div className="vol-row">
              <button className="vol-toggle" onClick={toggleBgm} title="BGM ON/OFF">
                {bgmOn ? '🎵' : '🔇'}
              </button>
              <div className="vol-main">
                <div className="vol-label">
                  <span>BGM</span>
                  <span className="vol-val">{bgmVol}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bgmVol}
                  onChange={(e) => onBgmVol(Number(e.target.value))}
                  className="vol-slider"
                  aria-label="BGM音量"
                />
              </div>
            </div>
            <div className="vol-track">
              <span className="vol-track-name" title={track}>
                ♪ {bgmOn ? track : 'OFF'}
              </span>
              <button className="vol-skip" onClick={() => nextTrack()} disabled={!bgmOn} title="次の曲へ">
                ⏭
              </button>
            </div>

            <div className="vol-sep" />

            {/* SE */}
            <div className="vol-row">
              <button className="vol-toggle" onClick={toggleSe} title="効果音 ON/OFF">
                {seOn ? '🔊' : '🔇'}
              </button>
              <div className="vol-main">
                <div className="vol-label">
                  <span>効果音</span>
                  <span className="vol-val">{seVol}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={seVol}
                  onChange={(e) => onSeVol(Number(e.target.value))}
                  onMouseUp={() => seOn && sfx.click()}
                  className="vol-slider"
                  aria-label="効果音量"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
