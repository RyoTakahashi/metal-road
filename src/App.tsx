import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGame } from './hooks/useGame';
import { ageLabel } from './game/engine';
import { setSfxEnabled } from './audio/sfx';
import { Board } from './components/Board';
import { StatusPanel } from './components/StatusPanel';
import { MemberList } from './components/MemberList';
import { LogPanel } from './components/LogPanel';
import { Controls } from './components/Controls';
import { EventModal } from './components/EventModal';
import { BranchModal } from './components/BranchModal';
import { TitleScreen } from './components/TitleScreen';
import { EndingScreen } from './components/EndingScreen';

export default function App() {
  const { state, start, restart, roll, chooseBranch, choose, continueAuto, ack } = useGame();
  const [sound, setSound] = useState(true);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSfxEnabled(next);
  };

  if (state.phase === 'title') {
    return (
      <div className="app">
        <TitleScreen onStart={start} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>
            📅 ターン {state.turn}/{state.maxTurns}　|　{ageLabel(state.turn)}
          </span>
          <button className="btn" style={{ padding: '6px 12px' }} onClick={toggleSound}>
            {sound ? '🔊 SE ON' : '🔇 SE OFF'}
          </button>
        </div>
      </div>

      <div className="sidebar">
        <Controls dice={state.dice} phase={state.phase} onRoll={roll} />
        <StatusPanel stats={state.stats} />
        <MemberList members={state.members} />
        <LogPanel log={state.log} />
      </div>

      <div className="stage">
        <Board currentSquareId={state.currentSquareId} branchOptions={state.branchOptions} />

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
