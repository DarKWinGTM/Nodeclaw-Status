# Phase 005 — Status Timeline and Incident History

**Summary File:** [SUMMARY.md](SUMMARY.md)
**Phase ID / Name:** `phase-005` — Status Timeline and Incident History
**Status:** Completed

## Design References

- [../design/status-events.design.md](../design/status-events.design.md)

## Patch References

- [../patch/status-timeline-and-incident-history.patch.md](../patch/status-timeline-and-incident-history.patch.md)

## Objective

Develop the public Status Timeline and Incident History layer so NodeClaw Status can show Uptime %, fixed bars for the latest 24 hours, and date-selectable daily outage history from Upptime/Git check data.

## Why This Phase Exists

Upptime can record HTTP 502/down samples in Git history, but the current public status page mainly communicates the current operational state. Short incidents can be hard to see when summary badges round uptime to `100%`. This phase makes uptime context and observed history visible without replacing Upptime's monitoring engine.

## Expected Output

- A timeline compiler that normalizes Upptime history/Git check samples, uptime percentages, sample counts, and 24 fixed hourly timeline buckets into public static JSON.
- `api/status-timeline/index.json` for the current 24-hour pointer and available daily archive list.
- `api/status-timeline/days/YYYY-MM-DD.json` day files for component segments and grouped incidents.
- A status page renderer section for Uptime %, fixed 24-hour timeline bars, and daily incident history.
- Public copy that clearly says `observed duration` or `observed window` when exact downtime cannot be proven from sparse checks.

## Completion Gate

Phase 005 is complete when fixture/local generation, fixed 24-hour bucket output checks, renderer source checks, generated JSON shape checks, NodeClaw-owned API workflow republish hardening, serialized API publish concurrency, governance sync, and post-deployment verification pass. Release closeout is complete for the checked v0.2.4 scope: Uptime %, fixed public timeline bars, daily incident history, `api/status-events.json`, and `api/status-timeline/*` appear separately from Upptime `Active Incidents` and publish only public-safe fields.

## Entry Conditions

- Status Events v0.2.0 design target is recorded.
- The active patch identifies the timeline before/after change surface.
- `TODO.md` records post-release public rendered-page, deployed JSON, and workflow-run verification as completed after v0.2.4 release verification.

## Action Checklist

- [x] Define the Status Timeline and Incident History target in design.
- [x] Create the active review patch for the timeline/history change surface.
- [x] Add TODO/changelog/phase governance for the v0.2.0 target.
- [x] Refine the target to v0.2.1 with Uptime % display and observed-uptime wording.
- [x] Implement timeline compiler from Upptime history/Git check data, including uptime percentage and sample-count calculation.
- [x] Generate static timeline index/day JSON.
- [x] Render Uptime %, the current 24-hour timeline, and date-selectable daily archive through `.upptimerc.yml` custom HTML.
- [x] Add fixture coverage for HTTP 502/down samples, uptime percentage calculation, sample counts, and observed-duration grouping.
- [x] Add NodeClaw-owned Status Timeline workflow without editing generated Upptime workflow bodies.
- [x] Harden NodeClaw-owned Status Events and Status Timeline workflows to republish API JSON after successful Upptime `Static Site CI` runs.
- [x] Refine timeline output so each component has exactly 24 fixed hourly bars instead of one bar per observed sample.
- [x] Serialize NodeClaw-owned API publish workflows through one shared concurrency group to avoid post-static `gh-pages` publish races.
- [x] Verify public API JSON availability and rendered status page behavior after release.

## Out of Scope

- Replacing Upptime uptime checks, response-time graphs, or automatic incident engine.
- Claiming exact outage duration from sparse check samples.
- Querying raw GitHub commit history from every public page load.
- Rendering raw issue body HTML, raw provider error HTML, raw headers, private incident notes, or internal routing details.
- Editing generated Upptime workflow bodies or generated `gh-pages/index.html` directly.

## Affected Artifacts

- `design/status-events.design.md`
- `docs/status-events.md`
- `changelog/status-events.changelog.md`
- `TODO.md`
- `phase/SUMMARY.md`
- `phase/phase-005-status-timeline-and-incident-history.md`
- `patch/status-timeline-and-incident-history.patch.md`
- Implemented local targets: `scripts/generate-status-timeline.mjs`, `.github/workflows/status-events.yml`, `.github/workflows/status-timeline.yml`, `.upptimerc.yml`, `api/status-timeline/index.json`, and `api/status-timeline/days/YYYY-MM-DD.json` with uptime percentage fields, fixed 24-hour timeline buckets, and serialized API republish restoration after Upptime static-site deploys

## Development Verification / TestKit Coverage

Local and public verification completed:

- Fixture timeline generation covers at least one HTTP `502` runtime-health sample, uptime percentage/sample-count output, and exactly 24 fixed hourly segments per component.
- JSON schema/shape validation for index and day files passed in local audit, including 24 segments per component.
- Renderer source check confirms Uptime %, timeline sections, fixed-bucket tooltip labels, and timeline placement before Upptime live incident/status sections.
- Date-selector source path for previous daily archives is present in the renderer.
- Public-safety audit confirms timeline JSON excludes raw HTML, raw headers, private incident notes, and internal routing details in checked local output.
- Public pre-release evidence confirmed `api/status-events.json` and `api/status-timeline/index.json` returned HTTP `404` while the checked remote `gh-pages` output had no `api/` directory.
- Post-static verification before the v0.2.4 race fix found `Status Events CI` passed while `Status Timeline CI` failed during a concurrent `gh-pages` publish.
- Workflow source audit confirms NodeClaw-owned `Status Events CI` and `Status Timeline CI` republish API JSON after successful Upptime `Static Site CI` runs through one shared API publish concurrency group without editing generated Upptime workflow bodies.
- Release commit `6a1ad1f` was pushed to `master`; `Setup CI`, manually triggered `Static Site CI`, post-static `Status Events CI`, post-static `Status Timeline CI`, and final GitHub Pages deployment passed in the checked release scope.
- Deployed `api/status-events.json`, `api/status-timeline/index.json`, and all advertised timeline day JSON returned HTTP `200`; timeline index/day JSON retained exactly 24 segments per component and passed bounded public-safety field checks.
- Headless rendered-page verification confirmed the public `Uptime Timeline` section renders before Upptime status sections, outside `Active Incidents`, with 24 `nodeclaw-status-timeline__segment` elements for each visible component row.

## TODO and Changelog Coordination

- Changelog version: `0.2.4`.
- Durable tasks live in [../TODO.md](../TODO.md).
- Local implementation, local verification, and post-release public verification are complete for the fixed-bucket timeline and API publish serialization; durable TODO records the v0.2.4 release verification as completed.

## Closeout Summary

Phase 005 v0.2.4 fixed-bucket/API publication hardening is complete, released, and publicly verified in the checked GitHub Pages/API/workflow scope. Users can see uptime percentages plus fixed 24-hour bars and recent/per-day observed outage history on the public status page, while `api/status-events.json` and `api/status-timeline/*` are restored after Upptime static-site deploys without `gh-pages` publish races.

## Next Possible Phases

- Public update markers for incident issue comments if timeline incidents later need human-authored updates attached to grouped check windows.
- Broader incident analytics can follow as a later phase now that the basic 24-hour and daily timeline renderer is publicly verified.
