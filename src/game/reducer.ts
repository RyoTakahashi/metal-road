import type { GameState } from '../types';
import {
  applyEffect,
  checkGameOver,
  CONFIG,
  createInitialState,
  phaseForTurn,
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

/** イベント結果適用後に呼ぶ：途中敗退（ステータス枯渇）の判定。 */
function settleAfterEffect(s: GameState): void {
  const over = checkGameOver(s);
  if (over) {
    s.ending = over;
    s.phase = 'ended';
    s.activeEvent = null;
  }
}

/**
 * 移動方向の候補。来た道（直前のマス）へ引き返す選択肢は除外する。
 * 除外した結果が空になる行き止まりのときだけ、来た道を許可して戻れるようにする。
 */
function moveOptions(s: GameState): string[] {
  const cur = squareById(s.currentSquareId);
  const forward = cur.next.filter((id) => id !== s.prevSquareId);
  return forward.length > 0 ? forward : cur.next;
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

  const prevTurn = s.turn;
  s.turn += 1;

  // 10年（120ターン）経過でフィナーレ
  if (s.turn > s.maxTurns) {
    resolveFinale(s);
    return;
  }

  // フェーズ更新（章が変わったらログ）
  const ph = phaseForTurn(s.turn);
  if (ph.id !== s.phaseId) {
    s.phaseId = ph.id;
    s.log = [`🎬 ${ph.name} ―― ${ph.hint}`, ...s.log].slice(0, 60);
  }
  void prevTurn;

  s.phase = 'idle';
}

/** マスに到達したときの解決（イベント抽選）。 */
function arrive(s: GameState): void {
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
