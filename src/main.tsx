import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// 開発用：?slice=stage でフル3D縦スライス（ライブステージ）を全画面表示。
// three.js は重いので通常プレイには載せず、必要なときだけ遅延ロードする。
const slice = new URLSearchParams(window.location.search).get('slice');
const LiveStageScene3D = lazy(() =>
  import('./slice/LiveStageScene3D').then((m) => ({ default: m.LiveStageScene3D })),
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {slice === 'stage' ? (
      <Suspense
        fallback={
          <div style={{ position: 'fixed', inset: 0, background: '#04040a', color: '#9a98a8', display: 'grid', placeItems: 'center' }}>
            Loading 3D…
          </div>
        }
      >
        <div style={{ position: 'fixed', inset: 0, background: '#04040a' }}>
          <LiveStageScene3D />
        </div>
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
