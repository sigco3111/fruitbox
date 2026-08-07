import { useEffect, useState } from 'react';
import { BoardView } from './components/BoardView';
import { HUD } from './components/HUD';
import { GameOverPanel } from './components/GameOverPanel';
import { useGame } from './game/useGame';
import { aliveCount, TIME_LIMIT_SEC } from './game/engine';
import { useLang } from './i18n';
import { useBestScore, useColorBlind, useSound } from './game/storage';
import { setSoundEnabled } from './game/sound';

export default function App() {
  const { lang, setLang, t } = useLang();
  const { state, actions } = useGame();
  const { best, refresh } = useBestScore();
  const [soundOn, toggleSound] = useSound();
  const [colorBlind, toggleColorBlind] = useColorBlind();
  const [copied, setCopied] = useState(false);

  useEffect(() => { setSoundEnabled(soundOn); }, [soundOn]);
  if (state.best > best) refresh();

  const alive = state.board ? aliveCount(state.board) : 0;

  const onCopySeed = async () => {
    if (!state.meta) return;
    try {
      await navigator.clipboard.writeText(state.meta.label);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(180deg, #f0f5e6 0%, #d8e6c4 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="text-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-900">
            🍎 {t('title')}
          </h1>
          <div className="text-xs sm:text-sm text-emerald-900/60">{t('tagline')}</div>
          {state.meta && (
            <div className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/10 text-emerald-900/70">
              {t('todayBoard')} · target {state.meta.target}
            </div>
          )}
        </div>

        <HUD
          lang={lang}
          t={t}
          status={state.status}
          target={state.meta?.target ?? 10}
          score={state.score}
          total={170}
          timeLeft={state.timeLeft}
          timeTotal={TIME_LIMIT_SEC}
          onStart={actions.start}
          onPauseToggle={actions.pauseToggle}
          onNewBoard={actions.newRound}
          onHint={actions.useHint}
          onCopySeed={onCopySeed}
          onLangToggle={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          onSoundToggle={toggleSound}
          onColorBlindToggle={toggleColorBlind}
          copied={copied}
          soundOn={soundOn}
          colorBlind={colorBlind}
          best={Math.max(best, state.best)}
          hintUsed={state.hintUsed}
          hintNoMove={false}
        />

        <div className="relative">
          {state.board && state.meta ? (
            <BoardView
              board={state.board}
              selection={state.selection}
              liveSum={state.liveSum}
              liveAlive={state.liveAlive}
              hintRect={state.hintRect}
              target={state.meta.target}
              colorBlind={colorBlind}
              onDragChange={actions.setDrag}
              onDragEnd={actions.commitDrag}
            />
          ) : (
            <div className="w-full max-w-[860px] aspect-[17/10] mx-auto rounded-2xl bg-emerald-100 animate-pulse" />
          )}

          {state.status === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-20">
              <div className="text-white text-3xl font-black drop-shadow">⏸ {t('pause')}</div>
            </div>
          )}
        </div>

        <RulesPanel t={t} />
      </div>

      <footer className="text-center text-xs text-emerald-900/50 pb-4">
        {t('footer')} · v0.2
      </footer>

      {state.status === 'over' && state.meta && (
        <GameOverPanel
          lang={lang}
          t={t}
          score={state.score}
          perfect={state.perfect}
          best={Math.max(best, state.best)}
          target={state.meta.target}
          onRestart={actions.start}
          onNewRound={actions.newRound}
        />
      )}
    </div>
  );
}

function RulesPanel({ t }: { t: (k: any) => string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="w-full max-w-[860px] mx-auto mt-4 rounded-xl bg-white/60 border border-emerald-900/15 px-4 py-2 text-sm text-emerald-900"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer font-bold select-none">📖 {t('rulesTitle')}</summary>
      <ol className="mt-2 space-y-1 list-decimal list-inside text-emerald-900/80">
        <li>{t('rule1')}</li>
        <li>{t('rule2')}</li>
        <li>{t('rule3')}</li>
        <li>{t('rule4')}</li>
      </ol>
      <div className="mt-2 text-xs text-emerald-700 font-semibold">
        ✨ {t('customRule')}
      </div>
    </details>
  );
}