import { motion } from 'framer-motion';
import { BOARD_BY_ID } from '../data/board';

interface Props {
  /** 分岐元マスのID（branchLabels 参照用） */
  fromId: string;
  options: string[];
  onChoose: (targetId: string) => void;
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
        <div className="modal-head">🔀 {from?.title ?? '分岐'}</div>
        <div className="modal-body">
          <p className="modal-text">どちらの道を選ぶ？ 選んだルートで物語が変わる。</p>
          <div className="choice-list">
            {options.map((opt, i) => (
              <button key={opt} className="btn choice" onClick={() => onChoose(opt)}>
                {labels[i] ?? BOARD_BY_ID[opt]?.title ?? opt}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
