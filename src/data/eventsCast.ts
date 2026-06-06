import type { GameEvent } from '../types';

/** 登場人物との出会い・友好度イベント（自由移動マップ用の追加分）。 */
export const CAST_EVENTS: Record<string, GameEvent> = {
  // ===================================================================
  // シン（Lead Gt）出会い → 加入
  // ===================================================================
  meet_shin: {
    id: 'meet_shin',
    title: '路地裏の超絶ギター',
    scene: 'street',
    category: 'encounter',
    phases: ['meet', 'grow'],
    charId: 'shin',
    once: true,
    requireMet: { charId: 'shin', met: false },
    text: '路地裏から、聴いたこともない速弾きが漏れてくる。音の主は、壁にもたれた一匹狼のギタリストだった。',
    intro: [
      { text: '深夜の裏路地。冷たいネオンの下で、誰かが弾くギターの音が空気を切り裂いていた。', scene: 'street' },
      { text: '近づくと、長髪のギタリストが目も合わせずに超絶技巧のフレーズを刻んでいる。タケが息を呑む。「…なんだコイツ、化け物か?」', scene: 'street' },
      { text: '男は弾く手を止め、こちらを一瞥した。「下手な奴とは組まねえ主義でね」 シンと名乗るその男に、ユウは挑むように一歩踏み出した。', scene: 'member' },
    ],
    choices: [
      {
        label: '俺たちの音を聴かせて認めさせる',
        resultText: 'ユウは即興でリフを返した。シンの眉がわずかに動く。「…悪くねえ。覚えとくよ、その面構え」 連絡先を残し、男は夜に消えた。',
        resultScene: 'member',
        effects: { affinity: { shin: 35 }, skill: 5, morale: 4, note: 'シンと出会った' },
      },
      {
        label: 'まずは敬意を払って話しかける',
        resultText: '「あんたの音、本物だ」 素直な言葉にシンは鼻を鳴らしたが、その目は満更でもなかった。「お前ら、また会うかもな」',
        resultScene: 'member',
        effects: { affinity: { shin: 28 }, morale: 3, note: 'シンと出会った' },
      },
    ],
  },
  bond_shin_session: {
    id: 'bond_shin_session',
    title: 'シンとの深夜セッション',
    scene: 'studio',
    category: 'relation',
    phases: ['grow', 'expand'],
    charId: 'shin',
    requireMet: { charId: 'shin', met: true },
    weight: 1.2,
    text: 'シンがふらりとスタジオに現れた。「暇つぶしだ」と言いながら、その指は嬉しそうに動いている。',
    intro: [
      { text: 'リハーサル中のスタジオ。ノックもなしにシンが入ってきた。「通りかかっただけだ」', scene: 'studio' },
      { text: 'だが彼はアンプに繋ぐと、こちらのリフに勝手に絡んできた。火花の散るような掛け合いが始まる。', scene: 'studio' },
      { text: '気づけば朝。汗だくの四人。シンが珍しく口角を上げた。「…悪くない夜だったな」 さて、どう応える?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '本気でぶつかり、技を盗み合う',
        resultText: '互いの手癖を奪い合うような濃密な時間。シンの孤高の壁が、ほんの少し崩れた音がした。',
        resultScene: 'success',
        effects: { affinity: { shin: 14 }, skill: 10, morale: 4 },
      },
      {
        label: '酒を酌み交わして本音を聞く',
        resultText: '缶ビール片手に、シンが初めて昔話をした。「一人で弾くのは、もう飽きたのかもな」 距離が一気に縮まった。',
        resultScene: 'backstage',
        effects: { affinity: { shin: 12 }, morale: 6 },
      },
      {
        label: '張り合って技を見せつける',
        resultText: 'ユウも負けじと弾き倒したが、ヒートアップしすぎて険悪に。「…ガキだな、お前」 シンは肩をすくめて帰っていった。',
        resultScene: 'fail',
        effects: { affinity: { shin: -6 }, skill: 4 },
      },
    ],
  },
  recruit_shin: {
    id: 'recruit_shin',
    title: 'シン、覚悟を問う',
    scene: 'member',
    category: 'encounter',
    phases: ['grow', 'expand'],
    charId: 'shin',
    once: true,
    requireMet: { charId: 'shin', met: true },
    requireAffinityMin: { charId: 'shin', min: 55 },
    text: 'シンが真顔で切り出した。「俺をお前らのバンドに入れろ。ただし、半端な覚悟なら断る」',
    intro: [
      { text: 'ライブ後の楽屋。やり遂げた顔のユウたちの前に、シンが立っていた。', scene: 'backstage' },
      { text: '「ずっと見てた。お前らの音は荒いが、本物だ」 そう言ってギターを差し出す。「俺を、入れろ」', scene: 'member' },
      { text: 'タケとリョウが息を呑む。一匹狼が、初めて誰かと組もうとしている。ユウの答え一つで、未来が変わる。', scene: 'member' },
    ],
    choices: [
      {
        label: '迎え入れる――「お前の音が必要だ」',
        resultText: 'がっちりと握手を交わす。リードギター・シン、正式加入。音の厚みが別次元に跳ね上がり、バンドは新たなステージへ踏み出した。',
        resultScene: 'success',
        effects: { recruit: 'shin', affinity: { shin: 12 }, skill: 16, morale: 10, fans: 800, note: 'シンが加入！' },
      },
      {
        label: '今の四人を大事にしたい、と断る',
        resultText: '「…そうか」 シンは少し寂しげに笑い、ギターを背負い直した。「気が変わったら呼べ」 縁は切れなかった。',
        resultScene: 'member',
        effects: { affinity: { shin: -4 }, morale: 2 },
      },
    ],
  },

  // ===================================================================
  // マオ（Keys）出会い → 加入
  // ===================================================================
  meet_mao: {
    id: 'meet_mao',
    title: '音大の天才キーボード',
    scene: 'livehouse',
    category: 'encounter',
    phases: ['meet', 'grow'],
    charId: 'mao',
    once: true,
    requireMet: { charId: 'mao', met: false },
    text: 'クラシックの演奏会帰りらしい品のいい女性が、なぜか地下のライブハウスを覗き込んでいた。',
    intro: [
      { text: 'ライブハウスのドア。場違いなほど上品な女性が、興味津々で中を覗いている。', scene: 'livehouse' },
      { text: '「メタル…生で聴くの、初めて」 音大出身のマオは、好奇心に目を輝かせていた。', scene: 'street' },
      { text: '試しにと置いてあったキーボードに触れた瞬間、空気が変わった。圧倒的な才能。リョウが呟く。「この人、ヤバいぞ…」', scene: 'member' },
    ],
    choices: [
      {
        label: '一緒に一曲、合わせてみないかと誘う',
        resultText: 'マオの鍵盤がユウのリフに重なる。荒々しい音楽が、急に色彩を帯びた。「楽しい…!」 彼女は心から笑った。',
        resultScene: 'success',
        effects: { affinity: { mao: 38 }, skill: 6, morale: 5, note: 'マオと出会った' },
      },
      {
        label: 'メタルの世界を熱く語って聞かせる',
        resultText: 'ユウの暑苦しい音楽論に、マオはくすくす笑った。「あなたたち、面白いわね」 また来ると約束してくれた。',
        resultScene: 'member',
        effects: { affinity: { mao: 30 }, morale: 4, note: 'マオと出会った' },
      },
    ],
  },
  bond_mao_arrange: {
    id: 'bond_mao_arrange',
    title: 'マオの編曲アイデア',
    scene: 'studio',
    category: 'practice',
    phases: ['grow', 'expand'],
    charId: 'mao',
    requireMet: { charId: 'mao', met: true },
    weight: 1.2,
    text: 'マオが楽譜を抱えてやってきた。「ねえ、この曲、こんなアレンジはどう?」',
    intro: [
      { text: 'スタジオに、几帳面に書き込まれたスコアを手にしたマオが現れた。', scene: 'studio' },
      { text: '「ここにストリングスを足すと、サビがもっと泣くと思うの」 理論に裏打ちされた提案に、タケが唸る。', scene: 'studio' },
      { text: 'メタルの衝動と、クラシックの教養。二つがぶつかり、溶け合おうとしていた。どう取り入れる?', scene: 'studio' },
    ],
    choices: [
      {
        label: 'マオの編曲を全面的に信じて任せる',
        resultText: '完成した楽曲は、誰も聴いたことのない壮大なメタルだった。マオは誇らしげ。「私の音、活きてる」',
        resultScene: 'success',
        effects: { affinity: { mao: 14 }, skill: 12, fans: 600 },
      },
      {
        label: '泥臭さも残して二人で折衷案を練る',
        resultText: '夜通し議論し、衝動と理論の絶妙な落とし所を見つけた。互いを認め合う、最高の共同作業だった。',
        resultScene: 'studio',
        effects: { affinity: { mao: 11 }, skill: 8, morale: 5 },
      },
    ],
  },
  recruit_mao: {
    id: 'recruit_mao',
    title: 'マオの決断',
    scene: 'member',
    category: 'encounter',
    phases: ['grow', 'expand'],
    charId: 'mao',
    once: true,
    requireMet: { charId: 'mao', met: true },
    requireAffinityMin: { charId: 'mao', min: 55 },
    text: 'マオが意を決した顔で言った。「私、音大の道じゃなくて…あなたたちと音楽がしたい」',
    intro: [
      { text: '雨上がりの河川敷。マオが珍しく硬い表情でユウを呼び出した。', scene: 'street' },
      { text: '「親には反対されてる。安定したレールも捨てることになる。でも――」 彼女はまっすぐ顔を上げた。', scene: 'member' },
      { text: '「この胸の高鳴りは、あなたたちのバンドでしか得られないの。入れてくれる?」', scene: 'member' },
    ],
    choices: [
      {
        label: '迎え入れる――「お前の音で世界を彩れ」',
        resultText: 'キーボード・マオ、正式加入。バンドの音はかつてない奥行きと美しさを手に入れた。五人の物語が、今、本当に動き出す。',
        resultScene: 'success',
        effects: { recruit: 'mao', affinity: { mao: 12 }, skill: 14, morale: 10, fans: 900, note: 'マオが加入！' },
      },
      {
        label: '将来を思って、もう一度よく考えろと諭す',
        resultText: 'マオは唇を噛み、「…優しいのね」と微笑んだ。決断は先送りになったが、信頼は確かに残った。',
        resultScene: 'member',
        effects: { affinity: { mao: -3 }, morale: 3 },
      },
    ],
  },

  // ===================================================================
  // 黒岩（大手プロデューサー）
  // ===================================================================
  meet_kuro: {
    id: 'meet_kuro',
    title: '敏腕プロデューサーの名刺',
    scene: 'contract',
    category: 'encounter',
    phases: ['grow', 'expand'],
    charId: 'kuro',
    once: true,
    requireMet: { charId: 'kuro', met: false },
    text: 'ライブ後、高級スーツの男が楽屋を訪ねてきた。差し出された名刺には、誰もが知る大手の名があった。',
    intro: [
      { text: '熱気の残る楽屋。場違いなほど洗練された男が、ゆっくりと拍手しながら入ってきた。', scene: 'backstage' },
      { text: '「いいライブだった。荒削りだが、金の匂いがする」 黒岩と名乗る男が名刺を差し出す。', scene: 'contract' },
      { text: '「売れたいか? 俺が手を貸せば、お前らは一気に頂点だ。ただし――俺のやり方に従ってもらう」', scene: 'contract' },
    ],
    choices: [
      {
        label: '話を聞いてみる――チャンスは逃さない',
        resultText: '黒岩は満足げに頷いた。「賢い選択だ」 大手の人脈という巨大なカードが、ユウたちの手札に加わった。',
        resultScene: 'contract',
        effects: { affinity: { kuro: 32 }, fans: 500, money: 2000, note: '黒岩と出会った' },
      },
      {
        label: '警戒しつつ、対等に渡り合う',
        resultText: '「俺たちは俺たちの音楽を曲げない」 黒岩は意外そうに笑った。「…面白い。気骨のある奴は嫌いじゃない」',
        resultScene: 'contract',
        effects: { affinity: { kuro: 26 }, morale: 5, note: '黒岩と出会った' },
      },
    ],
  },
  bond_kuro_direction: {
    id: 'bond_kuro_direction',
    title: '黒岩の売り出し戦略',
    scene: 'contract',
    category: 'promo',
    phases: ['expand'],
    charId: 'kuro',
    requireMet: { charId: 'kuro', met: true },
    weight: 1.1,
    text: '黒岩が分厚いマーケティング資料を広げた。「次の一手で、ファンは10倍になる。だが…」',
    intro: [
      { text: '高層ビルのオフィス。黒岩がプレゼン資料をテーブルに叩きつけた。', scene: 'contract' },
      { text: '「キャッチーなタイアップ曲を作れ。お前らの泥臭さは、少し薄めろ」 売れる方程式を、彼は淡々と説く。', scene: 'contract' },
      { text: 'タケが渋い顔をする。「それ、俺たちの音か?」 売れることと、譲れないもの。天秤が揺れる。', scene: 'studio' },
    ],
    choices: [
      {
        label: '黒岩の戦略に乗る――結果がすべてだ',
        resultText: '計算され尽くした楽曲は、狙い通り大ヒット。ファンが爆発的に増えた。黒岩は満足げに微笑む。「これが商売だ」',
        resultScene: 'crowd',
        effects: { affinity: { kuro: 12 }, fans: 2500, money: 4000, morale: -4 },
      },
      {
        label: '芯は曲げず、落とし所を交渉する',
        resultText: '譲れない一線を守りつつ、商業性も取り込んだ。黒岩は唸った。「…強情だが、悪くない着地だ」 互いの信頼が深まった。',
        resultScene: 'contract',
        effects: { affinity: { kuro: 14 }, fans: 1200, money: 2500, morale: 4 },
      },
      {
        label: '全面的に突っぱねる',
        resultText: '「俺たちのやり方でやる」 黒岩は冷たく資料を閉じた。「…後悔するなよ」 一時的に距離ができた。',
        resultScene: 'trouble',
        effects: { affinity: { kuro: -10 }, morale: 6, fans: 200 },
      },
    ],
  },
  special_kuro_majordeal: {
    id: 'special_kuro_majordeal',
    title: '黒岩、最後のカード',
    scene: 'contract',
    category: 'chance',
    phases: ['expand', 'mend'],
    charId: 'kuro',
    once: true,
    requireMet: { charId: 'kuro', met: true },
    requireAffinityMin: { charId: 'kuro', min: 60 },
    text: '黒岩が、これまでにない真剣な顔で言った。「お前らに、賭ける。俺のキャリア全部を、な」',
    intro: [
      { text: '夜景を背に、黒岩がグラスを傾けていた。「俺はこの業界で、数えきれないバンドを売ってきた」', scene: 'contract' },
      { text: '「だが、お前らみたいに俺を本気にさせた奴はいない」 彼は珍しく、笑みではなく真顔だった。', scene: 'contract' },
      { text: '「全国流通、テレビ、大型タイアップ――俺の持つカードを全部切る。お前らなら、応えられるな?」', scene: 'success' },
    ],
    choices: [
      {
        label: '黒岩の全力を受けて立つ',
        resultText: '黒岩のフルバックアップが炸裂。プロモーションは全国を席巻し、ファンは雪崩を打って増えた。「これが、俺の最高傑作だ」',
        resultScene: 'success',
        effects: { affinity: { kuro: 15 }, fans: 7000, money: 9000, skill: 8 },
      },
      {
        label: '感謝しつつ、自分たちのペースを貫く',
        resultText: '「無理はしない。でも、あんたの本気は受け取った」 黒岩は静かに頷いた。「…お前らは、それでいい」',
        resultScene: 'contract',
        effects: { affinity: { kuro: 8 }, fans: 2500, money: 4000, morale: 6 },
      },
    ],
  },

  // ===================================================================
  // 真理（インディーズ主宰）
  // ===================================================================
  meet_mari: {
    id: 'meet_mari',
    title: 'インディーズの姉御',
    scene: 'livehouse',
    category: 'encounter',
    phases: ['meet', 'grow', 'expand'],
    charId: 'mari',
    once: true,
    requireMet: { charId: 'mari', met: false },
    text: '小さなレーベルを率いる女性が、ライブの後でビールを奢ってくれた。「いい音だったよ、あんたら」',
    intro: [
      { text: 'ライブハウスのカウンター。革ジャンの似合う姐御肌の女性が、グラスを掲げた。', scene: 'livehouse' },
      { text: '「あたしは真理。小さいレーベルやってる」 飾らない笑顔に、張り詰めていた肩の力が抜ける。', scene: 'street' },
      { text: '「売れる売れないより、あんたらの音が好きかどうか。あたしはそれで動くんだ」 アーティスト想いの言葉に、ユウは胸を打たれた。', scene: 'backstage' },
    ],
    choices: [
      {
        label: '胸の内の悩みを打ち明ける',
        resultText: '真理は黙って最後まで聞き、ぽんと肩を叩いた。「焦るな。あんたらの音は本物だ」 心強い味方ができた。',
        resultScene: 'backstage',
        effects: { affinity: { mari: 36 }, morale: 8, note: '真理と出会った' },
      },
      {
        label: '一緒に音楽の未来を語り合う',
        resultText: '夜が更けるまで音楽談義に花が咲いた。「あんたらとなら、面白いことができそうだ」 真理は本気の目をしていた。',
        resultScene: 'livehouse',
        effects: { affinity: { mari: 30 }, morale: 5, fans: 200, note: '真理と出会った' },
      },
    ],
  },
  bond_mari_release: {
    id: 'bond_mari_release',
    title: '真理とインディーズ盤',
    scene: 'studio',
    category: 'relation',
    phases: ['grow', 'expand'],
    charId: 'mari',
    requireMet: { charId: 'mari', met: true },
    weight: 1.1,
    text: '真理が「うちでEP出さないか?」と持ちかけてきた。予算は少ないが、自由がある。',
    intro: [
      { text: '雑居ビルのレーベル事務所。真理が手作りの企画書を広げた。', scene: 'studio' },
      { text: '「大手みたいな金はない。でも、あんたらの好きにやらせてやれる」 嘘のない言葉だった。', scene: 'studio' },
      { text: 'リョウが目を潤ませる。「俺たちを、信じてくれるのか」 さて、どう応える?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '真理を信じて全力でEPを作る',
        resultText: '少ない予算でも、魂を込めた一枚が完成した。口コミでじわじわ広がり、確かな手応え。真理は我が事のように喜んだ。',
        resultScene: 'success',
        effects: { affinity: { mari: 14 }, fans: 1000, skill: 6, money: 1500 },
      },
      {
        label: '一緒に手売りで全国を回る',
        resultText: '二人三脚でライブハウスを行脚。真理が運転するワゴンで各地を駆けた。泥臭くも、忘れられない絆ができた。',
        resultScene: 'tour',
        effects: { affinity: { mari: 16 }, fans: 1500, morale: 8, money: -1000 },
      },
    ],
  },
  special_mari_loyalty: {
    id: 'special_mari_loyalty',
    title: '真理の覚悟',
    scene: 'contract',
    category: 'relation',
    phases: ['expand', 'mend'],
    charId: 'mari',
    once: true,
    requireMet: { charId: 'mari', met: true },
    requireAffinityMin: { charId: 'mari', min: 60 },
    text: '大手からの引き抜きの噂を聞いた真理が、震える声で言った。「行くのか? …いや、引き止める権利はないよな」',
    intro: [
      { text: '雨の事務所。真理が、いつになく弱気な表情でユウを見た。', scene: 'trouble' },
      { text: '「あんたらが大きくなるのは、あたしの夢でもある。でも――手放したくない、ってのも本音でさ」', scene: 'contract' },
      { text: 'ここまで育ててくれた姉御。その想いに、ユウはどう報いる?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '真理と添い遂げる――「恩は忘れない」',
        resultText: '「俺たちの原点は、あんただ」 真理は涙をこらえて笑った。義理を貫いた絆が、バンドに揺るがぬ芯をくれた。ファンも熱狂で応えた。',
        resultScene: 'success',
        effects: { affinity: { mari: 16 }, morale: 14, fans: 4000, money: 3000 },
      },
      {
        label: '感謝を胸に、より大きな舞台へ羽ばたく',
        resultText: '「育ててもらった分、デカくなって恩を返す」 真理は背中を押してくれた。「行ってこい、あたしの自慢のバンド」',
        resultScene: 'success',
        effects: { affinity: { mari: 6 }, fans: 5000, money: 6000, morale: 5 },
      },
    ],
  },

  // ===================================================================
  // REX（ライバルバンドのVo）
  // ===================================================================
  meet_rex: {
    id: 'meet_rex',
    title: 'ライバルの挑発',
    scene: 'livehouse',
    category: 'encounter',
    phases: ['grow', 'expand'],
    charId: 'rex',
    once: true,
    requireMet: { charId: 'rex', met: false },
    text: '対バン相手の人気バンドのVo・REXが、フロアでこちらを睨んでいた。「お前らが噂の新人か。…大したことねえな」',
    intro: [
      { text: '満員のライブハウス。トリを務める人気バンドのVo・REXが、楽屋でユウたちを値踏みした。', scene: 'backstage' },
      { text: '「俺の前座にしては、客が湧いてたじゃねえか」 挑発的な笑み。だがその目は、確かな実力者のものだった。', scene: 'livehouse' },
      { text: '「いつか俺を喰う気か? やれるもんならやってみろよ」 火花が散る。ユウの闘志に火がついた。', scene: 'member' },
    ],
    choices: [
      {
        label: '真っ向から宣戦布告する',
        resultText: '「次会うときは、お前を喰う」 REXはニヤリと笑った。「上等だ。楽しみにしてるぜ」 最高のライバルができた。',
        resultScene: 'member',
        effects: { affinity: { rex: 30 }, morale: 8, skill: 4, note: 'REXと出会った' },
      },
      {
        label: '実力で黙らせると、ステージで返す',
        resultText: 'アンコールを掻っ攫う熱演で答えた。袖で見ていたREXが舌打ちする。「…生意気な新人だ」 認めた証だった。',
        resultScene: 'crowd',
        effects: { affinity: { rex: 25 }, fans: 600, skill: 5, note: 'REXと出会った' },
      },
    ],
  },
  bond_rex_battle: {
    id: 'bond_rex_battle',
    title: 'REXとの対バン対決',
    scene: 'livehouse',
    category: 'live',
    phases: ['expand'],
    charId: 'rex',
    requireMet: { charId: 'rex', met: true },
    weight: 1.2,
    text: 'REXが対バンを申し込んできた。「どっちが客を沸かせるか、勝負だ」 ガチンコの一夜が始まる。',
    intro: [
      { text: '満員のライブハウス。両バンドのファンが入り乱れ、異様な熱気が渦巻く。', scene: 'crowd' },
      { text: 'REXが袖でユウとこぶしを合わせた。「手加減はしねえぞ」「望むところだ」', scene: 'backstage' },
      { text: 'フロアが揺れる。先攻はREX――凄まじいパフォーマンスにフロアが爆発する。さあ、どう超える?', scene: 'livehouse' },
    ],
    choices: [
      {
        label: '全力でぶつかり、フロアを奪い返す',
        resultText: '魂を削る演奏で、フロアの空気を完全に塗り替えた。終演後、REXが汗だくの顔で笑う。「…やられたよ。次は負けねえ」',
        resultScene: 'crowd',
        effects: { affinity: { rex: 14 }, fans: 1800, skill: 10, morale: 6 },
      },
      {
        label: '互いを高め合う共演に持ち込む',
        resultText: '最後はアンコールで両バンドが同じステージに。会場がひとつになった。「お前らとなら、まだ上に行ける」',
        resultScene: 'success',
        effects: { affinity: { rex: 16 }, fans: 1500, morale: 8 },
      },
      {
        label: '挑発に乗りすぎて空回りする',
        resultText: '張り合おうと無茶をして、演奏が雑になった。REXが冷めた目で見る。「…そんなもんか」 苦い夜になった。',
        resultScene: 'fail',
        effects: { affinity: { rex: -6 }, fans: 400, skill: 3 },
      },
    ],
  },
  special_rex_split: {
    id: 'special_rex_split',
    title: 'REXとの共演ツアー',
    scene: 'tour',
    category: 'chance',
    phases: ['expand', 'mend'],
    charId: 'rex',
    once: true,
    requireMet: { charId: 'rex', met: true },
    requireAffinityMin: { charId: 'rex', min: 60 },
    text: 'REXが肩を組んできた。「敵だの味方だの、もうどうでもいい。一緒にツアー回ろうぜ。客を、ぶっ飛ばしに行こう」',
    intro: [
      { text: '打ち上げの居酒屋。すっかり打ち解けたREXが、酔った勢いで叫んだ。', scene: 'backstage' },
      { text: '「俺たちが二大巨頭になりゃ、シーンごと持っていける」 もう敵意は欠片もない、戦友の顔だった。', scene: 'tour' },
      { text: '「全国、二マン(2バンド)ツアー。やるか?」 かつてのライバルが、最強の相棒になる瞬間。', scene: 'success' },
    ],
    choices: [
      {
        label: '相棒として全国を共に駆ける',
        resultText: '二大バンドの共演ツアーは各地で伝説を生んだ。会場は連日超満員。ライバルが戦友になった物語に、ファンは熱狂した。',
        resultScene: 'crowd',
        effects: { affinity: { rex: 15 }, fans: 6500, skill: 10, money: 5000, morale: 8 },
      },
      {
        label: 'いいライバルのままでいようと笑う',
        resultText: '「馴れ合いはナシだ。お前は俺が超える壁でいろ」 REXは豪快に笑った。「…お前、最高だな」 緊張感のある絆が残った。',
        resultScene: 'member',
        effects: { affinity: { rex: 8 }, fans: 2500, skill: 8, morale: 6 },
      },
    ],
  },

  // ===================================================================
  // ジュン（音楽ライター）
  // ===================================================================
  meet_jun: {
    id: 'meet_jun',
    title: '辛口ライターの取材',
    scene: 'press',
    category: 'encounter',
    phases: ['grow', 'expand'],
    charId: 'jun',
    once: true,
    requireMet: { charId: 'jun', met: false },
    text: '辛口で知られる音楽ライター・ジュンが取材に来た。「期待はしてない。期待を裏切ってくれよ」',
    intro: [
      { text: 'カフェの片隅。眼鏡の奥の鋭い目が、ユウたちを品定めしていた。', scene: 'press' },
      { text: '「俺は提灯記事は書かない。つまらなきゃ、そう書く」 ジュンは録音機を置いた。', scene: 'press' },
      { text: '「で? お前らは何者だ。語ってみろ」 試すような問い。ここが正念場だ。', scene: 'press' },
    ],
    choices: [
      {
        label: '飾らず、本気の音楽論をぶつける',
        resultText: 'ジュンのペンが止まらなくなった。「…面白い。久々に書く気になった」 翌週、彼の記事がバンドの名を広めた。',
        resultScene: 'press',
        effects: { affinity: { jun: 32 }, fans: 800, morale: 5, note: 'ジュンと出会った' },
      },
      {
        label: '音で語ると、その場で演奏を聴かせる',
        resultText: '言葉より音。即興の一曲に、ジュンは黙り込んだ。「…言葉はいらないな。これは本物だ」',
        resultScene: 'press',
        effects: { affinity: { jun: 28 }, fans: 500, skill: 4, note: 'ジュンと出会った' },
      },
    ],
  },
  bond_jun_review: {
    id: 'bond_jun_review',
    title: 'ジュンのレビュー',
    scene: 'press',
    category: 'promo',
    phases: ['expand', 'mend'],
    charId: 'jun',
    requireMet: { charId: 'jun', met: true },
    weight: 1.1,
    text: 'ジュンが新譜のレビューを書くという。「忖度はしない。覚悟しとけよ」',
    intro: [
      { text: '編集部の一室。ジュンが新譜を何度も聴き込んでいた。', scene: 'press' },
      { text: '「ここの歌詞、攻めてるな。だが詰めが甘い箇所もある」 容赦ない指摘が飛ぶ。', scene: 'press' },
      { text: 'だがその目は、真剣にバンドと向き合う者の目だった。どう応える?', scene: 'press' },
    ],
    choices: [
      {
        label: '批評を真摯に受け止め、糧にする',
        resultText: '「お前は伸びる。逃げないからな」 ジュンは満点に近い評を書いた。記事は大きな反響を呼んだ。',
        resultScene: 'tv',
        effects: { affinity: { jun: 13 }, fans: 1400, skill: 6 },
      },
      {
        label: '自分たちの意図を堂々と語り返す',
        resultText: 'ユウの反論にジュンが目を細めた。「…ちゃんと考えてやがる。いいレビューになりそうだ」 信頼が深まった。',
        resultScene: 'press',
        effects: { affinity: { jun: 11 }, fans: 1000, morale: 4 },
      },
    ],
  },

  // ===================================================================
  // DJナイト（ラジオDJ）
  // ===================================================================
  meet_dj: {
    id: 'meet_dj',
    title: '深夜ラジオのDJ',
    scene: 'sns',
    category: 'encounter',
    phases: ['grow', 'expand'],
    charId: 'dj',
    once: true,
    requireMet: { charId: 'dj', met: false },
    text: '人気深夜ラジオのDJナイトが、ユウたちの曲を番組でかけてくれたという。「会いに来いよ、スタジオに」',
    intro: [
      { text: '深夜のラジオ局。ヘッドホンを首にかけたDJナイトが、軽快に手を振った。', scene: 'tv' },
      { text: '「お前らの曲、たまたま聴いてさ。これは電波に乗せなきゃって思ったわけよ」', scene: 'sns' },
      { text: '「リスナーの反応も上々。どうだ、生出演してみないか?」 世に出すチャンスが転がり込んだ。', scene: 'tv' },
    ],
    choices: [
      {
        label: '生放送で全力トーク＆演奏',
        resultText: 'マイクの前で本音を喋り倒し、アコースティックで一曲。放送直後、SNSがバンドの名前で埋まった。',
        resultScene: 'sns',
        effects: { affinity: { dj: 34 }, fans: 1200, morale: 6, note: 'DJナイトと出会った' },
      },
      {
        label: 'DJと意気投合して深夜まで語る',
        resultText: '番組後、二人で朝まで音楽談義。「お前ら、応援するぜ」 強力なメディアの味方ができた。',
        resultScene: 'tv',
        effects: { affinity: { dj: 30 }, fans: 700, morale: 5, note: 'DJナイトと出会った' },
      },
    ],
  },
  bond_dj_onair: {
    id: 'bond_dj_onair',
    title: 'DJナイトの特集',
    scene: 'tv',
    category: 'promo',
    phases: ['expand', 'mend'],
    charId: 'dj',
    requireMet: { charId: 'dj', met: true },
    weight: 1.1,
    text: 'DJナイトが番組で一時間まるごとバンドを特集してくれるという。「お前らの物語を、全国に流すぜ」',
    intro: [
      { text: '深夜の生放送。DJナイトが熱を込めてマイクに向かう。「今夜は、俺が惚れ込んだバンドの特集だ」', scene: 'tv' },
      { text: '路上時代からの軌跡を、彼は丁寧に語ってくれた。リスナーからのメッセージが殺到する。', scene: 'sns' },
      { text: '「最後に、お前らの口から伝えたいことは?」 マイクが、ユウに向けられた。', scene: 'tv' },
    ],
    choices: [
      {
        label: 'リスナーへ熱いメッセージを届ける',
        resultText: 'ユウの言葉が深夜の電波に乗って全国へ。「夢、諦めんな」 共鳴したリスナーが大勢、新たなファンになった。',
        resultScene: 'crowd',
        effects: { affinity: { dj: 13 }, fans: 2200, morale: 6 },
      },
      {
        label: 'DJへの感謝をまっすぐ伝える',
        resultText: '「あんたがいなきゃ、ここまで来れなかった」 不意のお礼に、DJは照れ笑い。「…泣かせんなよ」 絆が深まった。',
        resultScene: 'tv',
        effects: { affinity: { dj: 15 }, fans: 1500, morale: 8 },
      },
    ],
  },
  special_dj_breakthrough: {
    id: 'special_dj_breakthrough',
    title: 'DJナイト、最後の一押し',
    scene: 'sns',
    category: 'chance',
    phases: ['expand', 'mend'],
    charId: 'dj',
    once: true,
    requireMet: { charId: 'dj', met: true },
    requireAffinityMin: { charId: 'dj', min: 60 },
    text: 'DJナイトが番組終了間際、爆弾を投下した。「俺の番組の全リスナー、お前らのライブに集合な!」',
    intro: [
      { text: '深夜ラジオ、最終コーナー。DJナイトが声を張り上げた。「みんな、いいか。よく聞けよ」', scene: 'tv' },
      { text: '「俺が本気で推すバンドが、今度ワンマンやる。一人残らず、行ってやってくれ!」 リスナーを巻き込む大号令。', scene: 'sns' },
      { text: 'SNSのトレンドが一気にバンド名で埋まる。これは、人生を変える夜になる。', scene: 'crowd' },
    ],
    choices: [
      {
        label: 'この波に全力で乗り、伝説を作る',
        resultText: 'ラジオから雪崩れ込んだリスナーで会場は超満員。語り継がれる一夜となり、知名度は全国区へ跳ね上がった。',
        resultScene: 'success',
        effects: { affinity: { dj: 14 }, fans: 8000, money: 6000, morale: 8 },
      },
      {
        label: '一人ひとりに丁寧に向き合う道を選ぶ',
        resultText: '爆発的な数より、来てくれた一人ひとりと心を通わせた。熱量の高い、本物のファンが確かに増えた。',
        resultScene: 'crowd',
        effects: { affinity: { dj: 10 }, fans: 3000, morale: 12 },
      },
    ],
  },

  // ===================================================================
  // アキ（一番のファン）
  // ===================================================================
  meet_aki: {
    id: 'meet_aki',
    title: '路上時代からのファン',
    scene: 'street',
    category: 'encounter',
    phases: ['meet', 'grow', 'expand'],
    charId: 'aki',
    once: true,
    requireMet: { charId: 'aki', met: false },
    text: '路上ライブの最前列で、ずっと手を振り続ける女の子がいた。「私、ずっとあなたたちのファンなんです!」',
    intro: [
      { text: '駅前の路上ライブ。まばらな人だかりの最前で、一人だけ全力で盛り上がる女の子がいた。', scene: 'street' },
      { text: '演奏が終わると、彼女は息を切らせて駆け寄ってきた。「アキです! 一曲目から鳥肌でした!」', scene: 'crowd' },
      { text: '「SNSで毎日宣伝してます。絶対、絶対売れてください!」 その純粋な熱量に、三人は胸が熱くなった。', scene: 'fans' },
    ],
    choices: [
      {
        label: '一緒に写真を撮り、約束を交わす',
        resultText: '「天下取るまで見ててくれ」 アキは涙目で頷いた。彼女の投稿が、最初の小さな口コミの輪を生んだ。',
        resultScene: 'fans',
        effects: { affinity: { aki: 38 }, fans: 300, morale: 8, note: 'アキと出会った' },
      },
      {
        label: '感謝を込めて、特別な一曲を捧げる',
        resultText: 'アキ一人のためのアンコール。彼女は泣きながら聴き入った。その動画が、じわじわと拡散されていく。',
        resultScene: 'fans',
        effects: { affinity: { aki: 34 }, fans: 400, morale: 6, note: 'アキと出会った' },
      },
    ],
  },
  bond_aki_sns: {
    id: 'bond_aki_sns',
    title: 'アキの拡散作戦',
    scene: 'sns',
    category: 'promo',
    phases: ['grow', 'expand'],
    charId: 'aki',
    requireMet: { charId: 'aki', met: true },
    weight: 1.1,
    text: 'アキが目を輝かせて提案してきた。「ファン有志で、宣伝企画を考えたんです!」',
    intro: [
      { text: 'カフェに集まったアキたちファン有志。手作りの企画書を広げて熱弁する。', scene: 'sns' },
      { text: '「みんなで一斉に投稿して、トレンド入りを狙うんです!」 その熱意は本物だった。', scene: 'fans' },
      { text: 'ファンが自発的に動いてくれる。その有り難さに、ユウは言葉を詰まらせた。どう乗る?', scene: 'street' },
    ],
    choices: [
      {
        label: 'ファンと一緒に全力で盛り上げる',
        resultText: '公式とファンが一体となった企画は大成功。ハッシュタグがトレンド入りし、新規ファンが続々と流れ込んだ。',
        resultScene: 'sns',
        effects: { affinity: { aki: 13 }, fans: 1600, morale: 6 },
      },
      {
        label: '無理しないでと、ファンを気遣う',
        resultText: '「君たちの応援だけで十分嬉しい」 アキは感激して泣いた。「だからこそ、もっと頑張りたいんです!」 絆が深まった。',
        resultScene: 'fans',
        effects: { affinity: { aki: 15 }, fans: 600, morale: 10 },
      },
    ],
  },
  special_aki_fanmade: {
    id: 'special_aki_fanmade',
    title: 'アキたちの大旗',
    scene: 'crowd',
    category: 'relation',
    phases: ['expand', 'mend'],
    charId: 'aki',
    once: true,
    requireMet: { charId: 'aki', met: true },
    requireAffinityMin: { charId: 'aki', min: 60 },
    text: 'ワンマン当日、客席にとんでもない数のファンが集結していた。先頭にはアキの姿。「みんな、連れてきました!」',
    intro: [
      { text: 'ワンマンライブ当日。楽屋でアキがそっと顔を出した。「サプライズ、用意したんです」', scene: 'backstage' },
      { text: 'ステージに立った瞬間、客席に巨大な手作りの旗が広がった。バンドのロゴ、そして「ありがとう」の文字。', scene: 'crowd' },
      { text: 'アキが先導し、客席全員が大合唱を始める。路上の一人から、この大観衆まで――こみ上げるものがあった。', scene: 'success' },
    ],
    choices: [
      {
        label: '万感の思いで、最高のライブを返す',
        resultText: '涙をこらえ、魂のすべてを叩きつけた。会場は一つになり、伝説の夜が刻まれた。古参も新規も、全員が一生のファンになった。',
        resultScene: 'success',
        effects: { affinity: { aki: 16 }, fans: 5500, morale: 14, money: 3000 },
      },
      {
        label: 'ステージから降り、ファンと肩を組む',
        resultText: '柵を越え、アキたちと肩を組んで歌った。距離ゼロの一体感。この光景がSNSで拡散され、新たな熱を生んだ。',
        resultScene: 'crowd',
        effects: { affinity: { aki: 14 }, fans: 4500, morale: 12 },
      },
    ],
  },

  // ===================================================================
  // ゲンさん（ライブハウス店長・出会い済み）下積み応援
  // ===================================================================
  bond_gen_support: {
    id: 'bond_gen_support',
    title: 'ゲンさんの檄',
    scene: 'livehouse',
    category: 'relation',
    phases: ['meet', 'grow'],
    charId: 'gen',
    requireMet: { charId: 'gen', met: true },
    weight: 1.2,
    text: '客入りの悪い日。落ち込むユウたちに、店長のゲンさんが昔話を始めた。',
    intro: [
      { text: 'ガラガラの客席。ステージを終えたユウは、楽屋で肩を落としていた。', scene: 'backstage' },
      { text: 'そこへゲンさんが缶コーヒーを二本、放ってよこした。「昔な、ここで腐ってたバンドが何組もいた」', scene: 'livehouse' },
      { text: '「諦めた奴は消えた。残った奴だけが、武道館に立った。お前ら、どっちだ?」 古参店長の檄が刺さる。', scene: 'livehouse' },
    ],
    choices: [
      {
        label: '「俺たちは残る側だ」と奮い立つ',
        resultText: 'ユウの目に火が戻った。ゲンさんはニヤリと笑い、「次の週末、いい枠空けといてやる」 心強い後ろ盾を得た。',
        resultScene: 'success',
        effects: { affinity: { gen: 14 }, morale: 12, skill: 4 },
      },
      {
        label: 'ゲンさんに弱音を吐き、励まされる',
        resultText: '初めて見せた弱さに、ゲンさんは優しく頷いた。「泣け。泣いて、また立て。それでいい」 心が軽くなった。',
        resultScene: 'backstage',
        effects: { affinity: { gen: 12 }, morale: 10 },
      },
    ],
  },
  bond_gen_stage: {
    id: 'bond_gen_stage',
    title: 'ゲンさんの店、最後の夜',
    scene: 'livehouse',
    category: 'relation',
    phases: ['expand', 'mend'],
    charId: 'gen',
    requireMet: { charId: 'gen', met: true },
    weight: 1.0,
    text: 'ゲンさんの店が、ビルの取り壊しで閉店するという。「最後の夜、お前らにトリを任せたい」',
    intro: [
      { text: '張り紙が貼られた店の前。「○月○日をもって閉店」の文字に、ユウは立ち尽くした。', scene: 'trouble' },
      { text: '「思い出の場所だが、しょうがねえ」 ゲンさんは寂しげに笑う。「最後のトリ、お前らがやれ」', scene: 'livehouse' },
      { text: '駆け出しの頃、何度も立たせてもらったこの小箱。最後にどう恩を返す?', scene: 'backstage' },
    ],
    choices: [
      {
        label: '原点回帰、魂の凱旋ライブを捧げる',
        resultText: '満員の小箱。あの頃の曲を全力で鳴らした。ゲンさんは客席で号泣。「…いい店だった。お前らのおかげだ」 伝説の一夜となった。',
        resultScene: 'success',
        effects: { affinity: { gen: 16 }, fans: 2000, morale: 12, skill: 6 },
      },
      {
        label: '常連やOBバンドも呼んで大宴会にする',
        resultText: 'かつての仲間が一堂に会し、店は笑いと涙に包まれた。「これでこそ俺の店の最後だ」 ゲンさんは満足げだった。',
        resultScene: 'crowd',
        effects: { affinity: { gen: 14 }, fans: 1500, morale: 10, money: -1000 },
      },
    ],
  },
};
