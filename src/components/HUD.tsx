import type { Lang, TKey } from '../i18n';

interface Props {
  lang: Lang;
  t: (k: TKey) => string;
  status: 'idle' | 'playing' | 'over' | 'paused';
  target: number;
  score: number;
  total: number;
  timeLeft: number;
  timeTotal: number;
  onStart: () => void;
  onPauseToggle: () => void;
  onNewBoard: () => void;
  onHint: () => void;
  onCopySeed: () => void;
  onLangToggle: () => void;
  onSoundToggle: () => void;
  onColorBlindToggle: () => void;
  copied: boolean;
  soundOn: boolean;
  colorBlind: boolean;
  best: number;
  hintUsed: boolean;
  hintNoMove: boolean;
}

export function HUD(props: Props) {
  const {
    lang, t, status, target, score, total, timeLeft, timeTotal,
    onStart, onPauseToggle, onNewBoard, onHint, onCopySeed, onLangToggle,
    onSoundToggle, onColorBlindToggle, copied, soundOn, colorBlind, best,
    hintUsed, hintNoMove,
  } = props;

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isOver = status === 'over';
  const isIdle = status === 'idle';
  const timerColor =
    timeLeft <= 10 ? 'text-red-600' : timeLeft <= 30 ? 'text-amber-700' : 'text-emerald-700';
  const progress = Math.max(0, Math.min(1, timeLeft / timeTotal));

  return (
    <div className="w-full max-w-[860px] mx-auto px-2 sm:px-4">
      {/* Top: 3-column HUD */}
      <div className="grid grid-cols-3 items-end mb-3 gap-4">
        <Stat label={t('score')} value={`${score}`} sub={`/${total}`} />
        <div className="text-center">
          <div className="text-xs text-emerald-900/70 font-semibold">{t('timeLeft')}</div>
          <div className={`text-4xl sm:text-5xl font-black tabular-nums leading-none ${timerColor}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-emerald-900/15 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-emerald-600'}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <Stat label={t('bestScore')} value={`${best}`} sub="" align="right" />
      </div>

      {/* Top-right utility row */}
      <div className="flex items-center justify-end gap-2 mb-3 text-xs">
        <button
          onClick={onCopySeed}
          className="px-2 py-1 rounded-md bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-900/20 text-emerald-900"
        >
          {copied ? `✓ ${t('copied')}` : t('copyDaily')}
        </button>
        <button
          onClick={onLangToggle}
          className="px-2 py-1 rounded-md bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-900/20 text-emerald-900"
        >
          {t('langToggle')}
        </button>
      </div>

      {/* Bottom: control buttons */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Ctrl icon="💡" label={t('hint')} onClick={onHint} disabled={!isPlaying || hintUsed} />
        <Ctrl
          icon={isPaused ? '▶️' : '⏸'}
          label={isPaused ? t('resume') : t('pause')}
          onClick={onPauseToggle}
          disabled={isIdle || isOver}
        />
        <Ctrl icon="🔄" label={t('newBoard')} onClick={onNewBoard} />
        <Ctrl
          icon="🎨"
          label={t('colorBlind')}
          onClick={onColorBlindToggle}
          active={colorBlind}
        />
        <Ctrl
          icon={soundOn ? '🔊' : '🔇'}
          label={t('sound')}
          onClick={onSoundToggle}
          active={soundOn}
        />
      </div>

      {hintNoMove && (
        <div className="text-center text-xs text-amber-700 mb-1">⚠ {t('noHint')}</div>
      )}

      {!isPlaying && !isPaused && (
        <div className="text-center">
          <button
            onClick={onStart}
            className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-lg shadow-lg shadow-emerald-500/30 transition-colors"
          >
            {isOver ? t('restart') : t('start')}
          </button>
        </div>
      )}

      <div className="text-center text-xs text-emerald-900/60 mt-2">
        {t('footerHint')}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, align = 'center' }: { label: string; value: string; sub: string; align?: 'center' | 'right' | 'left' }) {
  return (
    <div className={align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center'}>
      <div className="text-xs text-emerald-900/70 font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-3xl sm:text-4xl font-black text-emerald-900 leading-none">
        {value}
        {sub && <span className="text-base font-bold text-emerald-900/50"> {sub}</span>}
      </div>
    </div>
  );
}

function Ctrl({
  icon, label, onClick, disabled, active,
}: {
  icon: string; label: string; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border transition-all',
        disabled
          ? 'bg-emerald-900/5 text-emerald-900/30 border-emerald-900/10 cursor-not-allowed'
          : active
            ? 'bg-emerald-700 text-white border-emerald-800 shadow'
            : 'bg-white/70 hover:bg-white text-emerald-900 border-emerald-900/20 hover:border-emerald-900/40',
      ].join(' ')}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[10px] sm:text-xs font-semibold leading-tight">{label}</span>
    </button>
  );
}