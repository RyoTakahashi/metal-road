import type { GameEvent } from '../types';

/**
 * 全イベント定義。Square.eventId から参照される。
 * choices が空のものは autoEffects を即時適用する自動進行イベント。
 */
export const EVENTS: Record<string, GameEvent> = {
  // ===== ライブ系 =====
  street_live: {
    id: 'street_live',
    title: '路上ライブ',
    text: '駅前にアンプを担いで繰り出した。足を止めてくれる人はまばらだが、ここがすべての始まりだ。どう攻める？',
    choices: [
      {
        label: '王道のメタルナンバーで攻める',
        resultText: '轟音に数人が振り返った。確かな手応え。',
        effects: { fans: 30, skill: 4, money: 1500, note: '投げ銭が集まった' },
      },
      {
        label: 'バラードで通行人の足を止める',
        resultText: '意外な一面が刺さり、じっくり聴く人が現れた。',
        effects: { fans: 50, skill: 2, morale: 5 },
      },
      {
        label: '過激なパフォーマンスで目立つ',
        resultText: '通報されかけたが、SNSで少し話題に。',
        effects: { fans: 80, morale: -5, money: -500 },
      },
    ],
  },
  first_livehouse: {
    id: 'first_livehouse',
    title: '初めてのライブハウス',
    text: 'ノルマ制の小箱。チケットを売り切れるか不安だが、初の「ステージ」だ。',
    choices: [
      {
        label: '練習を重ねて挑む',
        resultText: '堅実な演奏で常連客の心をつかんだ。',
        effects: { fans: 120, skill: 6, money: -1000 },
      },
      {
        label: '勢い任せで爆音ライブ',
        resultText: '荒削りだが熱量は伝わった。機材を少し壊した。',
        effects: { fans: 180, skill: -2, money: -2000, morale: 5 },
      },
    ],
  },
  hall_concert: {
    id: 'hall_concert',
    title: 'ワンマンライブ',
    text: '初めてのワンマン。客席のキャパは埋まるか――。',
    choices: [],
    autoEffects: { fans: 800, skill: 8, morale: 10, money: 3000, note: 'ワンマン成功！' },
  },
  festival: {
    id: 'festival',
    title: '野外フェス出演',
    text: '大型フェスのサブステージに抜擢された。大観衆の前で実力を示すときだ。',
    choices: [
      {
        label: '新曲を世に問う',
        resultText: '攻めた選曲が刺さり、フェスの台風の目に。',
        effects: { fans: 3000, skill: 10, morale: 8 },
      },
      {
        label: '鉄板の代表曲で固める',
        resultText: '安定の盛り上がり。手堅く新規ファンを獲得。',
        effects: { fans: 1500, skill: 5, money: 5000 },
      },
    ],
  },

  // ===== 選択肢イベント =====
  flame: {
    id: 'flame',
    title: '炎上',
    text: 'メンバーの過去の発言が掘り起こされ、ネットが炎上。認知度は上がったが対応を誤ると致命傷だ。どうする？',
    choices: [
      {
        label: '誠実に謝罪する',
        resultText: '火種は鎮火。一部のファンはむしろ見直した。',
        effects: { fans: -200, morale: -5, money: -1000 },
      },
      {
        label: '黙殺してライブに集中',
        resultText: '時間が解決した。ノーダメージとはいかないが。',
        effects: { fans: -500, skill: 5 },
      },
      {
        label: '開き直ってネタにする',
        resultText: '炎上を逆手に取った。知名度は跳ね上がったが、離れたファンも。',
        effects: { fans: -800, morale: 10, note: '一部で「ヤバいバンド」として話題に' },
      },
    ],
  },
  contract_trouble: {
    id: 'contract_trouble',
    title: '怪しい契約話',
    text: '「君たちを売り出す」と名乗る男が、うまい話を持ちかけてきた。',
    choices: [
      {
        label: '契約書をよく読んで断る',
        resultText: '冷静な判断。危ない橋を渡らずに済んだ。',
        effects: { skill: 2, morale: 3 },
      },
      {
        label: 'チャンスに飛びつく',
        resultText: '前金は入ったが、後でえげつない取り分が発覚…。',
        effects: { fans: 600, money: -4000, morale: -10 },
      },
    ],
  },
  tv_offer: {
    id: 'tv_offer',
    title: 'テレビ出演のオファー',
    text: '深夜の音楽番組から声がかかった。メタルバンドがお茶の間に映る数少ないチャンス。',
    choices: [
      {
        label: '尖ったまま出演する',
        resultText: '賛否を呼びつつ、コア層が熱狂。',
        effects: { fans: 1000, morale: 8 },
      },
      {
        label: '少しマイルドに合わせる',
        resultText: '幅広い層に届いたが、古参は少し冷めた。',
        effects: { fans: 1600, morale: -8, money: 2000 },
      },
    ],
  },

  // ===== メンバー系 =====
  join_guitarist: {
    id: 'join_guitarist',
    title: '新メンバー加入：リードギター',
    text: 'スタジオで超絶技巧のギタリストと出会った。「お前らの音、面白いな」と彼は笑った。',
    choices: [
      {
        label: '迎え入れる',
        resultText: 'バンドの音に厚みと速さが加わった。',
        effects: {
          skill: 12,
          morale: 5,
          addMember: { id: 'g1', name: 'シン', role: 'リードギター', skill: 18 },
        },
      },
      {
        label: '今のメンバーを大事にする',
        resultText: '結束を選んだ。今いる仲間との絆が深まる。',
        effects: { morale: 12 },
      },
    ],
  },
  member_conflict: {
    id: 'member_conflict',
    title: 'メンバー同士の衝突',
    text: '音楽性をめぐってドラムとベースが大喧嘩。スタジオの空気は最悪だ。',
    choices: [
      {
        label: 'じっくり話し合う',
        resultText: '本音をぶつけ合い、わだかまりが解けた。',
        effects: { morale: 15, money: -500 },
      },
      {
        label: 'ライブで結果を出して黙らせる',
        resultText: '成功で空気は変わったが、火種は残った。',
        effects: { fans: 300, morale: -5 },
      },
    ],
  },
  member_leave: {
    id: 'member_leave',
    title: 'メンバー脱退の危機',
    text: '「ついていけない」とメンバーの一人が脱退をほのめかしている。',
    choices: [
      {
        label: '誠心誠意引き止める',
        resultText: '思いが通じ、彼は残ることを決めた。',
        effects: { morale: 8, money: -1000 },
      },
      {
        label: '送り出す',
        resultText: '一人減った。穴は大きいが、残った者の覚悟は固まった。',
        effects: { skill: -8, morale: -10, removeMember: 'random' },
      },
    ],
  },

  // ===== ランダム系（自動進行） =====
  equipment_trouble: {
    id: 'equipment_trouble',
    title: '機材トラブル',
    text: 'ライブ本番、アンプから煙が。応急処置でなんとか乗り切ったが出費がかさんだ。',
    choices: [],
    autoEffects: { money: -2500, skill: 3, note: 'トラブル対応で度胸がついた' },
  },
  sns_buzz: {
    id: 'sns_buzz',
    title: 'SNSでバズる',
    text: 'ライブ動画の切り抜きが拡散され、一晩で再生数が爆発した！',
    choices: [],
    autoEffects: { fans: 3000, morale: 10, note: '#メタルロード がトレンド入り' },
  },
  part_time_job: {
    id: 'part_time_job',
    title: 'バイトで食いつなぐ',
    text: '音楽だけでは食えない。引っ越しのバイトで体はボロボロだが、活動資金は確保した。',
    choices: [],
    autoEffects: { money: 4000, skill: -3, morale: -5, note: '現実は厳しい' },
  },
  rest_studio: {
    id: 'rest_studio',
    title: 'スタジオ合宿',
    text: '泊まり込みで曲作りと練習に没頭した。',
    choices: [],
    autoEffects: { skill: 10, morale: 8, money: -2000, note: 'バンドの一体感が増した' },
  },
};
