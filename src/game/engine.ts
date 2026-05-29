import type { Effect, Ending, GameEvent, GameState, Member } from '../types';
import { BOARD_BY_ID, START_SQUARE_ID } from '../data/board';
import { EVENTS } from '../data/events';
import { ENDINGS, goalEnding } from '../data/endings';
import { calculateRank } from '../data/venues';

// ===== チューニング用定数 =====
export const CONFIG = {
  MAX_TURNS: 16, // この回数までにゴールしないとタイムアップ（22歳→30歳）
  DEBT_LIMIT: -10000, // これを下回るとゲームオーバー（借金まみれ）
  DICE_MAX: 5, // 1〜5 のサイコロ
  START_AGE: 22,
  MONTHS_PER_TURN: 6,
  UPKEEP_MONEY: 1000, // 毎ターンの活動費（家賃・スタジオ・食費）
  UPKEEP_MORALE: 2, // 毎ターンの士気消耗（活動の疲弊）
};

/** 初期メンバー（弱小バンドからのスタート） */
const INITIAL_MEMBERS: Member[] = [
  { id: 'p', name: 'ユウ（主人公）', role: 'Vo & Gt', skill: 10 },
  { id: 'd0', name: 'タケ', role: 'Drums', skill: 8 },
  { id: 'b0', name: 'リョウ', role: 'Bass', skill: 7 },
];

export function createInitialState(): GameState {
  return {
    stats: { fans: 50, skill: 12, morale: 60, money: 4000 },
    members: INITIAL_MEMBERS.map((m) => ({ ...m })),
    turn: 1,
    maxTurns: CONFIG.MAX_TURNS,
    currentSquareId: START_SQUARE_ID,
    phase: 'title',
    dice: null,
    stepsRemaining: 0,
    activeEvent: null,
    eventResult: null,
    branchOptions: [],
    ending: null,
    reachedVenue: null,
    log: ['——— METAL ROAD ——— 0からのバンド成功物語'],
  };
}

/** 経過月から年齢表記を作る。 */
export function ageLabel(turn: number): string {
  const months = (turn - 1) * CONFIG.MONTHS_PER_TURN;
  const age = CONFIG.START_AGE + Math.floor(months / 12);
  const m = months % 12;
  return `${age}歳${m}ヶ月`;
}

export function rollDiceValue(): number {
  return 1 + Math.floor(Math.random() * CONFIG.DICE_MAX);
}

// ===== 効果の適用 =====

function pushLog(state: GameState, msg: string): void {
  state.log = [msg, ...state.log].slice(0, 50);
}

function formatEffectSummary(e: Effect): string {
  const parts: string[] = [];
  if (e.fans) parts.push(`ファン${e.fans > 0 ? '+' : ''}${e.fans}`);
  if (e.skill) parts.push(`スキル${e.skill > 0 ? '+' : ''}${e.skill}`);
  if (e.morale) parts.push(`士気${e.morale > 0 ? '+' : ''}${e.morale}`);
  if (e.money) parts.push(`資金${e.money > 0 ? '+' : ''}¥${e.money.toLocaleString()}`);
  return parts.join(' / ');
}

/** 効果を state に適用（破壊的）。state は事前に複製しておくこと。 */
export function applyEffect(state: GameState, e: Effect): void {
  const s = state.stats;
  s.fans = Math.max(0, s.fans + (e.fans ?? 0));
  s.skill = Math.max(0, s.skill + (e.skill ?? 0));
  s.morale = Math.max(0, s.morale + (e.morale ?? 0));
  s.money = s.money + (e.money ?? 0);

  if (e.addMember) {
    state.members = [...state.members, e.addMember];
    pushLog(state, `🎸 ${e.addMember.name}（${e.addMember.role}）が加入！`);
  }
  if (e.removeMember) {
    const removable = state.members.filter((m) => m.id !== 'p');
    if (removable.length > 0) {
      let target = removable[0];
      if (e.removeMember === 'random') {
        target = removable[Math.floor(Math.random() * removable.length)];
      } else {
        const found = state.members.find((m) => m.id === e.removeMember);
        if (found) target = found;
      }
      state.members = state.members.filter((m) => m.id !== target.id);
      pushLog(state, `💔 ${target.name} が脱退した…`);
      // メンバーが主人公1人だけになったら士気が崩壊
      if (state.members.length <= 1) state.stats.morale = 0;
    }
  }

  const summary = formatEffectSummary(e);
  if (summary) pushLog(state, `→ ${summary}`);
  if (e.note) pushLog(state, `　${e.note}`);
}

// ===== ゲームオーバー判定 =====

export function checkGameOver(state: GameState): Ending | null {
  const s = state.stats;
  if (s.fans <= 0) return ENDINGS.fans;
  if (s.skill <= 0) return ENDINGS.skill;
  if (s.morale <= 0) return ENDINGS.morale;
  if (s.money <= CONFIG.DEBT_LIMIT) return ENDINGS.money;
  return null;
}

// ===== ゴール処理 =====

export function resolveGoal(state: GameState): void {
  const result = calculateRank(state.stats);
  state.reachedVenue = result.venue;
  state.ending = goalEnding(result.venue.name, result.venue.rank);
  state.phase = 'ended';
  pushLog(state, `🏆 ゴール到達！ ${result.venue.name}（ランク${result.venue.rank}）`);
  result.detail.forEach((d) => pushLog(state, `　${d}`));
}

export function getEvent(eventId: string | undefined): GameEvent | null {
  if (!eventId) return null;
  return EVENTS[eventId] ?? null;
}

export function squareById(id: string) {
  return BOARD_BY_ID[id];
}
