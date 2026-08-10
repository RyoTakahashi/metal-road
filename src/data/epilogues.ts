import type { GameState } from '../types';
import { CHARACTERS_BY_ID } from './characters';

export interface EpilogueLine {
  charId: string;
  name: string;
  /** 友好度帯 */
  tier: 'high' | 'mid' | 'low';
  text: string;
}

/** 友好度に応じた後日談テキスト（高/中/低）。 */
const EPILOGUE_TEXT: Record<string, { high: string; mid: string; low: string }> = {
  take: {
    high: '「オリンピックの夢? 今の夢はこのステージだよ」 あがり症を克服したタケは、最後まで最強のビートを刻んだ。“速く走るための練習”は、いつしか彼の人生そのものになっていた。',
    mid: 'あがり症と戦いながらも、タケは屋台骨であり続けた。元陸上部のフィジカルは伊達じゃない。',
    low: 'タケとは距離ができていた。あの日ユウがついた小さな嘘の行方を、彼は最後まで知らないままだった。',
  },
  ryo: {
    high: '「売れなくてもよかった。ただ、お前らと長くやりたかった。…その夢は、叶ったな」 ギターを諦めてまで守った居場所で、リョウは誰より満ち足りた顔をしていた。',
    mid: 'リョウは物静かに、しかし誰より熱く低音を支えた。彼のメタル愛は、最後まで本物だった。',
    low: 'リョウとはすれ違いが続いた。「このメンバーで長く」という彼の願いを、汲みきれなかった。',
  },
  shin: {
    high: 'かつて家族に反対された天才は、ついに理想の音を掴んだ。「メタルで、ここまで来られると証明できた」 孤高のギタリストは、初めて仲間の前で泣いた。',
    mid: 'シンの速弾きはバンドの刃になった。音楽家一家との確執は、まだ完全には消えていないが。',
    low: 'シンとは分かり合えなかった。理想を追う彼の孤独に、最後まで寄り添えなかった。',
  },
  mao: {
    high: 'マオの鍵盤がサウンドに翼を与えた。「あなたたちの音楽が好き」と、彼女は誇らしげだった。',
    mid: 'マオの音大仕込みのアレンジが、曲の幅を広げてくれた。',
    low: 'マオとは音楽性で噛み合わなかった。才媛の力を借りきれなかった。',
  },
  kuro: {
    high: '敏腕プロデューサー黒岩は、最強の後ろ盾になった。「お前を売るのは、俺の誇りだ」。',
    mid: '黒岩とはビジネスライクな関係を保った。彼は確かに、バンドを大きくした。',
    low: '黒岩とは袂を分かった。「売れ線」を拒んだ代償は、小さくなかった。',
  },
  mari: {
    high: '姉御・真理のレーベルは、いつでも帰れる実家のような場所になった。',
    mid: '真理はアーティストとしてのユウを尊重してくれた。良き理解者だった。',
    low: '真理の小さなレーベルを、いつしか踏み台にしてしまっていた。',
  },
  rex: {
    high: 'ライバルREXとは、いつしか盟友になっていた。「次はどっちが上か、勝負だ」。',
    mid: 'REXとは好敵手であり続けた。彼の存在が、ユウを高みへ押し上げた。',
    low: 'REXには、最後まで一矢報いることができなかった。',
  },
  jun: {
    high: '辛口のライター・ジュンが、ついに絶賛の一筆を書いた。「彼らは本物だ」と。',
    mid: 'ジュンの批評は厳しかったが、的確だった。彼の言葉でバンドは育った。',
    low: 'ジュンの辛口は、最後まで辛口のままだった。',
  },
  dj: {
    high: 'DJナイトは深夜の電波で何度もバンドを流し、世に送り出してくれた恩人だ。',
    mid: 'DJナイトのラジオは、地道にファンを増やしてくれた。',
    low: 'DJナイトとの縁は、深まらないまま終わった。',
  },
  aki: {
    high: '路上時代からの一番のファン、アキ。「ずっと信じてた」と泣きながら最前列で叫んでいた。',
    mid: 'アキは変わらず応援し続けてくれた。SNSでの拡散は、いつも力になった。',
    low: 'アキは、いつの間にか客席からいなくなっていた。',
  },
  gen: {
    high: '名物店長ゲンさんは、巣立っていくバンドを誇らしげに見送った。「よくここまで来たな」。',
    mid: 'ゲンさんのライブハウスは、いつでも原点を思い出させてくれた。',
    low: 'ゲンさんの店からは、足が遠のいてしまっていた。',
  },
};

/** ゲーム終了時、友好度に応じた人物エピローグを生成（最大5件）。 */
export function buildEpilogues(state: GameState): EpilogueLine[] {
  const lines: EpilogueLine[] = [];
  for (const [id, cs] of Object.entries(state.cast)) {
    if (id === 'yu') continue;
    if (!cs.met) continue;
    const text = EPILOGUE_TEXT[id];
    if (!text) continue;
    const ch = CHARACTERS_BY_ID[id];
    const tier: EpilogueLine['tier'] = cs.affinity >= 65 ? 'high' : cs.affinity >= 35 ? 'mid' : 'low';
    lines.push({ charId: id, name: ch?.name ?? id, tier, text: text[tier] });
  }
  // 在籍メンバー & 友好度の高い順に、上位を見せる
  lines.sort((a, b) => {
    const aw = (a.tier === 'high' ? 2 : a.tier === 'mid' ? 1 : 0);
    const bw = (b.tier === 'high' ? 2 : b.tier === 'mid' ? 1 : 0);
    return bw - aw;
  });
  return lines.slice(0, 6);
}
