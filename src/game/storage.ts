import { useCallback, useEffect, useState } from 'react';

const BEST_KEY = 'sigco.fruitbox.best';
const PLAYS_KEY = 'sigco.fruitbox.plays';
const HINT_KEY = 'sigco.fruitbox.hintUsed';
const SOUND_KEY = 'sigco.fruitbox.sound';
const COLORBLIND_KEY = 'sigco.fruitbox.colorBlind';

export function loadBest(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(BEST_KEY) ?? '0');
}

export function saveBest(score: number): number {
  if (typeof window === 'undefined') return score;
  const cur = loadBest();
  if (score > cur) {
    localStorage.setItem(BEST_KEY, String(score));
    return score;
  }
  return cur;
}

export function bumpPlays(): number {
  if (typeof window === 'undefined') return 0;
  const n = Number(localStorage.getItem(PLAYS_KEY) ?? '0') + 1;
  localStorage.setItem(PLAYS_KEY, String(n));
  return n;
}

export function consumeHintToken(): boolean {
  if (typeof window === 'undefined') return false;
  const used = localStorage.getItem(HINT_KEY) === '1';
  if (used) return false;
  localStorage.setItem(HINT_KEY, '1');
  return true;
}

export function resetHintToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HINT_KEY);
}

export function useBestScore() {
  const [best, setBest] = useState(loadBest());
  useEffect(() => {
    const onStorage = () => setBest(loadBest());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return { best, refresh: () => setBest(loadBest()) };
}

export function usePrefBool(key: string, fallback: boolean): [boolean, () => void] {
  const [v, setV] = useState<boolean>(() => {
    if (typeof window === 'undefined') return fallback;
    const s = localStorage.getItem(key);
    if (s === '1') return true;
    if (s === '0') return false;
    return fallback;
  });
  useEffect(() => {
    localStorage.setItem(key, v ? '1' : '0');
  }, [key, v]);
  const toggle = useCallback(() => setV((x) => !x), []);
  return [v, toggle];
}

export const useSound = () => usePrefBool(SOUND_KEY, true);
export const useColorBlind = () => usePrefBool(COLORBLIND_KEY, false);