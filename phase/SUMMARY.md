# Nodeclaw-Status Phase Summary

**Status:** Active
**Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7
**Governing Design:** [../design/status-events.design.md](../design/status-events.design.md)
**Governing Patch:** [../patch/status-timeline-and-incident-history.patch.md](../patch/status-timeline-and-incident-history.patch.md)
**Previous Patch:** [../patch/status-events-layer.patch.md](../patch/status-events-layer.patch.md)

## Objective

Develop NodeClaw Status from an Upptime-only online/down page into a public status communication and history component while keeping ordinary announcements, manual reports, and timeline history separate from Upptime incidents.

## Current State

The Status Events Layer v0.1.0 is implemented, pushed, and publicly verified. Version 0.2.4 now has a local Status Timeline and Incident History implementation plus release-fix hardening: Git/Upptime check history is compiled into static timeline JSON with exactly 24 fixed hourly bars per component, `.upptimerc.yml` renders Uptime %, the latest 24 hours, and date-selectable daily incident history, and NodeClaw-owned Status Events/Timeline workflows republish public API JSON after successful Upptime `Static Site CI` runs through one shared API publish concurrency group. Public `api/status-events.json` and `api/status-timeline/index.json` were observed as HTTP `404` before v0.2.3, and post-static verification then exposed a timeline publish race before the v0.2.4 local fix. Public release verification remains pending until commit/push, GitHub Pages deployment, NodeClaw API workflow restoration, and post-release rendered-page/API checks complete.

## Phase Map

| Phase | Name | Status | Purpose |
|---|---|---|---|
| 001 | Status Events Governance and Baseline | Completed | Establish the clean baseline and governed status-events plan. |
| 002 | Status Event Compiler and Issue Contract | Completed | Convert GitHub Issues with NodeClaw event labels/metadata into public JSON. |
| 003 | Status Page Renderer Integration | Completed | Render status event sections through Upptime custom HTML without editing generated templates. |
| 004 | Workflow, Verification, and Release | Completed | Regenerate event data on issue changes, verify public page behavior, and prepare release. |
| 005 | Status Timeline and Incident History | Release verification pending | Compile Upptime/Git check history into public uptime %, fixed 24-hour timeline bars, daily incident timeline data, and restored public API JSON after static-site deploys. |

## Execution Order

```text
Phase 001 governance/baseline
  -> Phase 002 issue compiler/data contract
  -> Phase 003 renderer/UI integration
  -> Phase 004 workflow/public verification
  -> Phase 005 uptime percentage + timeline/history data and renderer
```

## Boundaries

- Do not move this governance into the main NodeClaw core docs unless explicitly requested.
- Do not edit generated Upptime workflow bodies that warn they can be overwritten by template updates.
- Do not edit generated `gh-pages/index.html` directly.
- Do not use ordinary GitHub Issues or Upptime maintenance issues for general announcements.
- Do not render raw issue body HTML.
- Do not query raw GitHub commit history from every public page load; compile timeline data into static JSON first.
- Do not claim exact outage duration when only observed check samples are available.

## Verification Gates

- Governance artifacts exist and agree on the same target architecture.
- The compiler produces schema-valid `api/status-events.json`.
- The status page renders announcements/notices/maintenance/reports/manual incident reports outside `Active Incidents`.
- Real Upptime online/down checks remain unchanged.
- Public output contains only public-safe fields.
- Timeline JSON exposes uptime %, sample counts, exactly 24 fixed hourly bars per component, and grouped down/degraded samples as observed incident windows.
- Status page renders Uptime %, current 24-hour timeline bars, and daily incident history outside Upptime `Active Incidents`.
- Public `gh-pages` keeps `api/status-events.json` and `api/status-timeline/*` available after Upptime `Static Site CI` and serialized NodeClaw API workflow republish runs.

## Closeout Summary

The completed v0.1.0 phase set delivered the public Issue-driven status communication path for NodeClaw Status. Phase 005 now has the v0.2.4 local implementation for uptime percentages, fixed 24-hour bars, recent/daily observed outage history, and serialized API JSON restoration after Upptime static-site deploys without replacing Upptime's monitoring engine; public rendered-page and deployed-API verification are still pending after release.

## TODO Coordination

Durable tracking lives in [../TODO.md](../TODO.md). Live task tracking remains in Claude Code tasks for the active implementation session.
