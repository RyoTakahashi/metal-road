import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EVENTS } from './data/events';
import './styles/index.css';

// 開発用フラグ（通常プレイには影響しない）：
//   ?slice=stage   … フル3D縦スライス（ライブステージ）を全画面表示
//   ?scene=<種別>  … 指定シーンの3D演出をモーダルサイズで確認
// three.js は重いので通常プレイには載せず、必要なときだけ遅延ロードする。
const params = new URLSearchParams(window.location.search);
const slice = params.get('slice');
const scene = params.get('scene');
const ending = params.get('ending'); // 'goal' | 'bad'（エンディング確認用）
const eventId = params.get('event'); // 任意イベントを直接プレビュー（検証用）
const LiveStageScene3D = lazy(() =>
  import('./slice/LiveStageScene3D').then((m) => ({ default: m.LiveStageScene3D })),
);
const EventModalLazy = lazy(() =>
  import('./components/EventModal').then((m) => ({ default: m.EventModal })),
);
const BadEndScene3D = lazy(() =>
  import('./components/scenes/BadEndScene3D').then((m) => ({ default: m.BadEndScene3D })),
);
const EventScene3D = lazy(() =>
  import('./components/scenes/EventScene3D').then((m) => ({ default: m.EventScene3D })),
);
const EndingScreen = lazy(() =>
  import('./components/EndingScreen').then((m) => ({ default: m.EndingScreen })),
);

const fallback = (
  <div style={{ position: 'fixed', inset: 0, background: '#04040a', color: '#9a98a8', display: 'grid', placeItems: 'center' }}>
    Loading 3D…
  </div>
);

let root: React.ReactNode = <App />;
if (slice === 'stage' || slice === 'badend') {
  root = (
    <Suspense fallback={fallback}>
      <div style={{ position: 'fixed', inset: 0, background: '#04040a' }}>
        {slice === 'badend' ? <BadEndScene3D /> : <LiveStageScene3D />}
      </div>
    </Suspense>
  );
} else if (scene) {
  root = (
    <Suspense fallback={fallback}>
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a10', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 'min(560px, 92vw)', height: 230, border: '2px solid #c01122', borderRadius: 12, overflow: 'hidden' }}>
          <EventScene3D kind={scene as never} />
        </div>
      </div>
    </Suspense>
  );
} else if (eventId) {
  // 任意イベントの見た目を直接確認する開発用ルート（?event=<id>）
  const ev = EVENTS[eventId];
  root = ev ? (
    <Suspense fallback={fallback}>
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a10' }}>
        <EventModalLazy event={ev} result={null} onChoose={() => {}} onContinueAuto={() => {}} onAck={() => {}} />
      </div>
    </Suspense>
  ) : (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a10', color: '#e8e6ea', display: 'grid', placeItems: 'center' }}>
      unknown event: {eventId}
    </div>
  );
} else if (ending) {
  const goal = ending === 'goal';
  const mockEnding = goal
    ? { id: 'goal' as const, title: 'THE STAGE ―― 日本武道館', text: '満員の日本武道館。地鳴りのような歓声の中、彼はステージに立っていた。0から始まったこの道のり。路上で誰にも振り向かれなかったあの日から、ここまで来た。最高のランク【S】で、物語は次の幕へ。', bad: false }
    : { id: 'morale' as const, title: '音楽性の違い ―― 不仲解散', text: '「もう一緒にはやれない」。積もり積もった衝突が爆発し、メンバーは一人また一人とスタジオを去っていった。残ったのは、誰のものでもなくなった曲だけ。', bad: true };
  const mockVenue = goal ? { rank: 'S', name: '日本武道館', capacity: 14000, minFans: 11000 } : null;
  const mockStats = goal ? { fans: 12400, skill: 62, morale: 70, money: 8200 } : { fans: 900, skill: 28, morale: 0, money: -1500 };
  // プレビュー用のダミー友好度（高/中/低をひと通り）
  const mockCast = {
    take: { id: 'take', affinity: 88, met: true, active: true },
    ryo: { id: 'ryo', affinity: 72, met: true, active: true },
    shin: { id: 'shin', affinity: 60, met: true, active: true },
    kuro: { id: 'kuro', affinity: 45, met: true, active: false },
    rex: { id: 'rex', affinity: 30, met: true, active: false },
    aki: { id: 'aki', affinity: 95, met: true, active: false },
  } as never;
  root = (
    <Suspense fallback={fallback}>
      <div className="app">
        <EndingScreen ending={mockEnding} venue={mockVenue} stats={mockStats} cast={mockCast} onRestart={() => location.reload()} />
      </div>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{root}</React.StrictMode>);
