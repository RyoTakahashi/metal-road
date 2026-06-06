// ===== METAL ROAD core domain model =====

/** The four tracked stats. All feed into the final venue/rank at the goal. */
export interface Stats {
  /** 🔥 ファン数: 集客力＝会場キャパの主軸。0でゲームオーバー */
  fans: number;
  /** 🎸 演奏スキル: ライブの質。会場を成立させられるかの係数。0でゲームオーバー */
  skill: number;
  /** 🤝 メンバー士気: バンドの結束。0でゲームオーバー */
  morale: number;
  /** 💰 資金: 活動の燃料。借金が一定額を超えるとゲームオーバー */
  money: number;
}

export type StatKey = keyof Stats;

// ===== キャラクター & 友好度 =====

/** 登場人物の役割カテゴリ。 */
export type CastRole = 'band' | 'producer' | 'rival' | 'media' | 'fan' | 'support';

/** 友好度を持つ登場人物。 */
export interface Character {
  id: string;
  name: string;
  role: CastRole;
  /** 肩書き・担当（例: "Drums" / "敏腕プロデューサー"） */
  title: string;
  /** 一言プロフィール */
  bio: string;
  /** 3Dアバター用: 楽器（バンドのみ） */
  instrument?: 'vocal' | 'guitar' | 'bass' | 'drums' | 'keys';
  /** アバターの髪色 */
  hair: string;
  /** バンドの正規メンバーか（ロスター扱い） */
  isMember?: boolean;
}

/** ゲーム中の各キャラの状態（友好度・在籍）。 */
export interface CharacterState {
  id: string;
  /** 友好度 0..100 */
  affinity: number;
  /** 登場済み（出会ったか） */
  met: boolean;
  /** バンドに在籍中か（メンバーのみ意味を持つ） */
  active: boolean;
}

// ===== フェーズ（10年＝120ターンを4期に分割） =====

export type PhaseId = 'meet' | 'grow' | 'expand' | 'mend';

export interface PhaseDef {
  id: PhaseId;
  /** 表示名 */
  name: string;
  /** このフェーズが始まるターン（1始まり、含む） */
  startTurn: number;
  /** 説明（プレイヤー向けの狙い） */
  hint: string;
  /** このフェーズで出やすいイベントカテゴリの重み */
  weights: Partial<Record<EventCategory, number>>;
}

/** イベントのカテゴリ（マス種別＆フェーズ抽選に使う）。 */
export type EventCategory =
  | 'encounter' // 出会い・人脈
  | 'practice' // スキル磨き
  | 'live' // ライブ
  | 'promo' // 宣伝・マーケ
  | 'relation' // 人間関係
  | 'trouble' // トラブル
  | 'chance'; // ランダム・幸運

/** イベント演出シーンの種類（アニメ付きイラストの出し分け）。 */
export type SceneKind =
  | 'street'
  | 'livehouse'
  | 'studio'
  | 'sns'
  | 'flame'
  | 'member'
  | 'trouble'
  | 'tv'
  | 'contract'
  | 'press'
  | 'fans'
  | 'tour'
  | 'festival'
  | 'arena'
  | 'overseas'
  | 'goal'
  // 多段演出で使う追加シーン
  | 'backstage' // 楽屋・舞台裏
  | 'crowd' // 客席のクローズアップ（盛り上がり/閑散）
  | 'success' // 成功の余韻（紙吹雪・歓声）
  | 'fail'; // 失敗・しょんぼり

/** A band member on the roster. */
export interface Member {
  id: string;
  name: string;
  /** 担当楽器 */
  role: string;
  /** 個人の演奏力。加入/脱退時にバンドの skill に反映される目安 */
  skill: number;
}

/** A change applied to the game state as the result of a square/choice. */
export interface Effect {
  fans?: number;
  skill?: number;
  morale?: number;
  money?: number;
  /** メンバーを加入させる */
  addMember?: Member;
  /** メンバーを脱退させる。'random' でランダムに1人 */
  removeMember?: string | 'random';
  /** キャラの友好度変化 { charId: delta }。met=false のキャラは met=true になる */
  affinity?: Record<string, number>;
  /** このキャラをバンドに加入させる（character id） */
  recruit?: string;
  /** このキャラをバンドから脱退させる（character id） */
  depart?: string;
  /** ログに残す追加メッセージ */
  note?: string;
}

/** One selectable option inside an event. */
export interface Choice {
  label: string;
  /** 選択後に表示する結果テキスト（オチ） */
  resultText: string;
  effects: Effect;
  /** 選択の結末で切り替える演出シーン（省略時はイベント既定のまま） */
  resultScene?: SceneKind;
}

/**
 * 導入の1ステップ（マルチシーン演出）。
 * 物語を 3〜4 段で見せ、最後に選択 or 自動効果＋オチへ繋ぐ。
 */
export interface EventBeat {
  /** このビートのセリフ/状況 */
  text: string;
  /** このビートで切り替える演出シーン（省略時は直前のシーンを継続） */
  scene?: SceneKind;
}

/** An event triggered when landing on a square. */
export interface GameEvent {
  id: string;
  title: string;
  /** 状況説明（intro 未指定時のフォールバック、互換用） */
  text: string;
  /**
   * 導入シーン列（多段演出）。指定すると text の代わりに順番に表示する。
   * 最後のビートのあとに選択肢/自動効果へ進む。
   */
  intro?: EventBeat[];
  /** 選択肢。空なら「続ける」だけの自動進行イベント */
  choices: Choice[];
  /** 選択肢なしイベントの即時効果（choices が空のとき使用） */
  autoEffects?: Effect;
  /** 自動進行イベントの結末で切り替える演出シーン（省略時は既定） */
  autoResultScene?: SceneKind;
  /** 演出シーン種別（既定） */
  scene: SceneKind;

  // ===== 抽選・分岐メタデータ（自由移動マップ用） =====
  /** イベントのカテゴリ（マス種別と対応） */
  category?: EventCategory;
  /** このイベントが出現しうるフェーズ（未指定なら全フェーズ） */
  phases?: PhaseId[];
  /** 主に関係する登場人物（演出/友好度条件に使用） */
  charId?: string;
  /** 出現条件: このキャラの友好度が min 以上 */
  requireAffinityMin?: { charId: string; min: number };
  /** 出現条件: このキャラと出会っている／いない */
  requireMet?: { charId: string; met: boolean };
  /** 1ゲームで一度だけ出現する（出会い・加入など） */
  once?: boolean;
  /** 抽選の基礎重み（未指定は1） */
  weight?: number;
}

export type SquareType =
  | 'start'
  | 'live'
  | 'event'
  | 'member'
  | 'random'
  | 'branch'
  | 'rest'
  | 'goal';

/** A node on the board. Branching is expressed via multiple `next` ids. */
export interface Square {
  id: string;
  type: SquareType;
  title: string;
  /** 紐づくイベント id（固定イベントマスの場合） */
  eventId?: string;
  /**
   * マスのカテゴリ。自由移動マップでは、止まったマスのカテゴリ×現在フェーズで
   * イベントを抽選する。固定 eventId があればそちらを優先。
   */
  category?: EventCategory;
  /** 隣接マス（双方向グラフ）。複数なら方向選択。 */
  next: string[];
  /** 分岐時に各 next を説明するラベル（next と同じ順序） */
  branchLabels?: string[];
  /** マスに立つキャラ/装飾のヒント（任意） */
  scene?: SceneKind;
  /** SVG 配置座標（盤面レイアウト用） */
  x: number;
  y: number;
}

/** Reasons the run can end before/at the goal. */
export type EndingId =
  | 'fans'
  | 'skill'
  | 'morale'
  | 'money'
  | 'timeup'
  | 'goal';

export interface Ending {
  id: EndingId;
  title: string;
  text: string;
  /** バッドエンドかどうか（ゴール以外は基本 true） */
  bad: boolean;
}

/** Venue ladder entry — the goal rank is the venue you can fill. */
export interface Venue {
  rank: string; // SS / S / A / B / C / D
  name: string; // 会場名
  capacity: number; // 収容人数の目安
  /** この会場に立つのに最低限必要なファン数 */
  minFans: number;
}

export type GamePhase =
  | 'title'
  | 'idle' // ダイスを振れる
  | 'rolling' // サイコロを振って出目が確定するまでの演出
  | 'moving'
  | 'branch' // 分岐選択待ち
  | 'event' // イベント表示中
  | 'ended'; // ゲームオーバー or ゴール

export interface GameState {
  stats: Stats;
  members: Member[];
  /** 全登場人物の友好度・在籍状態 */
  cast: Record<string, CharacterState>;
  turn: number;
  maxTurns: number;
  /** 現在のフェーズ id（turn から導出） */
  phaseId: PhaseId;
  currentSquareId: string;
  /** 直前にいたマス（引き返し時に来た方向を除外するためのヒント。任意） */
  prevSquareId: string | null;
  phase: GamePhase;
  dice: number | null;
  /** 残り移動マス数（移動アニメ用） */
  stepsRemaining: number;
  /** 表示中のイベント */
  activeEvent: GameEvent | null;
  /** イベント結果テキスト（選択後/自動進行後に表示） */
  eventResult: string | null;
  /** 分岐の選択肢（next の square id 配列） */
  branchOptions: string[];
  /** 一度きりイベントの消費済み id 集合 */
  usedOnce: string[];
  /** 確定したエンディング */
  ending: Ending | null;
  /** 終了時の到達会場（ランク） */
  reachedVenue: Venue | null;
  /** 行動ログ（新しいものが先頭） */
  log: string[];
}
