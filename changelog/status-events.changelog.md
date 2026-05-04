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

### Notes

- Upptime remains the online/down monitor and automatic incident engine.
- NodeClaw Status Events owns non-incident public communication and issue-driven reporting.
- Public release verification remains tracked in Phase 004 until the workflow and GitHub Pages output are checked after push.
