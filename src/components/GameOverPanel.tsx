import type { Lang, TKey } from '../i18n';

interface Props {
  lang: Lang;
  t: (k: TKey) => string;
  score: number;
  perfect: boolean;
  best: number;
  target: number;
  onRestart: () => void;
  onNewRound: () => void;
}

export function GameOverPanel({ t, score, perfect, best, target, onRestart, onNewRound }: Props) {
  return (
    <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl bg-white border-2 border-emerald-700 shadow-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-emerald-700/70">{t('gameOver')}</div>
        <div className="mt-1 text-3xl font-black text-emerald-900">
          {perfect ? `🏆 ${t('perfect')}` : (
            <>
              <span className="text-emerald-600">{score}</span> {t('points')}
            </>
          )}
        </div>
        {perfect && (
          <div className="mt-2 text-sm text-amber-600">
            +10 {t('perfectBonus')} · target {target}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
            <div className="text-xs text-emerald-700/70">{t('score')}</div>
            <div className="text-xl font-bold text-emerald-900">{score}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
            <div className="text-xs text-emerald-700/70">{t('bestScore')}</div>
            <div className="text-xl font-bold text-emerald-600">{best}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onRestart}
            className="flex-1 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold border border-emerald-300"
          >
            {t('restart')}
          </button>
          <button
            onClick={onNewRound}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-500/30"
          >
            {t('newRound')}
          </button>
        </div>
        <div className="mt-3 text-xs text-emerald-900/50 text-center">{t('footer')}</div>
      </div>
    </div>
  );
}