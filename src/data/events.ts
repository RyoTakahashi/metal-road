import type { GameEvent } from '../types';

/**
 * 全イベント定義。Square.eventId から参照される。
 * choices が空のものは autoEffects を即時適用する自動進行イベント。
 * scene は演出シーン（アニメ付きイラスト）の種別。
 */
export const EVENTS: Record<string, GameEvent> = {
  // ===== 下積み =====
  street_live: {
    id: 'street_live',
    title: '路上ライブ',
    scene: 'street',
    text: '駅前にアンプを担いで繰り出した。足を止めてくれる人はまばらだが、ここがすべての始まりだ。どう攻める？',
    choices: [
      {
        label: '王道のメタルナンバーで攻める',
        resultText: '轟音に数人が振り返った。確かな手応え。',
        effects: { fans: 40, skill: 4, money: 1500, note: '投げ銭が集まった' },
      },
      {
        label: 'バラードで通行人の足を止める',
        resultText: '意外な一面が刺さり、じっくり聴く人が現れた。',
        effects: { fans: 60, skill: 2, morale: 5 },
      },
      {
        label: '過激なパフォーマンスで目立つ',
        resultText: '通報されかけたが、SNSで少し話題に。',
        effects: { fans: 100, morale: -5, money: -500 },
      },
    ],
  },
  part_time_job: {
    id: 'part_time_job',
    title: 'バイトで食いつなぐ',
    scene: 'trouble',
    text: '音楽だけでは食えない。引っ越しのバイトで体はボロボロだが、活動資金は確保した。',
    choices: [],
    autoEffects: { money: 5000, skill: -2, morale: -5, note: '現実は厳しい' },
  },
  demo_tape: {
    id: 'demo_tape',
    title: 'デモ音源づくり',
    scene: 'studio',
    text: '宅録でデモを制作。クオリティを取るか、勢いを取るか。',
    choices: [
      {
        label: 'こだわり抜いて作り込む',
        resultText: '満足のいく一本に。手応えのある仕上がり。',
        effects: { skill: 8, morale: 6, money: -1500 },
      },
      {
        label: '勢い重視でとにかく数を出す',
        resultText: '粗いが、数曲がローカルで話題になった。',
        effects: { fans: 120, skill: 2 },
      },
    ],
  },
  first_livehouse: {
    id: 'first_livehouse',
    title: '初めてのライブハウス',
    scene: 'livehouse',
    text: 'ノルマ制の小箱。チケットを売り切れるか不安だが、初の「ステージ」だ。',
    choices: [
      {
        label: '練習を重ねて挑む',
        resultText: '堅実な演奏で常連客の心をつかんだ。',
        effects: { fans: 200, skill: 6, money: -1000 },
      },
      {
        label: '勢い任せで爆音ライブ',
        resultText: '荒削りだが熱量は伝わった。機材を少し壊した。',
        effects: { fans: 280, skill: -2, money: -2000, morale: 5 },
      },
    ],
  },
  taiban: {
    id: 'taiban',
    title: '対バンライブ',
    scene: 'livehouse',
    text: '他のバンドと同じ舞台に。負けられない夜だ。',
    choices: [
      {
        label: '真っ向勝負で観客を奪う',
        resultText: '対バンの客まで持っていった。界隈で名が知られ始める。',
        effects: { fans: 350, skill: 5, morale: 8 },
      },
      {
        label: '対バン相手と仲良くなる',
        resultText: '横の繋がりができ、今後の対バンに繋がった。',
        effects: { fans: 150, morale: 12, money: 1000 },
      },
    ],
  },

  // ===== 分岐1: 実力派 =====
  rest_studio: {
    id: 'rest_studio',
    title: 'スタジオ合宿',
    scene: 'studio',
    text: '泊まり込みで曲作りと練習に没頭した。',
    choices: [],
    autoEffects: { skill: 12, morale: 8, money: -2500, note: 'バンドの一体感が増した' },
  },
  street_training: {
    id: 'street_training',
    title: '路上で腕を磨く',
    scene: 'street',
    text: '初心を忘れず、再び路上へ。技術と度胸を鍛え直す。',
    choices: [],
    autoEffects: { skill: 8, fans: 200, money: 1000, note: '基礎が固まった' },
  },
  hall_concert: {
    id: 'hall_concert',
    title: '初のワンマンライブ',
    scene: 'livehouse',
    text: '初めてのワンマン。客席のキャパは埋まるか――。',
    choices: [],
    autoEffects: { fans: 900, skill: 8, morale: 10, money: 4000, note: 'ワンマン成功！' },
  },

  // ===== 分岐1: バズ狙い =====
  sns_post: {
    id: 'sns_post',
    title: '渾身のSNS投稿',
    scene: 'sns',
    text: '演奏動画を投稿。バズるかは運次第だが、狙いにいく。',
    choices: [
      {
        label: '高クオリティのMVを投稿',
        resultText: '映像のかっこよさが評価され、じわじわ拡散。',
        effects: { fans: 500, money: -2000, skill: 3 },
      },
      {
        label: 'インパクト重視のネタ動画',
        resultText: '一部で大ウケ。良くも悪くも目立った。',
        effects: { fans: 800, morale: -4 },
      },
    ],
  },
  sns_buzz: {
    id: 'sns_buzz',
    title: 'SNSでバズる',
    scene: 'sns',
    text: 'ライブ動画の切り抜きが拡散され、一晩で再生数が爆発した！',
    choices: [],
    autoEffects: { fans: 3000, morale: 10, note: '#メタルロード がトレンド入り' },
  },
  flame: {
    id: 'flame',
    title: '炎上',
    scene: 'flame',
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

  // ===== メンバー編成期 =====
  join_guitarist: {
    id: 'join_guitarist',
    title: '新メンバー加入：リードギター',
    scene: 'member',
    text: 'スタジオで超絶技巧のギタリストと出会った。「お前らの音、面白いな」と彼は笑った。',
    choices: [
      {
        label: '迎え入れる',
        resultText: 'バンドの音に厚みと速さが加わった。',
        effects: {
          skill: 12,
          morale: 5,
          addMember: { id: 'g1', name: 'シン', role: 'Lead Gt', skill: 18 },
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
    scene: 'member',
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
        effects: { fans: 400, morale: -5 },
      },
    ],
  },
  equipment_trouble: {
    id: 'equipment_trouble',
    title: '機材トラブル',
    scene: 'trouble',
    text: 'ライブ本番、アンプから煙が。応急処置でなんとか乗り切ったが出費がかさんだ。',
    choices: [],
    autoEffects: { money: -3000, skill: 3, note: 'トラブル対応で度胸がついた' },
  },
  magazine: {
    id: 'magazine',
    title: '音楽雑誌の取材',
    scene: 'press',
    text: 'メタル専門誌が取材に。誌面でどう見せる？',
    choices: [
      {
        label: 'ストイックな音楽論を語る',
        resultText: 'コアな読者の心を掴んだ。玄人筋から高評価。',
        effects: { fans: 600, skill: 4, morale: 5 },
      },
      {
        label: 'キャラを立てて派手に見せる',
        resultText: '誌面で目立ち、ライト層にも届いた。',
        effects: { fans: 1000, morale: -3 },
      },
    ],
  },
  ep_release: {
    id: 'ep_release',
    title: '自主制作EPリリース',
    scene: 'studio',
    text: '初の音源を世に出す。手売りか、配信か。',
    choices: [
      {
        label: '会場で手売りする',
        resultText: 'ファンと直接繋がり、濃いコアファンが増えた。',
        effects: { fans: 700, money: 3000, morale: 6 },
      },
      {
        label: 'サブスク配信に賭ける',
        resultText: '広く届き、知らない土地にもリスナーが。',
        effects: { fans: 1200, money: -1000 },
      },
    ],
  },

  // ===== 分岐2: インディーズ =====
  tv_offer: {
    id: 'tv_offer',
    title: 'テレビ出演のオファー',
    scene: 'tv',
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
  national_dist: {
    id: 'national_dist',
    title: '全国流通リリース',
    scene: 'press',
    text: 'インディーズのまま全国流通へ。自由を貫く道。',
    choices: [],
    autoEffects: { fans: 1400, money: 4000, morale: 8, note: '自分たちの音を曲げずに広がった' },
  },

  // ===== 分岐2: メジャー =====
  contract_trouble: {
    id: 'contract_trouble',
    title: '怪しい契約話',
    scene: 'contract',
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
  major_tieup: {
    id: 'major_tieup',
    title: '大型タイアップ',
    scene: 'tv',
    text: 'メジャーの力でアニメ主題歌のタイアップが決定。一気に名が広がる。',
    choices: [
      {
        label: '全力でタイアップに応える',
        resultText: '主題歌が大ヒット。一夜で知名度が跳ね上がった。',
        effects: { fans: 2500, money: 5000, morale: -5 },
      },
      {
        label: 'バンドらしさを守って制作',
        resultText: '尖りすぎてやや不採用ぎみ。だが芯は通した。',
        effects: { fans: 1200, skill: 8, morale: 8 },
      },
    ],
  },
  tour_start: {
    id: 'tour_start',
    title: '全国ツアー開始',
    scene: 'tour',
    text: 'ついに全国ツアーへ。各地のファンが待っている。',
    choices: [],
    autoEffects: { fans: 1800, skill: 10, money: 6000, morale: 5, note: '全国にファンの輪が広がった' },
  },

  // ===== 全国期 =====
  fanmeeting: {
    id: 'fanmeeting',
    title: 'ファンミーティング',
    scene: 'fans',
    text: 'コアファンとの交流会。サービスか、ストイックさか。',
    choices: [
      {
        label: '全力でファンに尽くす',
        resultText: 'ファンの忠誠心が跳ね上がった。',
        effects: { fans: 1200, money: -1000, morale: 6 },
      },
      {
        label: '音楽の話だけ熱く語る',
        resultText: '濃いファンがさらに濃くなった。',
        effects: { fans: 600, skill: 6, morale: 4 },
      },
    ],
  },
  member_leave: {
    id: 'member_leave',
    title: 'メンバー脱退の危機',
    scene: 'member',
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
        effects: { skill: -8, morale: -12, removeMember: 'random' },
      },
    ],
  },
  join_keys: {
    id: 'join_keys',
    title: '新メンバー加入：キーボード',
    scene: 'member',
    text: 'サポートで呼んだキーボーディストの腕が抜群だった。',
    choices: [
      {
        label: '正式メンバーに誘う',
        resultText: 'サウンドの表現の幅が一気に広がった。',
        effects: {
          skill: 14,
          morale: 6,
          addMember: { id: 'k1', name: 'マオ', role: 'Keys', skill: 20 },
        },
      },
      {
        label: 'サポートのままにする',
        resultText: '身軽さを優先。今の編成で勝負する。',
        effects: { skill: 5, money: 1000 },
      },
    ],
  },
  festival: {
    id: 'festival',
    title: '大型野外フェス出演',
    scene: 'festival',
    text: '大型フェスのメインステージ手前まで来た。大観衆の前で実力を示すときだ。',
    choices: [
      {
        label: '新曲を世に問う',
        resultText: '攻めた選曲が刺さり、フェスの台風の目に。',
        effects: { fans: 3000, skill: 10, morale: 8 },
      },
      {
        label: '鉄板の代表曲で固める',
        resultText: '安定の盛り上がり。手堅く新規ファンを獲得。',
        effects: { fans: 2200, skill: 5, money: 5000 },
      },
    ],
  },

  // ===== 分岐3: 海外 =====
  overseas_tour: {
    id: 'overseas_tour',
    title: '海外ツアー',
    scene: 'overseas',
    text: '本場のメタルシーンへ殴り込み。言葉は通じなくても、音は通じる。',
    choices: [
      {
        label: 'ワールドツアーを敢行',
        resultText: '各国で熱狂。世界に名が轟いた。',
        effects: { fans: 3500, skill: 12, money: -5000, morale: 10 },
      },
      {
        label: '主要都市だけ厳選して回る',
        resultText: '手堅く海外実績を作った。',
        effects: { fans: 2000, money: 2000, skill: 6 },
      },
    ],
  },
  reverse_import: {
    id: 'reverse_import',
    title: '逆輸入で話題に',
    scene: 'press',
    text: '海外での評価が日本に逆輸入され、国内が再注目。',
    choices: [],
    autoEffects: { fans: 2500, morale: 8, note: '「世界が認めたバンド」として国内が沸いた' },
  },

  // ===== 分岐3: 国内大箱 =====
  arena_first: {
    id: 'arena_first',
    title: 'アリーナ初挑戦',
    scene: 'arena',
    text: '国内のアリーナクラスに初挑戦。埋められるか、勝負だ。',
    choices: [
      {
        label: '大規模演出で魅せる',
        resultText: '圧巻のステージにファンが熱狂。大箱を制した。',
        effects: { fans: 3000, money: -3000, skill: 8, morale: 8 },
      },
      {
        label: '音で勝負、演出は最小限',
        resultText: '硬派な姿勢が逆にハマった。',
        effects: { fans: 2200, skill: 12 },
      },
    ],
  },
  documentary: {
    id: 'documentary',
    title: '密着ドキュメンタリー',
    scene: 'tv',
    text: 'これまでの軌跡を追ったドキュメンタリーが放送される。',
    choices: [],
    autoEffects: { fans: 2200, morale: 12, money: 2000, note: '0からの物語に多くの人が心を打たれた' },
  },

  // ===== 直前 =====
  pre_final: {
    id: 'pre_final',
    title: '集大成ライブ前夜',
    scene: 'studio',
    text: '最大の舞台を前に、最後の調整。仲間と過ごす静かな夜。',
    choices: [],
    autoEffects: { skill: 8, morale: 15, note: '最高の状態でその日を迎える準備が整った' },
  },
  final_practice: {
    id: 'final_practice',
    title: '最後の追い込み',
    scene: 'studio',
    text: '本番直前。やれることはすべてやる。',
    choices: [
      {
        label: '徹底的に詰める',
        resultText: '演奏精度が極限まで高まった。',
        effects: { skill: 12, morale: -3 },
      },
      {
        label: '体調を整え英気を養う',
        resultText: '心身ともに万全。最高の笑顔で挑める。',
        effects: { morale: 15, fans: 300 },
      },
    ],
  },
};
