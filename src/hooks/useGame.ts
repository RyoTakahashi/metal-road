import { useCallback, useEffect, useReducer, useRef } from 'react';
import { reducer } from '../game/reducer';
import { createInitialState } from '../game/engine';
import { sfx } from '../audio/sfx';

const STEP_MS = 300; // コマが1マス進む間隔

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const endSoundPlayed = useRef(false);

  // 移動アニメーション：phase が moving の間、1マスずつ進める
  useEffect(() => {
    if (state.phase !== 'moving') return;
    const id = setTimeout(() => {
      if (state.stepsRemaining > 0) sfx.step();
      dispatch({ type: 'STEP' });
    }, STEP_MS);
    return () => clearTimeout(id);
  }, [state.phase, state.currentSquareId, state.stepsRemaining]);

  // 終了サウンド
  useEffect(() => {
    if (state.phase === 'ended' && state.ending && !endSoundPlayed.current) {
      endSoundPlayed.current = true;
      if (state.ending.bad) sfx.gameover();
      else sfx.victory();
    }
    if (state.phase !== 'ended') endSoundPlayed.current = false;
  }, [state.phase, state.ending]);

  const start = useCallback(() => {
    sfx.click();
    dispatch({ type: 'START' });
  }, []);
  const restart = useCallback(() => {
    endSoundPlayed.current = false;
    dispatch({ type: 'RESTART' });
  }, []);
  const roll = useCallback(() => {
    sfx.dice();
    dispatch({ type: 'ROLL' });
  }, []);
  const chooseBranch = useCallback((targetId: string) => {
    sfx.click();
    dispatch({ type: 'CHOOSE_BRANCH', targetId });
  }, []);
  const choose = useCallback((index: number) => {
    dispatch({ type: 'CHOOSE', index });
  }, []);
  const continueAuto = useCallback(() => {
    dispatch({ type: 'CONTINUE_AUTO' });
  }, []);
  const ack = useCallback(() => {
    sfx.click();
    dispatch({ type: 'ACK' });
  }, []);

  return { state, start, restart, roll, chooseBranch, choose, continueAuto, ack };
}
