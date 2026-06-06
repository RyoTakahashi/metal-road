import type { EventCategory, GameEvent, GameState, Square } from '../types';
import { EVENTS } from '../data/events';
import { phaseForTurn, PHASES } from '../data/characters';

const ALL_EVENTS = Object.values(EVENTS);

/** イベントが現在の状態で出現可能か（フェーズ・友好度・出会い・once 条件）。 */
function isEligible(ev: GameEvent, state: GameState): boolean {
  if (ev.once && state.usedOnce.includes(ev.id)) return false;
  if (ev.phases && !ev.phases.includes(state.phaseId)) return false;
  if (ev.requireMet) {
    const cs = state.cast[ev.requireMet.charId];
    if (!cs || cs.met !== ev.requireMet.met) return false;
  }
  if (ev.requireAffinityMin) {
    const cs = state.cast[ev.requireAffinityMin.charId];
    if (!cs || cs.affinity < ev.requireAffinityMin.min) return false;
  }
  return true;
}

/** フェーズ重み × イベント基礎重みで1件抽選。 */
function weightedPick(events: GameEvent[], state: GameState): GameEvent | null {
  const phase = phaseForTurn(state.turn);
  const weighted = events.map((ev) => {
    const catW = ev.category ? phase.weights[ev.category] ?? 1 : 1;
    const base = ev.weight ?? 1;
    return { ev, w: Math.max(0, catW * base) };
  });
  const total = weighted.reduce((a, b) => a + b.w, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const { ev, w } of weighted) {
    roll -= w;
    if (roll <= 0) return ev;
  }
  return weighted[weighted.length - 1]?.ev ?? null;
}

/**
 * 止まったマスに対応するイベントを選ぶ。
 * 1. マスに固定 eventId があればそれ
 * 2. なければ「マスのカテゴリに一致する eligible イベント」から抽選
 * 3. それも無ければ「カテゴリ不問の eligible」から抽選
 */
export function pickEventForSquare(square: Square, state: GameState): GameEvent | null {
  if (square.eventId && EVENTS[square.eventId]) return EVENTS[square.eventId];

  const eligible = ALL_EVENTS.filter((ev) => isEligible(ev, state));
  const cat: EventCategory | undefined = square.category;

  if (cat) {
    const sameCat = eligible.filter((ev) => ev.category === cat);
    const picked = weightedPick(sameCat, state);
    if (picked) return picked;
  }
  // フォールバック: カテゴリ不問
  return weightedPick(eligible, state);
}

/** フェーズ境界をまたいだか（ログ用）。turn 進行後に呼ぶ。 */
export function phaseJustChanged(prevTurn: number, nextTurn: number): boolean {
  return phaseForTurn(prevTurn).id !== phaseForTurn(nextTurn).id;
}

export { PHASES };
