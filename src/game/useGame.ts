import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applySelection,
  aliveCount,
  createRound,
  findAnyValidRect,
  isValidSelection,
  rectAliveCount,
  rectSum,
  TIME_LIMIT_SEC,
  TOTAL,
  type Board,
  type RoundMeta,
  type TargetSum,
} from './engine';
import { bumpPlays, consumeHintToken, resetHintToken, saveBest } from './storage';
import { playError, playHint, playSuccess } from './sound';

export type Status = 'idle' | 'playing' | 'paused' | 'over';

export interface DragSelection {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

export interface GameState {
  status: Status;
  roundIndex: number;
  board: Board;
  meta: RoundMeta | null;
  score: number;
  timeLeft: number;
  selection: DragSelection | null;
  liveSum: number;
  liveAlive: number;
  hintRect: DragSelection | null;
  hintUsed: boolean;
  perfect: boolean;
  best: number;
}

export function useGame() {
  const [roundIndex, setRoundIndex] = useState(1);
  const [board, setBoard] = useState<Board | null>(null);
  const [meta, setMeta] = useState<RoundMeta | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SEC);
  const [selection, setSelection] = useState<DragSelection | null>(null);
  const [liveSum, setLiveSum] = useState(0);
  const [liveAlive, setLiveAlive] = useState(0);
  const [hintRect, setHintRect] = useState<DragSelection | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [perfect, setPerfect] = useState(false);
  const [best, setBest] = useState(0);

  const tickRef = useRef<number | null>(null);
  const overRef = useRef(false);

  const finish = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setStatus('over');
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    const cleared = board ? TOTAL - aliveCount(board) : 0;
    const isPerfect = board ? aliveCount(board) === 0 : false;
    setPerfect(isPerfect);
    bumpPlays();
    const finalScore = score + cleared + (isPerfect ? 10 : 0);
    setBest(saveBest(finalScore));
  }, [board, score]);

  // Start a new round
  const newRound = useCallback(() => {
    overRef.current = false;
    resetHintToken();
    const next = roundIndex + 1;
    setRoundIndex(next);
    const { board: b, meta: m } = createRound(next);
    setBoard(b);
    setMeta(m);
    setStatus('idle');
    setScore(0);
    setTimeLeft(TIME_LIMIT_SEC);
    setSelection(null);
    setLiveSum(0);
    setLiveAlive(0);
    setHintRect(null);
    setHintUsed(false);
    setPerfect(false);
  }, [roundIndex]);

  // Initialize first round on mount
  useEffect(() => {
    const { board: b, meta: m } = createRound(1);
    setBoard(b);
    setMeta(m);
  }, []);

  // Timer
  useEffect(() => {
    if (status !== 'playing') return;
    tickRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [status, finish]);

  // Auto-end if board becomes empty (perfect clear before timer)
  useEffect(() => {
    if (status !== 'playing' || !board) return;
    if (aliveCount(board) === 0) finish();
  }, [board, status, finish]);

  const start = useCallback(() => {
    if (status === 'over') return;
    setStatus('playing');
  }, [status]);

  const pauseToggle = useCallback(() => {
    setStatus((s) => {
      if (s === 'playing') return 'paused';
      if (s === 'paused') return 'playing';
      return s;
    });
  }, []);

  // Drag selection handlers
  const setDrag = useCallback(
    (r: number, c: number) => {
      if (!board || !meta) return;
      setSelection((prev) => {
        if (!prev) return { r1: r, c1: c, r2: r, c2: c };
        const r1 = Math.min(prev.r1, r);
        const c1 = Math.min(prev.c1, c);
        const r2 = Math.max(prev.r2, r);
        const c2 = Math.max(prev.c2, c);
        return { r1, c1, r2, c2 };
      });
    },
    [board, meta],
  );

  // Recompute live sum/alive whenever board or selection changes.
  useEffect(() => {
    if (!board || !selection) {
      setLiveSum(0);
      setLiveAlive(0);
      return;
    }
    setLiveSum(rectSum(board, selection.r1, selection.c1, selection.r2, selection.c2));
    setLiveAlive(rectAliveCount(board, selection.r1, selection.c1, selection.r2, selection.c2));
  }, [board, selection]);

  const clearDrag = useCallback(() => {
    setSelection(null);
    setLiveSum(0);
    setLiveAlive(0);
  }, []);

  const commitDrag = useCallback(() => {
    if (!board || !meta || !selection) {
      clearDrag();
      return;
    }
    if (status !== 'playing') {
      clearDrag();
      return;
    }
    if (isValidSelection(board, selection.r1, selection.c1, selection.r2, selection.c2, meta.target)) {
      const cleared = rectAliveCount(board, selection.r1, selection.c1, selection.r2, selection.c2);
      const next = applySelection(board, selection.r1, selection.c1, selection.r2, selection.c2);
      setBoard(next);
      setScore((s) => s + cleared);
      playSuccess();
    } else {
      playError();
    }
    clearDrag();
  }, [board, meta, selection, status, clearDrag]);

  const useHint = useCallback(() => {
    if (!board || !meta) return;
    if (status !== 'playing') return;
    if (!consumeHintToken()) {
      setHintUsed(true);
      return;
    }
    const rect = findAnyValidRect(board, meta.target);
    setHintRect(rect);
    setHintUsed(true);
    if (rect) playHint();
  }, [board, meta, status]);

  return {
    state: {
      status,
      roundIndex,
      board,
      meta,
      score,
      timeLeft,
      selection,
      liveSum,
      liveAlive,
      hintRect,
      hintUsed,
      perfect,
      best,
    } as GameState,
    actions: {
      start,
      pauseToggle,
      newRound,
      setDrag,
      clearDrag,
      commitDrag,
      useHint,
    },
  };
}