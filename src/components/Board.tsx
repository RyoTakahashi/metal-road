import { motion } from 'framer-motion';
import type { SquareType } from '../types';
import { BOARD, BOARD_BY_ID, BOARD_VIEWBOX } from '../data/board';

const TYPE_STYLE: Record<SquareType, { fill: string; ring: string; icon: string }> = {
  start: { fill: '#243042', ring: '#5aa0ff', icon: '🚩' },
  live: { fill: '#3a1020', ring: '#ff3b5c', icon: '🎤' },
  event: { fill: '#332139', ring: '#c46bff', icon: '⚡' },
  member: { fill: '#2a2410', ring: '#ffb13b', icon: '🎸' },
  random: { fill: '#10262a', ring: '#4fd6c4', icon: '🎲' },
  rest: { fill: '#16301a', ring: '#9ad14f', icon: '🎼' },
  branch: { fill: '#2c2c12', ring: '#e8b339', icon: '🔀' },
  goal: { fill: '#3a0a0a', ring: '#ffd24a', icon: '🏟️' },
};

const R = 30;

interface BoardProps {
  currentSquareId: string;
  /** 分岐選択中にハイライトする候補マス */
  branchOptions: string[];
}

export function Board({ currentSquareId, branchOptions }: BoardProps) {
  const cur = BOARD_BY_ID[currentSquareId];

  return (
    <div className="scrollboard">
      <svg
        viewBox={`0 0 ${BOARD_VIEWBOX.width} ${BOARD_VIEWBOX.height}`}
        style={{ width: '100%', minWidth: 900, height: 'auto', display: 'block' }}
      >
        {/* 経路 */}
        {BOARD.map((sq) =>
          sq.next.map((nid) => {
            const to = BOARD_BY_ID[nid];
            if (!to) return null;
            const midX = (sq.x + to.x) / 2;
            const d = `M ${sq.x} ${sq.y} Q ${midX} ${sq.y} ${midX} ${(sq.y + to.y) / 2} T ${to.x} ${to.y}`;
            const isBranchEdge = sq.next.length > 1;
            return (
              <path
                key={`${sq.id}-${nid}`}
                d={d}
                fill="none"
                stroke={isBranchEdge ? '#5a4a1a' : '#33333f'}
                strokeWidth={isBranchEdge ? 5 : 7}
                strokeDasharray={isBranchEdge ? '10 8' : undefined}
                strokeLinecap="round"
              />
            );
          }),
        )}

        {/* マス */}
        {BOARD.map((sq) => {
          const st = TYPE_STYLE[sq.type];
          const isCurrent = sq.id === currentSquareId;
          const isOption = branchOptions.includes(sq.id);
          return (
            <g key={sq.id}>
              {isOption && (
                <motion.circle
                  cx={sq.x}
                  cy={sq.y}
                  r={R + 8}
                  fill="none"
                  stroke={st.ring}
                  strokeWidth={3}
                  animate={{ r: [R + 6, R + 14, R + 6], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              <circle
                cx={sq.x}
                cy={sq.y}
                r={R}
                fill={st.fill}
                stroke={st.ring}
                strokeWidth={isCurrent ? 4 : 2.5}
                style={isCurrent ? { filter: `drop-shadow(0 0 10px ${st.ring})` } : undefined}
              />
              <text x={sq.x} y={sq.y + 8} textAnchor="middle" fontSize="26">
                {st.icon}
              </text>
              <text
                x={sq.x}
                y={sq.y + R + 18}
                textAnchor="middle"
                fontSize="14"
                fontWeight={700}
                fill="#cfcdd6"
              >
                {sq.title}
              </text>
            </g>
          );
        })}

        {/* コマ（バンドのフラッグ） */}
        <motion.g
          animate={{ x: cur.x, y: cur.y }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          initial={false}
        >
          <motion.text
            textAnchor="middle"
            fontSize="34"
            y={-R - 4}
            animate={{ y: [-R - 4, -R - 14, -R - 4] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            🤘
          </motion.text>
        </motion.g>
      </svg>
    </div>
  );
}
