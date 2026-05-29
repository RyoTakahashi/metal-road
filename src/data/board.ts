import type { Square } from '../types';

/**
 * 盤面。`next` が複数あるマスが分岐点。
 * 横長レイアウト（spine y=320 / 上ルート y=150 / 下ルート y=490）。
 * カメラがコマを追従するため、横に長くてよい。
 *
 * 構成:
 *   結成 → 路上 → バイト → デモ → 初ライブハウス → 対バン
 *     → 〔分岐1: 実力派 / バズ〕→ 合流(ギター加入)
 *     → 衝突 → 機材 → 雑誌 → EP
 *     → 〔分岐2: インディーズ / メジャー〕→ 合流(全国ツアー)
 *     → ファンミ → 脱退危機 → キー加入 → フェス
 *     → 〔分岐3: 海外 / 国内大箱〕→ 合流(前夜)
 *     → 追い込み → GOAL(集大成ライブ＝会場ランク確定)
 */
const Y = { spine: 320, top: 150, bottom: 490 };

export const BOARD: Square[] = [
  { id: 's0', type: 'start', title: 'バンド結成', next: ['s1'], x: 80, y: Y.spine },
  { id: 's1', type: 'live', title: '路上ライブ', eventId: 'street_live', next: ['s2'], x: 230, y: Y.spine },
  { id: 's2', type: 'random', title: 'バイト生活', eventId: 'part_time_job', next: ['s3'], x: 380, y: Y.spine },
  { id: 's3', type: 'event', title: 'デモ制作', eventId: 'demo_tape', next: ['s4'], x: 530, y: Y.spine },
  { id: 's4', type: 'live', title: '初ライブハウス', eventId: 'first_livehouse', next: ['s5'], x: 680, y: Y.spine },
  { id: 's5', type: 'live', title: '対バンライブ', eventId: 'taiban', next: ['br1'], x: 830, y: Y.spine },

  {
    id: 'br1',
    type: 'branch',
    title: '進路の分かれ道',
    next: ['a1', 'b1'],
    branchLabels: ['実力派ルート（地道に磨く）', 'バズ狙いルート（一発逆転）'],
    x: 980,
    y: Y.spine,
  },
  { id: 'a1', type: 'rest', title: 'スタジオ合宿', eventId: 'rest_studio', next: ['a2'], x: 1130, y: Y.top },
  { id: 'a2', type: 'rest', title: '路上で腕磨き', eventId: 'street_training', next: ['a3'], x: 1280, y: Y.top },
  { id: 'a3', type: 'live', title: 'ワンマンライブ', eventId: 'hall_concert', next: ['m1'], x: 1430, y: Y.top },
  { id: 'b1', type: 'event', title: 'SNS投稿', eventId: 'sns_post', next: ['b2'], x: 1130, y: Y.bottom },
  { id: 'b2', type: 'random', title: 'SNSでバズる', eventId: 'sns_buzz', next: ['b3'], x: 1280, y: Y.bottom },
  { id: 'b3', type: 'event', title: '炎上', eventId: 'flame', next: ['m1'], x: 1430, y: Y.bottom },

  { id: 'm1', type: 'member', title: 'ギター加入', eventId: 'join_guitarist', next: ['s6'], x: 1580, y: Y.spine },
  { id: 's6', type: 'member', title: 'メンバー衝突', eventId: 'member_conflict', next: ['s7'], x: 1730, y: Y.spine },
  { id: 's7', type: 'random', title: '機材トラブル', eventId: 'equipment_trouble', next: ['s8'], x: 1880, y: Y.spine },
  { id: 's8', type: 'event', title: '雑誌取材', eventId: 'magazine', next: ['s9'], x: 2030, y: Y.spine },
  { id: 's9', type: 'event', title: '自主制作EP', eventId: 'ep_release', next: ['br2'], x: 2180, y: Y.spine },

  {
    id: 'br2',
    type: 'branch',
    title: 'メジャーの誘い',
    next: ['c1', 'd1'],
    branchLabels: ['インディーズ継続（自由を貫く）', 'メジャー契約（大舞台へ）'],
    x: 2330,
    y: Y.spine,
  },
  { id: 'c1', type: 'event', title: 'テレビ出演', eventId: 'tv_offer', next: ['c2'], x: 2480, y: Y.top },
  { id: 'c2', type: 'event', title: '全国流通', eventId: 'national_dist', next: ['m2'], x: 2630, y: Y.top },
  { id: 'd1', type: 'event', title: '怪しい契約', eventId: 'contract_trouble', next: ['d2'], x: 2480, y: Y.bottom },
  { id: 'd2', type: 'event', title: '大型タイアップ', eventId: 'major_tieup', next: ['m2'], x: 2630, y: Y.bottom },

  { id: 'm2', type: 'live', title: '全国ツアー', eventId: 'tour_start', next: ['s10'], x: 2780, y: Y.spine },
  { id: 's10', type: 'event', title: 'ファンミ', eventId: 'fanmeeting', next: ['s11'], x: 2930, y: Y.spine },
  { id: 's11', type: 'member', title: '脱退の危機', eventId: 'member_leave', next: ['s12'], x: 3080, y: Y.spine },
  { id: 's12', type: 'member', title: 'キー加入', eventId: 'join_keys', next: ['s13'], x: 3230, y: Y.spine },
  { id: 's13', type: 'live', title: '野外フェス', eventId: 'festival', next: ['br3'], x: 3380, y: Y.spine },

  {
    id: 'br3',
    type: 'branch',
    title: 'さらなる高みへ',
    next: ['e1', 'f1'],
    branchLabels: ['海外に挑む', '国内の大箱を制す'],
    x: 3530,
    y: Y.spine,
  },
  { id: 'e1', type: 'live', title: '海外ツアー', eventId: 'overseas_tour', next: ['e2'], x: 3680, y: Y.top },
  { id: 'e2', type: 'event', title: '逆輸入で話題', eventId: 'reverse_import', next: ['m3'], x: 3830, y: Y.top },
  { id: 'f1', type: 'live', title: 'アリーナ初挑戦', eventId: 'arena_first', next: ['f2'], x: 3680, y: Y.bottom },
  { id: 'f2', type: 'event', title: 'ドキュメンタリー', eventId: 'documentary', next: ['m3'], x: 3830, y: Y.bottom },

  { id: 'm3', type: 'rest', title: '集大成ライブ前夜', eventId: 'pre_final', next: ['s14'], x: 3980, y: Y.spine },
  { id: 's14', type: 'rest', title: '最後の追い込み', eventId: 'final_practice', next: ['goal'], x: 4130, y: Y.spine },
  { id: 'goal', type: 'goal', title: 'GOAL：集大成ライブ', next: [], x: 4280, y: Y.spine },
];

export const BOARD_BY_ID: Record<string, Square> = Object.fromEntries(
  BOARD.map((s) => [s.id, s]),
);

export const START_SQUARE_ID = 's0';
export const BOARD_VIEWBOX = { width: 4420, height: 640 };
