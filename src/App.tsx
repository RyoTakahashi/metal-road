import { Suspense, lazy, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGame } from './hooks/useGame';
import { ageLabel, phaseForTurn } from './game/engine';
import { setSfxEnabled } from './audio/sfx';
import { setBgmEnabled, startBgm } from './audio/bgm';
import { StatusPanel } from './components/StatusPanel';
import { CastPanel } from './components/CastPanel';
import { LogPanel } from './components/LogPanel';
import { Controls } from './components/Controls';
import { EventModal } from './components/EventModal';
import { BranchModal } from './components/BranchModal';
import { TitleScreen } from './components/TitleScreen';
import { EndingScreen } from './components/EndingScreen';

// 3D盤面は three.js を含み重いので、ゲーム開始時にだけ遅延ロードする
const Board3D = lazy(() => import('./components/Board3D').then((m) => ({ default: m.Board3D })));

export default function App() {
  const { state, start, restart, roll, chooseBranch, choose, continueAuto, ack } = useGame();
  const [sound, setSound] = useState(true);
  const [bgm, setBgm] = useState(true);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSfxEnabled(next);
  };

  const toggleBgm = () => {
    const next = !bgm;
    setBgm(next);
    setBgmEnabled(next);
  };

  // タイトルの「旅を始める」でメインテーマを再生開始（ユーザー操作起点）
  const handleStart = () => {
    startBgm();
    start();
  };

  if (state.phase === 'title') {
    return (
      <div className="app">
        <TitleScreen onStart={handleStart} />
      </div>
    );
  }

  if (state.phase === 'ended' && state.ending) {
    return (
      <div className="app">
        <EndingScreen
          ending={state.ending}
          venue={state.reachedVenue}
          stats={state.stats}
          cast={state.cast}
          onRestart={restart}
        />
      </div>
    );
  }

  return (
    <div className="game-shell">
      <div className="topbar">
        <span className="metal-title" style={{ fontSize: 22 }}>
          🤘 METAL ROAD
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="phase-chip">{phaseForTurn(state.turn).name}</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>
            📅 {state.turn}/{state.maxTurns}　{ageLabel(state.turn)}
          </span>
          <button className="btn" style={{ padding: '6px 12px' }} onClick={toggleBgm}>
            {bgm ? '🎵 BGM ON' : '🎵 BGM OFF'}
          </button>
          <button className="btn" style={{ padding: '6px 12px' }} onClick={toggleSound}>
            {sound ? '🔊 SE ON' : '🔇 SE OFF'}
          </button>
        </div>
      </div>

      <div className="sidebar">
        <Controls dice={state.dice} phase={state.phase} onRoll={roll} />
        <StatusPanel stats={state.stats} />
        <CastPanel cast={state.cast} />
        <LogPanel log={state.log} />
      </div>

      <div className="stage">
        <Suspense fallback={<div className="board3d-loading">🤘 3D盤面を読み込み中…</div>}>
          <Board3D currentSquareId={state.currentSquareId} branchOptions={state.branchOptions} />
        </Suspense>

        <AnimatePresence>
          {state.phase === 'event' && state.activeEvent && (
            <EventModal
              key="event"
              event={state.activeEvent}
              result={state.eventResult}
              onChoose={choose}
              onContinueAuto={continueAuto}
              onAck={ack}
            />
          )}
          {state.phase === 'branch' && (
            <BranchModal
              key="branch"
              fromId={state.currentSquareId}
              options={state.branchOptions}
              onChoose={chooseBranch}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
