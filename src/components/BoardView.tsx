import { useCallback, useEffect, useRef } from 'react';
import type { Board, TargetSum } from '../game/engine';
import type { DragSelection } from '../game/useGame';
import { Apple, appleContainerStyle } from './Apple';

interface Props {
  board: Board;
  selection: DragSelection | null;
  liveSum: number;
  liveAlive: number;
  hintRect: DragSelection | null;
  target: TargetSum;
  colorBlind?: boolean;
  onDragChange: (r: number, c: number) => void;
  onDragEnd: () => void;
}

interface Point { r: number; c: number }

function clientToCell(container: HTMLElement, clientX: number, clientY: number): Point | null {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
  const cellW = rect.width / 17;
  const cellH = rect.height / 10;
  const c = Math.max(0, Math.min(16, Math.floor(x / cellW)));
  const r = Math.max(0, Math.min(9, Math.floor(y / cellH)));
  return { r, c };
}

export function BoardView({
  board, selection, liveSum, liveAlive, hintRect, target, colorBlind = false, onDragChange, onDragEnd,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const p = clientToCell(el, clientX, clientY);
      if (!p) return;
      onDragChange(p.r, p.c);
    },
    [onDragChange],
  );

  const handleUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    pointerIdRef.current = null;
    onDragEnd();
  }, [onDragEnd]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      handleMove(e.clientX, e.clientY);
    }
    function onPointerUp() { handleUp(); }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [handleMove, handleUp]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    draggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    const p = clientToCell(containerRef.current, e.clientX, e.clientY);
    if (p) onDragChange(p.r, p.c);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const selSet = new Set<string>();
  if (selection) {
    for (let r = selection.r1; r <= selection.r2; r++) {
      for (let c = selection.c1; c <= selection.c2; c++) selSet.add(`${r}-${c}`);
    }
  }
  const hintSet = new Set<string>();
  if (hintRect) {
    for (let r = hintRect.r1; r <= hintRect.r2; r++) {
      for (let c = hintRect.c1; c <= hintRect.c2; c++) hintSet.add(`${r}-${c}`);
    }
  }

  const validSelection = !!selection && liveSum === target && liveAlive >= 2;

  return (
    <div
      className="relative w-full max-w-[860px] mx-auto rounded-[14px] p-[10px] no-touch-default shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #4f9b2c 0%, #2f6b1a 100%)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(0,0,0,0.15)',
      }}
    >
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        className="relative w-full aspect-[17/10] rounded-[8px] overflow-hidden"
        style={{
          background: '#e8f3d6',
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.0) 40%, rgba(0,0,0,0.04))',
          boxShadow: 'inset 0 0 0 3px #c43a3a, inset 0 0 0 5px #6c1212',
        }}
      >
        {/* Subtle grid lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={`${((i + 1) / 17) * 100}%`} y1="0"
              x2={`${((i + 1) / 17) * 100}%`} y2="100%"
              stroke="rgba(0,0,0,0.05)" strokeWidth="1"
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0" y1={`${((i + 1) / 10) * 100}%`}
              x2="100%" y2={`${((i + 1) / 10) * 100}%`}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1"
            />
          ))}
        </svg>

        {board.map((row, r) =>
          row.map((cell, c) => {
            const empty = cell === null;
            const selected = selSet.has(`${r}-${c}`);
            const hinted = hintSet.has(`${r}-${c}`);
            return (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{
                  left: `${(c / 17) * 100}%`,
                  top: `${(r / 10) * 100}%`,
                  width: `${100 / 17}%`,
                  height: `${100 / 10}%`,
                  boxSizing: 'border-box',
                  padding: '2px',
                }}
              >
                {empty ? (
                  <div className="w-full h-full" />
                ) : (
                  <div
                    className={[
                      'relative w-full h-full transition-transform duration-100',
                      selected ? 'scale-95' : '',
                    ].join(' ')}
                    style={appleContainerStyle}
                  >
                    <Apple value={cell as number} hueShift={(r * 17 + c) * 3} colorBlind={colorBlind} />
                    <div
                      className="absolute inset-0 flex items-center justify-center font-extrabold text-white pointer-events-none"
                      style={{
                        fontSize: 'clamp(10px, 2vw, 22px)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.6), 0 0 1px rgba(0,0,0,0.8)',
                      }}
                    >
                      {cell}
                    </div>
                    {selected && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-white/80 pointer-events-none" />
                    )}
                    {hinted && !selected && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-yellow-300 animate-pulse pointer-events-none" />
                    )}
                  </div>
                )}
              </div>
            );
          }),
        )}

        {/* Selection outline */}
        {selection && (
          <div
            className="absolute pointer-events-none rounded-md"
            style={{
              left: `${(selection.c1 / 17) * 100}%`,
              top: `${(selection.r1 / 10) * 100}%`,
              width: `${((selection.c2 - selection.c1 + 1) / 17) * 100}%`,
              height: `${((selection.r2 - selection.r1 + 1) / 10) * 100}%`,
              border: `3px solid ${validSelection ? '#c43a3a' : '#ffffff'}`,
              boxShadow: validSelection
                ? '0 0 0 1px rgba(196,58,58,0.3), 0 0 18px rgba(196,58,58,0.45)'
                : '0 0 0 1px rgba(255,255,255,0.3), 0 0 12px rgba(255,255,255,0.4)',
              transition: 'border-color 0.12s, box-shadow 0.12s',
            }}
          >
            {liveAlive >= 1 && (
              <div
                className="absolute font-extrabold text-white pointer-events-none"
                style={{
                  right: '-2px',
                  top: '-2px',
                  transform: 'translate(0, -100%)',
                  fontSize: 'clamp(10px, 1.4vw, 16px)',
                  background: validSelection ? '#c43a3a' : 'rgba(15,23,42,0.85)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {liveSum}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}