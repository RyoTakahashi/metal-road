import type { Stats, Venue } from '../types';

/**
 * 会場ラダー（ファン数で到達できる上限キャパが決まる）。
 * minFans の降順に並べておく。
 */
export const VENUES: Venue[] = [
  { rank: 'SS', name: '東京ドーム', capacity: 50000, minFans: 130000 },
  { rank: 'S', name: '日本武道館', capacity: 14000, minFans: 95000 },
  { rank: 'A', name: '横浜アリーナ', capacity: 10000, minFans: 70000 },
  { rank: 'B', name: 'Zepp（ライブハウス大）', capacity: 3000, minFans: 40000 },
  { rank: 'C', name: '市民ホール', capacity: 1500, minFans: 15000 },
  { rank: 'D', name: 'ライブハウス（小箱）', capacity: 200, minFans: 3000 },
  { rank: 'E', name: '路上ライブ', capacity: 30, minFans: 0 },
];

/** ファン数から到達できる「上限」会場を求める。 */
function venueByFans(fans: number): Venue {
  for (const v of VENUES) {
    if (fans >= v.minFans) return v;
  }
  return VENUES[VENUES.length - 1];
}

/** 会場を1段階格下げする（ラダー上で1つ下へ）。 */
function downgrade(venue: Venue, steps: number): Venue {
  const idx = VENUES.findIndex((v) => v.rank === venue.rank);
  const next = Math.min(VENUES.length - 1, idx + steps);
  return VENUES[next];
}

export interface RankResult {
  venue: Venue;
  /** ファン数だけで見たときの上限会場 */
  potentialVenue: Venue;
  /** 演奏スキル×士気の品質係数(0〜1) */
  qualityFactor: number;
  /** 資金ゲートで格下げされたか */
  fundsGated: boolean;
  /** 説明文 */
  detail: string[];
}

/**
 * ゴール時のランク（＝立てる会場）を算出する。
 * - ファン数: 到達できる会場の上限を決める
 * - 演奏スキル × メンバー士気: 会場を成立させられるかの品質係数。低いと格下げ
 * - 資金: 大箱の確保ゲート。不足すると格下げ
 */
export function calculateRank(stats: Stats): RankResult {
  const detail: string[] = [];
  const potentialVenue = venueByFans(stats.fans);
  detail.push(`ファン数 ${stats.fans.toLocaleString()}人 → 上限「${potentialVenue.name}」`);

  // 品質係数: スキル（10年スケールで ~250 が満点目安）と士気（~120 で満点）を
  // それぞれ正規化して平均。低いと会場を成立させられず格下げ。
  const skillN = Math.min(1, stats.skill / 250);
  const moraleN = Math.min(1, stats.morale / 120);
  const qualityFactor = Math.max(0, Math.min(1, (skillN + moraleN) / 2));

  let venue = potentialVenue;
  let qualityDown = 0;
  if (qualityFactor < 0.35) qualityDown = 2;
  else if (qualityFactor < 0.6) qualityDown = 1;

  if (qualityDown > 0) {
    venue = downgrade(venue, qualityDown);
    detail.push(
      `演奏スキル${stats.skill}・士気${stats.morale}（品質${Math.round(
        qualityFactor * 100,
      )}%）が伴わず${qualityDown}段格下げ`,
    );
  } else {
    detail.push(
      `演奏スキル${stats.skill}・士気${stats.morale}（品質${Math.round(
        qualityFactor * 100,
      )}%）で会場を完全に掌握`,
    );
  }

  // 資金ゲート: 大箱(アリーナ以上)を押さえるには資金が要る
  let fundsGated = false;
  const idx = VENUES.findIndex((v) => v.rank === venue.rank);
  const isBigVenue = idx <= 2; // SS / S / A
  if (isBigVenue && stats.money < 20000) {
    venue = downgrade(venue, 1);
    fundsGated = true;
    detail.push(`資金不足（¥${stats.money.toLocaleString()}）で大箱を押さえられず1段格下げ`);
  }

  return { venue, potentialVenue, qualityFactor, fundsGated, detail };
}
