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
  | 'goal';

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
  /** ログに残す追加メッセージ */
  note?: string;
}

/** One selectable option inside an event. */
export interface Choice {
  label: string;
  /** 選択後に表示する結果テキスト */
  resultText: string;
  effects: Effect;
}

/** An event triggered when landing on a square. */
export interface GameEvent {
  id: string;
  title: string;
  /** 状況説明 */
  text: string;
  /** 選択肢。空なら「続ける」だけの自動進行イベント */
  choices: Choice[];
  /** 選択肢なしイベントの即時効果（choices が空のとき使用） */
  autoEffects?: Effect;
  /** 演出シーン種別 */
  scene: SceneKind;
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
  /** 紐づくイベント id（type に応じて） */
  eventId?: string;
  /** 次のマス。1つなら直進、複数なら分岐選択 */
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
  | 'rolling'
  | 'moving'
  | 'branch' // 分岐選択待ち
  | 'event' // イベント表示中
  | 'ended'; // ゲームオーバー or ゴール

export interface GameState {
  stats: Stats;
  members: Member[];
  turn: number;
  maxTurns: number;
  currentSquareId: string;
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
  /** 確定したエンディング */
  ending: Ending | null;
  /** ゴール時の到達会場 */
  reachedVenue: Venue | null;
  /** 行動ログ（新しいものが先頭） */
  log: string[];
}
