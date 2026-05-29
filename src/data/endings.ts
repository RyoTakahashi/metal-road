import type { Ending, EndingId } from '../types';

/** パラメータ枯渇・期限切れ時の特殊エンディング。 */
export const ENDINGS: Record<Exclude<EndingId, 'goal'>, Ending> = {
  fans: {
    id: 'fans',
    title: '誰も来ない解散ライブ',
    text: 'ステージのライトが照らすのは、空っぽの客席だけ。最後の一音が虚しく響き、バンドは静かに幕を下ろした。届かなかった音楽は、夜の街に溶けて消えた。',
    bad: true,
  },
  skill: {
    id: 'skill',
    title: 'イップス ―― 鳴らせなくなった音',
    text: 'ある日突然、指が動かなくなった。あれほど自由だった演奏が、もう自分のものではない。楽器を置いた手は、二度とピックを握ることはなかった。',
    bad: true,
  },
  morale: {
    id: 'morale',
    title: '音楽性の違い ―― 不仲解散',
    text: '「もう一緒にはやれない」。積もり積もった衝突が爆発し、メンバーは一人また一人とスタジオを去っていった。残ったのは、誰のものでもなくなった曲だけ。',
    bad: true,
  },
  money: {
    id: 'money',
    title: '夜逃げ ―― 高利貸しに追われて',
    text: '機材ローン、スタジオ代、そして手を出してはいけない金。膨らんだ借金は、もう音楽では返せない額になっていた。ある朝、彼は街から姿を消した。',
    bad: true,
  },
  timeup: {
    id: 'timeup',
    title: '実家へ ―― 家業を継ぐということ',
    text: '気づけば30歳。夢を追いかけるには、人生は少しだけ現実的すぎた。彼は楽器をしまい、実家の暖簾をくぐる。それでも時々、ふと口ずさむメロディがある。',
    bad: true,
  },
};

/** ゴール（成功）エンディング。会場名はランク算出後に差し込む。 */
export function goalEnding(venueName: string, rank: string): Ending {
  return {
    id: 'goal',
    title: `THE STAGE ―― ${venueName}`,
    text: `満員の${venueName}。地鳴りのような歓声の中、彼はステージに立っていた。0から始まったこの道のり。路上で誰にも振り向かれなかったあの日から、ここまで来た。最高のランク【${rank}】で、物語は次の幕へ。`,
    bad: false,
  };
}
