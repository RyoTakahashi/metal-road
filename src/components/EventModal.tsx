import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Effect, GameEvent } from '../types';
import { sfx } from '../audio/sfx';
import { EventScene } from './scenes/EventScene';

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

export function EventModal({ event, result, onChoose, onContinueAuto, onAck }: Props) {
  const isAuto = event.choices.length === 0;
  const [applied, setApplied] = useState<Effect | null>(null);

  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="modal-scene">
          <EventScene kind={event.scene} />
          <div className="modal-scene-title">⚡ {event.title}</div>
        </div>
        <div className="modal-body">
          <p className="modal-text">{event.text}</p>

          {result === null ? (
            isAuto ? (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  if (event.autoEffects) {
                    setApplied(event.autoEffects);
                    netScore(event.autoEffects) >= 0 ? sfx.good() : sfx.bad();
                  }
                  onContinueAuto();
                }}
              >
                続ける
              </button>
            ) : (
              <div className="choice-list">
                {event.choices.map((c, i) => (
                  <button
                    key={i}
                    className="btn choice"
                    onClick={() => {
                      setApplied(c.effects);
                      netScore(c.effects) >= 0 ? sfx.good() : sfx.bad();
                      onChoose(i);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )
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
