import type { Effect, GameState, LiveReview, Stats } from '../types';
import { calculateRank } from '../data/venues';

const LIVE_INTERVAL = 5; // 5ターンごと

/** このターン終了時に定期ライブを行うか。 */
export function isLiveTurn(turn: number): boolean {
  return turn > 0 && turn % LIVE_INTERVAL === 0;
}

function starsFrom(value: number, thresholds: [number, number, number, number]): number {
  if (value >= thresholds[3]) return 5;
  if (value >= thresholds[2]) return 4;
  if (value >= thresholds[1]) return 3;
  if (value >= thresholds[0]) return 2;
  return 1;
}

const STAR = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
void STAR;

/**
 * 現在のステータスから定期ライブの査定を作る（パワプロのスカウト査定風）。
 * - 演奏スキル → 演奏の完成度
 * - メンバー士気 → バンドの一体感／ステージング
 * - ファン数   → 動員・客席の熱
 * - スキル＋ファン → メディア注目度
 * 出来に応じてファン・資金・士気が増減する。
 */
export function evaluateLive(state: GameState, index: number): LiveReview {
  const s: Stats = state.stats;
  const venue = calculateRank(s).venue;

  const perf = starsFrom(s.skill, [20, 50, 90, 150]); // 演奏
  const unity = starsFrom(s.morale, [30, 55, 75, 95]); // 一体感
  const draw = starsFrom(s.fans, [500, 3000, 12000, 40000]); // 動員
  const media = starsFrom(Math.round(s.skill * 1.5 + s.fans / 400), [60, 130, 260, 500]); // 注目度

  const totalStars = perf + unity + draw + media; // 4..20
  const grade: LiveReview['grade'] =
    totalStars >= 18 ? 'S' : totalStars >= 14 ? 'A' : totalStars >= 10 ? 'B' : totalStars >= 6 ? 'C' : 'D';

  const marks: LiveReview['marks'] = [
    {
      label: '演奏の完成度',
      icon: '🎸',
      stars: perf,
      comment:
        perf >= 5 ? '全国レベル。一音の隙もない' : perf >= 4 ? 'プロの水準に達している' : perf >= 3 ? '安定してきた' : perf >= 2 ? '粗削りだが芯はある' : 'まだ荒い。基礎から鍛えたい',
    },
    {
      label: 'バンドの一体感',
      icon: '🤝',
      stars: unity,
      comment:
        unity >= 5 ? '阿吽の呼吸。鳥肌モノだ' : unity >= 4 ? '結束が音に出ている' : unity >= 3 ? 'まとまりが出てきた' : unity >= 2 ? 'ややバラつきあり' : '空気が硬い。関係を見直したい',
    },
    {
      label: '動員・客席の熱',
      icon: '🔥',
      stars: draw,
      comment:
        draw >= 5 ? '超満員。熱狂が渦を巻く' : draw >= 4 ? '大箱を沸かせている' : draw >= 3 ? '常連が増えてきた' : draw >= 2 ? 'コアな客が支える' : '客席はまばら…ここからだ',
    },
    {
      label: 'メディア注目度',
      icon: '📡',
      stars: media,
      comment:
        media >= 5 ? '各社が殺到。時代の中心だ' : media >= 4 ? '業界が放っておかない' : media >= 3 ? '一部メディアが嗅ぎつけた' : media >= 2 ? 'ネットでちらほら話題' : 'まだ無名。これからの原石',
    },
  ];

  const scoutComment =
    grade === 'S'
      ? '影野「…文句なしだ。このバンド、本物だよ。今すぐ大箱を押さえな」'
      : grade === 'A'
        ? '影野「いいね、抜けてきた。あとは爆発のきっかけ次第だ」'
        : grade === 'B'
          ? '影野「悪くない。武器をもう一つ、磨いてみな」'
          : grade === 'C'
            ? '影野「まだ粗いな。だが伸びしろは感じるぜ」'
            : '影野「うーん、今のままじゃ厳しい。基礎を固め直しだ」';

  // 報酬: 出来（星合計）に応じてファン増・収益・士気。動員が大きいほど稼ぐ。
  // ファン獲得: 出来（演奏・一体感・注目度）による新規獲得が主。
  // 口コミ分として現ファンの少量(1.5%)を加える程度に抑え、雪だるま暴走を防ぐ。
  const quality = (perf + unity + media) / 15; // 0..1
  const fanGain = Math.round((30 + (perf + unity + media) * 22) * (0.5 + quality) + s.fans * 0.008);
  const moneyGain = Math.round((draw * 450 + perf * 180) * (0.6 + media / 10));
  const moraleGain = grade === 'S' ? 8 : grade === 'A' ? 5 : grade === 'B' ? 2 : grade === 'C' ? 0 : -4;

  const scene: LiveReview['scene'] =
    draw >= 5 ? 'arena' : draw >= 4 ? 'festival' : draw >= 3 ? 'crowd' : 'livehouse';

  const effects: Effect = {
    fans: fanGain,
    money: moneyGain,
    morale: moraleGain,
    note: `第${index}回 定期ライブ ＠${venue.name}（評価${grade}）`,
  };

  return { index, grade, venueName: venue.name, marks, scoutComment, effects, scene };
}
