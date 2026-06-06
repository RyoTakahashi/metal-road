import type { GameState } from '../types';
import {
  applyEffect,
  canEnterArea,
  checkGameOver,
  CONFIG,
  createInitialState,
  phaseById,
  refreshUnlocks,
  resolveFinale,
  rollDiceValue,
  squareById,
} from './engine';
import { pickEventForSquare } from './eventPicker';

export type Action =
  | { type: 'START' }
  | { type: 'RESTART' }
  | { type: 'ROLL' }
  | { type: 'BEGIN_MOVE' }
  | { type: 'STEP' }
  | { type: 'CHOOSE_BRANCH'; targetId: string }
  | { type: 'CHOOSE'; index: number }
  | { type: 'CONTINUE_AUTO' }
  | { type: 'ACK' };

function clone(state: GameState): GameState {
  return structuredClone(state);
}

/** イベント結果適用後に呼ぶ：エリア解放の更新＋途中敗退（ステータス枯渇）の判定。 */
function settleAfterEffect(s: GameState): void {
  refreshUnlocks(s); // ステータス変化で新エリアが解放されたら反映
  const over = checkGameOver(s);
  if (over) {
    s.ending = over;
    s.phase = 'ended';
    s.activeEvent = null;
  }
}

/**
 * 移動方向の候補。
 * - 未解放エリアへ踏み込む辺（関所）は除外する（条件を満たすまで進めない）。
 * - 来た道（直前のマス）へ引き返す選択肢は除外する。
 * - すべて塞がれた場合は、まず関所だけ緩めて来た道で戻れるようにする。
 */
function moveOptions(s: GameState): string[] {
  const cur = squareById(s.currentSquareId);
  // 関所: 行き先マスのエリアに入れるもののみ
  const enterable = cur.next.filter((id) => canEnterArea(s, squareById(id).area));
  // 引き返し除外
  const forward = enterable.filter((id) => id !== s.prevSquareId);
  if (forward.length > 0) return forward;
  if (enterable.length > 0) return enterable; // 戻るしかない場合は来た道を許可
  // 全方向が未解放（理論上ほぼ無いが保険）：引き返しのみ許可
  return cur.next.filter((id) => id === s.prevSquareId).length > 0
    ? [s.prevSquareId as string]
    : cur.next;
}

/** 現在マスのエリアを phaseId に反映し、章が変わったらログ（破壊的）。 */
function syncArea(s: GameState): void {
  const area = squareById(s.currentSquareId).area;
  if (area !== s.phaseId) {
    s.phaseId = area;
    const def = phaseById(area);
    s.log = [`🎬 「${def.name}」に足を踏み入れた ―― ${def.hint}`, ...s.log].slice(0, 60);
  }
}

/** ターン終了処理：活動費→敗退判定→ターン進行→フェーズ更新→10年でフィナーレ。 */
function finalizeTurn(s: GameState): void {
  s.activeEvent = null;
  s.eventResult = null;
  if (s.phase === 'ended') return;

  // 毎ターンの活動費（資金への継続的な圧力）
  if (CONFIG.UPKEEP_MONEY) s.stats.money -= CONFIG.UPKEEP_MONEY;
  if (CONFIG.UPKEEP_MORALE) s.stats.morale = Math.max(0, s.stats.morale - CONFIG.UPKEEP_MORALE);

  const over = checkGameOver(s);
  if (over) {
    s.ending = over;
    s.phase = 'ended';
    return;
  }

  s.turn += 1;

  // 10年（120ターン）経過でフィナーレ
  if (s.turn > s.maxTurns) {
    resolveFinale(s);
    return;
  }

  s.phase = 'idle';
}

/** マスに到達したときの解決（エリア同期→イベント抽選）。 */
function arrive(s: GameState): void {
  syncArea(s);
  const cur = squareById(s.currentSquareId);
  const ev = pickEventForSquare(cur, s);
  if (!ev) {
    finalizeTurn(s);
    return;
  }
  if (ev.once) s.usedOnce = [...s.usedOnce, ev.id];
  s.activeEvent = ev;
  s.eventResult = null;
  s.phase = 'event';
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START': {
      const s = clone(state);
      s.phase = 'idle';
      return s;
    }
    case 'RESTART':
      return { ...createInitialState(), phase: 'idle' };

    case 'ROLL': {
      if (state.phase !== 'idle') return state;
      const s = clone(state);
      s.dice = rollDiceValue();
      s.stepsRemaining = s.dice;
      s.phase = 'rolling'; // 出目が確定するまでの演出。移動は BEGIN_MOVE で開始
      return s;
    }

    case 'BEGIN_MOVE': {
      if (state.phase !== 'rolling') return state;
      const s = clone(state);
      s.phase = 'moving';
      return s;
    }

    case 'STEP': {
      if (state.phase !== 'moving') return state;
      const s = clone(state);

      // 残り0 → 着地してイベント解決
      if (s.stepsRemaining <= 0) {
        arrive(s);
        return s;
      }
      // 自由移動：毎マス方向を選ぶ（候補が2つ以上なら必ず選択させる）
      const opts = moveOptions(s);
      if (opts.length > 1) {
        s.phase = 'branch';
        s.branchOptions = opts;
        return s;
      }
      // 一本道は自動で進む
      s.prevSquareId = s.currentSquareId;
      s.currentSquareId = opts[0];
      s.stepsRemaining -= 1;
      return s;
    }

    case 'CHOOSE_BRANCH': {
      if (state.phase !== 'branch') return state;
      const s = clone(state);
      s.prevSquareId = s.currentSquareId;
      s.currentSquareId = action.targetId;
      s.branchOptions = [];
      if (s.stepsRemaining > 0) {
        s.stepsRemaining -= 1;
        s.phase = 'moving';
      } else {
        arrive(s);
      }
      return s;
    }

    case 'CHOOSE': {
      if (state.phase !== 'event' || !state.activeEvent) return state;
      const choice = state.activeEvent.choices[action.index];
      if (!choice) return state;
      const s = clone(state);
      applyEffect(s, choice.effects);
      s.eventResult = choice.resultText;
      settleAfterEffect(s);
      return s;
    }

    case 'CONTINUE_AUTO': {
      if (state.phase !== 'event' || !state.activeEvent) return state;
      const ev = state.activeEvent;
      if (ev.choices.length > 0) return state;
      const s = clone(state);
      if (ev.autoEffects) applyEffect(s, ev.autoEffects);
      s.eventResult = ev.autoEffects?.note ?? '——';
      settleAfterEffect(s);
      return s;
    }

    case 'ACK': {
      const s = clone(state);
      finalizeTurn(s);
      return s;
    }

    default:
      return state;
  }
}
