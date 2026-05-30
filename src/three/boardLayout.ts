import type { Square, SquareType } from '../types';
import { BOARD_BY_ID } from '../data/board';

/** 2D盤面座標(x:80..4280, y:150/320/490) を 3D ワールド座標へ写像する。 */
const SCALE = 0.022;
const CX = 2180; // x 中央
const CZ = 320; // y 中央（spine）

export function worldPos(sq: Square): [number, number, number] {
  return [(sq.x - CX) * SCALE, 0, (sq.y - CZ) * SCALE];
}

export function worldPosById(id: string): [number, number, number] {
  const sq = BOARD_BY_ID[id];
  return sq ? worldPos(sq) : [0, 0, 0];
}

export const TILE = {
  radius: 1.15,
  height: 0.5,
};

export interface Tile3DStyle {
  color: string;
  emissive: string;
  icon: string;
}

export const TYPE_3D: Record<SquareType, Tile3DStyle> = {
  start: { color: '#1d3a5a', emissive: '#2a6cff', icon: '🚩' },
  live: { color: '#5a1226', emissive: '#ff2a55', icon: '🎤' },
  event: { color: '#3a2350', emissive: '#b25cff', icon: '⚡' },
  member: { color: '#4a3a12', emissive: '#ffb13b', icon: '🎸' },
  random: { color: '#0f3a3a', emissive: '#2bd6c4', icon: '🎲' },
  rest: { color: '#1c4022', emissive: '#7fe04a', icon: '🎼' },
  branch: { color: '#4a4416', emissive: '#ffd24a', icon: '🔀' },
  goal: { color: '#5a0a0a', emissive: '#ffd24a', icon: '🏟️' },
};
