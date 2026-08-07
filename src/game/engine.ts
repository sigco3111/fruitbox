import { mulberry32, dailySeed, hashStringToInt } from './random';

export const ROWS = 10;
export const COLS = 17;
export const TOTAL = ROWS * COLS; // 170
export const TIME_LIMIT_SEC = 120;
export const PERFECT_SCORE = TOTAL;

/** Target sums available per round. 10 = classic. */
export const TARGET_SUMS = [8, 10, 12, 15] as const;
export type TargetSum = (typeof TARGET_SUMS)[number];

export type Cell = number | null; // null = cleared
export type Board = Cell[][]; // [row][col]

export interface RoundMeta {
  seed: number;
  target: TargetSum;
  /** Stable label for the round (e.g. "daily-2026-08-08#3"). */
  label: string;
}

function fillBoard(rng: () => number): Board {
  const board: Board = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) row.push(1 + Math.floor(rng() * 9)); // 1..9
    board.push(row);
  }
  return board;
}

/**
 * Ensure the freshly generated board has *at least one* valid rectangle whose
 * remaining cells sum to `target`. If not, we lightly adjust by swapping a few
 * cells. Cheap, deterministic.
 *
 * @returns board and a flag indicating whether we had to intervene.
 */
function ensureSolvable(board: Board, rng: () => number, target: TargetSum): { board: Board; intervened: boolean } {
  if (findAnyValidRect(board, target)) return { board, intervened: false };
  let intervened = true;
  for (let attempt = 0; attempt < 500; attempt++) {
    const trial = board.map((row) => row.slice());
    // Re-roll a handful of cells with values that help.
    for (let k = 0; k < 12; k++) {
      const r = Math.floor(rng() * ROWS);
      const c = Math.floor(rng() * COLS);
      const candidates = trial
        .flat()
        .filter((v): v is number => v !== null);
      // pick a value biased toward making pair/triple sums reach `target`
      const want = Math.max(1, target - Math.max(0, candidates.length ? candidates[Math.floor(rng() * candidates.length)] : 0));
      const v = Math.min(9, Math.max(1, want));
      trial[r][c] = v;
    }
    if (findAnyValidRect(trial, target)) return { board: trial, intervened };
  }
  return { board, intervened };
}

export function createRound(roundIndex: number, explicitTarget?: TargetSum, now = new Date()): { board: Board; meta: RoundMeta } {
  const day = dailySeed(now);
  const target: TargetSum =
    explicitTarget ?? TARGET_SUMS[Math.floor(Math.random() * TARGET_SUMS.length)];
  const seedKey = `${day}-${roundIndex}-${target}`;
  const seed = hashStringToInt(seedKey);
  const rng = mulberry32(seed);
  let board = fillBoard(rng);
  const { board: solved } = ensureSolvable(board, rng, target);
  board = solved;
  const label = `daily-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}#${roundIndex}-T${target}`;
  return { board, meta: { seed, target, label } };
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Is `value` a valid cell number? */
export function isAlive(v: Cell): v is number {
  return v !== null;
}

/** Sum of alive cells in the rectangle [r1..r2][c1..c2]. Empty cells count as 0. */
export function rectSum(board: Board, r1: number, c1: number, r2: number, c2: number): number {
  let s = 0;
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const v = board[r][c];
      if (v !== null) s += v;
    }
  }
  return s;
}

/** Count of alive cells inside the rectangle. */
export function rectAliveCount(board: Board, r1: number, c1: number, r2: number, c2: number): number {
  let n = 0;
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (board[r][c] !== null) n++;
    }
  }
  return n;
}

/**
 * Validate a candidate rectangle (top-left + bottom-right inclusive).
 * Rules:
 *   - sum of remaining numbers === target
 *   - at least 2 alive cells (a single number === target is not enough, mirrors original "no 10s" rule)
 */
export function isValidSelection(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  target: TargetSum,
): boolean {
  if (r1 > r2 || c1 > c2) return false;
  const sum = rectSum(board, r1, c1, r2, c2);
  const alive = rectAliveCount(board, r1, c1, r2, c2);
  return sum === target && alive >= 2;
}

/** Apply the selection by clearing those cells. Returns a new board (immutable). */
export function applySelection(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): Board {
  const next = board.map((row) => row.slice());
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      next[r][c] = null;
    }
  }
  return next;
}

/** Find one valid rectangle (if any) — used for hints + solvability gate. */
export function findAnyValidRect(board: Board, target: TargetSum): { r1: number; c1: number; r2: number; c2: number } | null {
  for (let r1 = 0; r1 < ROWS; r1++) {
    for (let c1 = 0; c1 < COLS; c1++) {
      if (board[r1][c1] === null) continue;
      for (let r2 = r1; r2 < ROWS; r2++) {
        for (let c2 = c1; c2 < COLS; c2++) {
          if (isValidSelection(board, r1, c1, r2, c2, target)) {
            return { r1, c1, r2, c2 };
          }
        }
      }
    }
  }
  return null;
}

/** Count alive cells remaining. */
export function aliveCount(board: Board): number {
  let n = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== null) n++;
    }
  }
  return n;
}

/**
 * Greedy "solvable-from-here" check — given current board state, does there exist at least
 * one valid selection? Useful for end-of-round perfect detection (it should be unreachable
 * before the board is empty).
 */
export function hasAnyValidMove(board: Board, target: TargetSum): boolean {
  return findAnyValidRect(board, target) !== null;
}