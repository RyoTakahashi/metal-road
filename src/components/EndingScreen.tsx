import { motion } from 'framer-motion';
import type { Ending, Stats, Venue } from '../types';

// エンディング背景は事前レンダリングのポスター（成功＝歓声のステージ／失敗＝雨の寂寥）
const STAGE_POSTER = `${import.meta.env.BASE_URL}posters/stage.jpg`;
const BADEND_POSTER = `${import.meta.env.BASE_URL}posters/badend.jpg`;

interface Props {
  ending: Ending;
  venue: Venue | null;
  stats: Stats;
  onRestart: () => void;
}

export function EndingScreen({ ending, venue, stats, onRestart }: Props) {
  const isGoal = !ending.bad;

  return (
    <div className="screen3d">
      <div
        className="scene-bg poster"
        style={{ backgroundImage: `url("${isGoal ? STAGE_POSTER : BADEND_POSTER}")` }}
      />
      <div className="scrim" />

      <div className="content center-screen">
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
          style={{ maxWidth: 620, lineHeight: 1.9, color: '#e2e0e8' }}
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
          style={{ display: 'flex', gap: 18, color: '#cfcdd6', fontSize: 13, flexWrap: 'wrap', justifyContent: 'center' }}
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
    </div>
  );
}
