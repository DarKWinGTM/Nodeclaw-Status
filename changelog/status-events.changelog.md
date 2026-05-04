# NodeClaw Status Events Changelog

> **Parent Document:** [../design/status-events.design.md](../design/status-events.design.md)
> **Current Version:** 0.1.0
> **Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7

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
