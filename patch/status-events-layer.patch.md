# Status Events Layer Patch

> **Current Version:** 0.1.0
> **Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7
> **Status:** Completed
> **Target Design:** [../design/status-events.design.md](../design/status-events.design.md)
> **Full history:** [../changelog/status-events.changelog.md](../changelog/status-events.changelog.md)

## Context

Nodeclaw-Status currently uses Upptime for uptime checks, response-time history, incidents, and the static status page. The user now wants the status repo to support public communication events similar in spirit to a status page announcement/report feed: announcements, minor notices, scheduled work, and operational reports that can be created from GitHub Issues without becoming Upptime `Active Incidents`.

## Analysis

The preview proved that Upptime `introMessage`, `customHeadHtml`, and `customBodyHtml` can affect the generated status page. The preview also proved ordinary issue/maintenance semantics can be misleading because they may show under incident-oriented sections. A separate NodeClaw-owned Status Events layer is needed.

## Change Items

### 1. Clean preview config

- **Target artifact:** `.upptimerc.yml`
- **Change type:** replacement
- **Before:** temporary `customHeadHtml` and `customBodyHtml` preview blocks containing `Method 2` / `Method 3` copy
- **After:** remove preview blocks and keep only the real `introMessage` baseline until production renderer is added

### 2. Add governance artifacts

- **Target artifacts:** `docs/`, `design/`, `changelog/`, `phase/`, `patch/`, `TODO.md`
- **Change type:** additive
- **Before:** no dedicated Nodeclaw-Status governance set for status events
- **After:** subproject-owned governance chain records design, phase order, TODO tracking, and patch review surface

### 3. Add issue authoring contract

- **Target artifact:** `.github/ISSUE_TEMPLATE/status-event.md`
- **Change type:** additive
- **Before:** only Upptime/default issue templates exist; no NodeClaw event template
- **After:** status event issue template defines labels, metadata, public-safety guidance, and examples

### 4. Add status event compiler

- **Target artifact:** `scripts/generate-status-events.mjs`
- **Change type:** additive
- **Before:** no compiler turns GitHub Issues into public event data
- **After:** compiler reads `status:event` issues, validates metadata, and writes `api/status-events.json`

### 5. Add generated event data contract

- **Target artifact:** `api/status-events.json`
- **Change type:** additive
- **Before:** Upptime-generated `api/` only contains uptime/response data
- **After:** NodeClaw-owned `api/status-events.json` contains public-safe event records for the renderer

### 6. Add status page renderer

- **Target artifact:** `.upptimerc.yml`
- **Change type:** replacement/additive
- **Before:** no production event renderer
- **After:** `customHeadHtml` and `customBodyHtml` render status event sections from JSON without raw issue HTML

### 7. Add workflow

- **Target artifact:** `.github/workflows/status-events.yml`
- **Change type:** additive
- **Before:** only Upptime-generated workflows exist and warn against direct edits
- **After:** NodeClaw-owned custom workflow regenerates status event JSON on issue changes/manual dispatch

## Verification

- Parsed `.upptimerc.yml` successfully.
- Ran compiler syntax and fixture checks successfully.
- Parsed local and public `api/status-events.json` successfully.
- Verified `Setup CI`, fixed `Status Events CI`, and verified the fixed run passed.
- Verified GitHub Pages deployment after publishing `api/status-events.json` to `gh-pages`.
- Verified public page contains status event renderer and whole-page NodeNetwork theme markers.
- Verified headless browser-rendered DOM shows Issue #6 under `Announcements` and does not show `Active Incidents`.

## Rollback Approach

- Remove or disable `.github/workflows/status-events.yml`.
- Remove production `customHeadHtml` / `customBodyHtml` event renderer from `.upptimerc.yml`.
- Leave Upptime `sites` and normal status monitoring untouched.
- Keep `api/status-events.json` inert if no renderer loads it.
