import { Suspense, lazy, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Choice, Effect, EventBeat, GameEvent, SceneKind } from '../types';
import { sfx } from '../audio/sfx';

// 3D演出シーン（three.js を含むため遅延ロード。盤面で既にロード済みなら即時）
const EventScene3D = lazy(() => import('./scenes/EventScene3D').then((m) => ({ default: m.EventScene3D })));

interface Props {
  event: GameEvent;
  result: string | null;
  onChoose: (index: number) => void;
  onContinueAuto: () => void;
  onAck: () => void;
}

/** 効果の正負ざっくり判定でSEを鳴らす。 */
function netScore(e: Effect) {
  let score = 0;
  if (e.fans) score += Math.sign(e.fans) * 2;
  if (e.skill) score += Math.sign(e.skill);
  if (e.morale) score += Math.sign(e.morale);
  if (e.money) score += Math.sign(e.money);
  if (e.removeMember) score -= 2;
  if (e.addMember) score += 2;
  return score;
}

function EffectChips({ e }: { e: Effect }) {
  const chips: { icon: string; text: string; up: boolean }[] = [];
  if (e.fans) chips.push({ icon: '🔥', text: `${e.fans > 0 ? '+' : ''}${e.fans.toLocaleString()}`, up: e.fans > 0 });
  if (e.skill) chips.push({ icon: '🎸', text: `${e.skill > 0 ? '+' : ''}${e.skill}`, up: e.skill > 0 });
  if (e.morale) chips.push({ icon: '🤝', text: `${e.morale > 0 ? '+' : ''}${e.morale}`, up: e.morale > 0 });
  if (e.money) chips.push({ icon: '💰', text: `${e.money > 0 ? '+' : ''}¥${e.money.toLocaleString()}`, up: e.money > 0 });
  if (e.addMember) chips.push({ icon: '🎸', text: `${e.addMember.name} 加入`, up: true });
  if (e.removeMember) chips.push({ icon: '💔', text: '脱退', up: false });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
      {chips.map((c, i) => (
        <motion.span
          key={i}
          className="fx-chip"
          style={{ color: c.up ? 'var(--money)' : 'var(--blood-bright)', borderColor: c.up ? 'var(--money)' : 'var(--blood-bright)' }}
          initial={{ opacity: 0, y: 12, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 400, damping: 16 }}
        >
          {c.icon} {c.text}
        </motion.span>
      ))}
    </div>
  );
}

/** イベントの導入ビート列を取り出す（intro 未指定なら text 1枚に）。 */
function beatsOf(event: GameEvent): EventBeat[] {
  if (event.intro && event.intro.length > 0) return event.intro;
  return [{ text: event.text, scene: event.scene }];
}

export function EventModal({ event, result, onChoose, onContinueAuto, onAck }: Props) {
  const isAuto = event.choices.length === 0;
  const beats = useMemo(() => beatsOf(event), [event]);

  // 導入ビートのインデックス。最後まで来たら選択/自動効果フェーズへ
  const [beat, setBeat] = useState(0);
  const [applied, setApplied] = useState<Effect | null>(null);
  // 選択結果で切り替える結末シーン
  const [resultScene, setResultScene] = useState<SceneKind | null>(null);

  const lastBeat = beat >= beats.length - 1;

  // 表示すべきシーン: 結末 > 現在ビート(指定があれば) > 直近で指定されたビート > 既定
  const shownScene: SceneKind = useMemo(() => {
    if (result !== null && resultScene) return resultScene;
    // ビートにシーン指定があればそれを、なければ直近の指定を遡って継承
    for (let i = Math.min(beat, beats.length - 1); i >= 0; i--) {
      if (beats[i].scene) return beats[i].scene as SceneKind;
    }
    return event.scene;
  }, [result, resultScene, beat, beats, event.scene]);

  const currentText = result === null ? beats[Math.min(beat, beats.length - 1)].text : null;

  const commitChoice = (c: Choice, i: number) => {
    setApplied(c.effects);
    if (c.resultScene) setResultScene(c.resultScene);
    netScore(c.effects) >= 0 ? sfx.good() : sfx.bad();
    onChoose(i);
  };

  const commitAuto = () => {
    if (event.autoEffects) {
      setApplied(event.autoEffects);
      netScore(event.autoEffects) >= 0 ? sfx.good() : sfx.bad();
    }
    if (event.autoResultScene) setResultScene(event.autoResultScene);
    onContinueAuto();
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="modal-scene">
          <Suspense fallback={<div className="scene-loading">🤘</div>}>
            <EventScene3D kind={shownScene} />
          </Suspense>
          <div className="modal-scene-title">⚡ {event.title}</div>
          {/* 進行ドット（多段演出のときだけ） */}
          {result === null && beats.length > 1 && (
            <div className="beat-dots">
              {beats.map((_, i) => (
                <span key={i} className={`beat-dot${i === beat ? ' on' : ''}`} />
              ))}
            </div>
          )}
        </div>

        <div className="modal-body">
          {result === null ? (
            <>
              <AnimatePresence mode="wait">
                <motion.p
                  key={beat}
                  className="modal-text"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {currentText}
                </motion.p>
              </AnimatePresence>

              {!lastBeat ? (
                // まだ導入の途中：次のビートへ
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    sfx.click();
                    setBeat((b) => b + 1);
                  }}
                >
                  ▶ つづき
                </button>
              ) : isAuto ? (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={commitAuto}>
                  続ける
                </button>
              ) : (
                <div className="choice-list">
                  {event.choices.map((c, i) => (
                    <button key={i} className="btn choice" onClick={() => commitChoice(c, i)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {applied && <EffectChips e={applied} />}
              <motion.div className="result-box" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {result}
              </motion.div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={onAck}>
                次へ
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
