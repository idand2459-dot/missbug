# MissBug — QA / Security / Regression Report

Date: 2026-10-26 · Scope: read-only audit. **No application code, data, config or dependencies were modified.**

## 1. How the app actually works (inspected)
- Express 5 (`server.js`, port **hard-coded 3030**) serves `miss-bug-starter-react/` statically. No bundler, no Vite, no test runner (`npm test` is the placeholder that exits 1).
- Frontend: global `React`/`ReactRouterDOM`/`axios`, `HashRouter`, in-browser Babel via `lib/loadBabelModules.js` (regex `^import .+ from`, so imports must stay single-line).
- Auth: `cryptr`-encrypted JSON blob in an httpOnly `loginToken` cookie (`service/auth.service.js`); secret = `process.env.SECRET1 || 'secret123'`.
- Data: `bugs.json`, `user.json` (plaintext passwords), read-modify-write with no locking.

## 2. Method / safety
- Copied `server.js`, `service/`, `package.json`, `node_modules` into a **sandbox in the session scratchpad** with disposable fixtures (admin + 4 users, 8 bugs incl. a creator-less legacy bug and a bug owned by a user on pagination page 2). Server ran there on port 3030; real `bugs.json`/`user.json` were never read-written by the server. Real files were only read (passwords not printed).
- Commands: `node sandbox/server.js` (background), `node qa.mjs` (74 HTTP checks), `node qa2.mjs` (authz re-run on clean fixtures after check B8 contaminated the first run), a Node import-resolution script. No commit/push.
- Test files (outside repo, nothing added to the repo except this report):
  `C:\Users\user\AppData\Local\Temp\claude\c--Users-user-Downloads-X5u5VzMREa3iTsO7PPma-ex-ex\5d22f904-d3ce-4d9d-9075-a6f7977b5628\scratchpad\{qa.mjs,qa2.mjs,reset.mjs,sandbox\}`

## 3. Findings (ordered by severity)

| # | Sev | Finding | Evidence / repro | Proposed fix (NOT applied) |
|---|-----|---------|------------------|----------------------------|
| F1 | **HIGH** | **Any logged-in user can overwrite any bug and steal ownership via `POST /api/bug` with a client `_id`.** `bugService.save` takes the update path when `_id` is present, and the POST handler performs no ownership check. | bob: `POST /api/bug {"_id":"b4","title":"hijack"}` → 200; alice's `b4` now title `hijack`, creator `u2` (bob). | In POST, delete `bug._id`/`createdAt` from the body (whitelist `title, description, severity, labels`). |
| F2 | **HIGH** | **Token forgeable when `SECRET1` is unset**: fallback secret `'secret123'` is public in the repo. A forged admin token was accepted. | Encrypted `{isAdmin:true}` with Cryptr('secret123') → `GET /api/user` = 200. Repo has no `.env`/`SECRET1` handling. | Require `SECRET1` (fail fast in production), set it on Render. |
| F3 | HIGH (deploy) | Port hard-coded to 3030 → will not run on Render (needs `process.env.PORT`). Also no `app.set('trust proxy',1)` and no `secure` cookie behind HTTPS proxy. | `server.js:288`. | `const port = process.env.PORT \|\| 3030`; cookie `secure: NODE_ENV==='production'`, `trust proxy`. |
| F4 | MED | Login failure returns **500** (not 401); unknown user, wrong password, empty body, deleted user all → 500 `Failed to login user`. | `POST /api/auth/login` bad creds → 500. | Map "invalid credentials" to 401, missing fields to 400. |
| F5 | MED | Signup: duplicate username → **500** (should be 409); missing/empty fields accepted (201) and **a user with `username: undefined` was persisted** in `user.json`; empty password/fullname accepted. | `POST /api/auth/signup {}` → 201. | Validate fields, 409 on duplicate. |
| F6 | MED | **Admin can delete their own account** server-side (only the React button is disabled). Matches the stated "prevent accidental self-deletion" rule only in the UI. | admin `DELETE /api/user/a1` → 200, admin gone from `user.json`. | Reject `userId === loggedinUser._id` with 400/403. |
| F7 | MED | Tokens are stateless and carry an identity snapshot: pre-logout token still works after logout (replay → 403/200 as the user); a **deleted user's token keeps working** (created bug as deleted user → 200); `isAdmin` revocation never takes effect until cookie dies. Cookie has no expiry. | Replayed token after `/logout`; token of deleted user `POST /api/bug` → 200. | Re-load user from `user.json` in a middleware; add expiry/`maxAge`. |
| F8 | MED | **Legacy bugs without `creator` cause 500** in PUT/DELETE for non-admin users (`bug.creator._id`). Admin is fine. | bob `PUT/DELETE /api/bug/bLegacy` → 500 (expected 403). Real `bugs.json` currently has no such bug, so latent. | `bug.creator?._id`. |
| F9 | MED | Malformed `visitedBugs` cookie → **500** (`JSON.parse` unguarded); a cookie that parses to an object → 500; to a string → 401 "Wait for a bit". | cookie `visitedBugs={notjson` → 500. | try/catch + `Array.isArray`. |
| F10 | MED | **No input validation on bugs.** `POST {}` → 200 saves empty bug; severity `"abc"` or labels as string → 500. `PUT` with partial body overwrites missing fields with `undefined`/`NaN`(→`null`): `{title:'only title'}` stored `severity:null`, description/labels removed. PUT labels are not trimmed/filtered as POST does. | See qa.mjs B9, B9b, B15, B15b, B15c. | Shared validator for POST/PUT. |
| F11 | LOW | `POST/…` without `Content-Type: application/json` → `req.body` undefined → destructuring crash → 500 (signup/login/bug). Malformed JSON with a JSON content-type is 400 (OK). | A2d/B9c. | Default `req.body ?? {}`. |
| F12 | LOW | Signup does **not** set the auth cookie; the client does a second `login` request (works, but not atomic). | Signup response has no `Set-Cookie`. | Acceptable; optional to set cookie in signup. |
| F13 | LOW | Plaintext passwords in `user.json` (known course limitation). **`user.json` is untracked and NOT gitignored** (root `.gitignore` only contains `node_modules/`) — risk of committing credentials. `.postman/` and `postman/` contain no password/token strings (grep). | `git check-ignore user.json` → not ignored. | Add `user.json` to `.gitignore`; later bcrypt with a migration (needs your approval). |
| F14 | LOW | Read-modify-write on JSON files without serialization → race/lost-update under concurrent requests. `GET /api/bug?pageIdx=abc` returns `[]` silently. | code review. | Optional write queue. |
| F15 | LOW (UI) | Login/signup errors only `console.error` (no user message); no redirect after login; Cancel in `prompt()` creates bug with `title:null` / edit sets severity 0; UserIndex/UserDetails lack loading/empty states; "Next Page" never disabled; `<Link>` inside `<button>`. | code review (browser not run). | UX cleanup in styling phase. |

## 4. Test matrix

Sandbox HTTP results (first run 74 checks; FAIL rows map to findings above; B10–B14 reconfirmed in the clean re-run).

| Area | Check | Status | Notes |
|---|---|---|---|
| Auth | valid login 200 + httpOnly cookie, no password in response | PASS | |
| Auth | cookie `HttpOnly; SameSite=Lax` | PASS | no `Secure`, no expiry → F3/F7 |
| Auth | invalid login → 401 | **FAIL** | 500 (F4) |
| Auth | signup creates non-admin; client `isAdmin:true` ignored | PASS | |
| Auth | duplicate username rejected appropriately | **FAIL** | 500 (F5) |
| Auth | malformed/missing signup input | **FAIL** | 201 + junk user (F5); malformed JSON → 400 PASS |
| Auth | signup→login yields cookie | PASS | via 2 calls (F12) |
| Auth | logout clears cookie header | PASS | |
| Auth | logout invalidates token server-side | **FAIL** | stateless (F7) |
| Auth | garbage / missing token → 401 | PASS | |
| Auth | forged token with default secret | **FAIL** | F2 |
| Bugs | list/details/filter/sort/pagination (size 5) | PASS | list without `pageIdx` returns all bugs |
| Bugs | missing bug → 404 (GET/PUT/DELETE) | PASS | |
| Bugs | anonymous create/edit/delete → 401, file unchanged | PASS | |
| Bugs | creator taken from token; client `creator` ignored | PASS | |
| Bugs | POST with `_id` cannot touch others' bugs | **FAIL** | F1 |
| Bugs | regular user edit/delete other's bug → 403 | PASS | clean re-run |
| Bugs | owner edit/delete OK, creator unchanged | PASS | |
| Bugs | admin edit/delete others | PASS | |
| Bugs | creator-less legacy bug, non-admin → 403 | **FAIL** | 500 (F8) |
| Bugs | visited-bugs limit (3 then 401) | PASS | |
| Bugs | malformed visited cookie handled | **FAIL** | F9 |
| Bugs | validation / malformed fields, `bugs.json` stays valid JSON | **FAIL** (validation) / PASS (file stays valid) | F10 |
| Users | `GET /api/user` 401 / 403 / sanitized admin list | PASS | no password fields |
| Users | `DELETE /api/user/:id` 401 / 403 / 404 | PASS | |
| Users | blocked when user owns a bug (incl. page-2 bug) | PASS | `bugService.query({})` has `pageIdx` undefined → **not paginated**, covers all records. Latent coupling: it would break if `query` gains a default page size. Legacy creator-less bugs are skipped safely (`bug.creator &&`). |
| Users | self-delete prevented | **FAIL** (server) | UI-only (F6) |
| Users | delete persists to `user.json`, response has no password, removed from list | PASS | |
| Users | deleted user cannot log in | PASS (rejected, but as 500 — F4) | |
| Users | deleted user's existing token rejected | **FAIL** | F7 |
| Frontend | all 21 imports resolve with exact case/path; none import from `react`; all single-line (loader-safe) | PASS | script |
| Frontend | HashRouter routes `/ /bug /bug/:id /about /login /user /user/list` defined; hooks via global `React` | PASS (static) | |
| Frontend | Logout updates header without reload (`setLoggedinUser(null)`); admin-only nav + `UserIndex` guard | PASS (static) | server enforces regardless |
| Frontend | Refresh restores user from sessionStorage (display only) | PASS (static) | stale after cookie loss; no 401 handling |
| Frontend | pages render without console errors in a real browser | **NOT RUN** | no browser executed; see manual checks |
| Frontend | loading / empty / error states | PARTIAL | BugList/BugDetails OK; Login errors silent, Users/Profile lack states (F15) |
| Automated | existing test suite | **NOT RUN** | none exists (`npm test` is a stub) |

## 5. Remaining risks
Items F1–F3 must be resolved before deployment. Deployed secret handling, HTTPS cookie behaviour behind Render's proxy, and concurrency on JSON files were not tested live.

## 6. Manual browser / Postman checks (to finish what could not be executed)
1. `node server.js`, open `http://localhost:3030/#/` with DevTools Console open; visit every route; expect no red errors.
2. Login with a wrong password → confirm 4xx (currently 500); check Application→Cookies: `loginToken` HttpOnly.
3. Signup new user → header shows name without reload; Logout → header returns to "Login" immediately and cookie is cleared.
4. Log in as regular user: no "Manage Users" link; open `#/user/list` directly → "Admin access only"; in Postman `GET /api/user` → 403.
5. Postman (logged in as user A): `POST /api/bug` with `{"_id":"<other user's bug id>","title":"x"}` — confirm F1 on a **copy** of data.
6. Refresh `#/user` while logged in; delete the cookie and refresh → UI still shows logged in (display-only state).
7. Details page: open 4 different bugs within 7 seconds → 4th shows error.

## 7. Files created
Only `QA_REPORT.md` in the repo. Scratch tests/fixtures listed in §2 (outside the repo).

## 8. Summary (עברית)
**מה עבר:** הרשאות בסיסיות בצד השרת (401 לאנונימי, 403 למשתמש רגיל על עריכה/מחיקה של באג של אחר ועל ניהול משתמשים), שדה `creator` נקבע מהטוקן, רשימת משתמשים לא מחזירה סיסמאות, חסימת מחיקת משתמש שיש לו באגים (גם בעמוד 2 – השאילתה לא מדופדפת), סינון/מיון/דפדוף, ופתרון כל ה-imports בפרונט.

**בעיות שנמצאו:** (1) קריטי: אפשר לדרוס באג של אחר ולקחת בעלות עליו דרך `POST` עם `_id`; (2) קריטי: אם `SECRET1` לא מוגדר, סוד ברירת המחדל `secret123` מאפשר זיוף טוקן אדמין; (3) הפורט קבוע ל-3030 – לא יעבוד ב-Render; (4) לוגין/סיינאפ מחזירים 500 במקום 401/409, ואין ולידציה (נשמר משתמש ללא username); (5) אדמין יכול למחוק את עצמו בשרת; (6) הטוקן לא מתבטל בלוגאאוט ולא במחיקת משתמש; (7) באגים ישנים בלי `creator` גורמים ל-500; עוגיית `visitedBugs` פגומה גורמת ל-500; (8) `user.json` עם סיסמאות גלויות לא ב-`.gitignore`.

**מה נשאר:** בדיקה בדפדפן אמיתי (לא הורצה), ובדיקות על סביבת Render עצמה. לא שיניתי קוד – כל התיקונים ממתינים לאישורך.

**האם מוכן לעיצוב ו-Render?** לעיצוב – כן, אפשר להתחיל (הבעיות הן בשרת ולא מונעות עבודת UI). ל-Render – **עדיין לא**, עד שיתוקנו לפחות 1–3 ו-8.
