import { motion } from 'framer-motion';
import { BOARD_BY_ID } from '../data/board';
import type { EventCategory } from '../types';

interface Props {
  /** 分岐元マスのID（branchLabels 参照用） */
  fromId: string;
  options: string[];
  onChoose: (targetId: string) => void;
}

const CATEGORY_LABEL: Record<EventCategory, string> = {
  encounter: '出会いの予感',
  practice: '練習・制作',
  live: 'ライブ',
  promo: '宣伝・メディア',
  relation: '人間関係',
  trouble: 'トラブル',
  chance: '気まぐれ',
};

const CATEGORY_ICON: Record<EventCategory, string> = {
  encounter: '🤝',
  practice: '🎼',
  live: '🎤',
  promo: '📡',
  relation: '💬',
  trouble: '⚠️',
  chance: '🎲',
};

/** 分岐元→行き先の方角を矢印で返す。 */
function arrow(fromId: string, toId: string): string {
  const a = BOARD_BY_ID[fromId];
  const b = BOARD_BY_ID[toId];
  if (!a || !b) return '•';
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? '→ 東' : '← 西';
  return dy > 0 ? '↓ 南' : '↑ 北';
}

export function BranchModal({ fromId, options, onChoose }: Props) {
  const from = BOARD_BY_ID[fromId];
  const labels = from?.branchLabels ?? [];

  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div className="modal-head">🔀 道の分かれ目</div>
        <div className="modal-body">
          <p className="modal-text">どの方向へ進む？ 行き先のマスで起きることが変わる。</p>
          <div className="choice-list">
            {options.map((opt, i) => {
              const dest = BOARD_BY_ID[opt];
              const cat = dest?.category;
              // 1) 明示ラベルがあれば優先 2) なければ方角＋行き先の素性
              const explicit = labels[i];
              const destName = dest?.title || (cat ? CATEGORY_LABEL[cat] : 'この先');
              const icon = cat ? CATEGORY_ICON[cat] : '🚩';
              return (
                <button key={opt} className="btn choice branch-choice" onClick={() => onChoose(opt)}>
                  <span className="branch-dir">{arrow(fromId, opt)}</span>
                  <span className="branch-dest">
                    {icon} {explicit || destName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
