import type { GameState } from '../types';
import {
  applyEffect,
  checkGameOver,
  CONFIG,
  createInitialState,
  getEvent,
  resolveGoal,
  rollDiceValue,
  squareById,
} from './engine';

export type Action =
  | { type: 'START' }
  | { type: 'RESTART' }
  | { type: 'ROLL' }
  | { type: 'STEP' }
  | { type: 'CHOOSE_BRANCH'; targetId: string }
  | { type: 'CHOOSE'; index: number }
  | { type: 'CONTINUE_AUTO' }
  | { type: 'ACK' };

function clone(state: GameState): GameState {
  return structuredClone(state);
}

/** イベント結果適用後に呼ぶ：ゲームオーバー判定。 */
function settleAfterEffect(s: GameState): void {
  const over = checkGameOver(s);
  if (over) {
    s.ending = over;
    s.phase = 'ended';
    s.activeEvent = null;
  }
}

/** ターン終了処理：ターンを進めてタイムアップ判定。 */
function finalizeTurn(s: GameState): void {
  s.activeEvent = null;
  s.eventResult = null;
  if (s.phase === 'ended') return;

  // 毎ターンの活動費・疲弊（資金/士気への継続的な圧力）
  s.stats.money -= CONFIG.UPKEEP_MONEY;
  s.stats.morale = Math.max(0, s.stats.morale - CONFIG.UPKEEP_MORALE);
  s.log = [
    `📅 今月の活動費 -¥${CONFIG.UPKEEP_MONEY.toLocaleString()}（士気-${CONFIG.UPKEEP_MORALE}）`,
    ...s.log,
  ].slice(0, 50);

  // 活動費で枯渇したらゲームオーバー
  const over = checkGameOver(s);
  if (over) {
    s.ending = over;
    s.phase = 'ended';
    return;
  }

  s.turn += 1;
  if (s.turn > s.maxTurns) {
    s.ending = {
      id: 'timeup',
      title: '実家へ ―― 家業を継ぐということ',
      text: '気づけば30歳。夢を追いかけるには、人生は少しだけ現実的すぎた。彼は楽器をしまい、実家の暖簾をくぐる。それでも時々、ふと口ずさむメロディがある。',
      bad: true,
    };
    s.phase = 'ended';
    return;
  }
  s.phase = 'idle';
}

/** マスに到達したときの解決（イベント/分岐/ゴール）。 */
function arrive(s: GameState): void {
  const cur = squareById(s.currentSquareId);
  if (cur.type === 'goal' || cur.next.length === 0) {
    resolveGoal(s);
    return;
  }
  if (cur.type === 'branch') {
    s.phase = 'branch';
    s.branchOptions = cur.next;
    return;
  }
  const ev = getEvent(cur.eventId);
  if (!ev) {
    finalizeTurn(s);
    return;
  }
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
      s.phase = 'moving';
      return s;
    }

    case 'STEP': {
      if (state.phase !== 'moving') return state;
      const s = clone(state);
      const cur = squareById(s.currentSquareId);

      // ゴール到達（next なし）
      if (cur.next.length === 0) {
        resolveGoal(s);
        return s;
      }
      // 残り0 → 着地解決
      if (s.stepsRemaining <= 0) {
        arrive(s);
        return s;
      }
      // 分岐点を通過するには方向選択が必要
      if (cur.next.length > 1) {
        s.phase = 'branch';
        s.branchOptions = cur.next;
        return s;
      }
      // 直進
      s.currentSquareId = cur.next[0];
      s.stepsRemaining -= 1;
      return s;
    }

    case 'CHOOSE_BRANCH': {
      if (state.phase !== 'branch') return state;
      const s = clone(state);
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
