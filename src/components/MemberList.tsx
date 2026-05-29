import { AnimatePresence, motion } from 'framer-motion';
import type { Member } from '../types';

export function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="panel">
      <h3>Band Members（{members.length}）</h3>
      <AnimatePresence initial={false}>
        {members.map((m) => (
          <motion.div
            key={m.id}
            className="member"
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
          >
            <span>
              {m.id === 'p' ? '🎤' : '🎵'} {m.name}
            </span>
            <span className="role">{m.role}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
