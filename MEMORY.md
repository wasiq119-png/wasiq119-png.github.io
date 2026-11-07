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

## 2. File map (re-confirmed 2026-08-24 resync, matches spec — no drift)
- `index.html` — single page, all content (34,653 bytes as of the latest
  commit on `main`; grew slightly from the `rel="noopener"` + pinch-zoom
  viewport-meta fixes)
- `style.css` — all styling, CSS custom props in `:root` + a HARDENING
  utility-class block (32,287 bytes, 260 open / 260 close braces — balanced,
  re-verified this resync)
- `script.js` — all behavior: typewriter, reveal, particles, nav highlight,
  modals, project filter, copy-to-clipboard, canvas throttle (9,884 bytes,
  `node -c` parses clean, re-verified this resync)
- `assets/images/` — exactly 5 files, all real and all referenced:
  `wasiq.jpg`, `Inseyab Certification_page-0001.jpg`,
  `TV x Internship Certificate_page-0001.jpg`, `Microservices_app.png`,
  `favicon.ico`. No orphans, no legacy template assets.
- `service-list.html` — confirmed absent (deleted per the "purge legacy
  bloat" commit, see §3 for current hash).
- **Tracked as of this resync**: `.claude/agents/portfolio-engineer.md` and
  `MEMORY.md` itself were committed in the "chore(agent)" commit (see §3) —
  they are no longer untracked. Only `.clineignore` remains untracked in the
  repo root (not part of the site; a tool-config file, correctly left out of
  version control per spec §7).
- `.gitignore` covers OS junk, `*.lnk`, and common credential-filename globs
  (`*Credentials*.txt`, `*password*.txt`, `*secret*.txt`, `.env*`) — good
  baseline, no secrets tracked as of this snapshot.

## 3. Work history (git log, newest first) — do not redo or regress

> **HASH-REWRITE NOTICE (found during 2026-08-24 resync)**: this repo's
> reflog shows a `filter-branch: rewrite` event. Every commit from the
> "hardening pass" onward was rewritten with a **new SHA**, same messages
> and content. The OLD hashes previously recorded in memory/agent-prompt
> docs (`67a0bcc`, `48186b9`, `424ea88`, `b69751f`, `2463c51`, plus an
> intermediate `70caf09`) are now **dangling / unreachable from `main`**
> (`git branch --contains <old-hash>` returns nothing). They still exist as
> loose objects (visible via `git log --oneline --all` / reflog) but do NOT
> appear in `git log` on `main`. **Use the current hashes below.** If you
> ever see one of the old hashes cited elsewhere, treat it as the same
> historical work under a different SHA, not as missing/undone work.

- **8c95464** `chore(agent): add portfolio-engineer custom agent + project
  MEMORY.md` — persisted the agent spec (`.claude/agents/portfolio-engineer.md`)
  and this MEMORY.md into the tracked repo (previously untracked / test-run
  only). *(current SHA of what was originally committed as `956c403`.)*
- **020ca00** `fix(mobile): lock pinch-zoom to stop fixed dock/nav drift` —
  `maximum-scale=1.0, user-scalable=no` added to the viewport meta tag.
  Root cause: `position:fixed` elements (dock, cyber-canvas, perspective
  grid) recompute against the layout viewport mid-pinch-gesture, producing
  visible drift/resnap; locking zoom removes the gesture entirely.
  *(current SHA of what was originally committed as `e1c8822`.)*
- **22b786c** `fix(security): add rel=noopener to LinkedIn/GitHub external
  links` — closed the two detail-card anchors (lines 517, 529) that were
  still missing `rel="noopener"` after an earlier audit; all 5
  `target="_blank"` anchors in `index.html` now carry `rel="noopener"`
  (verified this resync). *(current SHA of what was originally committed as
  `70caf09`.)*
- **e0bbd63** `fix(mobile): move overflow-x:hidden from html to body to fix
  fixed dock nav` — root cause: `overflow-x` on the root `<html>` element
  breaks the containing block for `position:fixed` descendants on several
  mobile browsers, causing the floating dock to scroll with the page instead
  of staying pinned. One-line CSS fix; confirmed present in current
  `style.css` (`body { overflow-x: hidden }`, `html` has no `overflow-x`).
  *(current SHA of what was originally committed as `2463c51`.)*
- **a0f26ce** `fix(mobile): eliminate dock roaming - remove backdrop blur on
  touch for solid bar, disable smooth-scroll pill sweep, keep frozen bg` —
  removed `backdrop-filter` on touch (solid bar instead), `scroll-behavior:
  auto` on touch (no smooth-scroll pill sweep), froze canvas background +
  parallax grid on touch, `viewport-fit=cover` +
  `interactive-widget=resizes-visual`, `safe-area-inset-bottom` on the dock.
  Confirmed present this resync in `style.css` `@media (pointer: coarse)`
  block (~line 1446). *(current SHA of what was originally committed as
  `b69751f`.)*
- **1101e5e** `fix(mobile): stop floating dock jitter` — replaced
  scroll-event nav-highlight with `IntersectionObserver`, rAF + pass-throttled
  parallax, 100svh fallbacks, canvas reduced to 40 particles / ~30fps on
  phones. *(current SHA of what was originally committed as `424ea88`.)*
- **91ab7b9** purged legacy Bootstrap template assets (vendor css/js, icofont
  fonts ~4MB, `assets/scss` tree, placeholder images) + orphaned
  `service-list.html`; wired favicon. *(current SHA of what was originally
  committed as `48186b9`.)*
- **2f642b5** purged ~210 inline styles into CSS utility classes, removed
  purple/pink residues, added fluid `clamp()` typography, fixed a missing
  closing brace on `.copy-hint:hover` and a stray trailing brace. Always
  re-check brace balance after CSS edits (this resync: confirmed 260/260,
  still balanced). *(current SHA of what was originally committed as
  `67a0bcc`.)*

Chronological summary for a fresh agent (oldest → newest, current SHAs):
`2f642b5` → `91ab7b9` → `1101e5e` → `a0f26ce` → `e0bbd63` → `22b786c` →
`020ca00` → `8c95464`.

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
    Fixed and **committed** in `22b786c` (was staged/unstaged in an earlier
    test-run; now landed on `main`).
  - Line 529 GitHub detail-card link — **was MISSING `rel="noopener"`**.
    Fixed and **committed** in `22b786c` (same commit).
  - Status: all 5 `target="_blank"` anchors in `index.html` carry
    `rel="noopener"` — verified in the tracked, committed file this resync
    (`grep -n 'target="_blank"' index.html` shows `rel="noopener"` on every
    match). Fully closed, nothing left uncommitted.
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

### ADDRESSED (not yet visually reconfirmed) — Mobile dock jitter/roaming
Status as of 2026-08-24 resync: **four separate hardening commits have now
targeted this specific complaint** (`2f642b5`→`91ab7b9`→`1101e5e`→`a0f26ce`
→`e0bbd63`→`020ca00`, current SHAs, see §3), each fixing a distinct
mechanism. This is a broader/deeper fix set than the single "dock roaming"
commit that was open at the last handoff. **Still no real-device visual
confirmation has been performed in any session** (no Android/Chrome device
or browser driver available) — so this stays open-but-downgraded rather than
CLOSED, per SOP §6 ("if you changed UX, confirm visual/behavior... or
explicitly flag not visually verified").

Code-level findings, all confirmed present in the current tracked code this
resync:
- `style.css` `.floating-nav`: `position: fixed`, `bottom: max(1rem,
  env(safe-area-inset-bottom))` — present.
- `@media (pointer: coarse)` block (style.css ~line 1446, from `a0f26ce`):
  `html { scroll-behavior: auto }`, `.floating-nav` backdrop-filter removed
  + solid `rgba(10,12,18,0.98)` background, `.nav-item` transition reduced
  to color/opacity only, tooltip `::before` hidden — present.
- `body { overflow-x: hidden }` / `html` has no `overflow-x` (from
  `e0bbd63`) — fixes `position:fixed` containing-block breakage that was
  causing the dock to scroll with the page on some mobile browsers.
- Viewport meta (index.html line 6) now has `maximum-scale=1.0,
  user-scalable=no` (from `020ca00`, pinch-zoom lock) in addition to the
  earlier `viewport-fit=cover` + `interactive-widget=resizes-visual` — this
  targets a *different* drift mechanism (fixed elements recalculating mid
  pinch-gesture), independent of the scroll/backdrop fixes above.
- `script.js`: `isCoarsePointer()` helper (pointer:coarse matchMedia) gates
  the canvas — on touch, particles are drawn once, `requestAnimationFrame`
  loop never starts (frozen background). Parallax grid loop likewise
  skipped when `isCoarsePointer()` is true.
- Nav active-state uses `IntersectionObserver`, not a scroll listener.

**Conclusion**: every mitigation the commit messages claim is actually
present in the working code, and the fix set now covers all four levers
listed in the original "possible next levers" list (dual bottom/vv-vh units
→ overflow-x fix; smooth-scroll → scroll-behavior:auto; canvas-on-touch →
isCoarsePointer freeze; pinch-gesture recalculation → zoom lock). **A future
agent with real Android/Pixel Chrome or iPhone access should still do one
visual pass to close this out formally**, but there is no known remaining
code-level cause to chase blindly — do not re-open this by guessing at new
mechanisms without a fresh repro.

### CLOSED — Inline styles / purple-pink palette regression
Verified clean this session (0 inline styles, 0 palette residuals). Keep
checking after any future CSS/HTML edit — do not regress.

### CLOSED — Missing rel="noopener" on 2 detail-card anchors
Fixed lines 517 and 529 of index.html; committed in `22b786c`. Verified in
tracked file this resync — fully closed, no further action.

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

## 9. Test-run note (historical) + 2026-08-24 resync note

This MEMORY.md was originally created during a validation run of the
portfolio-engineer agent spec. That run's `rel="noopener"` fixes and the
agent-spec/MEMORY.md files themselves were later committed (see §3:
`22b786c`, `8c95464`) by a session with commit permission — the
"not committed" caveat that used to live here no longer applies.

**2026-08-24 resync (this session)**: compared this file, the agent prompt
file (`.claude/agents/portfolio-engineer.md`), and `git log` against the
actual working tree. Found and corrected:
- §3 was missing 5 newer commits (`a0f26ce`, `e0bbd63`, `22b786c`,
  `020ca00`, `8c95464`) — added, verified each against the working code.
- §2 incorrectly listed `.claude/` and `MEMORY.md` as untracked — they are
  now tracked/committed; only `.clineignore` remains untracked.
- §6 rel=noopener status was stale ("unstaged") — now committed and closed.
- §7's dock-roaming bug is now addressed by 4 additional targeted commits
  beyond what was open at the last handoff — downgraded from fully-open to
  "addressed, pending visual reconfirmation" (see §7), not closed outright
  since no real-device pass has happened yet.
- **New finding, not previously recorded anywhere**: the repo's reflog shows
  a `git filter-branch: rewrite` event that changed the SHA of every commit
  from "hardening pass" onward. All old hashes cited in the agent prompt
  file's WORK HISTORY (§3 there) are dangling/unreachable from `main`. See
  the HASH-REWRITE NOTICE in §3 above for the old→new mapping. The agent
  prompt file itself has been updated with a pointer to this note (small,
  factual edit only — not a full rewrite of that file).
This session made no code changes to index.html/style.css/script.js — this
was a memory-resync-only task, no commit/push performed (per instructions).
