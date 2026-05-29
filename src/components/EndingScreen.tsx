import { motion } from 'framer-motion';
import type { Ending, Stats, Venue } from '../types';
import { EventScene } from './scenes/EventScene';
import { Chibi } from './sprites/Chibi';

function LonelyScene() {
  return (
    <svg viewBox="0 0 480 200" style={{ width: '100%', maxWidth: 480, borderRadius: 12, display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <rect width={480} height={200} fill="#0a0a10" />
      <rect x={0} y={160} width={480} height={40} fill="#101017" />
      {/* 雨 */}
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.line
          key={i}
          x1={(i * 53) % 480}
          y1={-10}
          x2={(i * 53) % 480}
          y2={6}
          stroke="#2a3550"
          strokeWidth={1.5}
          animate={{ y: [0, 210] }}
          transition={{ duration: 0.9 + (i % 4) * 0.2, repeat: Infinity, delay: (i % 6) * 0.15, ease: 'linear' }}
        />
      ))}
      <g transform="translate(208 78)" opacity={0.9}>
        <Chibi look={{ instrument: 'guitar', hair: '#7a7a86', skin: '#cbb39a' }} />
      </g>
    </svg>
  );
}

interface Props {
  ending: Ending;
  venue: Venue | null;
  stats: Stats;
  onRestart: () => void;
}

export function EndingScreen({ ending, venue, stats, onRestart }: Props) {
  const isGoal = !ending.bad;

  return (
    <div className="center-screen">
      <motion.div
        style={{ width: 'min(560px, 92vw)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {isGoal ? <EventScene kind="goal" /> : <LonelyScene />}
      </motion.div>

      <motion.div
        className="tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ color: isGoal ? 'var(--gold)' : 'var(--blood-bright)' }}
      >
        {isGoal ? 'GOAL — 成功エンディング' : 'GAME OVER — 特殊エンディング'}
      </motion.div>

      {isGoal && venue && (
        <motion.div
          className="rank-badge metal-title"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        >
          {venue.rank}
        </motion.div>
      )}

      <motion.h1
        className="metal-title"
        style={{ fontSize: 'clamp(28px, 5vw, 48px)', margin: 0, maxWidth: 720 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {ending.title}
      </motion.h1>

      <motion.p
        style={{ maxWidth: 620, lineHeight: 1.9, color: '#d6d4dc' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {ending.text}
      </motion.p>

      {isGoal && venue && (
        <div className="tag" style={{ fontSize: 14 }}>
          🏟️ {venue.name}（収容 {venue.capacity.toLocaleString()}人）でフィナーレ
        </div>
      )}

      <motion.div
        style={{ display: 'flex', gap: 18, color: 'var(--muted)', fontSize: 13, flexWrap: 'wrap', justifyContent: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <span>🔥 ファン {stats.fans.toLocaleString()}</span>
        <span>🎸 スキル {stats.skill}</span>
        <span>🤝 士気 {stats.morale}</span>
        <span>💰 ¥{stats.money.toLocaleString()}</span>
      </motion.div>

      <motion.button
        className="btn btn-primary"
        style={{ fontSize: 17, padding: '12px 36px' }}
        onClick={onRestart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        もう一度挑戦する
      </motion.button>
    </div>
  );
}
