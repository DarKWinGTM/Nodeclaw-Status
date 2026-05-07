# NodeClaw Status Events Changelog

> **Parent Document:** [../design/status-events.design.md](../design/status-events.design.md)
> **Current Version:** 0.2.4
> **Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7

## 0.2.4 — 2026-05-08

### Changed

- Changed the Status Timeline compiler to emit exactly 24 fixed hourly `segments` for each component in the current 24-hour view and daily archive files, so sparse check history still renders as a consistent bar timeline instead of one bar per observed sample.
- Updated the timeline renderer tooltip text to show bucket ranges, sample counts, and HTTP status codes while keeping rendered content on DOM text nodes.
- Updated NodeClaw-owned Status Events and Status Timeline workflow concurrency so post-`Static Site CI` API publishes serialize through one shared group instead of racing on `gh-pages` pushes.

### Verification

- `node --check scripts/generate-status-timeline.mjs` passed.
- Fixture dry-run verified 24 timeline segments per component and preserved an HTTP `502` down bucket.
- Generated `api/status-timeline/index.json` and all checked day files have 24 segments per component and no forbidden public-safety field names in the checked scope.
- Extracted `.upptimerc.yml` inline renderer script passed `node --check`.

### Notes

- This version does not yet claim the fixed 24-hour bars are visible on GitHub Pages or that both post-static API restoration workflows pass after the new concurrency setting; those remain release verification gates after commit/push/deploy.
- Pre-fix post-static verification found `Status Events CI` passed while `Status Timeline CI` failed during `gh-pages` publish because the two API workflows raced each other.

---

## 0.2.3 — 2026-05-08

### Changed

- Updated NodeClaw-owned `Status Events CI` and `Status Timeline CI` workflows to republish public API JSON after successful Upptime `Static Site CI` runs.
- Documented that generated Upptime static-site deployment can replace the public `gh-pages` output without preserving custom `api/` files, so NodeClaw API workflows restore those files instead of editing generated Upptime workflow bodies.

### Verification

- Public `https://darkwingtm.github.io/Nodeclaw-Status/api/status-events.json` and `api/status-timeline/index.json` currently return HTTP `404` before release.
- Remote `gh-pages` root was checked and did not contain an `api/` directory before this local fix is committed/pushed.
- `status-events.yml` and `status-timeline.yml` remain NodeClaw-owned workflows and do not modify generated Upptime workflow bodies.

### Notes

- This version still does not claim GitHub Pages deployment, public rendered-page verification, or post-release API availability.
- Release closeout must verify that both Status Events JSON and Status Timeline JSON are present on `gh-pages` after `Static Site CI` and NodeClaw API workflow runs complete.

---

## 0.2.2 — 2026-05-08

### Added

- Added `scripts/generate-status-timeline.mjs` to compile Upptime/Git history into `api/status-timeline/index.json` and daily timeline JSON.
- Added fixture coverage for HTTP `502` down samples, observed uptime calculation, sample counts, and grouped incident windows.
- Added the Status Timeline renderer in `.upptimerc.yml` so Uptime %, timeline pills, sample counts, and daily archive selection render before Upptime live incident/status sections.
- Added the NodeClaw-owned `Status Timeline CI` workflow for regenerating and publishing timeline JSON without editing generated Upptime workflow bodies.

### Changed

- Generated local `api/status-timeline/*` JSON using the timeline compiler so the renderer has a static contract to read.
- Synced design, operator docs, TODO, Phase 005, phase summary, and patch wording from planned target to local implementation with release verification pending.

### Verification

- `node --check scripts/generate-status-timeline.mjs` passed.
- Fixture dry-run verified HTTP `502`, observed uptime, down sample count, and incident grouping.
- Git/history mode dry-run produced timeline output for the checked local history scope.
- Extracted `.upptimerc.yml` inline renderer script passed `node --check`.
- Generated timeline JSON shape and public-safe fields passed local audit.

### Notes

- This version does not claim GitHub Pages deployment, public rendered-page verification, or post-release timeline workflow execution.
- Local history in this checkout may be stale or sparse compared with the full remote Upptime/Git history; the workflow uses full checkout history through `fetch-depth: 0`.

---

## 0.2.1 — 2026-05-08

### Changed

- Refined the Phase 005 Status Timeline target to show Uptime % beside component timeline rows instead of relying only on incident pills/history.
- Added separate wording for Upptime-generated uptime percentages and sample/window-derived `observed uptime` percentages.
- Expanded the timeline JSON target with uptime summary fields, sample counts, down-sample counts, and incident counts.
- Updated design, operator docs, TODO, Phase 005, phase summary, and patch wording so Uptime % remains target behavior without claiming implementation.

### Notes

- This version does not claim uptime-percent rendering, timeline compiler output, live public status changes, or GitHub Pages deployment.
- Rounded `100%` values must not hide visible down/degraded timeline segments or incident counts.

---

## 0.2.0 — 2026-05-08

### Added

- Defined the Status Timeline and Incident History target as the v0.2.0 successor to the Issue-driven Status Events layer.
- Added the target static JSON contract for `api/status-timeline/index.json` and `api/status-timeline/days/YYYY-MM-DD.json`.
- Added Phase 005 as the planned execution slice for compiling Upptime/Git check history into public 24-hour and daily incident timelines.
- Added the active review patch `patch/status-timeline-and-incident-history.patch.md` for the timeline/history change surface.

### Changed

- Expanded the design boundary so Upptime remains the monitor/current-status owner while NodeClaw owns public timeline rendering from compiled static JSON.
- Updated operator docs to explain 24-hour timeline behavior, daily archive lookback, incident grouping, HTTP `502` down samples, and observed-duration wording.
- Updated TODO tracking to keep implementation and verification work pending after governance sync.

### Notes

- This version does not claim the timeline compiler, timeline workflow, timeline renderer, public timeline JSON, live deployment, or rendered public timeline are implemented yet.
- The key evidence basis is that Upptime/Git history can contain HTTP `502` down samples while the current public page can still show only the current operational state or rounded uptime summaries.

---

## 0.1.0 — 2026-05-04

### Added

- Established the NodeClaw Status Events design as a subproject-owned status communication layer inside `status/`.
- Defined the Issue-driven event model for announcements, notices, scheduled maintenance, operational reports, and human-authored incident communication.
- Added the status event issue template and public metadata contract.
- Added the status event compiler for generating `api/status-events.json` from public-safe GitHub Issues.
- Added fixture support for bounded compiler verification.
- Added the `.upptimerc.yml` renderer CSS and browser-side renderer through Upptime-supported custom HTML fields.
- Added the NodeClaw-owned `Status Events CI` workflow for regenerating event data on issue/source changes and publishing the static JSON to `gh-pages` without taking over Upptime's page deploy.
- Generated the first public status event JSON from GitHub Issue #6.

### Changed

- Refined the status event section visual tone toward the NodeNetwork operational SaaS palette with stronger blue accents, slate/white surfaces, clearer badge roles, and visible link focus styling.
- Expanded the NodeNetwork visual tone from the injected status event section to the whole Upptime status page, including the page background, navigation, header, operational banner, graph cards, form tabs, and dark event surfaces.
- Refined the Live Status timeframe selector from individually boxed radio labels into a single segmented pill control.
- Removed `.upptimerc.yml` from direct `Status Events CI` push triggers so Upptime config/theme changes publish status events only after successful `Setup CI` completion.

### Notes

- Upptime remains the online/down monitor and automatic incident engine.
- NodeClaw Status Events owns non-incident public communication and issue-driven reporting.
- Public release verification passed: Issue #6 renders as an announcement outside Upptime `Active Incidents`, and the monitored NodeNetwork Website/App Health endpoints returned HTTP 200 after release.
