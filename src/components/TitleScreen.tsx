import { motion } from 'framer-motion';

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="center-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 40 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        <div style={{ fontSize: 64, lineHeight: 1 }}>🤘</div>
        <h1 className="metal-title" style={{ fontSize: 'clamp(40px, 9vw, 96px)', margin: '8px 0 0' }}>
          METAL ROAD
        </h1>
        <div className="tag">0からのバンド成功物語</div>
      </motion.div>

      <motion.p
        style={{ maxWidth: 560, lineHeight: 1.8, color: 'var(--muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        武道館、そしてドームを夢見る青年。弱小バンドを率いて路上から這い上がれ。
        サイコロを振り、ライブとイベントを乗り越え、ファン・スキル・士気・資金を育てながら、
        最後の集大成ライブで立てる「会場の規模」がお前のランクだ。
        <br />
        ――どれかが尽きれば、そこで物語は終わる。
      </motion.p>

      <motion.button
        className="btn btn-primary"
        style={{ fontSize: 18, padding: '14px 40px' }}
        onClick={onStart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        旅を始める
      </motion.button>
    </div>
  );
}
