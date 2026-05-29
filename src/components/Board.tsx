import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { SquareType } from '../types';
import { BOARD, BOARD_BY_ID, BOARD_VIEWBOX } from '../data/board';
import { Chibi } from './sprites/Chibi';

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

const R = 34;
const LEADER = { instrument: 'vocal' as const, hair: '#d11a35', skin: '#e9c6a4' };

interface BoardProps {
  currentSquareId: string;
  branchOptions: string[];
}

export function Board({ currentSquareId, branchOptions }: BoardProps) {
  const cur = BOARD_BY_ID[currentSquareId];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  // コンテナ高さを実測してSVGを明示サイズ化（高さいっぱい＋横は溢れさせてスクロール）
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 盤面の拡大率（高さに合わせる。大きすぎ/小さすぎないようクランプ）
  const k = h > 0 ? Math.min(1.15, Math.max(0.6, h / BOARD_VIEWBOX.height)) : 1;
  const svgW = BOARD_VIEWBOX.width * k;
  const svgH = BOARD_VIEWBOX.height * k;

  // カメラ追従：現在のマスを中央に
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || h === 0) return;
    el.scrollTo({ left: cur.x * k - el.clientWidth / 2, behavior: 'smooth' });
  }, [cur.x, k, h]);

  return (
    <div className="scrollboard" ref={scrollRef}>
      <svg
        viewBox={`0 0 ${BOARD_VIEWBOX.width} ${BOARD_VIEWBOX.height}`}
        width={svgW}
        height={svgH}
        style={{ display: 'block', flex: '0 0 auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="boardGlow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1c0d14" />
            <stop offset="100%" stopColor="#0b0b11" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={BOARD_VIEWBOX.width} height={BOARD_VIEWBOX.height} fill="url(#boardGlow)" />

        {/* 経路 */}
        {BOARD.map((sq) =>
          sq.next.map((nid) => {
            const to = BOARD_BY_ID[nid];
            if (!to) return null;
            const midX = (sq.x + to.x) / 2;
            const d = `M ${sq.x} ${sq.y} Q ${midX} ${sq.y} ${midX} ${(sq.y + to.y) / 2} T ${to.x} ${to.y}`;
            const isBranchEdge = sq.next.length > 1;
            return (
              <g key={`${sq.id}-${nid}`}>
                <path d={d} fill="none" stroke="#000" strokeWidth={14} strokeLinecap="round" opacity={0.5} />
                <path
                  d={d}
                  fill="none"
                  stroke={isBranchEdge ? '#6b5410' : '#39394a'}
                  strokeWidth={9}
                  strokeDasharray={isBranchEdge ? '14 10' : undefined}
                  strokeLinecap="round"
                />
              </g>
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
                  strokeWidth={4}
                  animate={{ r: [R + 6, R + 16, R + 6], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {isCurrent && (
                <motion.circle
                  cx={sq.x}
                  cy={sq.y}
                  r={R + 6}
                  fill="none"
                  stroke={st.ring}
                  strokeWidth={3}
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
              {/* 台座の影 */}
              <ellipse cx={sq.x} cy={sq.y + R - 2} rx={R} ry={8} fill="#000" opacity={0.4} />
              <circle
                cx={sq.x}
                cy={sq.y}
                r={R}
                fill={st.fill}
                stroke={st.ring}
                strokeWidth={isCurrent ? 5 : 3}
                style={isCurrent ? { filter: `drop-shadow(0 0 12px ${st.ring})` } : undefined}
              />
              <circle cx={sq.x} cy={sq.y - R * 0.35} r={R * 0.55} fill="#fff" opacity={0.07} />
              <text x={sq.x} y={sq.y + 10} textAnchor="middle" fontSize="30">
                {st.icon}
              </text>
              <text x={sq.x} y={sq.y + R + 22} textAnchor="middle" fontSize="17" fontWeight={800} fill="#d7d5de" stroke="#000" strokeWidth={0.5}>
                {sq.title}
              </text>
            </g>
          );
        })}

        {/* コマ（バンドのリーダー） */}
        <motion.g
          animate={{ x: cur.x, y: cur.y }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          initial={false}
        >
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* 🤘 吹き出し */}
            <text textAnchor="middle" fontSize="28" y={-R - 50} x={0}>
              🤘
            </text>
            <g transform={`translate(-32 ${-R - 46})`}>
              <Chibi look={LEADER} scale={0.62} />
            </g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
