import type { EventCategory, GameEvent, GameState, Square } from '../types';
import { EVENTS } from '../data/events';
import { phaseById, phaseForTurn, PHASES } from '../data/characters';

const ALL_EVENTS = Object.values(EVENTS);

/** イベントの効果が「特定キャラの加入(recruit)」を含むなら、その charId を返す。 */
function recruitTargetOf(ev: GameEvent): string | null {
  if (ev.autoEffects?.recruit) return ev.autoEffects.recruit;
  for (const c of ev.choices) {
    if (c.effects.recruit) return c.effects.recruit;
  }
  return null;
}

/** イベントが現在の状態で出現可能か（フェーズ・友好度・出会い・once・加入済み 条件）。 */
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
  // 加入イベントは、対象が既にバンドに在籍していたら出さない
  // （代わりに該当キャラとの友好イベント等が抽選される）
  const recruitId = recruitTargetOf(ev);
  if (recruitId && state.cast[recruitId]?.active) return false;
  return true;
}

/**
 * プレイヤーの状態（友好度・ステータス）に応じた動的バイアス倍率。
 * 「育て方によって起きることが変わる」感を作る中核。1.0 を基準に増減する。
 */
function dynamicBias(ev: GameEvent, state: GameState): number {
  let mult = 1;

  // 1) キャラ友好度バイアス: 関係が深いキャラのイベントほど顕著に出やすい。
  //    友好度0で約-60%、40で基準前後、100で約+180%。育てた相手の物語が増える。
  if (ev.charId) {
    const cs = state.cast[ev.charId];
    if (cs?.met) {
      mult *= 0.4 + (cs.affinity / 100) * 2.4;
    } else {
      // 未会いのキャラのイベント（＝出会いイベント）は等倍のまま
    }
  }

  // 2) ステータス親和バイアス: 強みに沿ったシーンが寄ってくる。
  const { skill, fans, morale } = state.stats;
  const cat = ev.category;
  if (cat === 'promo') {
    // 知名度（ファン）と実力（スキル）が高いほどメディア/宣伝の声がかかる
    if (fans >= 8000) mult *= 1.5;
    else if (fans >= 2000) mult *= 1.2;
    if (skill >= 80) mult *= 1.35; // コアな音楽シーンからのアプローチ
    else if (skill >= 50) mult *= 1.15;
  } else if (cat === 'live') {
    if (fans >= 5000) mult *= 1.35;
    else if (fans >= 1000) mult *= 1.15;
    if (skill >= 60) mult *= 1.15;
  } else if (cat === 'practice') {
    // スキル探求型: 既にスキルが高いほど、より高みを目指す制作/練習イベントが増える
    if (skill >= 60) mult *= 1.3;
  } else if (cat === 'relation') {
    // 士気（バンドの結束）が高いほど人間関係を深める出来事が増える
    if (morale >= 80) mult *= 1.35;
    else if (morale >= 50) mult *= 1.15;
  } else if (cat === 'trouble') {
    // 苦境は、低ステータス時にやや増える（順風満帆だと減る）
    if (morale < 40 || skill < 25) mult *= 1.3;
    if (fans >= 8000 && morale >= 70) mult *= 0.7;
  } else if (cat === 'encounter') {
    // 出会いは序盤(meet)で活きるが、人脈が広がる(知名度)と新たな出会いも呼ぶ
    if (fans >= 3000) mult *= 1.15;
  }

  return Math.max(0.1, mult);
}

/** エリア重み × イベント基礎重み × 動的バイアスで1件抽選。 */
function weightedPick(events: GameEvent[], state: GameState): GameEvent | null {
  const area = phaseById(state.phaseId);
  const weighted = events.map((ev) => {
    const catW = ev.category ? area.weights[ev.category] ?? 1 : 1;
    const base = ev.weight ?? 1;
    const bias = dynamicBias(ev, state);
    return { ev, w: Math.max(0, catW * base * bias) };
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
