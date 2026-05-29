import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { SceneKind } from '../../types';
import { Chibi, type ChibiLook } from '../sprites/Chibi';

const VB = { w: 480, h: 220 };

const BAND: ChibiLook[] = [
  { instrument: 'guitar', hair: '#9b5cff', skin: '#e9c6a4' },
  { instrument: 'vocal', hair: '#d11a35', skin: '#e9c6a4' },
  { instrument: 'drums', hair: '#2bb6a8', skin: '#e9c6a4' },
];

/** 上から差すスポットライト（左右で揺れる）。 */
function Spotlights({ colors = ['#ff2238', '#9b5cff'] as [string, string] }) {
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      <defs>
        <linearGradient id="spot0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="0.55" />
          <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="spot1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[1]} stopOpacity="0.55" />
          <stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points="120,0 60,170 200,170"
        fill="url(#spot0)"
        style={{ transformOrigin: '120px 0px' }}
        animate={{ rotate: [-10, 10, -10] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.polygon
        points="360,0 280,170 420,170"
        fill="url(#spot1)"
        style={{ transformOrigin: '360px 0px' }}
        animate={{ rotate: [10, -10, 10] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </g>
  );
}

/** 観客のシルエット（手を上げてヘドバン）。 */
function Crowd({ count = 10, y = 170, color = '#05050a' }) {
  const items = Array.from({ length: count });
  return (
    <g>
      {items.map((_, i) => {
        const x = 20 + (i * (VB.w - 40)) / Math.max(1, count - 1);
        const s = 0.8 + ((i * 37) % 5) / 10;
        const delay = (i % 5) * 0.12;
        return (
          <motion.g
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay, ease: 'easeInOut' }}
          >
            {/* 頭 */}
            <circle cx={x} cy={y} r={9 * s} fill={color} />
            {/* 体 */}
            <rect x={x - 8 * s} y={y + 6 * s} width={16 * s} height={40} rx={6} fill={color} />
            {/* 上げた腕＋🤘 */}
            <line x1={x - 6} y1={y} x2={x - 12} y2={y - 16} stroke={color} strokeWidth={4} strokeLinecap="round" />
            <line x1={x + 6} y1={y} x2={x + 12} y2={y - 16} stroke={color} strokeWidth={4} strokeLinecap="round" />
          </motion.g>
        );
      })}
    </g>
  );
}

/** ステージ系シーン（ライブ/ツアー/フェス/アリーナ/海外/ゴール）。 */
function StageScene({
  crowd,
  colors,
  banner,
  pyro = false,
}: {
  crowd: number;
  colors?: [string, string];
  banner?: string;
  pyro?: boolean;
}) {
  return (
    <>
      <rect width={VB.w} height={VB.h} fill="#0a0a12" />
      {/* バックの薄い円（会場の奥行き） */}
      <ellipse cx={VB.w / 2} cy={60} rx={200} ry={70} fill="#16101e" />
      <Spotlights colors={colors} />

      {banner && (
        <g>
          <rect x={VB.w / 2 - 90} y={14} width={180} height={26} rx={4} fill="#1a0b10" stroke="#c01122" />
          <text x={VB.w / 2} y={32} textAnchor="middle" fontSize="15" fontWeight={800} fill="#ff3b4e">
            {banner}
          </text>
        </g>
      )}

      {/* ステージ床 */}
      <rect x={0} y={150} width={VB.w} height={70} fill="#0c0c14" />
      <rect x={0} y={148} width={VB.w} height={4} fill="#c01122" opacity={0.7} />

      {/* バンド（ステージ上） */}
      <g transform="translate(0 70) scale(0.9)">
        <motion.g animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ transformOrigin: '120px 130px' }}>
          <Chibi look={BAND[0]} x={120} y={40} />
        </motion.g>
        <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 0.45, repeat: Infinity }}>
          <Chibi look={BAND[1]} x={210} y={36} scale={1.1} />
        </motion.g>
        <motion.g animate={{ rotate: [3, -3, 3] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ transformOrigin: '320px 130px' }}>
          <Chibi look={BAND[2]} x={300} y={40} />
        </motion.g>
      </g>

      {/* 観客（手前） */}
      <Crowd count={crowd} />

      {pyro && (
        <>
          {[80, 240, 400].map((x, i) => (
            <motion.g key={x}>
              <motion.rect
                x={x - 3}
                y={60}
                width={6}
                height={90}
                fill="#ffb13b"
                style={{ transformOrigin: `${x}px 150px` }}
                animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
              />
            </motion.g>
          ))}
          {/* 紙吹雪 */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.rect
              key={i}
              x={(i * 31) % VB.w}
              y={-10}
              width={5}
              height={9}
              fill={['#ff2238', '#e8b339', '#9b5cff', '#2bb6a8'][i % 4]}
              animate={{ y: [-10, VB.h + 10], rotate: [0, 360] }}
              transition={{ duration: 2.4 + (i % 4) * 0.5, repeat: Infinity, delay: (i % 6) * 0.3, ease: 'linear' }}
            />
          ))}
        </>
      )}
    </>
  );
}

/** イコライザーのバー（スタジオ）。 */
function Equalizer({ x, y, bars = 7 }: { x: number; y: number; bars?: number }) {
  return (
    <g>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.rect
          key={i}
          x={x + i * 14}
          y={y}
          width={9}
          height={40}
          rx={2}
          fill={['#ff2238', '#e8b339', '#2bb6a8'][i % 3]}
          style={{ transformOrigin: `${x + i * 14}px ${y + 40}px` }}
          animate={{ scaleY: [0.2, 1, 0.4, 0.9, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
        />
      ))}
    </g>
  );
}

function FloatingIcons({ icon, color }: { icon: string; color: string }) {
  return (
    <g>
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.text
          key={i}
          x={80 + (i * 41) % 320}
          y={200}
          fontSize={18 + (i % 3) * 6}
          fill={color}
          textAnchor="middle"
          animate={{ y: [200, 30], opacity: [0, 1, 0] }}
          transition={{ duration: 2.2 + (i % 3) * 0.6, repeat: Infinity, delay: (i % 5) * 0.4, ease: 'easeOut' }}
        >
          {icon}
        </motion.text>
      ))}
    </g>
  );
}

export function EventScene({ kind }: { kind: SceneKind }) {
  let content: ReactNode;

  switch (kind) {
    case 'livehouse':
      content = <StageScene crowd={9} banner="LIVE HOUSE" />;
      break;
    case 'tour':
      content = <StageScene crowd={12} banner="NATIONWIDE TOUR" colors={['#ff2238', '#e8b339']} />;
      break;
    case 'festival':
      content = <StageScene crowd={16} banner="ROCK FESTIVAL" colors={['#ff2238', '#2bb6a8']} />;
      break;
    case 'arena':
      content = <StageScene crowd={16} banner="ARENA" colors={['#9b5cff', '#5aa0ff']} pyro />;
      break;
    case 'overseas':
      content = <StageScene crowd={14} banner="WORLD TOUR" colors={['#5aa0ff', '#e8b339']} />;
      break;
    case 'goal':
      content = <StageScene crowd={18} banner="THE FINAL STAGE" colors={['#ff2238', '#e8b339']} pyro />;
      break;

    case 'street':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0c0e18" />
          <rect x={0} y={170} width={VB.w} height={50} fill="#15151c" />
          {/* 街灯 */}
          <rect x={70} y={40} width={5} height={130} fill="#2a2a33" />
          <circle cx={72} cy={40} r={12} fill="#ffd98a" opacity={0.9} />
          <motion.polygon points="72,40 30,180 120,180" fill="#ffd98a" opacity={0.12} animate={{ opacity: [0.08, 0.16, 0.08] }} transition={{ duration: 2, repeat: Infinity }} />
          {/* 弾き語りチビ */}
          <g transform="translate(180 78)">
            <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ transformOrigin: '32px 90px' }}>
              <Chibi look={{ instrument: 'guitar', hair: '#d11a35', skin: '#e9c6a4' }} />
            </motion.g>
          </g>
          <FloatingIcons icon="♪" color="#e8b339" />
        </>
      );
      break;

    case 'studio':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0e0f17" />
          <rect x={0} y={170} width={VB.w} height={50} fill="#14141d" />
          {/* アンプ */}
          <rect x={40} y={120} width={70} height={55} rx={4} fill="#1a1a22" stroke="#34343f" />
          <circle cx={75} cy={148} r={16} fill="#0a0a0f" stroke="#34343f" />
          <Equalizer x={250} y={70} />
          <g transform="translate(120 80)">
            <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <Chibi look={{ instrument: 'guitar', hair: '#9b5cff', skin: '#e9c6a4' }} />
            </motion.g>
          </g>
        </>
      );
      break;

    case 'sns':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0b0d16" />
          {/* スマホ */}
          <rect x={VB.w / 2 - 55} y={30} width={110} height={170} rx={14} fill="#15151f" stroke="#34343f" strokeWidth={2} />
          <rect x={VB.w / 2 - 47} y={46} width={94} height={120} rx={4} fill="#0a0a12" />
          <motion.text x={VB.w / 2} y={120} textAnchor="middle" fontSize={40} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            📱
          </motion.text>
          <FloatingIcons icon="❤" color="#ff3b5c" />
          <motion.text x={VB.w / 2} y={186} textAnchor="middle" fontSize={13} fontWeight={800} fill="#4fd6c4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
            再生数 急上昇中！
          </motion.text>
        </>
      );
      break;

    case 'flame':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#160707" />
          <g transform="translate(190 70)">
            <Chibi look={{ instrument: 'vocal', hair: '#d11a35', skin: '#e9c6a4' }} />
            <motion.text x={56} y={20} fontSize={20} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}>💦</motion.text>
          </g>
          {/* 炎 */}
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 20 + i * 52;
            return (
              <motion.path
                key={i}
                d={`M${x} 220 Q${x - 18} 170 ${x} 140 Q${x + 18} 170 ${x} 220 Z`}
                fill={i % 2 ? '#ff7a1a' : '#ff2a1a'}
                style={{ transformOrigin: `${x}px 220px` }}
                animate={{ scaleY: [0.7, 1.2, 0.8, 1.1, 0.7], opacity: [0.8, 1, 0.85] }}
                transition={{ duration: 0.6 + (i % 3) * 0.15, repeat: Infinity, delay: i * 0.05 }}
              />
            );
          })}
          <FloatingIcons icon="🔥" color="#ff7a1a" />
        </>
      );
      break;

    case 'member':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0e0f17" />
          <rect x={0} y={170} width={VB.w} height={50} fill="#14141d" />
          <motion.g animate={{ x: [0, 6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
            <g transform="translate(120 80)"><Chibi look={{ instrument: 'guitar', hair: '#9b5cff', skin: '#e9c6a4' }} /></g>
          </motion.g>
          <motion.g animate={{ x: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
            <g transform="translate(250 80) scale(-1 1)"><Chibi look={{ instrument: 'bass', hair: '#e8b339', skin: '#e9c6a4' }} /></g>
          </motion.g>
          <motion.text x={VB.w / 2} y={70} textAnchor="middle" fontSize={34} animate={{ scale: [0.9, 1.2, 0.9] }} transition={{ duration: 0.8, repeat: Infinity }}>⚡</motion.text>
        </>
      );
      break;

    case 'trouble':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#100f14" />
          <rect x={0} y={170} width={VB.w} height={50} fill="#15151d" />
          <rect x={VB.w / 2 - 45} y={100} width={90} height={75} rx={5} fill="#1a1a22" stroke="#34343f" />
          <circle cx={VB.w / 2} cy={140} r={20} fill="#0a0a0f" stroke="#34343f" />
          {/* 火花 */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.line
              key={i}
              x1={VB.w / 2}
              y1={100}
              x2={VB.w / 2 + Math.cos((i / 8) * 6.28) * 40}
              y2={100 + Math.sin((i / 8) * 6.28) * 40}
              stroke="#ffd24a"
              strokeWidth={2}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.06 }}
            />
          ))}
          <motion.text x={VB.w / 2} y={80} textAnchor="middle" fontSize={26} animate={{ y: [80, 55], opacity: [1, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>💨</motion.text>
          <FloatingIcons icon="💸" color="#9ad14f" />
        </>
      );
      break;

    case 'tv':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0b0d16" />
          <rect x={VB.w / 2 - 110} y={30} width={220} height={150} rx={10} fill="#15151f" stroke="#34343f" strokeWidth={3} />
          <rect x={VB.w / 2 - 98} y={44} width={196} height={110} rx={4} fill="#0a0a12" />
          <g transform="translate(200 70) scale(0.8)"><Chibi look={{ instrument: 'vocal', hair: '#d11a35', skin: '#e9c6a4' }} /></g>
          <motion.g animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <rect x={VB.w / 2 + 50} y={52} width={44} height={18} rx={3} fill="#c01122" />
            <text x={VB.w / 2 + 72} y={66} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">ON AIR</text>
          </motion.g>
          {/* スキャンライン */}
          <motion.rect x={VB.w / 2 - 98} y={44} width={196} height={3} fill="#5aa0ff" opacity={0.4} animate={{ y: [44, 150] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
        </>
      );
      break;

    case 'press':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0e0f17" />
          {/* 雑誌 */}
          <rect x={VB.w / 2 - 80} y={60} width={75} height={100} rx={3} fill="#1a1a22" stroke="#34343f" transform={`rotate(-6 ${VB.w / 2 - 42} 110)`} />
          <rect x={VB.w / 2 + 5} y={60} width={75} height={100} rx={3} fill="#20202b" stroke="#34343f" transform={`rotate(6 ${VB.w / 2 + 42} 110)`} />
          <text x={VB.w / 2} y={50} textAnchor="middle" fontSize={14} fontWeight={800} fill="#ff3b4e">METAL MAGAZINE</text>
          {/* カメラフラッシュ */}
          {[100, 380, 240].map((x, i) => (
            <motion.circle key={x} cx={x} cy={40 + i * 20} r={10} fill="#fff" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.5 }} />
          ))}
        </>
      );
      break;

    case 'fans':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0c0a14" />
          <rect x={0} y={170} width={VB.w} height={50} fill="#14121d" />
          <g transform="translate(205 78)">
            <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ transformOrigin: '32px 90px' }}>
              <Chibi look={{ instrument: 'vocal', hair: '#d11a35', skin: '#e9c6a4' }} />
            </motion.g>
          </g>
          <Crowd count={8} y={185} color="#1a1430" />
          <FloatingIcons icon="❤" color="#ff3b5c" />
        </>
      );
      break;

    case 'contract':
      content = (
        <>
          <rect width={VB.w} height={VB.h} fill="#0d0f10" />
          <rect x={0} y={170} width={VB.w} height={50} fill="#141716" />
          {/* 怪しい男（黒スーツ・サングラス） */}
          <g transform="translate(200 70)">
            <ellipse cx={32} cy={92} rx={18} ry={4} fill="#000" opacity={0.35} />
            <rect x={16} y={44} width={32} height={42} rx={6} fill="#0b0b0f" stroke="#2a2a30" />
            <circle cx={32} cy={30} r={16} fill="#d8b48f" />
            <rect x={18} y={26} width={28} height={8} rx={2} fill="#000" />
            <rect x={26} y={6} width={12} height={18} rx={2} fill="#1a1a1a" />
            {/* アタッシュケース */}
            <rect x={48} y={64} width={22} height={16} rx={2} fill="#3a2a16" stroke="#000" />
          </g>
          <FloatingIcons icon="＄" color="#9ad14f" />
        </>
      );
      break;
  }

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ width: '100%', display: 'block', borderRadius: 10 }} preserveAspectRatio="xMidYMid slice">
      {content}
    </svg>
  );
}
