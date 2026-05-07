# Status Timeline and Incident History Patch

> **Current Version:** 0.2.3
> **Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7
> **Status:** Active local implementation; release verification pending
> **Target Design:** [../design/status-events.design.md](../design/status-events.design.md)
> **Full history:** [../changelog/status-events.changelog.md](../changelog/status-events.changelog.md)

## Context

NodeClaw Status already has an Issue-driven Status Events layer for announcements, notices, maintenance, operational reports, and manual incident reports. Upptime can record check history such as HTTP `502` down samples in Git history, but the public page needs a clear 24-hour uptime timeline and daily incident archive so short observed outages remain visible even when summary badges round to `100%`.

Public release checks also showed that `https://darkwingtm.github.io/Nodeclaw-Status/api/status-events.json` and `api/status-timeline/index.json` returned HTTP `404` before this local fix. The checked remote `gh-pages` root did not contain an `api/` directory, so NodeClaw-owned API JSON must be republished after Upptime static-site deploys replace the page output.

## Analysis

The change is additive. Upptime remains the monitor and current-state/status-summary owner, while NodeClaw adds a static timeline data contract, compiler, workflow, renderer, and API publication restoration path that make observed outage history and uptime percentage context visible. The renderer does not query raw Git history at page load; the NodeClaw-owned compiler normalizes Git/Upptime check data into public-safe JSON first.

The v0.2.3 source implementation now exists locally: timeline compiler, HTTP `502` fixture coverage, generated static timeline JSON, `.upptimerc.yml` timeline renderer, `Status Timeline CI`, and API republish hardening for both `Status Events CI` and `Status Timeline CI` are present. This patch does not claim GitHub Pages deployment, public rendered-page verification, deployed API availability, or first post-release workflow restoration.

Generated Upptime workflow bodies remain Upptime-owned and are not edited by this patch. NodeClaw-owned workflows restore `api/status-events.json` and `api/status-timeline/*` after successful `Static Site CI` runs instead of trying to change generated Upptime deployment behavior.

## Change Items

### 1. Extend target design for timeline history

- **Target artifact:** `design/status-events.design.md`
- **Change type:** replacement/additive
- **Before:** design covered Issue-driven status events and kept archived/history behavior as future scope.
- **After:** design keeps Issue-driven events and adds Status Timeline / Incident History as a separate Git/Upptime-derived layer with uptime percentage display, 24-hour timeline, daily archive, grouped incident windows, observed-duration wording, public-safe timeline JSON, and post-`Static Site CI` API restoration through NodeClaw-owned workflows.

### 2. Add operator documentation for timeline and API restoration behavior

- **Target artifact:** `docs/status-events.md`
- **Change type:** additive/replacement
- **Before:** docs explained status event labels, metadata, public safety, event sections, and the local timeline renderer contract.
- **After:** docs explain that the implemented source renderer reads compiled timeline JSON, shows uptime % with the latest 24 hours by default, supports date-selectable daily archives, groups non-up samples into observed incidents, labels sample-derived values as `observed uptime`, and requires NodeClaw-owned workflows to republish public API JSON after Upptime `Static Site CI` replaces the generated page output.

### 3. Update Phase 005 execution record

- **Target artifacts:** `phase/SUMMARY.md`, `phase/phase-005-status-timeline-and-incident-history.md`
- **Change type:** additive/replacement
- **Before:** Phase 005 recorded local timeline implementation and release verification pending, but did not yet record the public API 404 finding or API republish hardening.
- **After:** Phase 005 records the v0.2.3 API publication hardening, the pre-release public `404` evidence, NodeClaw-owned workflow restoration after `Static Site CI`, and release gates for rendered page plus deployed API availability verification.

### 4. Add timeline compiler and JSON contract

- **Target artifacts:** `scripts/generate-status-timeline.mjs`, `api/status-timeline/index.json`, `api/status-timeline/days/YYYY-MM-DD.json`
- **Change type:** additive
- **Before:** no NodeClaw-owned compiler produced public timeline JSON from Upptime/Git check history.
- **After:** the compiler normalizes public component check samples into an index file and daily detail files with uptime summaries, `upptimeUptimePercent` when the Upptime scope matches, `observedUptimePercent`, sample counts, down/degraded/unknown sample counts, incident counts, segments, grouped incidents, status codes, response-time samples, and observed-duration fields.

### 5. Add fixture coverage for observed incidents

- **Target artifact:** `scripts/fixtures/status-timeline.fixture.json`
- **Change type:** additive
- **Before:** no fixture covered timeline grouping, uptime percentage calculation, or HTTP `502` down samples.
- **After:** fixture data includes a runtime-health HTTP `502` down sample between up samples so dry-run checks can verify observed uptime calculation, down sample count, and grouped incident output without needing live deployment.

### 6. Add timeline regeneration workflow

- **Target artifact:** `.github/workflows/status-timeline.yml`
- **Change type:** additive
- **Before:** only the Status Events workflow regenerated issue-driven event JSON; generated Upptime workflow bodies remained Upptime-owned.
- **After:** a NodeClaw-owned `Status Timeline CI` workflow regenerates timeline JSON after relevant Upptime check/history changes or manual dispatch, uses `fetch-depth: 0` for Git history, and publishes `api/status-timeline/*` without editing generated Upptime workflow bodies.

### 7. Restore public API JSON after generated static-site deploys

- **Target artifacts:** `.github/workflows/status-events.yml`, `.github/workflows/status-timeline.yml`
- **Change type:** replacement/additive
- **Before:** `Status Events CI` republished status events after issue/source changes and `Setup CI`; `Status Timeline CI` republished timeline JSON after Upptime/history changes and manual dispatch. A later generated Upptime `Static Site CI` deploy could replace the public `gh-pages` output without preserving custom `api/` files.
- **After:** both NodeClaw-owned workflows also run after successful `Static Site CI` workflow completion and publish their API directories with `keep_files: true`, restoring `api/status-events.json` and `api/status-timeline/*` on `gh-pages` without editing generated Upptime workflow bodies.

### 8. Add public timeline renderer

- **Target artifact:** `.upptimerc.yml`
- **Change type:** additive/replacement inside NodeClaw-owned custom HTML blocks
- **Before:** custom renderer displayed Status Events sections before Upptime live incident/status sections.
- **After:** renderer fetches `api/status-timeline/index.json` and selected day files, then displays Uptime %, current 24-hour timeline, sample counts, and daily incident history before Upptime live incident/status sections while keeping all rendered text on DOM text nodes.

### 9. Sync changelog and TODO

- **Target artifacts:** `changelog/status-events.changelog.md`, `TODO.md`
- **Change type:** replacement/additive
- **Before:** version authority recorded `0.2.2` as the local timeline implementation version and TODO tracked post-release rendered-page/deployed-JSON verification tasks.
- **After:** changelog records `0.2.3` as the local API publication hardening version with pre-release public `404` evidence and deployment limits, while TODO moves API republish hardening to completed and leaves only post-release rendered-page/deployed-JSON/workflow verification tasks pending.

## Verification

Local implementation verification completed across v0.2.2 and v0.2.3:

- `node --check scripts/generate-status-timeline.mjs` passed.
- Fixture dry-run verified HTTP `502`, observed uptime percentage, down sample count, and grouped incident output.
- Git/history mode dry-run produced timeline output for the checked local history scope.
- Extracted `.upptimerc.yml` inline renderer script passed `node --check`.
- Generated `api/status-timeline/index.json` and day JSON passed shape and public-safe field checks in local audit.
- Public pre-release checks found `api/status-events.json` and `api/status-timeline/index.json` returned HTTP `404`, and the checked remote `gh-pages` root had no `api/` directory.
- Workflow source checks confirm `Status Events CI` and `Status Timeline CI` include successful `Static Site CI` as a `workflow_run` trigger and retain `keep_files: true` publication.
- Generated Upptime workflow bodies remain out of scope and are not edited by this patch.

Governance-sync verification for this patch checks metadata, design/docs/changelog/TODO/phase/patch alignment, local-implementation wording, API restoration wording, and explicit release-verification-pending boundaries.

Release closeout still requires post-deployment rendered-page verification that Uptime %, public timeline history, and daily incident history appear separately from Upptime `Active Incidents`, deployed API JSON public-safety audit for both Status Events and timeline contracts, and first post-release `Status Events CI` / `Status Timeline CI` confirmation after `Static Site CI`.

## Rollback Approach

- Remove `Static Site CI` from NodeClaw-owned API workflow `workflow_run` trigger lists if post-site-deploy republishing causes unexpected workflow churn.
- Remove or disable the timeline renderer block while leaving the existing Status Events renderer intact.
- Disable `.github/workflows/status-timeline.yml` if generated timeline data causes publication issues.
- Leave Upptime `sites`, generated uptime summaries, response graphs, and automatic incident behavior untouched.
- Keep `api/status-timeline/*` inert if no renderer loads it.
