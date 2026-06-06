import type { GameEvent } from '../types';
import { CAST_EVENTS } from './eventsCast';

/**
 * 固定/汎用イベント定義。Square.eventId から参照される。
 * choices が空のものは autoEffects を即時適用する自動進行イベント。
 * scene は演出シーン（アニメ付きイラスト）の種別。
 */
const BASE_EVENTS: Record<string, GameEvent> = {
  // ===== 下積み =====
  street_live: {
    id: 'street_live',
    category: 'live',
    phases: ['meet', 'grow'],
    weight: 1.8,
    title: '路上ライブ',
    scene: 'street',
    text: '駅前にアンプを担いで繰り出した。足を止めてくれる人はまばらだが、ここがすべての始まりだ。どう攻める？',
    intro: [
      { text: '夜の駅前。重いアンプを担いで、ユウたちは初めて街に立った。', scene: 'street' },
      { text: '行き交う人々は誰も足を止めない。ベースのリョウが小声でぼやく。「…誰も見てねえぞ」', scene: 'street' },
      { text: 'ユウはピックを握りしめた。「だったら、振り向かせるしかねえだろ」 さあ、どう攻める？', scene: 'street' },
    ],
    choices: [
      {
        label: '王道のメタルナンバーで攻める',
        resultText: '轟音が夜気を裂いた。数人が驚いて振り返り、ギターケースに小銭が落ちる。確かな、確かな手応えだ。',
        resultScene: 'crowd',
        effects: { fans: 40, skill: 4, money: 1500, note: '投げ銭が集まった' },
      },
      {
        label: 'バラードで通行人の足を止める',
        resultText: '一転、静かな旋律。意外な一面に、二人、三人と立ち止まる。「メタルバンドが、こんな曲も…？」',
        resultScene: 'fans',
        effects: { fans: 60, skill: 2, morale: 5 },
      },
      {
        label: '過激なパフォーマンスで目立つ',
        resultText: 'アンプを限界まで上げ、絶叫。通報されかけたが、誰かのスマホがその一部始終を捉えていた。',
        resultScene: 'sns',
        effects: { fans: 100, morale: -5, money: -500 },
      },
    ],
  },
  part_time_job: {
    id: 'part_time_job',
    category: 'trouble',
    phases: ['meet', 'grow'],
    weight: 1.8,
    title: 'バイトで食いつなぐ',
    scene: 'trouble',
    text: '音楽だけでは食えない。引っ越しのバイトで体はボロボロだが、活動資金は確保した。',
    intro: [
      { text: '家賃の督促状が、また郵便受けに突き刺さっていた。', scene: 'trouble' },
      { text: '「音楽だけじゃ、食えねえよな…」 ユウは作業着に袖を通す。', scene: 'trouble' },
      { text: '炎天下の引っ越しバイト。重い冷蔵庫を運びながら、頭の中ではずっとリフが鳴っていた。', scene: 'trouble' },
    ],
    choices: [],
    autoEffects: { money: 5000, skill: -2, morale: -5, note: '現実は厳しい' },
    autoResultScene: 'fail',
  },
  demo_tape: {
    id: 'demo_tape',
    category: 'practice',
    phases: ['meet', 'grow'],
    weight: 1.8,
    title: 'デモ音源づくり',
    scene: 'studio',
    text: '宅録でデモを制作。クオリティを取るか、勢いを取るか。',
    intro: [
      { text: '六畳一間の部屋に、中古の機材が所狭しと並ぶ。今夜、初めての音源を刻む。', scene: 'studio' },
      { text: 'タケがヘッドホンを片耳に当てて唸る。「録り直すか? それとも一発の勢い、信じるか?」', scene: 'backstage' },
      { text: 'ユウはモニターを睨んだ。「この一本が、俺たちの名刺になる」 どう仕上げる?', scene: 'studio' },
    ],
    choices: [
      {
        label: 'こだわり抜いて作り込む',
        resultText: '夜が明けるまで何度も録り直した。再生ボタンを押すと、鳥肌が立つ。これだ、と三人が頷いた一本が鳴っていた。',
        resultScene: 'success',
        effects: { skill: 8, morale: 6, money: -1500 },
      },
      {
        label: '勢い重視でとにかく数を出す',
        resultText: '粗削りのまま量産した数曲を片っ端からばら撒く。そのうち一曲が、地元の音楽好きの間でじわりと回り始めた。',
        resultScene: 'sns',
        effects: { fans: 120, skill: 2 },
      },
    ],
  },
  first_livehouse: {
    id: 'first_livehouse',
    category: 'live',
    phases: ['meet', 'grow'],
    title: '初めてのライブハウス',
    scene: 'livehouse',
    text: 'ノルマ制の小箱。チケットを売り切れるか不安だが、初の「ステージ」だ。',
    intro: [
      { text: '地下のライブハウス。湿った熱気と、安酒と、汗の匂い。ここが「ステージ」というやつか。', scene: 'livehouse' },
      { text: 'ノルマの紙を握りしめたリョウが青ざめる。「客、半分も埋まってねえぞ…大丈夫か?」', scene: 'backstage' },
      { text: 'ユウはチューニングを終え、暗がりの客席を見据えた。「埋まってる席の数なんか関係ねえ。今いる奴を全員、信者にする」', scene: 'livehouse' },
    ],
    choices: [
      {
        label: '練習を重ねて挑む',
        resultText: '一音も外さない。研ぎ澄ました演奏に、腕を組んでいた常連たちが一人、また一人と前のめりになる。終演後、何人かが名前を聞いてきた。',
        resultScene: 'crowd',
        effects: { fans: 200, skill: 6, money: -1000 },
      },
      {
        label: '勢い任せで爆音ライブ',
        resultText: '理屈も技術もかなぐり捨て、ただ全力で叩きつけた。シンバルが一枚割れ、フロアは騒然。荒削りでも、熱だけは間違いなく届いた。',
        resultScene: 'crowd',
        effects: { fans: 280, skill: -2, money: -2000, morale: 5 },
      },
    ],
  },
  taiban: {
    id: 'taiban',
    category: 'live',
    phases: ['grow', 'expand'],
    title: '対バンライブ',
    scene: 'livehouse',
    text: '他のバンドと同じ舞台に。負けられない夜だ。',
    intro: [
      { text: '今夜は四バンドの対バン。楽屋には他バンドのメンバーがひしめき、火花が見えない火花を散らしている。', scene: 'backstage' },
      { text: '隣のバンドのギターが鋭いリフを鳴らして挑発してくる。タケが舌打ちした。「…生意気な顔しやがって」', scene: 'backstage' },
      { text: 'ユウは静かに笑った。「同じ舞台に立つんだ。客がどっちを覚えて帰るか、それだけの話だろ」 どう出る?', scene: 'livehouse' },
    ],
    choices: [
      {
        label: '真っ向勝負で観客を奪う',
        resultText: '他バンドの客まで根こそぎ持っていった。終演後、見知らぬ客が「お前らが一番ヤバかった」と肩を叩いていく。界隈に名が刻まれた。',
        resultScene: 'crowd',
        effects: { fans: 350, skill: 5, morale: 8 },
      },
      {
        label: '対バン相手と仲良くなる',
        resultText: '打ち上げで杯を交わすうち、ライバルは仲間になっていた。「次もまた組もうぜ」 横の繋がりが、これからの戦場を広げてくれる。',
        resultScene: 'member',
        effects: { fans: 150, morale: 12, money: 1000 },
      },
    ],
  },

  // ===== 分岐1: 実力派 =====
  rest_studio: {
    id: 'rest_studio',
    category: 'practice',
    title: 'スタジオ合宿',
    scene: 'studio',
    text: '泊まり込みで曲作りと練習に没頭した。',
    intro: [
      { text: '郊外の音楽スタジオを数日借り切った。寝袋とインスタント食品を持ち込んでの缶詰生活が始まる。', scene: 'studio' },
      { text: '深夜、ぶつかり合う意見。リョウが床に寝転んで天井を見上げる。「…なあ、俺たちって本当に変われるのかな」', scene: 'backstage' },
      { text: '朝陽が差す頃、新曲が一曲、形になっていた。三人は無言でハイタッチを交わした。言葉はいらなかった。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { skill: 12, morale: 8, money: -2500, note: 'バンドの一体感が増した' },
    autoResultScene: 'success',
  },
  street_training: {
    id: 'street_training',
    category: 'practice',
    phases: ['meet', 'grow'],
    title: '路上で腕を磨く',
    scene: 'street',
    text: '初心を忘れず、再び路上へ。技術と度胸を鍛え直す。',
    intro: [
      { text: '少しだけ名が知れてきた今、ユウはあえてアンプを担いで、あの駅前に戻ってきた。', scene: 'street' },
      { text: 'タケが怪訝な顔をする。「なんで今さら路上なんだよ」 ユウは弦を弾いた。「ここで足を止めさせられねえ奴に、アリーナなんか埋められるかよ」', scene: 'street' },
      { text: '冷たい風の中、何時間も弾き続けた。指は悴み、それでも足を止める人の数は、初めての夜よりずっと多かった。', scene: 'crowd' },
    ],
    choices: [],
    autoEffects: { skill: 8, fans: 200, money: 1000, note: '基礎が固まった' },
    autoResultScene: 'crowd',
  },
  hall_concert: {
    id: 'hall_concert',
    category: 'live',
    phases: ['grow', 'expand'],
    title: '初のワンマンライブ',
    scene: 'livehouse',
    text: '初めてのワンマン。客席のキャパは埋まるか――。',
    intro: [
      { text: 'ついに自分たちだけの名前で打つ、初のワンマン。フライヤーには三人の顔が刷られている。', scene: 'livehouse' },
      { text: '本番前、楽屋の壁の薄さ越しに客のざわめきが聞こえてくる。リョウの手が震えた。「…埋まってんのか、これ」', scene: 'backstage' },
      { text: '幕が開いた瞬間、視界いっぱいに広がる客、客、客。すべて、自分たちを観に来た人間だった。ユウは思わず叫んだ。', scene: 'crowd' },
      { text: 'アンコールの手拍子が鳴り止まない。汗だくの三人は、満員のフロアに深々と頭を下げた。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { fans: 900, skill: 8, morale: 10, money: 4000, note: 'ワンマン成功！' },
    autoResultScene: 'success',
  },

  // ===== 分岐1: バズ狙い =====
  sns_post: {
    id: 'sns_post',
    category: 'promo',
    title: '渾身のSNS投稿',
    scene: 'sns',
    text: '演奏動画を投稿。バズるかは運次第だが、狙いにいく。',
    intro: [
      { text: 'スマホの画面を三人で覗き込む。再生数という名の海に、これから一本の動画を投げ込む。', scene: 'sns' },
      { text: 'タケが腕を組む。「で、どっちで行く? 死ぬほどカッコつけるか、死ぬほどバカやるか」', scene: 'backstage' },
      { text: 'ユウは投稿ボタンに親指を乗せた。「バズるかどうかは運だ。けど、刺さるかどうかは中身次第だろ」 どっちに賭ける?', scene: 'sns' },
    ],
    choices: [
      {
        label: '高クオリティのMVを投稿',
        resultText: '金をかけた映像が静かに評価を集めていく。「このバンド、画がいい」 一晩で爆発はしないが、確かなリスナーがじわじわ根を張った。',
        resultScene: 'fans',
        effects: { fans: 500, money: -2000, skill: 3 },
      },
      {
        label: 'インパクト重視のネタ動画',
        resultText: '振り切ったバカ動画が一部で大ウケ。コメント欄は「何これ最高」と「ふざけんな」で真っ二つ。とにかく、目立った。',
        resultScene: 'sns',
        effects: { fans: 800, morale: -4 },
      },
    ],
  },
  sns_buzz: {
    id: 'sns_buzz',
    category: 'promo',
    title: 'SNSでバズる',
    scene: 'sns',
    text: 'ライブ動画の切り抜きが拡散され、一晩で再生数が爆発した！',
    intro: [
      { text: '誰かが撮ったライブの切り抜き。それが、深夜のうちに静かに転がり始めていた。', scene: 'sns' },
      { text: '朝、リョウの叫び声で全員が飛び起きた。「おい!! 再生数のケタ、おかしくねえか!?」', scene: 'backstage' },
      { text: 'タイムラインがバンドの名前で埋め尽くされていく。鳴り止まない通知。一夜にして、世界が変わった。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { fans: 3000, morale: 10, note: '#メタルロード がトレンド入り' },
    autoResultScene: 'success',
  },
  flame: {
    id: 'flame',
    category: 'trouble',
    title: '炎上',
    scene: 'flame',
    text: 'メンバーの過去の発言が掘り起こされ、ネットが炎上。認知度は上がったが対応を誤ると致命傷だ。どうする？',
    intro: [
      { text: '朝、スマホの通知が鳴り止まなかった。何年も前のリョウの軽口が、誰かに掘り起こされていた。', scene: 'flame' },
      { text: 'リプ欄は罵詈雑言で埋め尽くされている。リョウが頭を抱えた。「…俺のせいだ。どうすりゃいい」', scene: 'backstage' },
      { text: 'ユウは燃え盛るタイムラインを睨んだ。「ここで動き方を間違えたら、バンドごと焼け落ちる」 さあ、どう火を消す?', scene: 'flame' },
    ],
    choices: [
      {
        label: '誠実に謝罪する',
        resultText: '言葉を選び抜いた謝罪文を出した。炎は静かに鎮火し、「逃げなかった」と一部のファンはむしろ見直した。',
        resultScene: 'fans',
        effects: { fans: -200, morale: -5, money: -1000 },
      },
      {
        label: '黙殺してライブに集中',
        resultText: '一切反応せず、ただ楽器を握り続けた。時間が嵐を運び去る。無傷とはいかないが、音だけは確かに磨かれた。',
        resultScene: 'studio',
        effects: { fans: -500, skill: 5 },
      },
      {
        label: '開き直ってネタにする',
        resultText: 'ステージで「炎上中のバンドです」と自ら名乗り、フロアを爆笑させた。知名度は跳ね上がり、同時に静かに去る者もいた。',
        resultScene: 'sns',
        effects: { fans: -800, morale: 10, note: '一部で「ヤバいバンド」として話題に' },
      },
    ],
  },

  // ===== メンバー編成期 =====
  join_guitarist: {
    id: 'join_guitarist',
    category: 'encounter',
    phases: ['meet', 'grow'],
    title: '新メンバー加入：リードギター',
    scene: 'member',
    text: 'スタジオで超絶技巧のギタリストと出会った。「お前らの音、面白いな」と彼は笑った。',
    intro: [
      { text: '隣のスタジオから、信じられない速さのギターソロが漏れ聞こえてきた。三人は思わず壁に耳を当てる。', scene: 'studio' },
      { text: '現れたのは、ニヤリと笑う長髪の男――シン。「お前らの音、粗いけど面白いな。俺が混ざったらもっと化けるぜ」', scene: 'member' },
      { text: 'タケがユウに耳打ちする。「腕は本物だ。けど…今の三人の空気、壊れねえか?」 さあ、どうする?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '迎え入れる',
        resultText: 'シンのリードが加わった瞬間、音の壁が一段高くなった。厚みと速さ、そして毒。バンドは確かに、別の次元へ踏み出した。',
        resultScene: 'member',
        effects: {
          skill: 12,
          morale: 5,
          addMember: { id: 'g1', name: 'シン', role: 'Lead Gt', skill: 18 },
        },
      },
      {
        label: '今のメンバーを大事にする',
        resultText: 'ユウは静かに首を振った。「俺たちは三人で始めたバンドだ」 シンは肩をすくめて去り、残った三人の結束は前より固くなった。',
        resultScene: 'member',
        effects: { morale: 12 },
      },
    ],
  },
  member_conflict: {
    id: 'member_conflict',
    category: 'relation',
    title: 'メンバー同士の衝突',
    scene: 'member',
    text: '音楽性をめぐってドラムとベースが大喧嘩。スタジオの空気は最悪だ。',
    intro: [
      { text: '新曲の方向性をめぐって、タケとリョウの口論がついに爆発した。スティックが床に叩きつけられる。', scene: 'member' },
      { text: '「お前のドラムは独りよがりなんだよ!」「ベースが走るからだろうが!」 スタジオの空気は凍りついた。', scene: 'trouble' },
      { text: '間に立ったユウは天井を見上げた。「…バンドが割れるか、強くなるか。ここが分かれ目だな」 どう収める?', scene: 'backstage' },
    ],
    choices: [
      {
        label: 'じっくり話し合う',
        resultText: '深夜のファミレスで、缶詰になって本音をぶつけ合った。最後はバカみたいに笑い合い、わだかまりは溶けて消えた。',
        resultScene: 'member',
        effects: { morale: 15, money: -500 },
      },
      {
        label: 'ライブで結果を出して黙らせる',
        resultText: '「文句は結果出してから言え」 不穏なまま臨んだライブは大成功。空気は変わったが、消えきらない火種が胸の奥に残った。',
        resultScene: 'crowd',
        effects: { fans: 400, morale: -5 },
      },
    ],
  },
  equipment_trouble: {
    id: 'equipment_trouble',
    category: 'trouble',
    weight: 1.8,
    title: '機材トラブル',
    scene: 'trouble',
    text: 'ライブ本番、アンプから煙が。応急処置でなんとか乗り切ったが出費がかさんだ。',
    intro: [
      { text: 'ライブ本番、二曲目の途中。ユウのアンプから「バチッ」と火花が散り、白い煙が立ち上った。', scene: 'trouble' },
      { text: '客がざわつく。リョウが小声で叫ぶ。「やべえ、音が出てねえ! どうする!?」', scene: 'backstage' },
      { text: 'ユウは焦らなかった。ケーブルを引っこ抜き、予備に差し替えながら客を煽る。「機材が燃えるくらい、熱くなってきたか!?」 機転と度胸で、その場を繋ぎ切った。', scene: 'crowd' },
    ],
    choices: [],
    autoEffects: { money: -3000, skill: 3, note: 'トラブル対応で度胸がついた' },
    autoResultScene: 'crowd',
  },
  magazine: {
    id: 'magazine',
    category: 'promo',
    phases: ['grow', 'expand'],
    title: '音楽雑誌の取材',
    scene: 'press',
    text: 'メタル専門誌が取材に。誌面でどう見せる？',
    intro: [
      { text: '老舗のメタル専門誌から取材の依頼が届いた。あの誌面に、自分たちの顔が載る日が来るとは。', scene: 'press' },
      { text: 'ICレコーダーを構えた記者が問う。「で、あなたたちは何者なんです?」 タケが小声で囁く。「ここでの見せ方、デカいぞ」', scene: 'backstage' },
      { text: 'ユウは姿勢を正した。「俺たちをどう刻むか、ここで決まる」 どんな顔で誌面に立つ?', scene: 'press' },
    ],
    choices: [
      {
        label: 'ストイックな音楽論を語る',
        resultText: '機材も理論も妥協なく語り倒した。記事は熱量たっぷりの長文に。「これぞ本物」と玄人筋が唸り、コアな読者の心を掴んだ。',
        resultScene: 'fans',
        effects: { fans: 600, skill: 4, morale: 5 },
      },
      {
        label: 'キャラを立てて派手に見せる',
        resultText: '奇抜な衣装と挑発的な物言いで撮影に臨んだ。見開きで強烈に映え、メタルを知らないライト層の目にも留まった。',
        resultScene: 'press',
        effects: { fans: 1000, morale: -3 },
      },
    ],
  },
  ep_release: {
    id: 'ep_release',
    category: 'practice',
    phases: ['grow', 'expand'],
    title: '自主制作EPリリース',
    scene: 'studio',
    text: '初の音源を世に出す。手売りか、配信か。',
    intro: [
      { text: '刷り上がったばかりのEP。手作りのジャケットに、三人で一枚ずつシュリンクを巻いていく。', scene: 'studio' },
      { text: 'リョウが完成品を掲げる。「で、これどうやって届ける? 直接手売りか、世界中にバラ撒くか」', scene: 'backstage' },
      { text: 'ユウは一枚を握りしめた。「この音が、誰かの人生に刺さるかもしれねえ」 さあ、どう世に出す?', scene: 'studio' },
    ],
    choices: [
      {
        label: '会場で手売りする',
        resultText: 'ライブ後の物販に長い列ができた。一枚一枚、目を見て手渡す。「ずっと応援してます」 濃く、揺るがないコアファンが増えていく。',
        resultScene: 'fans',
        effects: { fans: 700, money: 3000, morale: 6 },
      },
      {
        label: 'サブスク配信に賭ける',
        resultText: '世界中の配信サービスに音源を放流した。ある日、会ったこともない遠い街の若者から「救われた」とメッセージが届いた。',
        resultScene: 'sns',
        effects: { fans: 1200, money: -1000 },
      },
    ],
  },

  // ===== 分岐2: インディーズ =====
  tv_offer: {
    id: 'tv_offer',
    category: 'promo',
    phases: ['grow', 'expand'],
    title: 'テレビ出演のオファー',
    scene: 'tv',
    text: '深夜の音楽番組から声がかかった。メタルバンドがお茶の間に映る数少ないチャンス。',
    intro: [
      { text: '一本の電話。深夜の音楽番組への出演オファーだった。テレビにメタルが映る、滅多にないチャンス。', scene: 'tv' },
      { text: 'スタッフが台本を差し出す。「尺は短いので、わかりやすく…」 リョウが眉をひそめた。「丸くしろってことかよ」', scene: 'backstage' },
      { text: 'ユウは台本を閉じた。「茶の間に媚びるか、俺たちのまま殴り込むか」 本番まであと十分。どう映る?', scene: 'tv' },
    ],
    choices: [
      {
        label: '尖ったまま出演する',
        resultText: '一切妥協せず、爆音と絶叫を全国に叩きつけた。SNSは「深夜に何見せられてんだ」と騒然。コア層は歓喜の雄叫びを上げた。',
        resultScene: 'crowd',
        effects: { fans: 1000, morale: 8 },
      },
      {
        label: '少しマイルドに合わせる',
        resultText: 'テンポを抑え、笑顔も添えた。お茶の間に好印象を残し、新たなファン層が一気に流れ込む。だが古参は少しだけ、寂しげだった。',
        resultScene: 'fans',
        effects: { fans: 1600, morale: -8, money: 2000 },
      },
    ],
  },
  national_dist: {
    id: 'national_dist',
    category: 'promo',
    phases: ['grow', 'expand'],
    title: '全国流通リリース',
    scene: 'press',
    text: 'インディーズのまま全国流通へ。自由を貫く道。',
    intro: [
      { text: 'メジャーの誘いを蹴って、インディーズのまま全国流通の道を選んだ。誰の指図も受けない、茨の道。', scene: 'press' },
      { text: 'タケが流通伝票の山を抱えて笑う。「自分たちで全部背負うんだろ? 上等じゃねえか」', scene: 'backstage' },
      { text: '全国のレコード店の棚に、自分たちのCDが並んだ。一切妥協しなかった音が、誰の手も借りず日本中へ広がっていく。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { fans: 1400, money: 4000, morale: 8, note: '自分たちの音を曲げずに広がった' },
    autoResultScene: 'success',
  },

  // ===== 分岐2: メジャー =====
  contract_trouble: {
    id: 'contract_trouble',
    category: 'trouble',
    title: '怪しい契約話',
    scene: 'contract',
    text: '「君たちを売り出す」と名乗る男が、うまい話を持ちかけてきた。',
    intro: [
      { text: 'ライブ後、高そうなスーツの男が名刺を差し出した。「君たちを、一気にスターダムへ押し上げてあげるよ」', scene: 'contract' },
      { text: '分厚い契約書。びっしり並ぶ細かい文字。リョウが囁く。「…なんか、うますぎねえか? この話」', scene: 'backstage' },
      { text: '男は満面の笑みでペンを差し出す。「迷う時間はもったいない。さあ、サインを」 ユウはペンを見つめた。どうする?', scene: 'contract' },
    ],
    choices: [
      {
        label: '契約書をよく読んで断る',
        resultText: '一行ずつ指でなぞり、印税の項で手が止まった。「…これ、俺たちほぼ取り分ねえぞ」 丁重に断る。危ない橋を渡らずに済んだ。',
        resultScene: 'backstage',
        effects: { skill: 2, morale: 3 },
      },
      {
        label: 'チャンスに飛びつく',
        resultText: '勢いに乗ってサインした。前金は確かに入った――が、数ヶ月後、利益の大半が男の懐に消える仕組みだと知る。手痛い授業料だった。',
        resultScene: 'trouble',
        effects: { fans: 600, money: -4000, morale: -10 },
      },
    ],
  },
  major_tieup: {
    id: 'major_tieup',
    category: 'promo',
    phases: ['expand', 'mend'],
    weight: 0.6,
    title: '大型タイアップ',
    scene: 'tv',
    text: 'メジャーの力でアニメ主題歌のタイアップが決定。一気に名が広がる。',
    intro: [
      { text: 'レーベルから朗報が届いた。話題の深夜アニメ、その主題歌に自分たちの楽曲が抜擢されたのだ。', scene: 'tv' },
      { text: 'プロデューサーが注文を並べる。「サビはキャッチーに、尺は90秒で」 タケが渋い顔をした。「…俺たちの音、削られねえか?」', scene: 'backstage' },
      { text: 'ユウはデモを聴き返した。「数百万人に届く曲だ。けど、俺たちらしさまで売り渡すのか?」 どう作る?', scene: 'studio' },
    ],
    choices: [
      {
        label: '全力でタイアップに応える',
        resultText: '要望を飲み込み、最強にキャッチーな一曲を仕上げた。主題歌は大ヒットし、街中で口ずさまれる。一夜で、知らぬ者のいないバンドになった。',
        resultScene: 'success',
        effects: { fans: 2500, money: 5000, morale: -5 },
      },
      {
        label: 'バンドらしさを守って制作',
        resultText: '譲れない一線は守り抜いた。尖りすぎて採用は微妙な空気――それでも、芯は一ミリも曲げなかった。音は確かに俺たちのものだ。',
        resultScene: 'studio',
        effects: { fans: 1200, skill: 8, morale: 8 },
      },
    ],
  },
  tour_start: {
    id: 'tour_start',
    category: 'live',
    phases: ['expand', 'mend'],
    title: '全国ツアー開始',
    scene: 'tour',
    text: 'ついに全国ツアーへ。各地のファンが待っている。',
    intro: [
      { text: '機材をぎゅう詰めにしたハイエースに乗り込み、ついに全国ツアーへ出発する。窓の外を高速の景色が流れていく。', scene: 'tour' },
      { text: '初日の地方都市。リョウが楽屋の窓から外を覗いて目を見開いた。「おい…こんな遠くにも、待ってる奴がいる」', scene: 'backstage' },
      { text: '北へ南へ。行く先々のステージで、見知らぬ街の客が拳を突き上げる。全国にファンの輪が、確かに広がっていった。', scene: 'crowd' },
    ],
    choices: [],
    autoEffects: { fans: 1800, skill: 10, money: 6000, morale: 5, note: '全国にファンの輪が広がった' },
    autoResultScene: 'crowd',
  },

  // ===== 全国期 =====
  fanmeeting: {
    id: 'fanmeeting',
    category: 'relation',
    phases: ['grow', 'expand'],
    title: 'ファンミーティング',
    scene: 'fans',
    text: 'コアファンとの交流会。サービスか、ストイックさか。',
    intro: [
      { text: '小さな会場に、いつも最前列にいる顔ぶれが集まった。バンドを支えてきた、いちばん濃いファンたちだ。', scene: 'fans' },
      { text: 'タケが楽屋で腕を組む。「で、今日はどう向き合う? 思いっきりサービスするか、音楽の話で熱く語り倒すか」', scene: 'backstage' },
      { text: 'ユウは会場のドアに手をかけた。「こいつらがいなきゃ、今の俺たちはねえ」 どう応える?', scene: 'fans' },
    ],
    choices: [
      {
        label: '全力でファンに尽くす',
        resultText: '一人ひとりとハイタッチし、写真に応じ、名前を覚えて呼びかけた。会場は涙と笑顔で溢れ、ファンの忠誠心は揺るぎないものになった。',
        resultScene: 'fans',
        effects: { fans: 1200, money: -1000, morale: 6 },
      },
      {
        label: '音楽の話だけ熱く語る',
        resultText: '機材の話、曲作りの裏側、メタル愛を何時間も語り尽くした。「ここまで本気だったのか」 濃いファンが、さらに底なしに濃くなった。',
        resultScene: 'fans',
        effects: { fans: 600, skill: 6, morale: 4 },
      },
    ],
  },
  member_leave: {
    id: 'member_leave',
    category: 'relation',
    phases: ['grow', 'expand', 'mend'],
    once: true,
    weight: 0.6,
    title: 'メンバー脱退の危機',
    scene: 'member',
    text: '「ついていけない」とメンバーの一人が脱退をほのめかしている。',
    intro: [
      { text: '練習後、一人が言いにくそうに切り出した。「…俺、もう、ついていけないかもしれない」 場が静まり返る。', scene: 'member' },
      { text: '加速していくバンドの速度に、心がすり減っていたのだ。リョウが俯く。「無理してたの、気づいてやれなくて…」', scene: 'trouble' },
      { text: 'ユウは仲間の目をまっすぐ見た。「ここで答えを間違えたら、一生後悔する」 引き止めるか、その背中を押すか?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '誠心誠意引き止める',
        resultText: '夜通し語り合った。お前がいなきゃ意味がない――その本気がついに伝わり、彼は「もう少しだけ、付き合うよ」と笑った。',
        resultScene: 'member',
        effects: { morale: 8, money: -1000 },
      },
      {
        label: '送り出す',
        resultText: '最後のライブで肩を組み、笑顔で送り出した。一人欠けた穴は痛いほど大きい。だが、残った者たちの覚悟は鋼のように固まった。',
        resultScene: 'fail',
        effects: { skill: -8, morale: -12, removeMember: 'random' },
      },
    ],
  },
  join_keys: {
    id: 'join_keys',
    category: 'encounter',
    phases: ['grow', 'expand'],
    title: '新メンバー加入：キーボード',
    scene: 'member',
    text: 'サポートで呼んだキーボーディストの腕が抜群だった。',
    intro: [
      { text: '新曲のレコーディングで、サポートにキーボーディストのマオを呼んだ。鍵盤に指が触れた瞬間、空気が変わった。', scene: 'studio' },
      { text: '荘厳なシンセが、メタルの轟音に交響曲のような奥行きを与える。タケが息を呑んだ。「…なんだこの音。世界が広がった」', scene: 'member' },
      { text: 'マオは控えめに笑う。「私でよければ…ずっと、この音に混ざりたい」 ユウは仲間と顔を見合わせた。どうする?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '正式メンバーに誘う',
        resultText: '「四人目、いや、五人目だ。一緒に来い」 マオの鍵盤が常に鳴るようになり、バンドの表現は別世界へと一気に広がった。',
        resultScene: 'member',
        effects: {
          skill: 14,
          morale: 6,
          addMember: { id: 'k1', name: 'マオ', role: 'Keys', skill: 20 },
        },
      },
      {
        label: 'サポートのままにする',
        resultText: '感謝を伝えつつ、コアの編成は変えなかった。身軽さこそ俺たちの武器――今のメンバーで、この戦場を駆け抜ける。',
        resultScene: 'studio',
        effects: { skill: 5, money: 1000 },
      },
    ],
  },
  festival: {
    id: 'festival',
    category: 'live',
    phases: ['expand', 'mend'],
    title: '大型野外フェス出演',
    scene: 'festival',
    text: '大型フェスのメインステージ手前まで来た。大観衆の前で実力を示すときだ。',
    intro: [
      { text: '夏の野外フェス。何万人もの観客が広大な芝生を埋め尽くす。ステージ袖から見える光景に、足が震えた。', scene: 'festival' },
      { text: 'タケがセットリストを握りしめる。「攻めるか、固めるか。この30分で、フェスの空気を持っていけるぞ」', scene: 'backstage' },
      { text: 'ユウはピックを掲げ、空を見上げた。「この大観衆を、俺たちの色に染めてやる」 さあ、何を鳴らす?', scene: 'festival' },
    ],
    choices: [
      {
        label: '新曲を世に問う',
        resultText: 'まだ誰も知らない新曲を、いきなり大舞台にぶつけた。攻めの一手が会場を貫き、その日のフェスの台風の目になった。',
        resultScene: 'crowd',
        effects: { fans: 3000, skill: 10, morale: 8 },
      },
      {
        label: '鉄板の代表曲で固める',
        resultText: 'イントロが鳴った瞬間、数万人が一斉に拳を突き上げた。鉄板の代表曲で会場をひとつにし、手堅く大量の新規ファンを掴んだ。',
        resultScene: 'crowd',
        effects: { fans: 2200, skill: 5, money: 5000 },
      },
    ],
  },

  // ===== 分岐3: 海外 =====
  overseas_tour: {
    id: 'overseas_tour',
    category: 'live',
    phases: ['expand', 'mend'],
    weight: 0.6,
    title: '海外ツアー',
    scene: 'overseas',
    text: '本場のメタルシーンへ殴り込み。言葉は通じなくても、音は通じる。',
    intro: [
      { text: 'パスポートを握りしめ、ついにメタルの本場・海外へ飛び立つ。空港の搭乗ゲートで、三人は無言で拳を合わせた。', scene: 'overseas' },
      { text: '言葉も文化も違う異国の地。リョウが不安げに呟く。「…俺たちの音、こいつらに通じるのかな」', scene: 'backstage' },
      { text: 'ユウはギターを背負い直した。「言葉は通じなくても、音は通じる。それを証明しに来たんだろ」 どう攻める?', scene: 'overseas' },
    ],
    choices: [
      {
        label: 'ワールドツアーを敢行',
        resultText: '何カ国も巡り、どの会場でも現地の客が母国語の歌詞を叫んでくれた。国境なんて関係ない。世界に、確かに名が轟いた。',
        resultScene: 'success',
        effects: { fans: 3500, skill: 12, money: -5000, morale: 10 },
      },
      {
        label: '主要都市だけ厳選して回る',
        resultText: '無理はせず、伝説のクラブだけを厳選して回った。本場の濃い客に確かな爪痕を残し、「海外実績」という勲章を手にした。',
        resultScene: 'overseas',
        effects: { fans: 2000, money: 2000, skill: 6 },
      },
    ],
  },
  reverse_import: {
    id: 'reverse_import',
    category: 'promo',
    phases: ['expand', 'mend'],
    weight: 0.6,
    title: '逆輸入で話題に',
    scene: 'press',
    text: '海外での評価が日本に逆輸入され、国内が再注目。',
    intro: [
      { text: '海外の名門メタルメディアが、こぞって自分たちを絶賛した。その記事が、海を越えて日本に逆輸入される。', scene: 'press' },
      { text: 'タケがネットニュースの見出しを読み上げる。「『世界が認めた日本のメタルバンド』…おい、俺たちのことだぞ!?」', scene: 'backstage' },
      { text: 'かつて見向きもしなかった国内メディアが、手のひらを返して殺到した。逆輸入の追い風が、日本中を沸かせた。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { fans: 2500, morale: 8, note: '「世界が認めたバンド」として国内が沸いた' },
    autoResultScene: 'success',
  },

  // ===== 分岐3: 国内大箱 =====
  arena_first: {
    id: 'arena_first',
    category: 'live',
    phases: ['expand', 'mend'],
    weight: 0.6,
    title: 'アリーナ初挑戦',
    scene: 'arena',
    text: '国内のアリーナクラスに初挑戦。埋められるか、勝負だ。',
    intro: [
      { text: '一万人を収容するアリーナ。がらんとした巨大な空間に立つと、自分たちの足音さえ反響した。', scene: 'arena' },
      { text: 'リョウが見上げる天井の高さに息を呑む。「…ここを、俺たちで埋めるのか。あの路上から、ここまで来たんだな」', scene: 'backstage' },
      { text: 'ユウは中央に立ち、空っぽの客席を見渡した。「数時間後、ここが拳で埋まる。最高の景色にしようぜ」 どう魅せる?', scene: 'arena' },
    ],
    choices: [
      {
        label: '大規模演出で魅せる',
        resultText: '炎、レーザー、巨大スクリーン。全てを注ぎ込んだ圧巻のステージに一万人が絶叫した。ついに、この国の大箱を制した。',
        resultScene: 'success',
        effects: { fans: 3000, money: -3000, skill: 8, morale: 8 },
      },
      {
        label: '音で勝負、演出は最小限',
        resultText: '飾りは一切なし。スポットライト一灯と、剥き出しの轟音だけで勝負した。その硬派さが、かえって観客の魂を撃ち抜いた。',
        resultScene: 'crowd',
        effects: { fans: 2200, skill: 12 },
      },
    ],
  },
  documentary: {
    id: 'documentary',
    category: 'promo',
    phases: ['expand', 'mend'],
    weight: 0.6,
    title: '密着ドキュメンタリー',
    scene: 'tv',
    text: 'これまでの軌跡を追ったドキュメンタリーが放送される。',
    intro: [
      { text: '長期密着のカメラが、これまでの軌跡を一本の番組にまとめ上げた。放送当日、三人はテレビの前に座る。', scene: 'tv' },
      { text: '画面に映る、あの寒い駅前の路上ライブ。ノルマに怯えた小箱の夜。リョウが洟をすすった。「…うわ、若えな、俺ら」', scene: 'backstage' },
      { text: 'ゼロから這い上がった物語が、お茶の間に流れていく。番組の最後、多くの視聴者がその姿に、静かに涙していた。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { fans: 2200, morale: 12, money: 2000, note: '0からの物語に多くの人が心を打たれた' },
    autoResultScene: 'success',
  },

  // ===== 直前 =====
  pre_final: {
    id: 'pre_final',
    category: 'practice',
    phases: ['expand', 'mend'],
    title: '集大成ライブ前夜',
    scene: 'studio',
    text: '最大の舞台を前に、最後の調整。仲間と過ごす静かな夜。',
    intro: [
      { text: '集大成のライブを翌日に控えた夜。最後のリハを終えたスタジオに、心地よい疲労感が漂っていた。', scene: 'studio' },
      { text: '誰からともなく、缶ビールを開けた。タケがぽつりと言う。「…路上で誰も振り向かなかった、あの夜を覚えてるか」', scene: 'backstage' },
      { text: '三人は静かに笑い合った。長く険しい道のりが、明日ひとつの頂に辿り着く。最高の状態で、その日を迎える準備が整った。', scene: 'success' },
    ],
    choices: [],
    autoEffects: { skill: 8, morale: 15, note: '最高の状態でその日を迎える準備が整った' },
    autoResultScene: 'success',
  },
  final_practice: {
    id: 'final_practice',
    category: 'practice',
    phases: ['expand', 'mend'],
    title: '最後の追い込み',
    scene: 'studio',
    text: '本番直前。やれることはすべてやる。',
    intro: [
      { text: '運命の本番まで、あとわずか。スタジオの時計の針が、いつもより速く進んでいくように感じる。', scene: 'studio' },
      { text: 'タケがスティックを回しながら問う。「最後の最後、どうする? 限界まで詰めるか、体を休めて本番に懸けるか」', scene: 'backstage' },
      { text: 'ユウは深く息を吸った。「悔いだけは残したくねえ」 やれることは、すべてやる。最後の選択だ。', scene: 'studio' },
    ],
    choices: [
      {
        label: '徹底的に詰める',
        resultText: '一音のズレも許さず、繰り返し叩き込んだ。指は限界、神経はピリピリ。それでも演奏精度は、人間離れした領域まで研ぎ澄まされた。',
        resultScene: 'success',
        effects: { skill: 12, morale: -3 },
      },
      {
        label: '体調を整え英気を養う',
        resultText: '楽器を置き、しっかり眠り、うまい飯を食った。心も体も満タン。鏡の前の三人は、不敵なほど晴れやかな笑顔をしていた。',
        resultScene: 'success',
        effects: { morale: 15, fans: 300 },
      },
    ],
  },
};

/** 固定/汎用イベント＋登場人物イベントを統合した全イベント。 */
export const EVENTS: Record<string, GameEvent> = { ...BASE_EVENTS, ...CAST_EVENTS };
