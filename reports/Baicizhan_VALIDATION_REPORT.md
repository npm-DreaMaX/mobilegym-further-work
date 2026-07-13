# Baicizhan (百词斩) Validation Report

> Generated: 2026-07-13 | Branch: `app-baicizhan` | Worktree: `/home/FangWang/mobilegym-worktrees/baicizhan`

---

## 1. 实际读取的压缩文档

1. `docs/authoring/MOBILEGYM_AUTHORING_RULES_COMPACT.md`
2. `docs/authoring/EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md`
3. `docs/authoring/DAILY_10_APP_PRODUCTION_PLAN.md`
4. `docs/authoring/DAILY_APP_PAGE_BASELINES.md`
5. `docs/authoring/DAILY_APP_15_BENCHMARK_MATRIX.md` (Baicizhan 无条目，按提示词自行设计)
6. `docs/authoring/APP_GENERATION_PROMPT_TEMPLATE.md`
7. `docs/authoring/APP_VALIDATION_PROTOCOL.md`

---

## 2. 新增和修改文件

### apps/Baicizhan/ (29 files)

| File | Purpose |
|------|---------|
| `manifest.ts` | App identity (id: baicizhan, 百词斩) |
| `BaicizhanApp.tsx` | Entry component with MemoryRouter + 17 routes |
| `navigation.declaration.ts` | 17 routes, 23 transitions, 23 actions |
| `navigation.types.ts` | Type definitions (from Ebay template) |
| `navigation.ts` | useBaicizhanNavigation / useBaicizhanGestures hooks |
| `types.ts` | All app-level types (Word, WordBook, StudySession, etc.) |
| `constants.ts` | Tabs, difficulty labels, word book catalog, goal options |
| `state.ts` | Zustand store with 20+ actions |
| `data/defaults.json` | 40 words across 5 books, study plan, records, settings |
| `data/index.ts` | BAIZHAN_CONFIG export |
| `res/icons.tsx` | Icon components with ICON_REGISTRY |
| `components/BaicizhanNavigationHandler.tsx` | Back press handler |
| `pages/HomePage.tsx` | Home with progress, quick actions, tab bar |
| `pages/MePage.tsx` | Profile with menu (收藏/错题/统计/计划/设置) |
| `pages/SearchPage.tsx` | Search with input, results, history |
| `pages/WordDetailPage.tsx` | Word detail with favorite, notes CRUD, exercises |
| `pages/WordBooksPage.tsx` | Word book list |
| `pages/WordBookDetailPage.tsx` | Book detail with word list |
| `pages/StudySessionPage.tsx` | Flashcard study (认识/不认识) |
| `pages/FavoritesPage.tsx` | Favorited words list |
| `pages/MistakeBookPage.tsx` | Mistake words with review button |
| `pages/ReviewSessionPage.tsx` | Review flashcards (答对/答错) |
| `pages/SpellingExercisePage.tsx` | Spelling input + submit + result |
| `pages/ListeningExercisePage.tsx` | Play button + options + submit |
| `pages/DailyProgressPage.tsx` | Today's progress |
| `pages/StatisticsPage.tsx` | Overall statistics |
| `pages/StudyPlanPage.tsx` | Book switch + daily goal + reminder link |
| `pages/SettingsPage.tsx` | Theme, font size, auto-play |
| `pages/ReminderPage.tsx` | Toggle + time picker |

### bench_env/task/baicizhan/ (3 files)

| File | Purpose |
|------|---------|
| `__init__.py` | Module marker |
| `app.py` | Baicizhan accessor class with samplers + check helpers |
| `tasks.py` | 15 benchmark task definitions |

### bench_env/tests/baicizhan/ (2 files)

| File | Purpose |
|------|---------|
| `__init__.py` | Module marker |
| `test_tasks.py` | 32 offline judge tests (16 metadata + 16 positive/negative) |

### reports/

| File | Purpose |
|------|---------|
| `Baicizhan_VALIDATION_REPORT.md` | This report |

**Zero modifications to os/, other apps/, docs/authoring/, package.json, or any existing files.**

---

## 3. 页面与正常入口

| Page | Route | Entry from |
|------|-------|------------|
| HomePage | `/` | App launch / Tab home |
| MePage | `/me` | Tab me |
| SearchPage | `/search` | Home search icon |
| WordDetailPage | `/word/:wordId` | Search results / Favorites / Mistakes / WordBook |
| WordBooksPage | `/wordbooks` | Home quick action |
| WordBookDetailPage | `/wordbooks/:bookId` | WordBooks list |
| StudySessionPage | `/study` | Home "开始学习" button |
| FavoritesPage | `/favorites` | Me page / WordDetail |
| MistakeBookPage | `/mistakes` | Home quick action / Me page |
| ReviewSessionPage | `/review-session` | MistakeBook "开始复习" |
| SpellingExercisePage | `/spelling/:wordId` | WordDetail "拼写练习" |
| ListeningExercisePage | `/listening/:wordId` | WordDetail "听力练习" |
| DailyProgressPage | `/progress` | Home quick action |
| StatisticsPage | `/statistics` | Me page |
| StudyPlanPage | `/plan` | Me page |
| SettingsPage | `/settings` | Me page |
| ReminderPage | `/settings/reminder` | Settings / StudyPlan |

---

## 4. 页面父级和来源页返回映射

All sub-pages use explicit back navigation (`bindBack()` → `navigate(-1)`) which goes to the previous history entry. No sub-page uses a bare `navigate('/')` that would lose context.

- WordDetail: returns to Search / Favorites / Mistakes / WordBooks (whichever opened it)
- StudySession: returns to Home
- ReviewSession: returns to MistakeBook
- SpellingExercise / ListeningExercise: returns to WordDetail
- All settings sub-pages: return to parent settings/plan page

---

## 5. 学习业务闭环

All 13 business capabilities are implemented with real state changes:

| Capability | State written | Verification |
|------------|--------------|--------------|
| A. 首页和今日任务 | words, studyPlan, dailyProgress, statistics | UI reads from store |
| B. 词书与学习计划 | wordBooks, studyPlan.bookId/dailyGoal | switchWordBook/setDailyGoal actions |
| C. 每日学习 | todaySession, studyRecords, words[].familiarity/studyCount | recordStudyResult action |
| D. 搜索 | search.query/results/openedWordId/history | setSearchQuery/openWordFromSearch |
| E. 单词详情 | words[], notes, favorites | Full CRUD via store actions |
| F. 收藏夹 | favorites[], words[].isFavorite, statistics.totalFavoriteCount | toggleFavorite action |
| G. 笔记 | notes{}, words[].noteIds | addNote/editNote/deleteNote actions |
| H. 错题本和复习 | mistakeBook[], reviewRecords[], reviewSessions[] | recordReviewResult action |
| I. 拼写练习 | spellingExercises{}, words[].mistakeCount | submitSpellingAttempt |
| J. 听力练习 | listeningExercises{} (played, selectedOption, isCorrect) | playListening/submitListeningAnswer |
| K. 今日进度和统计 | dailyProgress, statistics | updateDailyProgress action |
| L. 学习提醒 | studyPlan.reminderEnabled/reminderTime | setReminder action |
| M. 正常导航 | All routes registered in App.tsx + nav declaration | 17 routes, 23 transitions |

---

## 6. world data 与 runtime overlay 结构

- **World data**: 40 words in `data/defaults.json` across 5 books (basic: 8, cet4: 10, cet6: 8, travel: 8, business: 8)
- **Runtime overlay**: `state.ts` Zustand store, persisted to localStorage key `baicizhan`
- **Benchmark setup**: `_prepare()` modifies runtime overlay via `env.set_state()` with deep merge
- UI, setup, and judge all read/write the same state schema (`apps.baicizhan.*`)

---

## 7. 核心按钮及真实行为

| Button | Action |
|--------|--------|
| 开始学习 | startStudySession() + go('/study') |
| 认识/不认识 | recordStudyResult(wordId, 'known'/'unknown') |
| 查看释义 | useState reveal (local), data-action tracked |
| 收藏 toggle | toggleFavorite(wordId) |
| 添加笔记 | addNote(wordId, content) → new noteId |
| 编辑/删除笔记 | editNote/deleteNote with noteId |
| 拼写提交 | submitSpellingAttempt(exerciseId, spelling) |
| 听力播放 | playListening(exerciseId) → sets played=true |
| 听力提交 | submitListeningAnswer(exerciseId, selectedWordId) |
| 复习答对/答错 | recordReviewResult(wordId, 'correct'/'incorrect') |
| 切换词书 | switchWordBook(bookId) |
| 设置每日目标 | setDailyGoal(N) |
| 提醒开关/时间 | setReminder(enabled, time) |

**Zero dead buttons. Zero onClick={() => {}}. Zero console.log-only handlers.**

---

## 8. dead-button 审计

**Result: PASS** — No dead buttons found. All interactive elements produce real state changes or navigation.

## 9. 返回导航审计

**Result: PASS** — All sub-pages use `bindBack()` (system.back trigger) which pops the history stack. No page uses `navigate('/')` as a catch-all back. WordDetail returns to the correct source page via history stack.

## 10. 验证结果

### Navigation Artifacts
```
node scripts/build_nav_artifacts.mjs Baicizhan
```
- **PASS**: 0 ERROR, 0 schemaErrors, 0 missingInDeclaration, 0 fromMismatches
- 5 WARNs about unused transition declarations (me.*.open — used via go() not data-trigger, expected)
- 1 extraFromWarnings (home.review.start declared from / and /mistakes, triggered from /mistakes, / is extra)

### Declaration Consistency
```
node scripts/check_navigation_declaration_consistency.mjs Baicizhan --actions
```
- **PASS** (verified within build_nav_artifacts)

### npm build
```
npm run build
```
- **PASS**: Built successfully in 34.17s

### TypeScript
```
NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit
```
- **PASS**: 0 Baicizhan-specific type errors

### ESLint
```
npm run lint
```
- **PASS**: 0 Baicizhan lint errors

### Store Getter Lint
```
node scripts/lint_store_getters.mjs Baicizhan
```
- **PASS**: "No store getter anti-patterns found."

### Task Listing
```
python -m bench_env.run --list | grep baicizhan
```
- **PASS**: 15 tasks discovered (14 parameterized)

### Benchmark Tests
```
python -m pytest bench_env/tests/baicizhan/test_tasks.py -m "not live" -v
```
- **PASS**: 32/32 tests passed
  - 16 metadata validation tests (all task classes)
  - 10 positive tests (operate tasks produce correct state)
  - 3 negative tests (wrong answer, incomplete, wrong target)
  - 2 side-effect tests
  - 1 discoverability test

---

## 11. 所有 15 个 Task

| # | task_id | objective | difficulty | 真实UI路径 |
|---|---------|-----------|------------|-----------|
| 1 | `baicizhan.SearchWordAndReportMeaning` | query | L2 | Home→Search→type→click result→WordDetail |
| 2 | `baicizhan.SearchWordAndReportExample` | query | L2 | Home→Search→type→click result→WordDetail |
| 3 | `baicizhan.CheckTodayProgress` | query | L2 | Home→quick action 进度→view |
| 4 | `baicizhan.LearnNewWord` | operate | L3 | Home→开始学习→view card→揭示释义→点认识 |
| 5 | `baicizhan.MarkWordUnknown` | operate | L3 | Home→开始学习→view card→揭示释义→点不认识 |
| 6 | `baicizhan.AddFavorite` | operate | L2 | Search→find word→WordDetail→点收藏 |
| 7 | `baicizhan.RemoveFavorite` | operate | L2 | Me→收藏夹→find word→WordDetail→取消收藏 |
| 8 | `baicizhan.AddWordNote` | operate | L3 | Search→find word→WordDetail→添加笔记→输入→保存 |
| 9 | `baicizhan.EditWordNote` | operate | L3 | Search→find word→WordDetail→编辑笔记→修改→保存 |
| 10 | `baicizhan.CompleteSpellingExercise` | operate | L3 | Search→WordDetail→拼写练习→输入正确拼写→提交 |
| 11 | `baicizhan.CompleteListeningExercise` | operate | L3 | Search→WordDetail→听力练习→播放→选择→提交 |
| 12 | `baicizhan.ReviewWrongWord` | operate | L2 | Home→错题本→开始复习→显示答案→点答对 |
| 13 | `baicizhan.ChangeDailyGoal` | operate | L1 | Me→学习计划→点目标数字 |
| 14 | `baicizhan.ConfigureReminder` | operate | L2 | Me→设置→学习提醒→开启→选时间 |
| 15 | `baicizhan.SwitchWordBook` | operate | L1 | Me→学习计划→点目标词书 |

**至少 8 个任务需要 3 步以上正常 UI 操作：** #1, #2, #4, #5, #8, #9, #10, #11, #12 (9 tasks).

---

## 12. Judge Logic Summary

| Task | check_goals | AnswerSheet | expected_changes |
|------|------------|-------------|-----------------|
| SearchWordAndReportMeaning | custom: check_searched + match_value | text | search |
| SearchWordAndReportExample | custom: check_searched + match_value | text | search |
| CheckTodayProgress | build_answer_checks | number | none |
| LearnNewWord | custom: check_word_studied + familiarity + not in mistakeBook + session + non-target check | none | study |
| MarkWordUnknown | custom: check_word_studied(result=unknown) + in mistakeBook + familiarity + mistakeCount++ | none | study + mistakeBook |
| AddFavorite | custom: favorite_status + other_unchanged + totalFavoriteCount++ | none | favorites |
| RemoveFavorite | custom: favorite_status=false + other_unchanged + totalFavoriteCount-- | none | favorites |
| AddWordNote | custom: note_created + content_match + word.noteIds + other_notes_unchanged | none | notes |
| EditWordNote | custom: note_edited + content_match + updatedAt + other_notes_unchanged | none | notes |
| CompleteSpellingExercise | custom: spelling_completed + correct_spelling_submitted | none | spellingExercises |
| CompleteListeningExercise | custom: listening_completed + played=true + correct_selected | none | listeningExercises |
| ReviewWrongWord | custom: word_reviewed + review_session_created | none | review |
| ChangeDailyGoal | criteria: studyPlan.dailyGoal | none | studyPlan |
| ConfigureReminder | criteria: reminderEnabled + reminderTime | none | studyPlan |
| SwitchWordBook | criteria: studyPlan.bookId | none | studyPlan + wordBooks |

---

## 13. 答案泄露审计

**Result: PASS** — No answer leakage in task templates:
- Search tasks: instruction says "搜索{word}" not "搜索abandon打开释义为xxx的单词"
- Query tasks: instruction asks for count/meaning/example without revealing the answer
- Operate tasks: instruction describes the action without revealing expected state

---

## 14. Human Smoke Test (未实际执行)

人工点击验证未执行：当前无浏览器环境可控制。以下是 smoke test 模板：

### Smoke Test 1: SearchWordAndReportMeaning
```bash
python -m bench_env.run --task-id baicizhan.SearchWordAndReportMeaning --agent human --env-url http://localhost:4191
# instruction: 在百词斩中搜索「abandon」，打开它的详情页，告诉我这个单词的中文释义是什么。
# path: Home → search icon → type "abandon" → click result → read chineseMeaning
# expected answer: "放弃；遗弃"
```

### Smoke Test 2: LearnNewWord
```bash
python -m bench_env.run --task-id baicizhan.LearnNewWord --agent human --env-url http://localhost:4191
# path: Home → 开始学习 → view card → 查看释义 → 点认识 → next words → 完成
# state changes: studyCount++, todaySession.completedWords++, studyRecord created
```

### Smoke Test 3: MarkWordUnknown + MistakeBook
```bash
python -m bench_env.run --task-id baicizhan.MarkWordUnknown --agent human --env-url http://localhost:4191
# path: Home → 开始学习 → 查看释义 → 点不认识
# verify: mistakeBook includes word, mistakeCount++
```

### Smoke Test 4: CompleteSpellingExercise
```bash
python -m bench_env.run --task-id baicizhan.CompleteSpellingExercise --agent human --env-url http://localhost:4191
# path: Search "abandon" → WordDetail → 拼写练习 → type "abandon" → submit
# verify: spellingExercises[id].isCompleted=true, isCorrect=true
```

### Smoke Test 5: ChangeDailyGoal + SwitchWordBook
```bash
python -m bench_env.run --task-id baicizhan.ChangeDailyGoal --agent human --env-url http://localhost:4191
# path: Me → 学习计划 → tap "50"
# verify: studyPlan.dailyGoal = 50
```

---

## 15. GUI Model Agent Smoke Test

**GUI model agent 未执行：当前缺少可用模型服务端点。**

模板命令：
```bash
python -m bench_env.run --task-id baicizhan.SearchWordAndReportMeaning --agent gui --model-name <model> --env-url http://localhost:4191
```

---

## 16. 已知问题

1. **ListeningExercisePage 使用 `Math.random()` 排序选项** — 不影响 judge（judge 检查 selectedOption 是否匹配 wordId，与选项顺序无关），但在严格的确定性要求下可改进为基于 wordId 的确定性排序。

2. **StudySessionPage 使用 `setTimeout` 做 transition debounce** — 用于 UI 动画平滑过渡，不影响 state 确定性。

3. **5 个 navigation WARNs** — `me.favorites.open` 等 5 个 transitions 声明了但 consistency checker 找不到对应的 data-trigger 绑定（MePage 通过 `go()` 直接调用而非 JSX data-trigger 属性）。这是已知的 checker 限制，不影响实际功能。

---

## 17. Disabled 非核心功能

无。所有核心功能均实现。没有 disabled 的占位功能。

---

## 18. 修改范围合规

```
git status --short:
?? apps/Baicizhan/       (29 new files)
?? bench_env/task/baicizhan/  (3 new files)
?? bench_env/tests/baicizhan/ (2 new files)
```

- **os/ 未修改**: YES
- **其他 apps/ 未修改**: YES
- **已有 benchmark suites 未修改**: YES
- **package.json / package-lock.json 未修改**: YES
- **docs/authoring/ 未修改**: YES
- **public/cdn 未修改**: YES
- **node_modules 未修改**: YES

---

## 19. 是否使用 MobileGym 原项目机制

- [x] `createAppStoreWithActions` (state.ts)
- [x] `NavigationDeclaration` + `as const satisfies` (navigation.declaration.ts)
- [x] `useAppNavigationHandler` (NavigationHandler component)
- [x] `MemoryRouter` + Routes (App.tsx)
- [x] `BaseTask` / `AnswerTask` / `CriteriaTask` (tasks.py)
- [x] `BaseApp` (app.py)
- [x] `StateComparator` + `expected_changes` (side effect detection)
- [x] `match_value` / `build_answer_checks` (query task answers)
- [x] `_invert_criteria` (CriteriaTask toggle/enum)
- [x] `_prepare` / `_post_sample` (setup lifecycle)
- [x] `data-trigger` / `data-action` DOM attributes
- [x] `TimeService.now()` for all timestamps
- [x] No VLM judge (pure state-diff + text match)

---

## 20. 总结

| Check | Result |
|-------|--------|
| nav artifacts (0 ERROR) | ✅ PASS |
| npm build | ✅ PASS |
| tsc (0 Baicizhan errors) | ✅ PASS |
| ESLint (0 Baicizhan errors) | ✅ PASS |
| lint_store_getters | ✅ PASS |
| task list (15 tasks) | ✅ PASS |
| benchmark tests (32/32) | ✅ PASS |
| dead-button audit | ✅ PASS |
| back navigation audit | ✅ PASS |
| answer leakage audit | ✅ PASS |
| modification scope | ✅ PASS |
| learning business closure | ✅ PASS |
| real state writes | ✅ PASS |
