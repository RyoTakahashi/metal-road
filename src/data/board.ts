import type { AreaId, EventCategory, Square, SquareType } from '../types';

/**
 * 桃鉄型の自由移動マップ。
 * グリッド上にノードを配置し、隣接ノードを双方向の辺で結ぶ。
 * プレイヤーはサイコロの出目ぶん、好きな方向へ進める（分岐で方向選択・引き返し可）。
 * ゴールは無し。120ターン（10年）経過でエンディング。
 *
 * 各ノードは category を持ち、止まったマスのカテゴリ × 現在フェーズで
 * イベントを抽選する（拠点マスは固定の象徴的イベントを持つ）。
 */

const COLS = 11;
const ROWS = 7;
const GAP_X = 240;
const GAP_Y = 230;
const OX = 130;
const OY = 130;

interface Cell {
  r: number;
  c: number;
}

// グリッドの一部を「道」として使う（迷路的に少し穴を空けて桃鉄っぽく）。
// true = マスあり。外周はぐるりと繋がるループ、内側に横断路を数本。
function layoutMask(): boolean[][] {
  const m: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  // 外周ループ
  for (let c = 0; c < COLS; c++) {
    m[0][c] = true;
    m[ROWS - 1][c] = true;
  }
  for (let r = 0; r < ROWS; r++) {
    m[r][0] = true;
    m[r][COLS - 1] = true;
  }
  // 横断路（中段の行）
  for (let c = 0; c < COLS; c++) m[3][c] = true;
  // 縦の連絡路を数本
  for (let r = 0; r < ROWS; r++) {
    m[r][3] = true;
    m[r][7] = true;
  }
  return m;
}

// 列でエリアを4分割（左→右へ上位）。11列を 0-2 / 3-5 / 6-8 / 9-10 に割当て。
function areaForCol(c: number): AreaId {
  if (c <= 2) return 'meet';
  if (c <= 5) return 'grow';
  if (c <= 8) return 'expand';
  return 'mend';
}

const CATEGORY_CYCLE: EventCategory[] = [
  'encounter',
  'practice',
  'live',
  'promo',
  'relation',
  'trouble',
  'chance',
];

// 拠点（特別マス）: 座標(r,c) と種別・固定イベント
const LANDMARKS: { r: number; c: number; type: SquareType; title: string; category: EventCategory; eventId?: string }[] = [
  // 第1章 ガレージ（c 0-2）
  { r: 0, c: 0, type: 'start', title: 'ガレージ（拠点）', category: 'encounter' },
  { r: 3, c: 0, type: 'rest', title: '河川敷', category: 'relation' },
  { r: 6, c: 0, type: 'member', title: '練習スタジオ', category: 'practice' },
  // 第2章 ライブハウス街（c 3-5）
  { r: 0, c: 3, type: 'live', title: 'ライブハウス', category: 'live' },
  { r: 3, c: 3, type: 'random', title: '繁華街', category: 'chance' },
  { r: 6, c: 5, type: 'live', title: '対バン会場', category: 'live' },
  // 第3章 メディア街（c 6-8）
  { r: 0, c: 7, type: 'event', title: 'レコード店', category: 'promo' },
  { r: 3, c: 7, type: 'event', title: 'ラジオ局', category: 'promo' },
  { r: 6, c: 7, type: 'event', title: 'TV局', category: 'promo' },
  // 第4章 アリーナ（c 9-10）
  { r: 0, c: 10, type: 'live', title: 'アリーナ', category: 'live' },
  { r: 3, c: 10, type: 'live', title: 'フェス会場', category: 'live' },
  { r: 6, c: 10, type: 'member', title: 'メンバーの溜まり場', category: 'relation' },
];

function landmarkAt(r: number, c: number) {
  return LANDMARKS.find((l) => l.r === r && l.c === c);
}

function buildBoard(): Square[] {
  const mask = layoutMask();
  const id = (r: number, c: number) => `n_${r}_${c}`;
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (mask[r][c]) cells.push({ r, c });
    }
  }

  const squares: Square[] = cells.map(({ r, c }) => {
    const lm = landmarkAt(r, c);
    const cat = lm?.category ?? CATEGORY_CYCLE[(r * COLS + c) % CATEGORY_CYCLE.length];
    const type: SquareType = lm?.type ?? categoryToType(cat);
    return {
      id: id(r, c),
      type,
      title: lm?.title ?? '',
      eventId: lm?.eventId,
      category: cat,
      area: areaForCol(c),
      next: [],
      x: OX + c * GAP_X,
      y: OY + r * GAP_Y,
    };
  });

  const byId: Record<string, Square> = Object.fromEntries(squares.map((s) => [s.id, s]));

  // 4近傍で辺を張る（マスクが true 同士）
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!mask[r][c]) continue;
      const here = byId[id(r, c)];
      const neighbors: [number, number][] = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (!mask[nr][nc]) continue;
        here.next.push(id(nr, nc));
      }
    }
  }

  return squares;
}

function categoryToType(cat: EventCategory): SquareType {
  switch (cat) {
    case 'live':
      return 'live';
    case 'practice':
      return 'member';
    case 'encounter':
      return 'event';
    case 'promo':
      return 'event';
    case 'relation':
      return 'rest';
    case 'trouble':
      return 'random';
    case 'chance':
      return 'random';
    default:
      return 'event';
  }
}

export const BOARD: Square[] = buildBoard();

export const BOARD_BY_ID: Record<string, Square> = Object.fromEntries(
  BOARD.map((s) => [s.id, s]),
);

export const START_SQUARE_ID = 'n_0_0';

export const BOARD_VIEWBOX = {
  width: OX * 2 + (COLS - 1) * GAP_X,
  height: OY * 2 + (ROWS - 1) * GAP_Y,
};

// ===== 空き地（道に囲まれた空間）にモニュメントを置くための座標 =====

export type MonumentKind =
  | 'amp_stack' // 巨大アンプの壁
  | 'flying_v' // 突き立った Flying-V ギターのモニュメント
  | 'skull' // メタルなドクロ
  | 'pillar' // 炎のかがり火/スピーカー塔
  | 'drum' // 大ドラム
  | 'horns'; // メロイックサイン(🤘)の石像

export interface MonumentSpot {
  /** 2D盤面座標（worldPos と同じ系）。クラスタ中心。 */
  x: number;
  y: number;
  kind: MonumentKind;
  /** 見た目のばらつき用 */
  rot: number;
  /** ベース倍率（2×2クラスタを埋める大型サイズ） */
  scale: number;
}

/**
 * 道に囲まれた「2×2の空き地ブロック」を探し、その中央に大型モニュメントを1体置く。
 * マス1つと同サイズだと紛らわしいので、4マスぶんの空間を1体で占有する。
 */
function buildMonuments(): MonumentSpot[] {
  const mask = layoutMask();
  const spots: MonumentSpot[] = [];
  const kinds: MonumentKind[] = ['amp_stack', 'flying_v', 'skull', 'pillar', 'drum', 'horns'];
  const used: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  let k = 0;

  const isEmpty = (r: number, c: number) =>
    r >= 0 && r < ROWS && c >= 0 && c < COLS && !mask[r][c] && !used[r][c];

  // 2×2の空きブロックを優先配置（左上原点で走査、重複しないよう used を立てる）
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      if (isEmpty(r, c) && isEmpty(r, c + 1) && isEmpty(r + 1, c) && isEmpty(r + 1, c + 1)) {
        used[r][c] = used[r][c + 1] = used[r + 1][c] = used[r + 1][c + 1] = true;
        // 4セルの中央
        const cx = OX + (c + 0.5) * GAP_X;
        const cy = OY + (r + 0.5) * GAP_Y;
        const seed = (r * 7 + c * 13) % 100;
        spots.push({
          x: cx,
          y: cy,
          kind: kinds[k++ % kinds.length],
          rot: ((seed % 8) / 8) * Math.PI * 2,
          scale: 2.0 + (seed % 4) * 0.12, // 4マスを埋める大型
        });
      }
    }
  }

  return spots;
}

export const MONUMENTS: MonumentSpot[] = buildMonuments();
