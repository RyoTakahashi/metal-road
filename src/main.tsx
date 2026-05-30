import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// 開発用フラグ（通常プレイには影響しない）：
//   ?slice=stage   … フル3D縦スライス（ライブステージ）を全画面表示
//   ?scene=<種別>  … 指定シーンの3D演出をモーダルサイズで確認
// three.js は重いので通常プレイには載せず、必要なときだけ遅延ロードする。
const params = new URLSearchParams(window.location.search);
const slice = params.get('slice');
const scene = params.get('scene');
const LiveStageScene3D = lazy(() =>
  import('./slice/LiveStageScene3D').then((m) => ({ default: m.LiveStageScene3D })),
);
const EventScene3D = lazy(() =>
  import('./components/scenes/EventScene3D').then((m) => ({ default: m.EventScene3D })),
);

const fallback = (
  <div style={{ position: 'fixed', inset: 0, background: '#04040a', color: '#9a98a8', display: 'grid', placeItems: 'center' }}>
    Loading 3D…
  </div>
);

let root: React.ReactNode = <App />;
if (slice === 'stage') {
  root = (
    <Suspense fallback={fallback}>
      <div style={{ position: 'fixed', inset: 0, background: '#04040a' }}>
        <LiveStageScene3D />
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{root}</React.StrictMode>);
