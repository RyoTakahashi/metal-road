// 開発時のヘッドレス検証用。esbuild でバンドルして node 実行する。
import { reducer, type Action } from '../src/game/reducer';
import { createInitialState, rollDiceValue } from '../src/game/engine';
import type { GameState } from '../src/types';

const WORST = process.env.WORST === '1';

function autoChoose(s: GameState): Action | null {
  switch (s.phase) {
    case 'title':
      return { type: 'START' };
    case 'idle':
      return { type: 'ROLL' };
    case 'rolling':
      return { type: 'BEGIN_MOVE' };
    case 'moving':
      return { type: 'STEP' };
    case 'branch':
      return { type: 'CHOOSE_BRANCH', targetId: s.branchOptions[Math.floor(Math.random() * s.branchOptions.length)] };
    case 'live':
      return { type: 'ACK_LIVE' };
    case 'event':
      if (!s.activeEvent) return null;
      if (s.eventResult !== null) return { type: 'ACK' };
      if (s.activeEvent.choices.length === 0) return { type: 'CONTINUE_AUTO' };
      if (WORST) {
        // 最も負の効果が大きい選択肢を選ぶ
        let worst = 0;
        let worstScore = Infinity;
        s.activeEvent.choices.forEach((c, i) => {
          const e = c.effects;
          const score = (e.fans ?? 0) + (e.skill ?? 0) * 100 + (e.morale ?? 0) * 100 + (e.money ?? 0) / 50 + (e.removeMember ? -500 : 0);
          if (score < worstScore) {
            worstScore = score;
            worst = i;
          }
        });
        return { type: 'CHOOSE', index: worst };
      }
      return { type: 'CHOOSE', index: Math.floor(Math.random() * s.activeEvent.choices.length) };
    case 'ended':
      return null;
  }
}

function run(seed: number) {
  // 簡易乱数差し替えは省略。複数回まわして到達を見る。
  void seed;
  let s = createInitialState();
  let guard = 0;
  const visited = new Set<string>();
  while (s.phase !== 'ended' && guard < 5000) {
    const a = autoChoose(s);
    if (!a) break;
    s = reducer(s, a);
    visited.add(s.currentSquareId);
    guard++;
  }
  return { ending: s.ending?.id, rank: s.reachedVenue?.rank, turn: s.turn, square: s.currentSquareId, steps: guard, visited: visited.size, stats: s.stats, met: Object.values(s.cast).filter((c) => c.met).length };
}

void rollDiceValue;
const results: Record<string, number> = {};
for (let i = 0; i < 200; i++) {
  const r = run(i);
  const key = `${r.ending}${r.rank ? '(' + r.rank + ')' : ''}`;
  results[key] = (results[key] ?? 0) + 1;
  if (i < 3) console.log('sample', i, JSON.stringify(r));
}
console.log('--- 200 playthroughs (random choices) ---');
console.log(results);
