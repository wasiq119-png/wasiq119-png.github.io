# MEMORY.md — wasiq119-png.github.io

Persistent project memory for the portfolio-engineer agent. Update this file
before considering any task done. Never delete closed bug entries — mark them.

## 1. Identity
- Repo: `wasiq119-png.github.io`, branch `main`, pushes to `origin/main`.
- Host: GitHub Pages, default `https://wasiq119-png.github.io/` URL. No `CNAME`
  file present — custom domain confirmed removed (matches spec).
- Stack: 100% static HTML/CSS/JS, no framework, no build step, no npm deps.
- Owner: Wasiq Mudasar, Angular/Full-Stack engineer. Site targets desktop +
  mobile (iPhone and Android/Pixel Chrome are the tested targets).

## 2. File map (confirmed 2026-08-24, matches spec — no drift)
- `index.html` — single page, all content (34,586 bytes)
- `style.css` — all styling, CSS custom props in `:root` + a HARDENING
  utility-class block (32,287 bytes, 260 open / 260 close braces — balanced)
- `script.js` — all behavior: typewriter, reveal, particles, nav highlight,
  modals, project filter, copy-to-clipboard, canvas throttle (9,884 bytes,
  `node -c` parses clean)
- `assets/images/` — exactly 5 files, all real and all referenced:
  `wasiq.jpg`, `Inseyab Certification_page-0001.jpg`,
  `TV x Internship Certificate_page-0001.jpg`, `Microservices_app.png`,
  `favicon.ico`. No orphans, no legacy template assets.
- `service-list.html` — confirmed absent (deleted per 48186b9).
- Untracked in repo root (not part of site): `.claude/` (agent config incl.
  this agent's spec at `.claude/agents/portfolio-engineer.md`), `.clineignore`.
- `.gitignore` covers OS junk, `*.lnk`, and common credential-filename globs
  (`*Credentials*.txt`, `*password*.txt`, `*secret*.txt`, `.env*`) — good
  baseline, no secrets tracked as of this snapshot.

## 3. Work history (git log, newest first) — do not redo or regress
- **2463c51** `fix(mobile): move overflow-x:hidden from html to body to fix
  fixed dock nav` — NOT previously recorded in agent memory (drift found this
  session). Root cause: `overflow-x` on the root `<html>` element breaks the
  containing block for `position:fixed` descendants on several mobile
  browsers, causing the floating dock to scroll with the page instead of
  staying pinned. One-line CSS fix. **Add this to the permanent record.**
- **b69751f** `fix(mobile): eliminate dock roaming` — removed
  `backdrop-filter` on touch (solid bar instead), `scroll-behavior: auto` on
  touch (no smooth-scroll pill sweep), froze canvas background + parallax
  grid on touch, `viewport-fit=cover` + `interactive-widget=resizes-visual`,
  `safe-area-inset-bottom` on the dock.
- **424ea88** `fix(mobile): stop floating dock jitter` — replaced
  scroll-event nav-highlight with `IntersectionObserver`, rAF + pass-throttled
  parallax, 100svh fallbacks, canvas reduced to 40 particles / ~30fps on
  phones.
- **48186b9** purged legacy Bootstrap template assets (vendor css/js, icofont
  fonts ~4MB, `assets/scss` tree, placeholder images) + orphaned
  `service-list.html`; wired favicon.
- **67a0bcc** purged ~210 inline styles into CSS utility classes, removed
  purple/pink residues, added fluid `clamp()` typography, fixed a missing
  closing brace on `.copy-hint:hover` and a stray trailing brace. Always
  re-check brace balance after CSS edits (this session: confirmed 260/260,
  still balanced).

## 4. Design system (protect unless changed with intent)
Palette (2026 Neo-Brutalist/Obsidian):
- `--bg-color:#06070B` `--card-bg:#0D0F17` `--text-main:#FFFFFF`
  `--text-muted:#94A3B8`
- `--accent-1:#4F46E5` (indigo) `--accent-2:#06B6D4` (cyan)
  `--accent-3:#10B981` (emerald)
- Glass: `--glass-bg`, `--glass-border: rgba(255,255,255,0.08)`
- Banned residuals: `#8b5cf6`, `#a855f7`, `#ec4899`, `rgba(168,85,247,...)` —
  confirmed ZERO occurrences across index.html/style.css/script.js this
  session.
Typography: 'Plus Jakarta Sans' (body) + 'Space Grotesk' (headings), fluid
`clamp()`. SEO: canonical, OG, Twitter Card, JSON-LD Person/ProfilePage graph
present — not regressed.

## 5. VERIFICATION PROTOCOL RESULTS — 2026-08-24 audit (read-only pass)

| Check | Result |
|---|---|
| Inline `style=` in index.html | **0** (clean — matches 67a0bcc claim) |
| Purple/pink residuals (`#8b5cf6`,`#a855f7`,`#ec4899`,`rgba(168,85,247`) | **0** across all 3 files |
| `assets/` references resolve to real files | **All resolve** — `index.html` (favicon, wasiq.jpg profile+OG, 2 cert images via `%20`-encoded paths matching literal space filenames on disk), `style.css` (`Microservices_app.png`), `script.js` (none referenced) |
| CSS brace balance (style.css) | **260 open / 260 close** — balanced |
| JS parse (`node -c script.js`, node v24.15.0) | **OK**, no syntax errors |
| HTML UTF-8 mojibake scan (`Ã`/`Â` sequences) | **0** matches — clean |
| Local preview (`npx serve`, python unavailable — see below) | `/` → **200**, `/style.css` → **200**, `/script.js` → **200**, `/assets/images/wasiq.jpg` → **200** |

Note: `python -m http.server` failed — this machine's `python`/`python3` are
Windows Store execution-alias stubs, not a real interpreter. Fell back to
`npx --yes serve`, which worked. **Use `npx serve` for local preview on this
machine going forward**, not `python -m http.server`.

## 6. Security scan — 2026-08-24

- **`target="_blank"` anchors in index.html**: 5 total.
  - Line 106 "View CV" — had `rel="noopener"` already. OK.
  - Line 110 GitHub icon link — had `rel="noopener"` already. OK.
  - Line 111 LinkedIn icon link — had `rel="noopener"` already. OK.
  - Line 517 LinkedIn detail-card link — **was MISSING `rel="noopener"`**.
    **FIXED this session** (trivial, obviously-safe edit per test protocol;
    left unstaged, visible in `git diff`).
  - Line 529 GitHub detail-card link — **was MISSING `rel="noopener"`**.
    **FIXED this session** (same fix, unstaged).
  - Status: all 5 now carry `rel="noopener"` in the working tree (uncommitted).
- **Third-party loads**: `fonts.googleapis.com` / `fonts.gstatic.com`
  (preconnect + stylesheet, Google Fonts), `cdnjs.cloudflare.com` (Font
  Awesome 6.4.0 full CSS bundle). No `<script src="https://...">` third-party
  JS found in index.html.
  - **Open recommendation (not auto-fixed)**: consider self-hosting Font
    Awesome instead of the cdnjs full bundle — reduces third-party trust
    surface and avoids pulling an entire icon library over CDN for the
    handful of icons actually used.
- **GitHub Pages headers**: cannot set CSP/COOP/COOP-style headers directly
  on GitHub Pages (static hosting, no custom response headers). Noted, not
  actionable without moving off Pages or fronting with something like
  Cloudflare.
- **Google Drive CV link exposure** (line 105, "View CV" button): URL is
  `https://docs.google.com/document/d/1tdH16.../edit?usp=sharing&ouid=...`.
  This is an **edit-mode** shared link, not a view-only or export link. If
  the underlying Drive sharing permission is "Anyone with the link can
  edit" rather than "can view", any site visitor could modify or corrupt
  the CV document. **Flagged, not auto-fixed** — recommend either (a)
  changing Drive share permission to view-only, or (b) switching the link
  to a `/export?format=pdf` direct-download URL instead of the editor URL.
  Human action required (Drive permissions aren't in this repo).
- No inline event handlers found echoing unescaped user input; the
  `onclick="copyText(...)"` handlers on lines 526/538 use static, hardcoded
  string literals (own profile URLs), not user-controlled data — not an XSS
  vector.
- No credentials found in tracked files. `.gitignore` already excludes
  common credential filename patterns.

## 7. Open bugs

### OPEN — Mobile dock jitter/roaming, visual confirmation still outstanding
Status as of 2026-08-24: **code-level review only, NOT visually verified**
(no Android/Chrome device or browser driver available in this session).

Code-level findings (all mitigations claimed in b69751f/424ea88/2463c51 are
**confirmed present in current code**):
- `style.css` `.floating-nav`: `position: fixed`, `bottom: max(1rem,
  env(safe-area-inset-bottom))` — present.
- `@media (pointer: coarse)` block (style.css ~line 1446): `html {
  scroll-behavior: auto }`, `.floating-nav` backdrop-filter removed + solid
  `rgba(10,12,18,0.98)` background, `.nav-item` transition reduced to
  color/opacity only, tooltip `::before` hidden — all present exactly as
  the commit messages describe.
- `script.js`: `isCoarsePointer()` helper (pointer:coarse matchMedia) gates
  the canvas — on touch, particles are drawn **once** and the
  `requestAnimationFrame` animate loop is never started (frozen background,
  confirmed at script.js ~line 210-219). Parallax grid loop
  (`parallaxLoop`, ~line 241) is likewise skipped entirely when
  `isCoarsePointer()` is true.
- Nav active-state uses `IntersectionObserver` (`navSpy`, ~line 224), not a
  scroll listener — matches the 424ea88 claim.
- Viewport meta tag (index.html line 6) has both `viewport-fit=cover` and
  `interactive-widget=resizes-visual`.
- `overflow-x: hidden` confirmed on `body`, not `html` (2463c51 fix present).

**Conclusion**: every mitigation the commit messages claim is actually
present in the working code — this is not a case of a commit message
overselling an incomplete fix. However, none of this has been visually
verified on a real Android/Pixel Chrome device this session. Next agent
with device/browser access should do a real visual pass before this can be
marked CLOSED.

### CLOSED — Inline styles / purple-pink palette regression
Verified clean this session (0 inline styles, 0 palette residuals). Keep
checking after any future CSS/HTML edit — do not regress.

### CLOSED (this session) — Missing rel="noopener" on 2 detail-card anchors
Fixed lines 517 and 529 of index.html. Left unstaged per test-run
constraints; needs to be committed by a session with commit permission.

### OPEN — Font Awesome CDN dependency
Not fixed, tracked as a recommendation (see Security scan above).

### OPEN — Google Drive CV link is edit-mode, not view-only
Not fixed, requires a human to change Drive sharing settings or swap the
link for an export URL (see Security scan above).

## 8. Approved fix patterns
- CSS edits: always recount `{` vs `}` after touching `style.css`.
- JS edits: always run `node -c script.js` after touching `script.js`.
- HTML edits: grep for `Ã`/`Â` mojibake sequences after touching
  `index.html` to confirm UTF-8 stayed clean.
- Local preview on this machine: `npx --yes serve -l <port> .` — `python`
  is a Windows Store stub here and does not work; don't rely on
  `python -m http.server` without first confirming a real Python install.
- External anchors: any new `target="_blank"` anchor must ship with
  `rel="noopener"` (or `noreferrer`) in the same edit — verify with
  `grep -n 'target="_blank"' index.html` before considering an HTML change
  done.

## 9. Test-run note
This MEMORY.md was created during a validation run of the
portfolio-engineer agent spec (`.claude/agents/portfolio-engineer.md`).
Commit/push were disabled for that run — the two `rel="noopener"` fixes
above are present in the working tree but **not committed**. A future
session with commit permission should stage `index.html` and commit them
(e.g. `fix(security): add rel=noopener to detail-card external links`),
then continue from the open-bugs list in section 7.
