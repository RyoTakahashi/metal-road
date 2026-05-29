import { motion } from 'framer-motion';
import type { GamePhase } from '../types';
import { CONFIG } from '../game/engine';

interface Props {
  dice: number | null;
  phase: GamePhase;
  onRoll: () => void;
}

export function Controls({ dice, phase, onRoll }: Props) {
  const canRoll = phase === 'idle';
  const rolling = phase === 'moving';

  return (
    <div className="panel">
      <h3>Action</h3>
      <div className="roll-zone">
        <motion.div
          className="dice"
          animate={rolling ? { rotate: [0, -15, 15, -10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
          key={dice ?? 'none'}
        >
          {dice ?? '🎲'}
        </motion.div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={!canRoll} onClick={onRoll}>
          {canRoll ? 'サイコロを振る' : rolling ? '移動中…' : '進行中…'}
        </button>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>1〜{CONFIG.DICE_MAX} のサイコロ</div>
      </div>
    </div>
  );
}
