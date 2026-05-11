# CLAUDE.md

Guidance for AI assistants working in the **Job Buddy** repository.

## What this app is

Job Buddy is a mobile-first **installable web app (PWA)** for handyman
workers — designed especially for users with ADHD. It runs entirely in the
browser with `localStorage` for persistence; there is no backend.

Core features the app must keep working:

- Multiple per-job **timers** with optional repeat and escalating alarm
  intensity.
- **Loud, persistent reminder alarms** (audio + vibration + Web
  Notifications) that escalate the longer they are ignored.
- **Job-site location alerts** via `navigator.geolocation.watchPosition` —
  fires arrival and departure events when crossing a per-job radius.
- **Departure ("leaving") checklist** modal that opens automatically on
  geofence exit.
- Per-job status (`Not Started`, `In Progress`, `Waiting`, `Done`,
  `Follow Up Needed`) and free-form notes.
- Installable on phones via Web App Manifest and a service worker for
  offline use.

## Tech stack

- **Zero framework.** Vanilla HTML, CSS, and ES2020 JavaScript.
- `package.json` exists only to declare a tiny Node build script and pin
  Vite as a dev dependency (Vite is not actually used today — see "Build").
- Deployed to **Vercel** (`vercel.json`); build output is `dist/`.

## File map

```
index.html             Page shell, header, job-rail layout, modal mounts
styles.css             All styling (mobile-first; large tap targets)
app.js                 Entire app: state, render, timers, alarms, geofence
manifest.webmanifest   PWA install metadata (theme, icons, scope)
service-worker.js      Cache-first SW; cache name "job-buddy-v2"
scripts/build-static.js  Copies the static files listed below into dist/
assets/                Icons (180/192/512) + workbench.jpg header image
dist/                  Build output (committed; Vercel serves from here)
vercel.json            buildCommand=npm run build, outputDirectory=dist
package.json           devDependency: vite ^5.4.0 (currently unused)
.gitignore             node_modules/, .vercel/, output/, .env*, *.log
CLAUDE_CODE_HANDOFF.md Legacy handoff notes (kept for context)
CLAUDE_CODE_PROMPT.txt Original kickoff prompt for Claude Code (legacy)
README.md              Short user-facing description
```

If you add a new top-level static asset that must ship to production,
**also add it to the `items` array in `scripts/build-static.js`** and to
`APP_FILES` in `service-worker.js` (and bump `CACHE_NAME`).

## Run, build, deploy

### Run locally

```bash
python -m http.server 5177
# then open http://127.0.0.1:5177/
```

The user works on Windows; the handoff doc uses `python -m http.server 5177`
and `npm.cmd run build`. Either form is fine.

**Why a server, not a `file://` open?** Service workers, the install
prompt, the Notifications API, and Geolocation all require a secure
context. Locally, `http://127.0.0.1` is treated as secure. In production
the site must be HTTPS.

### Build

```bash
npm run build
```

This runs `node scripts/build-static.js`, which:

1. Removes `dist/`.
2. Copies `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`,
   `service-worker.js`, and `assets/` into `dist/`.

There is no bundler, transpiler, or minifier. Source files are shipped
verbatim. **Keep it that way unless the user explicitly asks for a build
pipeline.**

### Deploy

Vercel picks up `vercel.json`: build command `npm run build`, output
directory `dist`, and SPA-style rewrites of every path to `/index.html`.

## Architecture inside `app.js`

`app.js` is intentionally one file. Important conventions:

- **State shape.** A single top-level `state` object holds `jobs`,
  `selectedJobId`, `activeAlarm`, `departureJobId`, `currentPosition`,
  and `locationMessage`. Persisted to `localStorage` under
  `STORAGE_KEY = "job-buddy-state-v1"`. If you change the shape in a
  breaking way, bump the version suffix and write a migration in
  `normalizeState`.
- **Normalization.** `normalizeState`, `normalizeTimer`, and
  `normalizeCheck` defensively coerce loaded data. New fields must default
  safely there or older saved state will break for existing users.
- **Render model.** `render()` rewrites the relevant DOM via
  `innerHTML`. There is no virtual DOM. Event handling uses **delegation**
  through `document.addEventListener` on `click`, `change`, `input`, and
  `submit`, dispatching by `data-action` / `data-form` attributes. When
  adding UI, add a `data-action="..."` attribute and a branch inside
  `handleClick` / `handleChange` / `handlePanelSubmit`.
- **HTML escaping.** All user-supplied strings rendered via
  template literals must go through `escapeHtml()` or `escapeAttr()`. The
  `innerHTML` render style makes this non-negotiable.
- **Timers.** Driven by `setInterval(tick, 1000)`. Each timer stores
  `nextDueAt` (epoch ms) when running; remaining seconds are derived. On
  expiry, `triggerTimerAlarm` flips `alarmActive` and sets `state.activeAlarm`.
- **Alarm escalation.** `updateAlarmLoop` increases `intensity` (1–5)
  based on elapsed time and shortens both the audio gap and notification
  gap. Audio uses a `WebAudio` square-wave beep pattern;
  `navigator.vibrate` is invoked when available.
- **Geofence.** `startLocationWatch` calls `watchPosition`. On each
  position update, distance to each job's site is computed with the
  haversine formula in `distanceMeters`. State machine: `site.wasInside`
  is tracked per job; transitions fire `triggerArrival` /
  `triggerDeparture`.
- **Wake lock.** `updateWakeLock` acquires a screen wake lock whenever
  an alarm is active or any timer is running. Releases otherwise.
- **Install prompt.** Captures `beforeinstallprompt` for Android; iOS
  falls back to the manual "Share → Add to Home Screen" instruction.

## Conventions and gotchas

- **One file per concern, not per component.** Don't introduce a build
  system or module bundler to split files. If `app.js` grows uncomfortably
  large, the user prefers a single split into named files loaded as plain
  `<script>` tags before reaching for tooling.
- **No external runtime dependencies.** No npm install at runtime, no
  CDN scripts in `index.html`. Stay self-contained.
- **Mobile-first.** Tap targets must remain large. The header and
  primary buttons use `.button.primary` / `.button.secondary` /
  `.button.danger` classes — reuse them.
- **Service worker cache.** Any change to a file listed in `APP_FILES`
  requires bumping `CACHE_NAME` in `service-worker.js`, or returning
  users will see stale content. Currently `"job-buddy-v2"`.
- **`localStorage` is the database.** No server, no sync. Data is
  per-device. Don't add code that assumes otherwise.
- **HTTPS is required in production** for installability, notifications,
  geolocation, and the wake lock. Local `http://127.0.0.1` is the only
  exception.
- **Tests.** There are none. There's no test runner configured. If a
  change is non-trivial, manually exercise: add a job → add a timer →
  let it expire → verify the alarm overlay, sound, and notification →
  resolve via Done/Snooze/Help/Blocked. Also test the departure modal
  and the "Use my current spot" location flow.

## Working style for this owner

The owner is **not a coder**. Default communication format:

- **What you did** — one short line.
- **Why it matters** — one short line.
- **What I need to do next** — concrete, e.g. "Run `npm run build`, then
  refresh the phone."

Do the work directly when possible. Avoid framework names, jargon, and
abstract design discussions. Short answers beat long ones.

## Source of truth for older context

`CLAUDE_CODE_HANDOFF.md` was the original handoff brief. It is kept for
historical context; **this `CLAUDE.md` supersedes it** for ongoing work.
If they disagree, this file wins.
