# 🍎 사과게임 · sigco fruitbox v0.3

[![Live](https://img.shields.io/badge/Live-sigco--fruitbox.vercel.app-000?logo=vercel&logoColor=white)](https://sigco-fruitbox.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-sigco3111%2Ffruitbox-181717?logo=github)](https://github.com/sigco3111/fruitbox)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

매일 새로운 17×10 사과 보드에서 숫자 사과를 직사각형으로 묶어 목표 합과 같게 지우는 120초 퍼즐 게임입니다.

원작: <https://fruitboxgame.com/ko#fruit-box-rules> 의 사과게임 메커니즘을 그대로 구현하면서, **매 판마다 목표 합이 8 / 10 / 12 / 15 중 하나로 랜덤 변경**되는 커스텀 규칙을 추가했습니다.

> 🎮 **즉시 플레이**: https://sigco-fruitbox.vercel.app

---

## 🎮 규칙

- 17열 × 10행 격자에 1~9 숫자가 적힌 사과 170개가 놓입니다.
- 사과를 직사각형으로 드래그해, 영역 안에 남은 사과의 합이 **목표 합(target sum)** 과 정확히 같으면 모두 사라집니다.
  - 합이 맞으면 **테두리가 빨간색**으로 표시되고 우상단 모서리에 합계가 뜹니다.
- 이미 지운 칸은 0으로 계산되므로, 빈칸을 가로질러 선택할 수 있습니다.
- 사과 1개당 1점. 한 번에 더 많이 지울수록 효율적입니다.
- 120초 안에 최고 점수를 노려보세요. 모든 사과를 지우면 퍼펙트 클리어 (+10 보너스).
- **매 판 시작 시 목표 합이 8 / 10 / 12 / 15 중 하나**로 랜덤 선택됩니다 — 같은 판이 계속되지 않습니다.
- 힌트 버튼은 한 판에 1회 사용 가능하며, 가능한 직사각형 하나를 노란색으로 표시합니다.

## 🧩 기능

- ✅ 매일 새로운 보드 (날짜 기반 시드) — 같은 날이면 모든 플레이어가 같은 보드
- ✅ SVG 사과 (잎+줄기+그라데이션) + 색맹 모드
- ✅ 한국어 / 영어 토글 (자동 감지 + 수동 전환, localStorage 저장)
- ✅ 모바일 터치 + 데스크탑 마우스 통합 드래그 (PointerEvents)
- ✅ 셀렉션 박스 실시간 색상 피드백 (무효=흰색, 유효=빨강) + 합계 라벨
- ✅ 보드 외곽 초록+빨강 이중 테두리, 연두 배경
- ✅ 5-버튼 컨트롤: 힌트 / 일시정지 / 새 보드 / 색맹 모드 / 효과음
- ✅ Web Audio 합성 효과음 (성공/실패/힌트) — 의존성 0
- ✅ 데일리 시드 라벨 클립보드 복사
- ✅ 최고 점수 / 플레이 횟수 localStorage 저장
- ✅ 게임 종료 시 점수 + 퍼펙트 보너스 표시
- ✅ Vite + React 18 + TypeScript + Tailwind (no UI 라이브러리 추가)

## 🛠️ 개발

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm run build        # vite build → dist/
npm run preview      # serve dist/
```

요구 환경: Node 20+ (Vercel은 24.x)

## 🚀 배포

### Vercel (자동)

GitHub `main` 푸시 → Vercel이 자동 빌드/배포합니다. 약 10–15초.

- **Production URL**: https://sigco-fruitbox.vercel.app
- **GitHub repo**: https://github.com/sigco3111/fruitbox
- 첫 연결 시: Vercel 대시보드에서 `sigco-fruitbox` 프로젝트 → Settings → Git → `sigco3111/fruitbox` 연결

### CLI (일회성)

```bash
vercel deploy --prod
```

Vite 기본 설정 그대로 정적 호스팅 가능. 추가 설정 불필요.

## 📁 구조

```
src/
  main.tsx                 React 부트스트랩
  App.tsx                  최상위 컴포넌트 (HUD + BoardView + GameOverPanel)
  index.css                Tailwind + 전역 스타일
  i18n.ts                  한국어/영어 사전 + useLang 훅
  game/
    random.ts              mulberry32 PRNG + 데일리 시드 파생
    engine.ts              보드 생성, 합 검증, 셀렉션 적용, 힌트 검색
    useGame.ts             게임 상태 머신 훅 (status, score, timer, drag)
    storage.ts             localStorage 헬퍼 (best / plays / hint)
  components/
    BoardView.tsx          17×10 사과 격자 + 드래그 셀렉션 시각화
    HUD.tsx                점수/타이머/타겟합 카드 + 시작/힌트 버튼
    GameOverPanel.tsx      종료 모달
```

### 핸드오프 노트

버그 수정 이력은 [`HANDOFF_BUGFIX.md`](./HANDOFF_BUGFIX.md) (v0.2 → v0.2.1: `newRound` 인자 제거로 React Minified Error #31 해결) 참고.

## 🧠 시드 규칙

`createRound(roundIndex)` 는 다음 시드를 사용합니다:

```
seed = hash(`${YYYYMMDD}-${roundIndex}-${target}`)
board = mulberry32(seed) 로 1..9 균등 난수 채움
```

따라서:

- 같은 날, 같은 roundIndex → 같은 보드 (모든 사용자가 공유)
- `roundIndex` 만 바꾸면 즉시 새 보드 (재시도 가능)
- `target` 만 바꾸면 같은 패턴에서 다른 합 목표 → 다양한 난이도

## 🎯 커스텀 규칙 (매 판 랜덤 목표 합)

`TARGET_SUMS = [8, 10, 12, 15]` — 새 라운드마다 하나가 무작위 선택됩니다.
8 = 빠르고 쉬움 / 10 = 클래식 / 12 = 약간 어려움 / 15 = 도전적.

수정하려면 `src/game/engine.ts` 상단의 `TARGET_SUMS` 배열을 바꾸세요.
시드는 `target`을 키에 포함하므로, 같은 roundIndex라도 목표 합이 다르면 보드도 달라집니다.

## 📜 라이선스

MIT — 원작 [fruitboxgame.com](https://fruitboxgame.com) 의 사과게임 메커니즘을 차용했으며, 본 저장소의 모든 코드는 MIT 라이선스로 배포됩니다.
