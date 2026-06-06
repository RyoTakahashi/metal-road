import type { EventCategory, Square, SquareType } from '../types';

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
  { r: 0, c: 0, type: 'start', title: 'ガレージ（拠点）', category: 'encounter' },
  { r: 0, c: 5, type: 'live', title: 'ライブハウス', category: 'live' },
  { r: 0, c: 10, type: 'member', title: 'スタジオ', category: 'practice' },
  { r: 3, c: 0, type: 'event', title: 'レコード店', category: 'promo' },
  { r: 3, c: 3, type: 'random', title: '繁華街', category: 'chance' },
  { r: 3, c: 7, type: 'event', title: 'ラジオ局', category: 'promo' },
  { r: 3, c: 10, type: 'rest', title: '河川敷', category: 'relation' },
  { r: 6, c: 0, type: 'live', title: 'フェス会場', category: 'live' },
  { r: 6, c: 5, type: 'event', title: 'TV局', category: 'promo' },
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
