import type { GameEvent } from '../types';

/**
 * メンバー個別のストーリーイベント（性格・背景に根ざした専用物語）。
 * events.ts / eventsCast.ts とは別管理。キーは yu_* / take_* / ryo_* / shin_* 接頭辞。
 * - 序盤(meet/grow): requireMet で「出会っていれば」出す導入イベント
 * - 中盤(grow/expand): requireAffinityMin で「仲を深めた人の物語」を出す
 * - 終盤(expand/mend): once + requireAffinityMin 高めの見せ場
 * shin は途中加入のため requireMet:{charId:'shin', met:true} を必須にする。
 */
export const MEMBER_EVENTS: Record<string, GameEvent> = {
  // ===================================================================
  // ユウ（Vo / 主人公）
  // ===================================================================
  yu_origin: {
    id: 'yu_origin',
    title: 'ユウの原体験',
    scene: 'backstage',
    category: 'relation',
    phases: ['meet', 'grow'],
    charId: 'yu',
    requireMet: { charId: 'yu', met: true },
    weight: 1.2,
    text: '打ち上げの帰り道、ユウがぽつりと「なんで俺がメタルやってるか、話したことなかったよな」と切り出した。',
    intro: [
      { text: '安酒でほろ酔いの夜道。ユウが珍しく静かな声で語り出した。「ガキの頃さ、親に連れられて場末のライブハウス行ったんだ」', scene: 'street' },
      { text: '「名もねえインディーズのメタルバンドでよ。爆音で、下手で、でも――全身が震えた。世界が、音でひっくり返ったんだ」 目が少年のように輝いている。', scene: 'livehouse' },
      { text: '「勉強もダメ、運動もダメ。でもあの日、俺は決めた。メタル以外に、俺の生きる道はねえって」 いつもの強気の裏に、譲れない核があった。', scene: 'backstage' },
    ],
    choices: [
      {
        label: 'その原体験を、俺たちの音で塗り替えようと誓う',
        resultText: '「今度は俺たちが、誰かのガキの世界をひっくり返す番だ」 ユウの言葉に全員が奮い立った。バンドの原点が、確かな軸になった。',
        resultScene: 'success',
        effects: { affinity: { yu: 16 }, morale: 10, skill: 4, note: 'ユウの原体験がバンドの軸になった' },
      },
      {
        label: '黙って隣を歩き、同じ夢を噛みしめる',
        resultText: '言葉はいらなかった。同じ景色を見て、同じ音に救われた仲間なのだと、肩を並べて歩くだけで伝わった。',
        resultScene: 'backstage',
        effects: { affinity: { yu: 12 }, morale: 8, fans: 150 },
      },
    ],
  },
  yu_throat_booze: {
    id: 'yu_throat_booze',
    title: 'ユウの喉と酒の板挟み',
    scene: 'backstage',
    category: 'trouble',
    phases: ['grow', 'expand'],
    charId: 'yu',
    requireAffinityMin: { charId: 'yu', min: 50 },
    weight: 1.1,
    text: '大事なライブ前夜。喉のケアが命のはずのユウが、行きつけの飲み屋で日本酒を睨んでいた。',
    intro: [
      { text: '本番前夜。内臓に響くデスボイスは、繊細な喉あってのもの。ユウ自身が一番それを分かっている。', scene: 'backstage' },
      { text: 'なのに手元には湯呑み酒。「一杯だけ…いや、この一杯が明日を殺すんだよな…」 大の酒好きと、Voの宿命がせめぎ合う。', scene: 'trouble' },
      { text: 'リョウが心配そうに覗き込む。「ユウ、明日は…」 ユウは湯呑みと、明日のステージを交互に見た。どう声をかける?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '「今夜は俺が付き合う。ソフトドリンクでな」と支える',
        resultText: 'ユウは渋々ウーロン茶を掲げた。「…お前がいると飲めねえじゃねえか」 翌日、絶好調の喉が会場を震わせた。',
        resultScene: 'success',
        effects: { affinity: { yu: 14 }, skill: 12, morale: 6, note: '喉のコンディションを守り抜いた' },
      },
      {
        label: '本人の意志を信じて任せる',
        resultText: 'ユウは湯呑みを置いた。「…プロ舐めんな。ここで飲むほど、俺はガキじゃねえ」 自制した誇りが、本番の気迫に変わった。',
        resultScene: 'backstage',
        effects: { affinity: { yu: 10 }, skill: 8, morale: 8 },
      },
      {
        label: '「一杯くらい」と一緒に飲んでしまう',
        resultText: '楽しい夜だった――が、翌日のユウの喉はガラガラ。デスボイスがかすれ、悔しさに拳を握った。「二度とやらねえ…」',
        resultScene: 'fail',
        effects: { affinity: { yu: 4 }, skill: -6, morale: -5, money: -2000 },
      },
    ],
  },
  yu_lonely: {
    id: 'yu_lonely',
    title: 'ユウの弱音',
    scene: 'backstage',
    category: 'relation',
    phases: ['grow', 'expand'],
    charId: 'yu',
    requireAffinityMin: { charId: 'yu', min: 48 },
    weight: 1.0,
    text: 'いつも一番騒がしいユウが、誰もいなくなった楽屋で、一人ぼんやり座り込んでいた。',
    intro: [
      { text: '打ち上げも終わった深夜の楽屋。フロントマンの仮面を外したユウが、小さく見えた。', scene: 'backstage' },
      { text: '「…なあ。俺、いつも吠えてるけどさ。ステージ降りると、急に静かになんの、怖ぇんだよ」 強気なリーダーが見せた、思いがけない脆さ。', scene: 'backstage' },
      { text: '「お前らがいなかったら、俺はただの、生き方の下手なうるさい奴だ」 寂しがり屋の本音が、ぽつりとこぼれた。', scene: 'member' },
    ],
    choices: [
      {
        label: '「俺たちがいる。ずっとだ」と肩を叩く',
        resultText: 'ユウは洟をすすって笑った。「…くせえこと言わせんな」 だがその目は、確かに救われていた。バンドの絆が一段深まった。',
        resultScene: 'success',
        effects: { affinity: { yu: 15 }, morale: 12, note: 'ユウの孤独に寄り添った' },
      },
      {
        label: '茶化して笑い飛ばし、いつもの空気に戻す',
        resultText: '「らしくねえぞ、湿っぽい!」 わざと明るく小突くと、ユウも吹き出した。言葉にしなくても、伝わる思いやりがあった。',
        resultScene: 'backstage',
        effects: { affinity: { yu: 9 }, morale: 7, skill: 3 },
      },
    ],
  },
  yu_solo_offer: {
    id: 'yu_solo_offer',
    title: 'ユウ、ソロの誘い',
    scene: 'contract',
    category: 'chance',
    phases: ['expand', 'mend'],
    charId: 'yu',
    once: true,
    requireAffinityMin: { charId: 'yu', min: 60 },
    text: 'メジャーの大物から、ユウ個人にソロ・デビューの誘いが来た。「そのデスボイスは、一人でも売れる。バンドを出て、頂点に来い」',
    intro: [
      { text: '豪華なホテルのラウンジ。業界の重鎮が、ユウ一人にだけ手を差し伸べた。「君のカリスマは規格外だ」', scene: 'contract' },
      { text: '「ソロなら、収入も知名度も桁が違う。バンドは足枷だ。…賢い選択をしろ」 甘い言葉が、耳に絡みつく。', scene: 'contract' },
      { text: 'その夜、ユウは全員を集めて話した。「こういう誘いが来た。…お前らに、隠したくなかった」 バンドの命運を分ける選択。', scene: 'member' },
    ],
    choices: [
      {
        label: 'バンドを選ぶ――「一人で立つ頂点に意味はねえ」',
        resultText: '「俺の声は、お前らの音があって初めて武器になる」 ユウはきっぱり誘いを断った。結束は最高潮に。この物語が伝わり、ファンは熱狂で応えた。',
        resultScene: 'success',
        effects: { affinity: { yu: 20 }, morale: 18, fans: 6000, skill: 12, note: 'ユウはバンドを選んだ' },
      },
      {
        label: 'ソロも視野に、正直に悩みを共有する',
        resultText: '「正直、揺れてる。デカい舞台は魅力だ」 ユウの本音に、楽屋の空気が張り詰めた。話し合いは平行線。一時、士気に影が差した。',
        resultScene: 'trouble',
        effects: { affinity: { yu: 6 }, morale: -10, fans: 3000, money: 5000 },
      },
    ],
  },

  // ===================================================================
  // タケ（Drums）
  // ===================================================================
  take_stage_fright: {
    id: 'take_stage_fright',
    title: 'タケ、本番前の吐き気',
    scene: 'backstage',
    category: 'relation',
    phases: ['meet', 'grow'],
    charId: 'take',
    requireMet: { charId: 'take', met: true },
    weight: 1.2,
    text: '出番直前、いつも元気なタケが、トイレの前で真っ青な顔でうずくまっていた。',
    intro: [
      { text: '開演五分前。フロアのざわめきが楽屋まで届く。そのとき、タケの姿が消えた。', scene: 'backstage' },
      { text: 'トイレの前で見つけたタケは、脂汗まみれ。「ごめん…俺、あがり症でさ…毎回吐きそうになんの…」 天真爛漫な笑顔の裏の、秘密だった。', scene: 'trouble' },
      { text: '「陸上の大会もそうだった。号砲の前、いつも吐いてた」 震える手で、彼はスティックを握りしめている。', scene: 'backstage' },
    ],
    choices: [
      {
        label: '「その震えは、本気の証拠だ」と背中を押す',
        resultText: '「…本気の、証拠」 タケは深呼吸して立ち上がった。ステージに出た瞬間、震えは爆発的なグルーヴに変わった。会場が揺れた。',
        resultScene: 'crowd',
        effects: { affinity: { take: 16 }, morale: 10, skill: 6, fans: 300, note: 'タケがあがり症を力に変えた' },
      },
      {
        label: '肩を組んで、二人でバカ話をして笑わせる',
        resultText: 'くだらない話で腹を抱えて笑ううち、タケの顔に赤みが戻った。「…お前といると、なんとかなる気がする」 笑顔でステージへ駆け出した。',
        resultScene: 'success',
        effects: { affinity: { take: 13 }, morale: 8, fans: 200 },
      },
    ],
  },
  take_friends: {
    id: 'take_friends',
    title: 'タケの顔の広さ',
    scene: 'street',
    category: 'promo',
    phases: ['grow', 'expand'],
    charId: 'take',
    requireAffinityMin: { charId: 'take', min: 45 },
    weight: 1.1,
    text: 'タケが「そういや友達のバンドが対バン探しててさ」と、当たり前のように大きな話を持ってきた。',
    intro: [
      { text: 'メタルには詳しくないタケだが、なぜかバンド仲間は誰より多い。「誰とでも仲良くなれる」が特技。', scene: 'street' },
      { text: '「地元で人気のバンドと、合同企画やらねえ?って誘われてさ。俺が『いいよ!』って言っといた」 相変わらずの人懐っこさ。', scene: 'livehouse' },
      { text: 'リョウが目を丸くする。「お前…その人脈、実はすごいぞ」 タケはきょとんとした。「そう? 友達だから頼んだだけだけど」', scene: 'backstage' },
    ],
    choices: [
      {
        label: 'タケの人脈を活かして合同企画を実現する',
        resultText: '複数バンドの合同ライブは大盛況。タケの顔の広さが、新しい客層をごっそり連れてきた。「な、持つべきものは友達だろ?」',
        resultScene: 'crowd',
        effects: { affinity: { take: 12 }, fans: 1400, morale: 6 },
      },
      {
        label: 'タケに任せて交渉の前面に立ってもらう',
        resultText: 'タケの天然の人たらしっぷりで、条件はどんどん好転。気づけば破格の好待遇に。本人は全く自覚がない。「え、俺なんかした?」',
        resultScene: 'success',
        effects: { affinity: { take: 10 }, fans: 900, money: 2500 },
      },
    ],
  },
  take_run_drums: {
    id: 'take_run_drums',
    title: 'タケと、あの嘘',
    scene: 'studio',
    category: 'practice',
    phases: ['grow', 'expand'],
    charId: 'take',
    requireAffinityMin: { charId: 'take', min: 50 },
    weight: 1.0,
    text: 'タケがドラムを叩きながら、真顔で言った。「なあユウ。ドラム続けてたら、俺やっぱ足速くなってる気がするんだよ」',
    intro: [
      { text: 'スタジオ。汗だくのタケが、キックを踏み込みながら真剣に語り出した。', scene: 'studio' },
      { text: '「昔お前が言ったろ。『速く走るには、ドラム練習するといい』って。俺、あれ信じて毎日叩いてんだ」 ――それは、幼い日のユウの、何気ない嘘だった。', scene: 'backstage' },
      { text: 'ユウの胸がちくりと痛む。だがその嘘のおかげで、タケはドラムを続け、今ここにいる。強靭なフィジカルは、誰にも負けない武器になっていた。', scene: 'studio' },
    ],
    choices: [
      {
        label: '嘘を明かさず、「もっと速くなるぞ」と笑う',
        resultText: '「おう、続けりゃ日本一速いドラマーだ」 タケは無邪気に目を輝かせ、さらに叩き込んだ。その底なしの体力が、鬼のようなグルーヴを生んだ。',
        resultScene: 'success',
        effects: { affinity: { take: 12 }, skill: 14, morale: 8, note: 'タケの原動力は今日も健在' },
      },
      {
        label: '「あれは嘘だった。でも…」と正直に打ち明ける',
        resultText: 'タケは目を丸くし――大笑いした。「マジかよ! でも、あの嘘がなきゃドラム始めてねえ。だから、ありがとうな」 笑って泣ける瞬間だった。',
        resultScene: 'backstage',
        effects: { affinity: { take: 16 }, skill: 8, morale: 10 },
      },
    ],
  },
  take_olympic: {
    id: 'take_olympic',
    title: 'タケ、二つの夢の間で',
    scene: 'member',
    category: 'relation',
    phases: ['expand', 'mend'],
    charId: 'take',
    once: true,
    requireAffinityMin: { charId: 'take', min: 60 },
    text: '元陸上部の恩師が訪ねてきた。「お前のフィジカルは本物だ。今からでも、オリンピックを狙える」――タケの顔が、揺れた。',
    intro: [
      { text: 'ライブ後の楽屋。かつての陸上部の監督が、タケの前に立っていた。「ずっと、お前の身体能力が忘れられなかった」', scene: 'backstage' },
      { text: '「メダル。お前ならガキの頃の夢に、まだ手が届く」 タケが子どもの頃から抱いてきた、オリンピックの夢。それが今、目の前にある。', scene: 'member' },
      { text: 'タケは俯いた。「…ドラムも、この仲間も、大好きなんだ。でも、走るのも…」 天真爛漫な男が、初めて本気で迷っていた。', scene: 'trouble' },
    ],
    choices: [
      {
        label: '「お前の夢を、俺たちが応援する」と選択を委ねる',
        resultText: 'タケは長い沈黙のあと、顔を上げた。「…俺の走る場所は、このステージだ。この鼓動で、世界を走らせる」 迷いを断ち切った一撃が、伝説のライブを生んだ。',
        resultScene: 'success',
        effects: { affinity: { take: 20 }, morale: 18, skill: 20, fans: 5500, note: 'タケはドラムに全てを賭けた' },
      },
      {
        label: '「二つとも、諦めなくていい」と背中を押す',
        resultText: '「バンドで鍛えた体で、走ってみせる。そんで、絶対戻ってくる」 タケは両方に全力で挑むと誓った。無茶だが、彼らしい答えだった。',
        resultScene: 'crowd',
        effects: { affinity: { take: 14 }, morale: 12, skill: 14, fans: 3500 },
      },
    ],
  },

  // ===================================================================
  // リョウ（Bass）
  // ===================================================================
  ryo_guitar_past: {
    id: 'ryo_guitar_past',
    title: 'リョウの告白',
    scene: 'backstage',
    category: 'relation',
    phases: ['meet', 'grow'],
    charId: 'ryo',
    requireMet: { charId: 'ryo', met: true },
    weight: 1.2,
    text: '機材の片付け中、リョウがベースを撫でながら「俺さ、本当はギターがやりたかったんだ」と、静かに打ち明けた。',
    intro: [
      { text: '誰もいなくなったスタジオ。物静かなリョウが、珍しく自分から口を開いた。', scene: 'backstage' },
      { text: '「軽音部でバンド組みたくてさ。でも、ベースがいなくて…頭数合わせで、俺が持ったんだ」 少し寂しげな、昔話。', scene: 'studio' },
      { text: '「けどな」 リョウは低音を一発、ずしんと鳴らした。「今は、この音がなきゃ生きていけない。ベースが、メタルが、大好きだ」 内気な男の、静かな熱。', scene: 'member' },
    ],
    choices: [
      {
        label: '「お前のベースが、バンドの背骨だ」と伝える',
        resultText: 'リョウは目を伏せ、少しだけ笑った。「…そう言ってもらえると、頭数合わせも悪くなかったって思えるよ」 縁の下の力持ちが、報われた夜。',
        resultScene: 'success',
        effects: { affinity: { ryo: 16 }, morale: 10, skill: 5, note: 'リョウのベース愛に触れた' },
      },
      {
        label: '「たまにはギターソロ、弾いてみろよ」と促す',
        resultText: '照れながらギターを手にしたリョウの演奏は、意外なほど泣けた。だが弾き終えると、すぐにベースを抱え直す。「…やっぱ、俺はこっちだ」',
        resultScene: 'backstage',
        effects: { affinity: { ryo: 12 }, skill: 8, morale: 6 },
      },
    ],
  },
  ryo_indie_maniac: {
    id: 'ryo_indie_maniac',
    title: 'リョウのマニア知識',
    scene: 'livehouse',
    category: 'chance',
    phases: ['grow', 'expand'],
    charId: 'ryo',
    requireAffinityMin: { charId: 'ryo', min: 45 },
    weight: 1.1,
    text: 'ブッキングが一つ飛んで途方に暮れる中、リョウが「あの…俺、あそこの店長さん知ってる」とぼそっと呟いた。',
    intro: [
      { text: '対バン相手が急遽キャンセル。空いた枠に頭を抱える一同。だが無類のメタルマニアのリョウは、地下シーンの隅々まで知り尽くしていた。', scene: 'trouble' },
      { text: '「あのライブハウス、伝説のインディーズバンドが昔よく出てて…今も熱いブッカーがいるんだ」 普段無口な男が、こと音楽の話になると饒舌になる。', scene: 'livehouse' },
      { text: '「連絡、してみようか」 リョウの深すぎる知識が、ピンチをチャンスに変えようとしていた。', scene: 'backstage' },
    ],
    choices: [
      {
        label: 'リョウの人脈と知識に賭ける',
        resultText: 'リョウが繋いだ伝説の小箱で、コアなメタルファンの前に立てた。「本物志向の客に刺さったな」と店長も太鼓判。濃いファンが一気に増えた。',
        resultScene: 'crowd',
        effects: { affinity: { ryo: 13 }, fans: 1500, skill: 6, note: 'リョウのマニア知識がピンチを救った' },
      },
      {
        label: '一緒にレアな共演バンドを掘り起こす',
        resultText: 'リョウの案内で、埋もれた実力派バンドと繋がった。渋いラインナップが評判を呼び、シーンでの信頼が高まった。',
        resultScene: 'success',
        effects: { affinity: { ryo: 11 }, fans: 1000, morale: 6, money: 1500 },
      },
    ],
  },
  ryo_lowend_pride: {
    id: 'ryo_lowend_pride',
    title: 'リョウ、低音を研ぐ',
    scene: 'studio',
    category: 'practice',
    phases: ['grow', 'expand'],
    charId: 'ryo',
    requireAffinityMin: { charId: 'ryo', min: 50 },
    weight: 1.0,
    text: 'リョウが一人スタジオに残り、たった一つの音を、何十回も鳴らし続けていた。',
    intro: [
      { text: '深夜のスタジオ。全員帰ったはずなのに、地を這う低音が響いていた。音の主は、リョウ。', scene: 'studio' },
      { text: '「ベースは目立たなくていい。でも、これがなきゃ全部が浮く」 一音の輪郭を、ミリ単位で削り出している。', scene: 'studio' },
      { text: '「派手じゃなくていいんだ。ユウの声も、タケのドラムも、俺が下から支える。それが、俺の誇りだ」 静かなマニアの、揺るぎない矜持。', scene: 'backstage' },
    ],
    choices: [],
    autoEffects: { affinity: { ryo: 12 }, skill: 12, morale: 6, note: 'リョウの低音がバンドの土台を固めた' },
    autoResultScene: 'success',
  },
  ryo_forever: {
    id: 'ryo_forever',
    title: 'リョウの願い',
    scene: 'backstage',
    category: 'relation',
    phases: ['expand', 'mend'],
    charId: 'ryo',
    once: true,
    requireAffinityMin: { charId: 'ryo', min: 60 },
    text: 'バンドが大きくなり始めた頃。リョウが意を決したように、「一つだけ、言っておきたいことがある」と全員を呼び止めた。',
    intro: [
      { text: '成功が見え始めた夜。華やかな話が飛び交う中、リョウだけが静かだった。', scene: 'backstage' },
      { text: '「売れるのは、嬉しい。でも俺が本当に欲しいのは、それじゃないんだ」 いつも一歩引いている男が、まっすぐ全員を見た。', scene: 'member' },
      { text: '「売れても、売れなくても――このメンバーで、ずっと音を鳴らしていたい。それだけが、俺の願いだ」 バンドを誰より愛する男の、心の核が、あふれ出した。', scene: 'backstage' },
    ],
    choices: [
      {
        label: '「約束する。この四人で、どこまでも」と誓う',
        resultText: '全員が拳を重ねた。リョウの目に、初めて見る涙。「…なら、俺はどこまでも付いていく」 揺るぎない絆が、バンドに永遠の芯を与えた。',
        resultScene: 'success',
        effects: { affinity: { ryo: 20 }, morale: 18, fans: 4000, skill: 8, note: 'リョウの願いがバンドの絆を不動にした' },
      },
      {
        label: '「その気持ちが、バンドの一番の宝だ」と抱きしめる',
        resultText: '言葉より先に、全員がリョウを囲んだ。派手さはないが、この温かさこそが本物だと、皆が知っていた。何があっても壊れない結束が生まれた。',
        resultScene: 'crowd',
        effects: { affinity: { ryo: 16 }, morale: 15, fans: 2500 },
      },
    ],
  },

  // ===================================================================
  // シン（Lead Gt / 途中加入の天才）※ 全て requireMet:{shin, true} 必須
  // ===================================================================
  shin_shy: {
    id: 'shin_shy',
    title: 'シンの不器用な距離',
    scene: 'backstage',
    category: 'relation',
    phases: ['grow', 'expand'],
    charId: 'shin',
    requireMet: { charId: 'shin', met: true },
    weight: 1.1,
    text: '加入したてのシンが、打ち上げの輪から一人だけ離れ、店の隅で黙々とグラスを傾けていた。',
    intro: [
      { text: '賑やかな打ち上げ。だが孤高の天才シンは、輪に入れず壁際にいた。「…群れるのは、性に合わねえ」', scene: 'backstage' },
      { text: 'ぶっきらぼうな態度。だがユウは気づいていた。皮肉屋の仮面の下は、ただの不器用な人見知りだと。', scene: 'member' },
      { text: 'ちらり、とシンがこちらを見た。本当は、混ざりたいのかもしれない。どう距離を詰める?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '無理に誘わず、隣に座って同じ酒を頼む',
        resultText: '何も言わず隣で飲む。しばらくして、シンがぼそりと呟いた。「…お前、しつこくなくていいな」 それが、彼なりの「ありがとう」だった。',
        resultScene: 'success',
        effects: { affinity: { shin: 14 }, morale: 8, note: 'シンとの距離が縮まった' },
      },
      {
        label: 'ギターの話題を振って、輪に引き込む',
        resultText: '音楽の話になった途端、シンの口が滑らかに動き出した。気づけば全員が聴き入っている。「…悪くねえ夜だ」 居場所を、見つけた顔だった。',
        resultScene: 'backstage',
        effects: { affinity: { shin: 12 }, morale: 6, skill: 5 },
      },
    ],
  },
  shin_family: {
    id: 'shin_family',
    title: 'シンの家と、コンプレックス',
    scene: 'backstage',
    category: 'relation',
    phases: ['grow', 'expand'],
    charId: 'shin',
    requireMet: { charId: 'shin', met: true },
    requireAffinityMin: { charId: 'shin', min: 50 },
    weight: 1.0,
    text: 'シンが、実家から届いたという手紙を握りつぶしていた。「…メタルなんて、まだやってるのか、だとよ」',
    intro: [
      { text: '楽屋の隅。音楽家一家に生まれ、幼少から多くの楽器を操ってきた天才・シン。だがその家では、メタルは「音楽ではない」とされていた。', scene: 'backstage' },
      { text: '「クラシックなら褒められた。速弾きは、ただの見世物だと言われ続けた」 皮肉屋の口調が、珍しく震えている。深いコンプレックス。', scene: 'trouble' },
      { text: '「なあ、ユウ。俺の音は…本物か?」 孤高の天才が、初めて他人に弱さをさらけ出した。', scene: 'member' },
    ],
    choices: [
      {
        label: '「お前の速弾きは、誰にも真似できねえ芸術だ」と断言する',
        resultText: 'シンは長く目を閉じ、静かに頷いた。「…そうか。お前がそう言うなら、信じてやる」 呪縛が一つ、ほどけた。指が、これまでになく自由に踊った。',
        resultScene: 'success',
        effects: { affinity: { shin: 15 }, skill: 14, morale: 8, note: 'シンのコンプレックスに向き合った' },
      },
      {
        label: '「家族に、俺たちの音で認めさせよう」と誓う',
        resultText: '「いつか、あの家の前で爆音を鳴らしてやる」 ユウの言葉に、シンが不敵に笑った。「…上等だ。付き合ってやるよ」 反骨が、力に変わった。',
        resultScene: 'member',
        effects: { affinity: { shin: 12 }, skill: 10, morale: 6, fans: 800 },
      },
    ],
  },
  shin_tone_vs_commerce: {
    id: 'shin_tone_vs_commerce',
    title: 'シン、理想の音の代償',
    scene: 'studio',
    category: 'trouble',
    phases: ['expand', 'mend'],
    charId: 'shin',
    once: true,
    requireMet: { charId: 'shin', met: true },
    requireAffinityMin: { charId: 'shin', min: 60 },
    text: 'ヒットを狙うシンプルな新曲を前に、シンが頑として首を振った。「このソロは削れねえ。俺の理想の音は、ここにしかない」',
    intro: [
      { text: 'レコーディング当日。売れ線を狙うなら、シンの超絶ソロは「くどい」と切るのが定石だった。', scene: 'studio' },
      { text: '「有名になりてえだけなら、こんなソロいらねえ。分かってる」 シンの目は真剣だった。「でも、俺は理想の音のためにギターを握ってる。妥協した音に、価値はねえ」', scene: 'member' },
      { text: '商業性を取るか、天才の理想を貫くか。バンドの音楽性を決める、重い分岐点。ユウは、どちらを選ぶ?', scene: 'studio' },
    ],
    choices: [
      {
        label: 'シンの理想を貫く――「お前の音が、俺たちの武器だ」',
        resultText: '削らなかった超絶ソロは、賛否を巻き起こしながらも唯一無二の名曲になった。「これが、俺の音だ」 妥協なき一撃に、コアなファンが熱狂した。',
        resultScene: 'success',
        effects: { affinity: { shin: 20 }, skill: 25, morale: 14, fans: 5000, note: 'シンの理想の音を守り抜いた' },
      },
      {
        label: '売れる形を優先し、シンを説得する',
        resultText: '「…今回は、大衆に届けることを取る」 シンは黙ってソロを削った。曲は広くヒットしたが、彼の横顔には、拭えない苦さが残った。',
        resultScene: 'crowd',
        effects: { affinity: { shin: -8 }, skill: 8, fans: 4000, money: 4000, morale: -6 },
      },
    ],
  },
};
