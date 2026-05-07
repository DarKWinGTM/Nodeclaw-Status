# Nodeclaw-Status - TODO
> **Last Updated:** 2026-05-08

---

## ✅ Completed

- Established the public NodeClaw Status monitoring baseline with NodeNetwork Website and NodeClaw App Health checks.
- Verified that ordinary GitHub Issues should not be used as announcement display records because Upptime can surface them as incidents depending on labels/semantics.
- Verified `introMessage`, `customHeadHtml`, and `customBodyHtml` behavior for status page customization.
- Decided that Status Events governance belongs inside this nested `status/` subproject, not the main NodeClaw core governance chain.
- Removed temporary announcement preview HTML/CSS from `.upptimerc.yml` and kept the production intro message baseline.
- Created the status events governance set under `status/`: docs, design, changelog, TODO, phase, and patch.
- Added the NodeClaw-owned status event issue template and public metadata contract.
- Added the status event compiler that converts public-safe GitHub Issues into `api/status-events.json`.
- Added fixture-based compiler verification support.
- Added a custom status page renderer through `.upptimerc.yml` that reads `api/status-events.json` and renders sections outside Upptime incidents.
- Added and fixed the custom workflow to regenerate status events and publish `api/status-events.json` to `gh-pages` without taking over Upptime's page deploy.
- Created GitHub Issue #6 as the first public status event and generated local JSON from it.
- Pushed the production Status Events Layer changes to `DarKWinGTM/Nodeclaw-Status`.
- Verified `Status Events CI`, `Setup CI`, and GitHub Pages deployment after the Status Events release.
- Verified public JSON returns Issue #6 as one active `announcement` event with `invalidCount: 0`.
- Verified headless browser-rendered public DOM shows Issue #6 under `Announcements` and does not show `Active Incidents`.
- Verified NodeNetwork Website and NodeClaw App Health endpoints return HTTP 200 after release.
- Expanded the status page theme from the injected status event section to a whole-page NodeNetwork-aligned dark blue/slate visual treatment.
- Refined the Live Status timeframe selector into a segmented pill control without individual boxed radio label borders.
- Defined the v0.2.0 Status Timeline and Incident History governance target across design, docs, changelog, phase, patch, and TODO.
- Refined the v0.2.1 Status Timeline target to include Uptime % display beside timeline rows with observed-uptime wording and sample-count context.
- Implemented the v0.2.2 local Status Timeline compiler, fixture, generated JSON, renderer, and workflow with release verification pending.
- Hardened v0.2.3 NodeClaw-owned API workflows so Status Events and Status Timeline JSON republish after Upptime `Static Site CI` replaces the public `gh-pages` output.
- Implemented the v0.2.4 local fixed 24-hour timeline buckets so component timelines render exactly 24 hourly bars instead of shrinking to one bar per observed sample.
- Serialized the v0.2.4 NodeClaw-owned API publish workflows through one shared concurrency group to avoid post-`Static Site CI` `gh-pages` publish races.

---

## 📋 Tasks To Do

### Status Timeline and Incident History

- [ ] Verify the rendered public status page shows Uptime %, fixed 24-hour timeline bars with the rightmost bar ending at the current window end, and daily archive outside Upptime `Active Incidents` after commit/push and GitHub Pages deployment.
- [ ] Audit deployed status API JSON for public-safe fields only: Status Events fields plus timeline component name/slug, uptime percentage, sample counts, fixed hourly bucket state, timestamps, status code, response-time summary, and public incident summary.
- [ ] Confirm the post-release `Status Events CI` and `Status Timeline CI` runs restore `api/status-events.json` and `api/status-timeline/*` after `Static Site CI`, with shared publish concurrency preventing `gh-pages` push races and timeline generation using full Git history through `fetch-depth: 0`.

---

## 📜 History

| Date | Changes |
|------|---------|
| 2026-05-04 | Initialized status subproject tracking for the Issue-driven Status Events Layer. |
| 2026-05-04 | Implemented local Status Events compiler, renderer, issue template, workflow, and generated event JSON. |
| 2026-05-04 | Released and verified Issue #6 public announcement rendering outside Upptime `Active Incidents`. |
| 2026-05-04 | Expanded the Upptime status page theme to match NodeNetwork's dark blue/slate tone across the whole page. |
| 2026-05-05 | Refined the Live Status timeframe selector into a smoother segmented pill control. |
| 2026-05-08 | Synced the v0.2.0 Status Timeline and Incident History governance target with design, docs, changelog, Phase 005, active patch, and pending implementation TODOs. |
| 2026-05-08 | Refined the Status Timeline target to v0.2.1 with Uptime % display, observed uptime wording, sample counts, and pending implementation verification tasks. |
| 2026-05-08 | Implemented the v0.2.2 local Status Timeline compiler, fixture, static JSON, custom renderer, and workflow; public release verification remains pending. |
| 2026-05-08 | Hardened the v0.2.3 API publish path so NodeClaw Status Events and Timeline JSON republish after Upptime `Static Site CI` replaces `gh-pages` output. |
| 2026-05-08 | Implemented the v0.2.4 fixed 24-hour timeline bucket renderer contract and serialized NodeClaw API publishes to avoid post-static `gh-pages` races. |
