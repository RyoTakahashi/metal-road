import type { Character, PhaseDef } from '../types';

/**
 * 登場人物（友好度を持つキャスト）。
 * バンドメンバー、プロデューサー、ライバル、メディア、ファン、サポート。
 * 友好度の閾値でイベントが分岐し、加入/脱退が変化する。
 */
export const CHARACTERS: Character[] = [
  // --- バンド（初期メンバー） ---
  { id: 'yu', name: 'ユウ', role: 'band', title: 'Vo & Gt（主人公）', bio: '武道館、いつかドームを夢見る不器用な熱血漢。', instrument: 'vocal', hair: '#d11a35', isMember: true },
  { id: 'take', name: 'タケ', role: 'band', title: 'Drums', bio: '幼馴染。口は悪いが面倒見がいい屋台骨。', instrument: 'drums', hair: '#2bb6a8', isMember: true },
  { id: 'ryo', name: 'リョウ', role: 'band', title: 'Bass', bio: '心配性だが堅実。バンドの良心。', instrument: 'bass', hair: '#e8b339', isMember: true },

  // --- バンド（加入候補） ---
  { id: 'shin', name: 'シン', role: 'band', title: 'Lead Gt', bio: '超絶技巧の一匹狼ギタリスト。プライドが高い。', instrument: 'guitar', hair: '#9b5cff', isMember: true },
  { id: 'mao', name: 'マオ', role: 'band', title: 'Keys', bio: '音大出身の才媛。サウンドの幅を広げる。', instrument: 'keys', hair: '#e8e6ea', isMember: true },

  // --- プロデューサー / 業界人 ---
  { id: 'kuro', name: '黒岩', role: 'producer', title: '敏腕プロデューサー', bio: '大手の実力者。売るためなら手段を選ばない。', hair: '#1a1a22' },
  { id: 'mari', name: '真理', role: 'producer', title: 'インディーズ主宰', bio: '小さなレーベルの主。アーティスト想いの姉御。', hair: '#c0506a' },

  // --- ライバル ---
  { id: 'rex', name: 'REX', role: 'rival', title: 'ライバルバンドのVo', bio: '同期の人気バンド。挑発的だが実力は本物。', hair: '#ff5a1a' },

  // --- メディア ---
  { id: 'jun', name: 'ジュン', role: 'media', title: '音楽ライター', bio: '辛口で知られる評論家。彼の一筆は影響大。', hair: '#5a78ff' },
  { id: 'dj', name: 'DJナイト', role: 'media', title: 'ラジオDJ', bio: '深夜ラジオの人気者。バンドを世に出す力を持つ。', hair: '#3ad0c0' },

  // --- ファン ---
  { id: 'aki', name: 'アキ', role: 'fan', title: '一番のファン', bio: '路上時代から追いかける古参。SNSの拡散力も。', hair: '#ff8fb0' },

  // --- サポート ---
  { id: 'gen', name: 'ゲンさん', role: 'support', title: 'ライブハウス店長', bio: '昔気質の名物店長。多くのバンドを育ててきた。', hair: '#8a7a5a' },
];

export const CHARACTERS_BY_ID: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
);

/** 初期からバンドに在籍しているメンバー id。 */
export const INITIAL_MEMBER_IDS = ['yu', 'take', 'ryo'];

/** 初期から「出会っている」キャラ id（バンド＋店長）。 */
export const INITIAL_MET_IDS = ['yu', 'take', 'ryo', 'gen'];

/**
 * フェーズ定義（10年＝120ターンを4期に）。
 * weights はそのフェーズで出やすいイベントカテゴリの相対重み。
 */
export const PHASES: PhaseDef[] = [
  {
    id: 'meet',
    name: '第1章 出会い（1年目）',
    startTurn: 1,
    hint: '仲間や人脈を広げる時期。出会いのマスが多い。',
    weights: { encounter: 5, practice: 2, live: 1, relation: 2, chance: 2, trouble: 1, promo: 0.5 },
  },
  {
    id: 'grow',
    name: '第2章 下積み（2〜4年目）',
    startTurn: 13,
    hint: '方向性とスキルを磨く時期。練習とライブが中心。',
    weights: { practice: 5, live: 4, encounter: 2, relation: 2, trouble: 2, chance: 2, promo: 1 },
  },
  {
    id: 'expand',
    name: '第3章 飛躍（5〜8年目）',
    startTurn: 49,
    hint: 'ファンを増やす時期。宣伝・メディア・大型ライブ。',
    weights: { promo: 5, live: 4, chance: 3, practice: 2, relation: 2, trouble: 2, encounter: 1 },
  },
  {
    id: 'mend',
    name: '第4章 円熟（9〜10年目）',
    startTurn: 97,
    hint: '人間関係を整える時期。絆を深め、集大成へ。',
    weights: { relation: 5, live: 3, promo: 2, trouble: 2, practice: 2, chance: 2, encounter: 1 },
  },
];

/** ターンから現在フェーズを返す。 */
export function phaseForTurn(turn: number): PhaseDef {
  let cur = PHASES[0];
  for (const p of PHASES) {
    if (turn >= p.startTurn) cur = p;
  }
  return cur;
}
