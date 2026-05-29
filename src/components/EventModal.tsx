import { motion } from 'framer-motion';
import type { Effect, GameEvent } from '../types';
import { sfx } from '../audio/sfx';

interface Props {
  event: GameEvent;
  result: string | null;
  onChoose: (index: number) => void;
  onContinueAuto: () => void;
  onAck: () => void;
}

/** 効果の正負ざっくり判定でSEを鳴らす。 */
function playEffectSfx(e: Effect) {
  let score = 0;
  if (e.fans) score += Math.sign(e.fans) * 2;
  if (e.skill) score += Math.sign(e.skill);
  if (e.morale) score += Math.sign(e.morale);
  if (e.money) score += Math.sign(e.money);
  if (e.removeMember) score -= 2;
  if (e.addMember) score += 2;
  if (score >= 0) sfx.good();
  else sfx.bad();
}

export function EventModal({ event, result, onChoose, onContinueAuto, onAck }: Props) {
  const isAuto = event.choices.length === 0;

  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="modal-head">⚡ {event.title}</div>
        <div className="modal-body">
          <p className="modal-text">{event.text}</p>

          {result === null ? (
            isAuto ? (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  if (event.autoEffects) playEffectSfx(event.autoEffects);
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
                      playEffectSfx(c.effects);
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
              <motion.div
                className="result-box"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
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
