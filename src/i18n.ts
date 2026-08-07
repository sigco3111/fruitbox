import { useEffect, useState } from 'react';

export type Lang = 'ko' | 'en';

const dict = {
  ko: {
    title: '사과게임',
    tagline: '120초 안에 사과를 모아 목표 합을 만들어 보드를 비워라',
    targetSum: '목표 합',
    score: '점수',
    timeLeft: '남은 시간',
    start: '시작',
    restart: '다시 시작',
    pause: '일시 정지',
    resume: '계속',
    newBoard: '새 보드',
    hint: '힌트',
    hintUsed: '힌트 사용됨',
    noHint: '더 이상 가능한 영역이 없습니다',
    colorBlind: '현황 색상',
    sound: '효과음',
    seconds: '초',
    points: '점',
    gameOver: '게임 종료',
    perfect: '퍼펙트 클리어!',
    bestScore: '최고 기록',
    newRound: '새 판',
    rulesTitle: '규칙',
    rule1: '숫자 사과를 직사각형으로 드래그해 목표 합과 같게 지우세요.',
    rule2: '빈칸은 0으로 계산되므로 가로질러 선택할 수 있어요.',
    rule3: '한 번에 더 많은 사과를 지울수록 효율적입니다.',
    rule4: '120초 안에 최고 점수를 노려보세요. 매일 새로운 보드가 생성됩니다.',
    customRule: '매 판마다 목표 합이 8 / 10 / 12 / 15 중 하나로 랜덤 변경됩니다.',
    langToggle: 'EN',
    todayBoard: '오늘의 보드',
    perfectBonus: '퍼펙트 보너스',
    selection: '선택 합',
    alive: '남은 사과',
    copyDaily: '오늘 보드 시드 공유',
    copied: '복사됨',
    plays: '플레이',
    footer: 'sigco · 사과게임 · 데일리 시드',
    footerHint: '보드 위를 드래그하세요. 테두리가 빨간색이면 합이 정확합니다.',
  },
  en: {
    title: 'Fruit Box',
    tagline: 'Drag apples into rectangles that sum to the target — clear the board in 120s',
    targetSum: 'Target',
    score: 'Score',
    timeLeft: 'Time',
    start: 'Start',
    restart: 'Restart',
    pause: 'Pause',
    resume: 'Resume',
    newBoard: 'New Board',
    hint: 'Hint',
    hintUsed: 'Hint used',
    noHint: 'No valid rectangle left',
    colorBlind: 'Color Mode',
    sound: 'Sound',
    seconds: 's',
    points: 'pts',
    gameOver: 'Game Over',
    perfect: 'Perfect Clear!',
    bestScore: 'Best',
    newRound: 'New Round',
    rulesTitle: 'Rules',
    rule1: 'Drag apples into a rectangle whose remaining numbers sum to the target.',
    rule2: 'Cleared cells count as 0, so you can cross empty space.',
    rule3: 'Clearing more apples in one move scores more efficiently.',
    rule4: 'Beat your best score in 120 seconds. A new board appears every day.',
    customRule: 'Each round randomly picks a target sum from 8 / 10 / 12 / 15.',
    langToggle: '한국어',
    todayBoard: 'Today’s Board',
    perfectBonus: 'Perfect Bonus',
    selection: 'Selection',
    alive: 'Apples left',
    copyDaily: 'Copy today’s seed',
    copied: 'Copied',
    plays: 'plays',
    footer: 'sigco · fruit box · daily seed',
    footerHint: 'Drag across the board. A red border means the sum is exactly right.',
  },
} as const;

export type TKey = keyof typeof dict['ko'];

export function useLang(): { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string } {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ko';
    const saved = localStorage.getItem('sigco.fruitbox.lang');
    if (saved === 'ko' || saved === 'en') return saved;
    return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
  });
  useEffect(() => {
    localStorage.setItem('sigco.fruitbox.lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (k: TKey) => dict[lang][k] ?? k;
  return { lang, setLang: setLangState, t };
}