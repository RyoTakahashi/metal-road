import { motion } from 'framer-motion';
import type { Stats } from '../types';

interface BarProps {
  label: string;
  icon: string;
  value: string;
  ratio: number; // 0..1
  color: string;
}

function StatBar({ label, icon, value, ratio, color }: BarProps) {
  return (
    <div className="stat-row">
      <div className="stat-head">
        <span>
          {icon} {label}
        </span>
        <motion.span
          className="val"
          style={{ color }}
          key={value}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="stat-bar">
        <motion.div
          className="stat-fill"
          style={{ background: color }}
          animate={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function StatusPanel({ stats }: { stats: Stats }) {
  // ファン数は対数スケールでバー化（武道館=5万を満タンの目安）
  const fanRatio = stats.fans <= 0 ? 0 : Math.log10(stats.fans + 1) / Math.log10(50000);
  // 資金は -10000(借金限界) 〜 +20000 を 0..1 にマップ
  const moneyRatio = (stats.money + 10000) / 30000;

  return (
    <div className="panel">
      <h3>Status</h3>
      <StatBar
        label="ファン数"
        icon="🔥"
        value={stats.fans.toLocaleString()}
        ratio={fanRatio}
        color="var(--fans)"
      />
      <StatBar
        label="演奏スキル"
        icon="🎸"
        value={String(stats.skill)}
        ratio={stats.skill / 100}
        color="var(--skill)"
      />
      <StatBar
        label="メンバー士気"
        icon="🤝"
        value={String(stats.morale)}
        ratio={stats.morale / 100}
        color="var(--morale)"
      />
      <StatBar
        label="資金"
        icon="💰"
        value={`¥${stats.money.toLocaleString()}`}
        ratio={moneyRatio}
        color="var(--money)"
      />
    </div>
  );
}
