import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import type { LiveReview } from '../types';

const EventScene3D = lazy(() => import('./scenes/EventScene3D').then((m) => ({ default: m.EventScene3D })));

const GRADE_COLOR: Record<LiveReview['grade'], string> = {
  S: 'var(--gold)',
  A: '#ff6a8a',
  B: 'var(--morale)',
  C: 'var(--skill)',
  D: 'var(--steel)',
};

function Stars({ n }: { n: number }) {
  return (
    <span className="live-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? 'on' : 'off'}>
          ★
        </span>
      ))}
    </span>
  );
}

interface Props {
  review: LiveReview;
  onAck: () => void;
}

export function LiveModal({ review, onAck }: Props) {
  const { fans, money, morale } = review.effects;
  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal live-modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="modal-scene">
          <Suspense fallback={<div className="scene-loading">🎤</div>}>
            <EventScene3D kind={review.scene} />
          </Suspense>
          <div className="modal-scene-title">
            🎤 第{review.index}回 定期ライブ ＠{review.venueName}
          </div>
        </div>

        <div className="modal-body">
          <div className="live-grade-row">
            <span className="live-grade-label">スカウト査定</span>
            <motion.span
              className="live-grade"
              style={{ color: GRADE_COLOR[review.grade] }}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}
            >
              {review.grade}
            </motion.span>
          </div>

          <div className="live-marks">
            {review.marks.map((m, i) => (
              <motion.div
                key={m.label}
                className="live-mark"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.12 }}
              >
                <span className="live-mark-label">
                  {m.icon} {m.label}
                </span>
                <Stars n={m.stars} />
                <span className="live-mark-comment">{m.comment}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="live-scout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {review.scoutComment}
          </motion.div>

          <div className="live-rewards">
            {!!fans && <span className="fx-chip" style={{ color: 'var(--fans)', borderColor: 'var(--fans)' }}>🔥 +{fans.toLocaleString()}</span>}
            {!!money && (
              <span className="fx-chip" style={{ color: money >= 0 ? 'var(--money)' : 'var(--blood-bright)', borderColor: money >= 0 ? 'var(--money)' : 'var(--blood-bright)' }}>
                💰 {money >= 0 ? '+' : ''}¥{money.toLocaleString()}
              </span>
            )}
            {!!morale && (
              <span className="fx-chip" style={{ color: morale >= 0 ? 'var(--morale)' : 'var(--blood-bright)', borderColor: morale >= 0 ? 'var(--morale)' : 'var(--blood-bright)' }}>
                🤝 {morale >= 0 ? '+' : ''}{morale}
              </span>
            )}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onAck}>
            ライブを終える
          </button>
        </div>
      </motion.div>
    </div>
  );
}
