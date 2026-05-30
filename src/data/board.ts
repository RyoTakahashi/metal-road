import type { Square, SquareType } from '../types';

/**
 * 盤面。長距離（約150マス）＋分岐8か所をジェネレータで生成する。
 * X方向に単調増加（コマ追従カメラが常に +X 方向を向ける）。
 * 分岐区間は上下2レーン（y=top / y=bottom）が並走し、次の本線で合流する。
 */
const STEP = 150;
const X0 = 90;
const Y = { spine: 320, top: 150, bottom: 490 };

// カテゴリごとのイベントプール（盤面で循環利用する）
const POOLS: Record<Exclude<SquareType, 'start' | 'branch' | 'goal'>, string[]> = {
  live: ['street_live', 'first_livehouse', 'taiban', 'hall_concert', 'festival', 'tour_start', 'arena_first', 'overseas_tour'],
  event: ['demo_tape', 'magazine', 'ep_release', 'tv_offer', 'national_dist', 'major_tieup', 'fanmeeting', 'documentary', 'reverse_import', 'sns_post', 'final_practice'],
  member: ['join_guitarist', 'member_conflict', 'member_leave', 'join_keys'],
  random: ['part_time_job', 'equipment_trouble', 'sns_buzz'],
  rest: ['rest_studio', 'street_training', 'pre_final'],
};

const BRANCH_LABELS: [string, string][] = [
  ['実力派ルート（地道に磨く）', 'バズ狙いルート（一発逆転）'],
  ['インディーズ継続（自由を貫く）', 'メジャー契約（大舞台へ）'],
  ['海外進出に挑む', '国内シーンを固める'],
  ['正攻法で攻める', '飛び道具で勝負'],
  ['堅実に運営する', '一発勝負を賭ける'],
  ['アート志向を貫く', '商業的に攻める'],
  ['ソロ活動も視野に', 'バンド一筋でいく'],
  ['地方巡業を回る', '都市に集中する'],
];

// 本線・各レーンのカテゴリ並び（循環）
type Cat = keyof typeof POOLS;
const SPINE_PATTERN: Cat[] = ['live', 'event', 'random', 'member', 'event', 'rest', 'event', 'live', 'member', 'event', 'random', 'event'];
const UPPER_PATTERN: Cat[] = ['rest', 'event', 'live', 'event', 'rest']; // 実力・堅実寄り
const LOWER_PATTERN: Cat[] = ['random', 'event', 'live', 'member', 'event']; // ファン・リスク寄り

function generateBoard(): Square[] {
  const board: Square[] = [];
  const poolIdx: Record<Cat, number> = { live: 0, event: 0, member: 0, random: 0, rest: 0 };
  const pick = (cat: Cat) => {
    const arr = POOLS[cat];
    const id = arr[poolIdx[cat] % arr.length];
    poolIdx[cat]++;
    return id;
  };

  let id = 0;
  let col = 0;
  const at = () => X0 + col * STEP;
  const nid = () => `t${id++}`;

  // 直前に作った「本線」タイル（次の接続元）。分岐合流時に更新する。
  let prev: Square | null = null;
  const pushSpine = (cat: Cat): Square => {
    const sq: Square = { id: nid(), type: cat, title: '', eventId: pick(cat), next: [], x: at(), y: Y.spine };
    if (prev) prev.next = [sq.id];
    board.push(sq);
    prev = sq;
    col++;
    return sq;
  };

  // start
  const start: Square = { id: nid(), type: 'start', title: 'バンド結成', next: [], x: at(), y: Y.spine };
  board.push(start);
  prev = start;
  col++;

  let spineCursor = 0;
  const SECTIONS = 8;
  const SPINE_RUN = 12;
  const LANE_RUN = 5;

  for (let s = 0; s < SECTIONS; s++) {
    // 本線ラン
    for (let i = 0; i < SPINE_RUN; i++) {
      pushSpine(SPINE_PATTERN[spineCursor++ % SPINE_PATTERN.length]);
    }
    // 分岐点
    const branch: Square = {
      id: nid(),
      type: 'branch',
      title: '分かれ道',
      next: [],
      branchLabels: BRANCH_LABELS[s % BRANCH_LABELS.length],
      x: at(),
      y: Y.spine,
    };
    if (prev) prev.next = [branch.id];
    board.push(branch);
    col++;

    // 上下レーン（並走）
    const upper: Square[] = [];
    const lower: Square[] = [];
    for (let j = 0; j < LANE_RUN; j++) {
      const x = at();
      const u: Square = { id: nid(), type: UPPER_PATTERN[j % UPPER_PATTERN.length], title: '', eventId: pick(UPPER_PATTERN[j % UPPER_PATTERN.length]), next: [], x, y: Y.top };
      const l: Square = { id: nid(), type: LOWER_PATTERN[j % LOWER_PATTERN.length], title: '', eventId: pick(LOWER_PATTERN[j % LOWER_PATTERN.length]), next: [], x, y: Y.bottom };
      upper.push(u);
      lower.push(l);
      board.push(u, l);
      col++;
    }
    branch.next = [upper[0].id, lower[0].id];
    for (let j = 0; j < LANE_RUN - 1; j++) {
      upper[j].next = [upper[j + 1].id];
      lower[j].next = [lower[j + 1].id];
    }
    // 合流：両レーンの末尾は次に作る本線タイルへ繋ぐ
    prev = null; // 直後の pushSpine で合流タイルを作り、そこへ両レーンを接続する
    const mergeCat = SPINE_PATTERN[spineCursor++ % SPINE_PATTERN.length];
    const merge: Square = { id: nid(), type: mergeCat, title: '', eventId: pick(mergeCat), next: [], x: at(), y: Y.spine };
    upper[LANE_RUN - 1].next = [merge.id];
    lower[LANE_RUN - 1].next = [merge.id];
    board.push(merge);
    prev = merge;
    col++;
  }

  // 最終ラン
  for (let i = 0; i < 6; i++) {
    pushSpine(SPINE_PATTERN[spineCursor++ % SPINE_PATTERN.length]);
  }

  // goal
  const goal: Square = { id: nid(), type: 'goal', title: 'GOAL：集大成ライブ', next: [], x: at(), y: Y.spine };
  if (prev) prev.next = [goal.id];
  board.push(goal);
  col++;

  // タイトルを補完（イベント名から付ける）
  for (const sq of board) {
    if (!sq.title) sq.title = TITLES[sq.eventId ?? ''] ?? '';
  }

  return board;
}

// イベントIDごとのマス表示名（盤面ラベル用）
const TITLES: Record<string, string> = {
  street_live: '路上ライブ',
  first_livehouse: 'ライブハウス',
  taiban: '対バン',
  hall_concert: 'ワンマン',
  festival: '野外フェス',
  tour_start: '全国ツアー',
  arena_first: 'アリーナ',
  overseas_tour: '海外ツアー',
  demo_tape: 'デモ制作',
  magazine: '雑誌取材',
  ep_release: 'EPリリース',
  tv_offer: 'テレビ出演',
  national_dist: '全国流通',
  major_tieup: 'タイアップ',
  fanmeeting: 'ファンミ',
  documentary: '密着取材',
  reverse_import: '逆輸入',
  sns_post: 'SNS投稿',
  final_practice: '追い込み',
  join_guitarist: 'ギター加入',
  member_conflict: 'メンバー衝突',
  member_leave: '脱退の危機',
  join_keys: 'キー加入',
  part_time_job: 'バイト',
  equipment_trouble: '機材トラブル',
  sns_buzz: 'SNSでバズる',
  rest_studio: 'スタジオ合宿',
  street_training: '路上で修行',
  pre_final: '決戦前夜',
};

export const BOARD: Square[] = generateBoard();

export const BOARD_BY_ID: Record<string, Square> = Object.fromEntries(
  BOARD.map((s) => [s.id, s]),
);

export const START_SQUARE_ID = BOARD[0].id;
export const BOARD_VIEWBOX = {
  width: BOARD[BOARD.length - 1].x + 90,
  height: 640,
};
