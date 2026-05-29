import { AnimatePresence, motion } from 'framer-motion';
import type { Member } from '../types';
import { Chibi, lookFor } from './sprites/Chibi';

function Avatar({ member }: { member: Member }) {
  return (
    <svg viewBox="8 0 48 80" width={34} height={50} style={{ flex: '0 0 auto' }}>
      <Chibi look={lookFor(member)} />
    </svg>
  );
}

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
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar member={m} />
              {m.name}
            </span>
            <span className="role">{m.role}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
