# 🍎 sigco-fruitbox 버그 수정 핸드오프

## ✅ 수정 완료 — ULTRAWORK MODE

### 사용자 요청
> "게임은 잘 진행되었는데, 완료 팝업에서 새 게임을 하니까 첨부파일 처럼 되어 버림"

완료 팝업에서 "새 판" 클릭 → 페이지가 검은 화면 + React Minified Error #31

### 근본 원인 (확정)
**파일**: `src/game/useGame.ts:79`

```diff
- const newRound = useCallback((explicitTarget?: TargetSum) => {
+ const newRound = useCallback(() => {
    overRef.current = false;
    resetHintToken();
    const next = roundIndex + 1;
    setRoundIndex(next);
-   const { board: b, meta: m } = createRound(next, explicitTarget);
+   const { board: b, meta: m } = createRound(next);
    setBoard(b);
    setMeta(m);
    ...
  }, [roundIndex]);
```

### 버그 메커니즘
1. HUD의 `<Ctrl onClick={actions.newRound}>` 와 GameOverPanel의 `<button onClick={onNewRound}>` 에서 React는 클릭 시 `actions.newRound(event)`로 SyntheticMouseEvent를 첫 번째 인자로 전달
2. 기존 시그니처의 `(explicitTarget?: TargetSum)` 파라미터가 SyntheticMouseEvent로 채워짐
3. `createRound(next, SyntheticMouseEvent)` → 내부에서 `target = explicitTarget ?? random` → target이 SyntheticMouseEvent가 됨
4. `setMeta({ ..., target: SyntheticMouseEvent, ... })`
5. `App.tsx`의 `{t('todayBoard')} · target {state.meta.target}` 평가 시 SyntheticMouseEvent가 React child로 렌더됨
6. `throwOnInvalidObjectType` → React Minified Error #31 → 페이지 깨짐

### 검증 (production build 기준)
- ✅ 타이머 120s 소진 → 게임 종료 팝업 표시
- ✅ "새 판" 클릭 → 새 보드 정상 렌더 (검은 화면 없음)
- ✅ "시작" 클릭 → 새 라운드 정상 시작
- ✅ `NO ERRORS!` in browser console

### 영향 범위
- `useGame.ts`의 다른 액션들 (`start`, `pauseToggle`, `setDrag`, `clearDrag`, `commitDrag`, `useHint`)은 모두 `() => void` 시그니처로 안전
- `actions.newRound`의 `explicitTarget` 파라미터는 어디서도 실제로 사용되지 않음 (외부 호출자 없음)
- 타입 시스템(TS)이 런타임에 잡지 못함 (SyntheticEvent는 `unknown`으로 통과)

### 부수 관찰 (수정 불필요)
- dev mode (StrictMode)에서 팝업이 늦게/안 뜨는 현상은 별개의 StrictMode 이중 마운트 quirk. 프로덕션 동작에는 영향 없음.
- Vercel 배포본 (`index-BQaNYj0e.js`)은 같은 버그 포함 → 재배포 필요

### 배포
```bash
# 수정된 코드는 dist/에 빌드되어 있음 (index-snSJS2x9.js)
# 다음 명령으로 Vercel 배포:
cd /Users/mac/work/sigco-fruitbox
vercel deploy --prod
```

### 작업 중 만든 임시 파일 (모두 원본 복원됨)
- `/tmp/App.tsx.bak`, `/tmp/HUD.tsx.bak`, `/tmp/BoardView.tsx.bak`, `/tmp/GameOverPanel.tsx.bak`
- `/tmp/react-dom-orig.js` (react-dom.cjs 백업)
- `/tmp/repro.js`, `/tmp/repro-dev.js`, `/tmp/inspect-*.js`, `/tmp/console-listener.js`, `/tmp/verify-fix.js` (Playwright 디버그 스크립트)

### 디버깅 방법 (다음에 또 같은 버그 잡을 때)
1. `node_modules/react-dom/cjs/react-dom.development.js`의 `throwOnInvalidObjectType` 함수에 console.log 추가 → offending object의 constructor, target, returnFiberType, returnFiberClass 출력
2. `npm run dev` 후 Playwright로 재현 → 어떤 div의 child로 SyntheticEvent가 들어가는지 추적
3. JSX에서 `{...}` 안에 들어가는 표현식 중 `state.X.Y` 형태가 있고 그게 prop/event handler 시그니처와 충돌하는지 확인
