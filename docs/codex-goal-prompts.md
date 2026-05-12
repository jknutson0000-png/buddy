# Codex CLI `/goal` Meta-Prompts for `cis` and `buddy`

A reference set of three high-leverage `/goal` prompts to use with the Codex
CLI's experimental `/goal` slash command across the `jknutson0000-png/cis` and
`jknutson0000-png/buddy` projects.

`/goal` was added in `codex-cli` 0.128.0 (April 30, 2026). Enable it from
`/experimental` inside Codex, or add `goals = true` under `[features]` in
`~/.codex/config.toml`.

---

## Why `/goal` instead of a normal prompt

A normal Codex prompt runs one turn and stops. `/goal` attaches a persistent
objective to the thread so the agent keeps working — across pauses, restarts,
and TUI exits — until the goal's validation loop says "done." The right shape
is bigger than a single prompt, smaller than an open-ended backlog, and has a
verifiable stop condition you would otherwise have to hand-check every cycle.

Subcommands: `/goal <objective>` to set, `/goal` to view, `/goal pause`,
`/goal resume`, `/goal clear`.

## Anatomy of a strong `/goal` prompt

The OpenAI docs recommend the pattern:

> `[Accomplish X] using [tools/approaches]. Validate with [command/method].
> Stop when [measurable condition met].`

Every prompt below covers all five components:

1. **Objective** — what to achieve, in one sentence.
2. **Scope boundaries** — what NOT to change, to prevent scope creep.
3. **Validation loop** — concrete commands or artifacts that prove progress
   between checkpoints.
4. **Stop condition** — measurable, multi-part, no judgment calls.
5. **Operating constraints** — what tools/dependencies/files are allowed.

---

## Option 1 — `buddy`: PWA install + offline reliability hardening

**Repo:** `jknutson0000-png/buddy`

**Why this is goal-shaped.** `README.md` and `CLAUDE_CODE_HANDOFF.md` both
flag that install, notifications, and location behave differently per phone
browser and need HTTPS. The fix is iterative — tweak manifest, rebuild, run
Lighthouse, repeat — until the PWA score stabilizes. That loop is exactly what
`/goal` exists for.

**Prompt:**

```text
/goal Make Job Buddy a Lighthouse-perfect installable PWA on Chrome Android
and iOS Safari without changing the visible UI. Work iteratively in
index.html, manifest.webmanifest, service-worker.js, and asset paths needed
for install. Do NOT change layout, button sizing, color palette, copy, or
feature surface — only fix manifest fields, icon sizes, scope/start_url,
service worker fetch/cache strategy, and HTTPS-related guards. After each
change run `npm.cmd run build`, serve `dist/` over HTTPS via a tunnel (or
document the exact tunnel command in dist/INSTALL_TEST.md), then capture a
Lighthouse PWA + Best Practices report into lighthouse-reports/ named with
the timestamp. Validate by: (1) Lighthouse PWA category = 100 and
"Installable" passes in two consecutive reports, (2) service-worker.js
precaches the full app shell and the offline page loads with network
throttled to Offline, (3) `npm.cmd run build` exits 0 and dist/ contains
every file referenced from index.html, (4) DevTools Application pane shows
the manifest with no warnings on Chrome desktop. Stop when all four
conditions hold and a final report is written to
docs/pwa-hardening-report.md listing what changed file-by-file and what
cannot be solved without a native shell. Do not add analytics, frameworks,
or build tools beyond the existing vite devDependency. Pause and ask before
any change that would alter the visible UI.
```

---

## Option 2 — `buddy`: "Today" screen + reusable job templates

**Repo:** `jknutson0000-png/buddy`

**Why this is goal-shaped.** `CLAUDE_CODE_HANDOFF.md` lists the next two
improvements as "clearer Today screen" and "job templates for common handyman
jobs." Both ship as one connected feature, both have visible behavior worth
checkpointing, and both must preserve existing localStorage data — a perfect
case for a persistent objective with a strict no-data-loss invariant.

**Prompt:**

```text
/goal Add a "Today" screen and a reusable job-template system to Job Buddy
without breaking any existing saved jobs or timers. Work in index.html,
styles.css, and app.js only — do not introduce a framework, bundler change,
or new dependency. The Today screen lists every job whose next reminder,
departure window, or arrival window falls in the current local day, sorted
by next event time, using the same big-button style already in use. The
template system stores a named JSON template (title, default duration,
reminder cadence, checklist items) in localStorage under a new key, lets the
user create a job from a template in two taps from the home screen, and
lets the user save the current job as a new template. Migration rule:
existing jobs in localStorage stay readable and editable; never delete or
rewrite a key the user already has. Validate at every checkpoint by:
(1) loading the app fresh in a private window with a seeded localStorage
snapshot of pre-existing jobs and confirming they still render, (2) creating
a job from a template and confirming the timer plus checklist behave
identically to a hand-built job, (3) the Today screen updating live when
the local clock crosses a job's next event time (set a test job 60 seconds
out), (4) `npm.cmd run build` exits 0 and dist/ boots with zero console
errors. Stop when all four conditions hold AND a one-page user-facing
WHATS_NEW.md is written in the plain "What you did / Why it matters / What
I need to do next" tone from CLAUDE_CODE_HANDOFF.md. Do NOT touch
service-worker caching, manifest, color palette, or the arrival/departure
modal layouts.
```

---

## Option 3 — `cis`: brand consistency + production-ready cleanup

**Repo:** `jknutson0000-png/cis` (targets the current `main` state)

**Why this is goal-shaped.** `main` currently holds `gallery.html` (Genesis
EHS marketing page using Unsplash placeholders), a generic "Built with AI
Studio" README, a 4.4 MB SuperMill PDF, a 1-byte `prints` file, and a Ford
Transit research markdown. The repo reads as mid-pivot. Cleanup needs
persistent attention across every page and every asset, with a clean
"site is one coherent brand, no 404s, no off-brand artifacts" stop
condition that is too tedious to verify by hand each round.

**Prompt:**

```text
/goal Make the cis repo deploy as a single coherent Genesis EHS brochure
site with no broken assets or off-brand artifacts. First discover the
current pages by listing every .html file plus everything gallery.html and
its siblings link to. For each page: ensure the navigation, footer brand
string, color tokens (--primary, --accent, --gold), and Inter font load are
consistent; replace every images.unsplash.com <img src> with either a local
placeholder under assets/ plus a "TODO: replace with real photo" comment,
or a real local photo if one already exists in the repo; fix every internal
link so the network tab shows zero 404s when the site is served via
`python -m http.server 8000` from the repo root. Move
SUPERMILL_SYSTEM_WITH_SEPARATE_MANUAL_SO (1).pdf and
ford-transit-250-mounting-points-research.md into a new archive/ folder and
add archive/README.md noting they are kept for reference and are not part
of the live site. Replace the top-level README with a real project README
(one paragraph: what the site is, how to preview locally, how to deploy).
Validate after each page change by: (1) running `python -m http.server 8000`
and opening every page from the index nav with zero console errors and
zero 404s in the network tab, (2) `grep -R "unsplash" .` returns zero hits
outside archive/, (3) `grep -R "AI Studio" .` returns zero hits, (4) every
<img> has a non-empty alt attribute. Stop when all four checks hold AND
docs/site-map.md lists every live page with its purpose in one line each.
Do NOT introduce a framework, build step, CMS, or external CDN — keep it
static HTML/CSS/JS that opens with a plain HTTP server. Do NOT delete
anything; only move questionable files into archive/.
```

---

## How to drive these from the Codex CLI

```text
codex
/experimental                    # enable goals if not already on
/goal <paste the full prompt>    # set the goal
/goal                            # check current goal + status
/goal pause                      # stop work without losing state
/goal resume                     # continue
/goal clear                      # remove the goal when done
```

Each prompt above is self-contained — paste the whole block after `/goal `.
If progress drifts, refine the goal text rather than layering ad-hoc
instructions on top.

## Sources

- [Slash commands in Codex CLI](https://developers.openai.com/codex/cli/slash-commands)
- [Follow a goal — Codex use cases](https://developers.openai.com/codex/use-cases/follow-goals)
- [Codex CLI features](https://developers.openai.com/codex/cli/features)
