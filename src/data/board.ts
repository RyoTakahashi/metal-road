import type { Square } from '../types';

/**
 * 盤面。`next` が複数あるマスが分岐点。
 * 座標は SVG viewBox(0 0 1960 620) 上の配置。
 *
 * 構成:
 *   結成 → 路上 → バイト → 初ライブハウス
 *     → 〔分岐1: 実力派ルート / バズ狙いルート〕→ 合流(ギター加入)
 *     → 衝突 → 機材トラブル
 *     → 〔分岐2: インディーズ継続 / メジャー契約〕→ 合流(フェス)
 *     → ゴール(ワンマン＝到達会場でランク確定)
 */
export const BOARD: Square[] = [
  { id: 's0', type: 'start', title: 'バンド結成', next: ['s1'], x: 70, y: 310 },
  { id: 's1', type: 'live', title: '路上ライブ', eventId: 'street_live', next: ['s2'], x: 210, y: 310 },
  { id: 's2', type: 'random', title: 'バイト生活', eventId: 'part_time_job', next: ['s3'], x: 350, y: 310 },
  { id: 's3', type: 'live', title: '初ライブハウス', eventId: 'first_livehouse', next: ['br1'], x: 490, y: 310 },

  {
    id: 'br1',
    type: 'branch',
    title: '進路の分かれ道',
    next: ['a1', 'b1'],
    branchLabels: ['実力派ルート（地道に磨く）', 'バズ狙いルート（一発逆転）'],
    x: 630,
    y: 310,
  },

  // 実力派ルート（上）
  { id: 'a1', type: 'rest', title: 'スタジオ合宿', eventId: 'rest_studio', next: ['a2'], x: 770, y: 150 },
  { id: 'a2', type: 'live', title: 'ワンマンライブ', eventId: 'hall_concert', next: ['m1'], x: 910, y: 150 },

  // バズ狙いルート（下）
  { id: 'b1', type: 'random', title: 'SNSでバズる', eventId: 'sns_buzz', next: ['b2'], x: 770, y: 470 },
  { id: 'b2', type: 'event', title: '炎上', eventId: 'flame', next: ['m1'], x: 910, y: 470 },

  // 合流
  { id: 'm1', type: 'member', title: 'ギタリスト加入', eventId: 'join_guitarist', next: ['s5'], x: 1050, y: 310 },
  { id: 's5', type: 'member', title: 'メンバー衝突', eventId: 'member_conflict', next: ['s6'], x: 1190, y: 310 },
  { id: 's6', type: 'random', title: '機材トラブル', eventId: 'equipment_trouble', next: ['br2'], x: 1330, y: 310 },

  {
    id: 'br2',
    type: 'branch',
    title: 'メジャーの誘い',
    next: ['c1', 'd1'],
    branchLabels: ['インディーズ継続（自由を貫く）', 'メジャー契約（大きな舞台へ）'],
    x: 1470,
    y: 310,
  },

  // インディーズ継続（上）
  { id: 'c1', type: 'event', title: 'テレビ出演', eventId: 'tv_offer', next: ['m2'], x: 1610, y: 150 },

  // メジャー契約（下）
  { id: 'd1', type: 'event', title: '怪しい契約話', eventId: 'contract_trouble', next: ['m2'], x: 1610, y: 470 },

  // 合流 → ゴール
  { id: 'm2', type: 'live', title: '野外フェス', eventId: 'festival', next: ['goal'], x: 1750, y: 310 },
  { id: 'goal', type: 'goal', title: 'GOAL：集大成ライブ', next: [], x: 1890, y: 310 },
];

export const BOARD_BY_ID: Record<string, Square> = Object.fromEntries(
  BOARD.map((s) => [s.id, s]),
);

export const START_SQUARE_ID = 's0';
export const BOARD_VIEWBOX = { width: 1960, height: 620 };
