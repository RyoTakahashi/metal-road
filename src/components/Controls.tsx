import { motion } from 'framer-motion';
import type { GamePhase } from '../types';
import { CONFIG } from '../game/engine';

interface Props {
  dice: number | null;
  phase: GamePhase;
  onRoll: () => void;
}

// 3x3 グリッド上のピップ位置（値ごと）
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

function DieFace({ value }: { value: number }) {
  const pips = PIPS[value] ?? [];
  const pos = (g: number) => 16 + g * 20; // 16,36,56
  return (
    <svg viewBox="0 0 72 72" width={72} height={72}>
      <rect x={2} y={2} width={68} height={68} rx={14} fill="#f4f4f6" stroke="#9a9aa6" strokeWidth={2} />
      <rect x={2} y={40} width={68} height={30} rx={14} fill="#000" opacity={0.08} />
      {pips.map(([gx, gy], i) => (
        <circle key={i} cx={pos(gx)} cy={pos(gy)} r={6} fill="#15151c" />
      ))}
    </svg>
  );
}

export function Controls({ dice, phase, onRoll }: Props) {
  const canRoll = phase === 'idle';
  const rolling = phase === 'moving';

  return (
    <div className="panel">
      <h3>Action</h3>
      <div className="roll-zone">
        <motion.div
          style={{ width: 72, height: 72, transformStyle: 'preserve-3d' }}
          animate={
            rolling
              ? { rotateX: [0, 360, 720], rotateZ: [0, 180, 360], scale: [1, 1.12, 1] }
              : { rotateX: 0, rotateZ: 0, scale: 1 }
          }
          transition={rolling ? { duration: 0.6, repeat: Infinity, ease: 'linear' } : { type: 'spring' }}
        >
          <DieFace value={dice ?? 1} />
        </motion.div>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!canRoll}
          onClick={onRoll}
        >
          {canRoll ? '🤘 サイコロを振る' : rolling ? '移動中…' : '進行中…'}
        </button>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>1〜{CONFIG.DICE_MAX} のサイコロ</div>
      </div>
    </div>
  );
}
