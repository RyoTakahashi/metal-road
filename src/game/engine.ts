import type { AreaId, CharacterState, Effect, Ending, GameEvent, GameState, Member, UnlockReq } from '../types';
import { BOARD_BY_ID, START_SQUARE_ID } from '../data/board';
import { EVENTS } from '../data/events';
import { ENDINGS } from '../data/endings';
import { calculateRank } from '../data/venues';
import {
  AREA_ORDER,
  CHARACTERS,
  INITIAL_MEMBER_IDS,
  INITIAL_MET_IDS,
  phaseById,
  phaseForTurn,
} from '../data/characters';

// ===== チューニング用定数 =====
export const CONFIG = {
  MAX_TURNS: 120, // 20歳〜30歳の10年間（1ターン=1ヶ月）。経過でエンディング
  DEBT_LIMIT: -20000, // これを下回るとゲームオーバー（借金まみれ）
  DICE_MAX: 6, // 1〜6 のサイコロ
  START_AGE: 20,
  MONTHS_PER_TURN: 1,
  UPKEEP_MONEY: 180, // 毎ターンの活動費（家賃・スタジオ・食費）。稼ぎとの綱引き
  UPKEEP_MORALE: 0, // 毎ターンの士気消耗（基本0。イベントで増減）
};

/** バンドの正規メンバー Member を Character から生成。 */
function memberFromChar(id: string): Member {
  const c = CHARACTERS.find((ch) => ch.id === id)!;
  return { id: c.id, name: c.name, role: c.title, skill: 8 };
}

/** 全キャラの初期状態（友好度・出会い・在籍）を作る。 */
function initialCast(): Record<string, CharacterState> {
  const cast: Record<string, CharacterState> = {};
  for (const c of CHARACTERS) {
    const met = INITIAL_MET_IDS.includes(c.id);
    const active = INITIAL_MEMBER_IDS.includes(c.id);
    cast[c.id] = {
      id: c.id,
      // 初期メンバーは友好度高め、出会い済みは中程度、未登場は0
      affinity: active ? 60 : met ? 40 : 0,
      met,
      active,
    };
  }
  return cast;
}

export function createInitialState(): GameState {
  return {
    stats: { fans: 50, skill: 12, morale: 85, money: 6000 },
    members: INITIAL_MEMBER_IDS.map(memberFromChar),
    cast: initialCast(),
    turn: 1,
    maxTurns: CONFIG.MAX_TURNS,
    phaseId: 'meet',
    unlockedAreas: ['meet'],
    currentSquareId: START_SQUARE_ID,
    prevSquareId: null,
    phase: 'title',
    dice: null,
    stepsRemaining: 0,
    activeEvent: null,
    eventResult: null,
    branchOptions: [],
    usedOnce: [],
    ending: null,
    reachedVenue: null,
    log: ['——— METAL ROAD ——— 0からのバンド成功物語', '20歳の春。10年後、お前はどこのステージに立っている？'],
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
  state.log = [msg, ...state.log].slice(0, 60);
}

function formatEffectSummary(e: Effect): string {
  const parts: string[] = [];
  if (e.fans) parts.push(`ファン${e.fans > 0 ? '+' : ''}${e.fans}`);
  if (e.skill) parts.push(`スキル${e.skill > 0 ? '+' : ''}${e.skill}`);
  if (e.morale) parts.push(`士気${e.morale > 0 ? '+' : ''}${e.morale}`);
  if (e.money) parts.push(`資金${e.money > 0 ? '+' : ''}¥${e.money.toLocaleString()}`);
  return parts.join(' / ');
}

const charName = (id: string) => CHARACTERS.find((c) => c.id === id)?.name ?? id;

/** 効果を state に適用（破壊的）。state は事前に複製しておくこと。 */
export function applyEffect(state: GameState, e: Effect): void {
  const s = state.stats;
  s.fans = Math.max(0, s.fans + (e.fans ?? 0));
  s.skill = Math.max(0, s.skill + (e.skill ?? 0));
  s.morale = Math.max(0, s.morale + (e.morale ?? 0));
  s.money = s.money + (e.money ?? 0);

  // 友好度変化（met も更新）
  if (e.affinity) {
    for (const [id, delta] of Object.entries(e.affinity)) {
      const cs = state.cast[id];
      if (!cs) continue;
      if (!cs.met) {
        cs.met = true;
        pushLog(state, `🤝 ${charName(id)} と出会った`);
      }
      const before = cs.affinity;
      cs.affinity = Math.max(0, Math.min(100, cs.affinity + delta));
      if (delta !== 0) {
        pushLog(state, `　${charName(id)} との友好度 ${delta > 0 ? '+' : ''}${delta}（${cs.affinity}）`);
      }
      void before;
    }
  }

  // 加入（character ベース）
  if (e.recruit) {
    const cs = state.cast[e.recruit];
    if (cs && !cs.active) {
      cs.active = true;
      cs.met = true;
      cs.affinity = Math.max(cs.affinity, 55);
      if (!state.members.find((m) => m.id === e.recruit)) {
        state.members = [...state.members, memberFromChar(e.recruit)];
      }
      pushLog(state, `🎸 ${charName(e.recruit)} がバンドに加入！`);
    } else if (cs && cs.active) {
      // 既に在籍済み：加入の代わりに友好を深める（保険）
      cs.affinity = Math.min(100, cs.affinity + 10);
      pushLog(state, `　${charName(e.recruit)} との絆が深まった（${cs.affinity}）`);
    }
  }
  // 脱退（character ベース）
  if (e.depart) {
    const cs = state.cast[e.depart];
    if (cs && cs.active && e.depart !== 'yu') {
      cs.active = false;
      state.members = state.members.filter((m) => m.id !== e.depart);
      pushLog(state, `💔 ${charName(e.depart)} がバンドを去った…`);
    }
  }

  // 旧 addMember/removeMember 互換（character を使わないイベント用）
  if (e.addMember) {
    state.members = [...state.members, e.addMember];
    pushLog(state, `🎸 ${e.addMember.name}（${e.addMember.role}）が加入！`);
  }
  if (e.removeMember) {
    const removable = state.members.filter((m) => m.id !== 'yu');
    if (removable.length > 0) {
      let target = removable[0];
      if (e.removeMember === 'random') {
        target = removable[Math.floor(Math.random() * removable.length)];
      } else {
        const found = state.members.find((m) => m.id === e.removeMember);
        if (found) target = found;
      }
      state.members = state.members.filter((m) => m.id !== target.id);
      const cs = state.cast[target.id];
      if (cs) cs.active = false;
      pushLog(state, `💔 ${target.name} が脱退した…`);
    }
  }

  const summary = formatEffectSummary(e);
  if (summary) pushLog(state, `→ ${summary}`);
  if (e.note) pushLog(state, `　${e.note}`);
}

// ===== ゲームオーバー判定（途中敗退） =====

export function checkGameOver(state: GameState): Ending | null {
  const s = state.stats;
  if (s.fans <= 0) return ENDINGS.fans;
  if (s.skill <= 0) return ENDINGS.skill;
  // 士気は 0 でも即敗退にはしない（会場ランクの品質に響く）。
  // メンバーが主人公だけになった＝バンド崩壊のときに不仲解散エンド。
  if (state.members.length <= 1) return ENDINGS.morale;
  if (s.money <= CONFIG.DEBT_LIMIT) return ENDINGS.money;
  return null;
}

// ===== タイムアップ（10年経過）でのフィナーレ =====

export function resolveFinale(state: GameState): void {
  const result = calculateRank(state.stats);
  state.reachedVenue = result.venue;
  // エンディングの本文・エピローグは EndingScreen 側で会場＋友好度から構成する
  state.ending = {
    id: 'goal',
    title: `10年の集大成 ―― ${result.venue.name}`,
    text: `20歳の春に夢を見たあの日から、10年。たどり着いた最大の舞台は「${result.venue.name}」だった。`,
    bad: false,
  };
  state.phase = 'ended';
  pushLog(state, `🏁 10年が経過。到達ランク ${result.venue.rank}（${result.venue.name}）`);
  result.detail.forEach((d) => pushLog(state, `　${d}`));
}

export function getEvent(eventId: string | undefined): GameEvent | null {
  if (!eventId) return null;
  return EVENTS[eventId] ?? null;
}

export function squareById(id: string) {
  return BOARD_BY_ID[id];
}

// ===== エリア解放（関所） =====

/** 解放条件をすべて満たすか。 */
export function meetsUnlock(stats: GameState['stats'], req?: UnlockReq): boolean {
  if (!req) return true;
  if (req.fans != null && stats.fans < req.fans) return false;
  if (req.skill != null && stats.skill < req.skill) return false;
  if (req.morale != null && stats.morale < req.morale) return false;
  if (req.money != null && stats.money < req.money) return false;
  return true;
}

/** あるエリアに入れるか（解放済み or 今ステータスで条件を満たす）。 */
export function canEnterArea(state: GameState, area: AreaId): boolean {
  if (state.unlockedAreas.includes(area)) return true;
  const def = phaseById(area);
  return meetsUnlock(state.stats, def.unlock);
}

/** 現在ステータスで新たに解放できるエリアを解放し、ログを残す（破壊的）。 */
export function refreshUnlocks(state: GameState): void {
  for (const area of AREA_ORDER) {
    if (state.unlockedAreas.includes(area)) continue;
    const def = phaseById(area);
    if (meetsUnlock(state.stats, def.unlock)) {
      state.unlockedAreas.push(area);
      pushLog(state, `🚪 新エリア解放！「${def.name}」へ進めるようになった`);
    }
  }
}

/** 次に未解放のエリアと、その不足条件の説明（HUD用）。無ければ null。 */
export function nextLockedAreaInfo(state: GameState): { name: string; need: string } | null {
  for (const area of AREA_ORDER) {
    if (state.unlockedAreas.includes(area)) continue;
    const def = phaseById(area);
    const req = def.unlock;
    if (!req) continue;
    const parts: string[] = [];
    if (req.fans != null) parts.push(`🔥ファン${req.fans.toLocaleString()}`);
    if (req.skill != null) parts.push(`🎸スキル${req.skill}`);
    if (req.morale != null) parts.push(`🤝士気${req.morale}`);
    if (req.money != null) parts.push(`💰¥${req.money.toLocaleString()}`);
    return { name: def.name, need: parts.join(' / ') };
  }
  return null;
}

export { phaseForTurn, phaseById };
