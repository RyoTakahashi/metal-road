import type { Member } from '../../types';

export type Instrument = 'vocal' | 'guitar' | 'bass' | 'drums' | 'keys';

export interface ChibiLook {
  instrument: Instrument;
  hair: string;
  skin: string;
}

const SKIN = '#e9c6a4';

/** メンバー情報から見た目（楽器・髪色）を決める。 */
export function lookFor(member: Member): ChibiLook {
  const role = member.role.toLowerCase();
  const map: Record<string, ChibiLook> = {
    p: { instrument: 'vocal', hair: '#d11a35', skin: SKIN },
    d0: { instrument: 'drums', hair: '#2bb6a8', skin: SKIN },
    b0: { instrument: 'bass', hair: '#e8b339', skin: SKIN },
    g1: { instrument: 'guitar', hair: '#9b5cff', skin: SKIN },
    k1: { instrument: 'keys', hair: '#e8e6ea', skin: SKIN },
  };
  if (map[member.id]) return map[member.id];
  if (role.includes('drum')) return { instrument: 'drums', hair: '#2bb6a8', skin: SKIN };
  if (role.includes('bass')) return { instrument: 'bass', hair: '#e8b339', skin: SKIN };
  if (role.includes('key')) return { instrument: 'keys', hair: '#e8e6ea', skin: SKIN };
  if (role.includes('vo')) return { instrument: 'vocal', hair: '#d11a35', skin: SKIN };
  return { instrument: 'guitar', hair: '#9b5cff', skin: SKIN };
}

/**
 * ダーク×デフォルメのチビ・メタルバンドキャラ。
 * 内部座標 0..64 (w) × 0..96 (h)。SVG 内に <g> として配置して使う。
 * （アニメーションは呼び出し側で motion ラップして付与する）
 */
export function Chibi({ look, x = 0, y = 0, scale = 1 }: { look: ChibiLook; x?: number; y?: number; scale?: number }) {
  const { instrument, hair, skin } = look;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* 影 */}
      <ellipse cx="32" cy="92" rx="18" ry="4" fill="#000" opacity="0.35" />

      {/* 脚 */}
      <rect x="24" y="74" width="6" height="16" rx="3" fill="#0e0e14" />
      <rect x="34" y="74" width="6" height="16" rx="3" fill="#0e0e14" />

      {/* 胴（黒のレザー）＋赤ライン */}
      <rect x="18" y="48" width="28" height="30" rx="9" fill="#191923" stroke="#34343f" strokeWidth="1.5" />
      <rect x="30" y="49" width="4" height="28" rx="2" fill={hair} opacity="0.8" />

      {/* 楽器 */}
      {instrument === 'vocal' && (
        <g>
          {/* マイク */}
          <line x1="46" y1="40" x2="50" y2="30" stroke="#cfd2da" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="28" r="4" fill="#cfd2da" />
        </g>
      )}
      {(instrument === 'guitar' || instrument === 'bass') && (
        <g transform="rotate(20 32 64)">
          <rect x="6" y="58" width="30" height="3" rx="1.5" fill="#5a3a1a" />
          <ellipse cx="40" cy="62" rx="13" ry="10" fill={instrument === 'bass' ? '#3a2a55' : '#7a1020'} stroke="#000" strokeWidth="1" />
          <circle cx="40" cy="62" r="3" fill="#000" />
        </g>
      )}
      {instrument === 'drums' && (
        <g>
          <line x1="44" y1="56" x2="56" y2="44" stroke="#cdb48a" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="48" y1="58" x2="60" y2="48" stroke="#cdb48a" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {instrument === 'keys' && (
        <g transform="rotate(8 32 64)">
          <rect x="14" y="60" width="34" height="9" rx="2" fill="#101018" stroke="#34343f" />
          <rect x="16" y="61" width="3" height="7" fill="#e8e6ea" />
          <rect x="21" y="61" width="3" height="7" fill="#e8e6ea" />
          <rect x="26" y="61" width="3" height="7" fill="#e8e6ea" />
          <rect x="31" y="61" width="3" height="7" fill="#e8e6ea" />
          <rect x="36" y="61" width="3" height="7" fill="#e8e6ea" />
        </g>
      )}

      {/* 頭 */}
      <circle cx="32" cy="32" r="18" fill={skin} />
      {/* 髪（ロング＋スパイク） */}
      <path
        d="M14 32 Q12 10 32 9 Q52 10 50 32 L50 50 Q46 40 44 52 Q40 38 38 52 Q34 40 32 53 Q30 40 26 52 Q24 38 20 52 Q18 40 14 50 Z"
        fill={hair}
      />
      <path d="M14 16 L20 6 L24 16 Z M40 16 L44 6 L50 16 Z M28 12 L32 3 L36 12 Z" fill={hair} />
      {/* 顔 */}
      <ellipse cx="26" cy="34" rx="2.2" ry="3" fill="#1a1a1a" />
      <ellipse cx="38" cy="34" rx="2.2" ry="3" fill="#1a1a1a" />
      <path d="M28 41 Q32 44 36 41" stroke="#7a3b2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
}
