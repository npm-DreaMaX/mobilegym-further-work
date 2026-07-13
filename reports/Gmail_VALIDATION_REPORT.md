# Gmail App and Benchmark Suite — Validation Report

**Date:** 2026-07-13 · **Branch:** `app-gmail` · **App:** `apps/Gmail/` · **Suite:** `bench_env/task/gmail/` (exactly 15 tasks)

## 1. Delivery summary

Implemented a persistent Gmail simulator with Inbox, global search, thread detail, Starred, Drafts, Sent, All Mail, Trash, Spam, labels, compose, reply, forward, multi-recipient To/Cc/Bcc fields, read/unread, star, importance, attachments, archive/restore, dangerous-action confirmation, empty states, and history-aware back navigation.

Seed state includes multiple senders and threads, read/unread and starred variants, attachments, archived/trash/spam mail, and existing labels. User-visible strings are centralized in `apps/Gmail/res/strings.ts` and consumed through `useGmailStrings`.

## 2. App registration and state contract

- `apps/Gmail/manifest.ts` exports `manifest` with `id: 'gmail'`.
- `apps/Gmail/GmailApp.tsx` has a default export and matches the OS `apps/*/*App.tsx` discovery pattern.
- No `os/` registry change was required.
- `bench_env/env/mobile_gym.py` maps display name `Gmail` to app id `gmail`, so benchmark `OPEN_APP` recognizes it.
- Runtime observation: `window.__OS__.openApp('gmail')` opened Inbox and `window.__SIM__.getState().apps.gmail.user.email` returned `alex.morgan@gmail.com`.

Persistent business state exposed under `apps.gmail`:

- `threads`, `messages`, `drafts`, `sent`, `labels`
- `search.query`, `search.resultThreadIds`
- `_temp.lastSearchQuery`, `_temp.lastOpenedThreadId`, `_temp.lastOpenedMessageId`, `_temp.searchHistory`, `_temp.openedThreadIds` as trajectory evidence

Generated IDs and timestamps use `TimeService`; judges identify newly created records by init/current ID differences rather than hardcoded generated IDs.

## 3. Real UI flow and state mutation audit

| Capability | Real UI path | Observable state change |
|---|---|---|
| Search and open | Search icon → query → result → thread | `search.*`, `_temp.lastOpened*`, `_temp.openedThreadIds`, `thread.isRead` |
| Star / unstar | List or thread star button | `threads[id].isStarred` |
| Important | Thread → More → Mark important | `threads[id].isImportant` |
| Mark unread | List or thread More menu | `threads[id].isRead=false` |
| Archive | Thread toolbar → Archive | `threads[id].folder='archive'` |
| Trash | Thread toolbar → Delete | `threads[id].folder='trash'` |
| Restore | Trash → thread → Restore | `threads[id].folder='inbox'` |
| Spam | Thread → More → Report spam → confirm | `threads[id].folder='spam'` |
| Permanent delete | Trash → thread → More → Delete forever → confirm | removes thread and its messages |
| Apply/remove label | Thread → More → Labels | `threads[id].labelIds` |
| Create label | Labels dialog → Create label | new `labels` record plus thread label ID |
| Save draft | Compose → fill To/Cc/Bcc/subject/body → Save draft | new `drafts` record; no sent record |
| Send | Compose → fill fields → Send | new mirrored `sent`/`messages` records and new archived thread |
| Reply | Thread → Reply → compose → Send | new sent message appended to original thread |
| Forward | Thread → Forward → recipient/note → Send | new sent message/thread containing quoted source |

No benchmark relies on a hidden control, toast-only behavior, or synthetic state bypass. Navigation/action controls use declared trigger/action IDs. Dangerous spam and permanent-delete operations have URL-driven confirmation dialogs.

## 4. Runtime verification evidence

The production build was launched and driven through the actual browser UI with Playwright at a 412×915 mobile viewport. State was observed only through the public simulator snapshot API.

```text
OPEN True alex.morgan@gmail.com
SEARCH_OPEN {"query":"Maya Chen","result":["thread_project_atlas"],"opened":"thread_project_atlas","message":"msg_atlas_1"}
STAR_ARCHIVE True archive
RESTORE inbox
LABELS ['Work', 'Recipes']
DRAFT {"to":["maya.chen@example.com","jamie@example.com"],"cc":["finance@example.com"],"bcc":["archive@example.com"],"subject":"Atlas dinner follow-up","body":"Please review the launch notes and dinner plan."}
SEND {"to":["nora@example.com"],"cc":["jamie@example.com"],"subject":"Volunteer dinner update","body":"The volunteer dinner starts at 6 PM on Saturday."}
REPLY {"threadId":"thread_project_atlas","to":["maya.chen@example.com"],"subject":"Re: Project Atlas launch plan","body":"I reviewed the checklist and will be ready for April 18.","count":2}
FORWARD {"to":["maya.chen@example.com"],"subject":"Fwd: Quarterly finance report","hasNote":true,"hasSource":true}
SPAM spam
NO_RESULTS True
```

Representative screenshot: `/tmp/gmail-runtime/gmail-no-results.png`.

The preview process was stopped after verification. Existing launcher/theme widget 404 messages were observed in the console; they originate from the simulator's WMR widget resources and did not prevent Gmail from opening or completing any tested flow.

## 5. Benchmark tasks (exactly 15)

| # | Task ID | UI path | Primary judge evidence |
|---|---|---|---|
| 1 | `gmail.SearchSenderOpenLatestAnswerSubject` | Search Maya Chen → open result → AnswerSheet | search query/result + opened thread/message + exact subject answer |
| 2 | `gmail.SearchKeywordOpenAnswerAttachment` | Search quarterly → open result → AnswerSheet | search/open trajectory + exact attachment filename |
| 3 | `gmail.SearchAndStarEmail` | Search Project Atlas → star result | search query/result + `isStarred=true` |
| 4 | `gmail.UnstarTravelReceipt` | Find travel receipt → unstar | stable thread `isStarred: true→false` |
| 5 | `gmail.MarkQuarterlyReportUnread` | Find report → mark unread | stable thread `isRead: true→false` |
| 6 | `gmail.ArchiveProjectAtlas` | Open Atlas → Archive | stable thread `folder: inbox→archive` |
| 7 | `gmail.TrashTravelReceipt` | Open receipt → Trash | stable thread `folder: inbox→trash` |
| 8 | `gmail.RestoreTrashEmailToInbox` | Menu → Trash → thread → Restore | stable thread `folder: trash→inbox` |
| 9 | `gmail.ApplyExistingWorkLabel` | Dinner recipes → More → Labels → Work | exact existing label appended to target thread |
| 10 | `gmail.CreateRecipesLabelAndApply` | Dinner recipes → Labels → create Recipes | exactly one new named label, applied to target thread |
| 11 | `gmail.SaveExactMultiRecipientDraft` | Compose → To/Cc/Bcc/subject/body → Save | exactly one matching new draft and zero new sent mail |
| 12 | `gmail.SendExactEmail` | Compose → fields → Send | exactly one matching mirrored sent/message record and thread |
| 13 | `gmail.ReplyToProjectAtlas` | Atlas → Reply → exact body → Send | exactly one message appended to original thread |
| 14 | `gmail.ForwardQuarterlyReport` | Report → Forward → recipient/note → Send | new thread with recipient, note, and quoted source |
| 15 | `gmail.ReportSecurityAlertSpam` | Suspicious mail → More → Spam → confirm | stable thread `folder: inbox→spam` |

The two grounded query tasks reject directly guessed answers: the judge requires a matching search, matching result, opening the target thread/message, AnswerSheet submission, and exact answer. Generated record IDs are never part of the expected answer.

## 6. Setup, reset, and judge strategy

- `_post_sample` prepares required preconditions through normal app state injection: unread/starred/folder/label state is made deterministic per task.
- `__SIM__.reset()` restores `apps/Gmail/data/defaults.json`; runtime verification reset before each independent flow.
- Stable-record operations compare the target's initial and current fields.
- Create operations use ID-set differences and require exactly one matching new record while preserving pre-existing records.
- Sending requires matching entries in both `sent` and `messages`, plus an exact archived thread.
- Reply requires one appended message in the original thread and preserves all other threads.
- Forward requires a new thread and verifies recipient, `Fwd:` subject, user note, and quoted source sender/subject/body.
- `expected_changes` declares only permitted business-state effects; `_temp` trajectory and AnswerSheet state are globally ignored for side-effect cleanliness.

## 7. Navigation and interaction IDs

### transitionId (14)

`gmail.inbox.openMenu`, `gmail.header.openSearch`, `gmail.menu.openMailbox`, `gmail.menu.openInbox`, `gmail.list.openThread`, `gmail.compose.open`, `gmail.draft.open`, `gmail.thread.openMore`, `gmail.thread.openLabels`, `gmail.thread.openNewLabel`, `gmail.thread.openSpamConfirm`, `gmail.thread.openDeleteConfirm`, `gmail.thread.reply`, `gmail.thread.forward`

### actionId (23)

`gmail.list.item.star.toggle`, `gmail.list.item.unread.toggle`, `gmail.search.query.input`, `gmail.search.submit`, `gmail.thread.star.toggle`, `gmail.thread.important.toggle`, `gmail.thread.unread.toggle`, `gmail.thread.archive.submit`, `gmail.thread.delete.submit`, `gmail.thread.restore.submit`, `gmail.thread.label.apply`, `gmail.thread.label.remove`, `gmail.thread.labelName.input`, `gmail.thread.labelCreate.submit`, `gmail.thread.spam.submit`, `gmail.thread.deleteForever.submit`, `gmail.compose.to.input`, `gmail.compose.cc.input`, `gmail.compose.bcc.input`, `gmail.compose.subject.input`, `gmail.compose.body.input`, `gmail.compose.save.submit`, `gmail.compose.send.submit`

## 8. Validation results

| Check | Result |
|---|---|
| Gmail runtime UI and state verification | **PASS** — all evidence in §4 observed |
| `node scripts/build_nav_artifacts.mjs Gmail` | **PASS** — 14/14 transitions and 23/23 actions, 0 schema errors, 0 warnings |
| `node scripts/lint_store_getters.mjs Gmail` | **PASS** |
| `python -m pytest bench_env/tests/gmail/test_tasks.py -q` | **PASS** — 27 passed |
| Gmail suite discovery | **PASS** — `[gmail] (15 tasks, 0 parameterized)` |
| `npm run build` | **PASS** |
| `npm run lint` | **PASS with repository warnings** — 0 errors; Gmail's only hook-dependency warning was fixed |
| `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` | **Gmail PASS; repository command exits 2** — all 38 errors are pre-existing under `apps/Cainiao/**`; 0 Gmail errors |
| `git diff --check` | **PASS** |
| Change-boundary audit | **PASS** — confined to Gmail app/suite/tests/report and minimal `OPEN_APP` mapping |

## 9. Files and scope

Changes are restricted to:

- `apps/Gmail/**` — app manifest, entry point, navigation, resources, seed data, store, components, hooks, and pages.
- `bench_env/task/gmail/**` — suite app accessor, deterministic judges, and 15 tasks.
- `bench_env/tests/gmail/**` — 27 offline structural and positive/negative judge tests.
- `bench_env/env/mobile_gym.py` — minimal Gmail display-name → app-id mapping.
- `reports/Gmail_VALIDATION_REPORT.md` — this report.

No changes were made to `os/**`, other apps, other benchmark suites, `docs/authoring/**`, `.claude/**`, `package.json`, `package-lock.json`, or shared UI/core framework code.

## 10. Known limitations and environment notes

- Full-repository TypeScript validation remains non-green because of 38 existing errors in `apps/Cainiao/**`, outside the authorized Gmail scope. Gmail itself reports zero TypeScript errors and the production build succeeds.
- The launcher/theme WMR widget emits existing 404/widget-root console noise; Gmail remains functional.
- No external GUI model endpoint was supplied, so no costly model-agent benchmark run was performed. Runtime browser verification plus offline positive/negative judge tests cover the delivered UI and evaluation logic.

## 11. Verdict

**PASS for the Gmail deliverable.** The app is automatically discoverable, `OPEN_APP gmail` works, all key mail operations mutate real persistent state through visible UI, exactly 15 deterministic tasks are discoverable, grounded query tasks enforce search/open trajectories, navigation artifacts have no warnings/errors, and Gmail-targeted tests pass.
