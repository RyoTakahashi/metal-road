import { AnimatePresence, motion } from 'framer-motion';
import type { GameState } from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';

const ROLE_ICON: Record<string, string> = {
  band: '🎸',
  producer: '💼',
  rival: '🔥',
  media: '📡',
  fan: '💗',
  support: '🛠️',
};

function affinityColor(a: number): string {
  if (a >= 80) return 'var(--gold)';
  if (a >= 55) return 'var(--morale)';
  if (a >= 30) return 'var(--skill)';
  return 'var(--steel)';
}

export function CastPanel({ cast }: { cast: GameState['cast'] }) {
  // 出会ったキャラのみ。バンド在籍→友好度の高い順に。
  const met = Object.values(cast)
    .filter((c) => c.met)
    .map((c) => ({ cs: c, ch: CHARACTERS_BY_ID[c.id] }))
    .filter((x) => x.ch)
    .sort((a, b) => {
      if (!!b.cs.active !== !!a.cs.active) return b.cs.active ? 1 : -1;
      return b.cs.affinity - a.cs.affinity;
    });

  return (
    <div className="panel">
      <h3>人物 & 友好度（{met.length}）</h3>
      <div className="cast-list">
        <AnimatePresence initial={false}>
          {met.map(({ cs, ch }) => (
            <motion.div
              key={cs.id}
              className="cast-row"
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="cast-head">
                <span className="cast-name">
                  {ROLE_ICON[ch.role] ?? '•'} {ch.name}
                  {cs.active && <span className="cast-badge">在籍</span>}
                </span>
                <span className="cast-aff" style={{ color: affinityColor(cs.affinity) }}>
                  {cs.affinity}
                </span>
              </div>
              <div className="cast-sub">{ch.title}</div>
              <div className="cast-bar">
                <motion.div
                  className="cast-fill"
                  style={{ background: affinityColor(cs.affinity) }}
                  animate={{ width: `${cs.affinity}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
