# Phase 004 — Workflow, Verification, and Release

**Summary File:** [SUMMARY.md](SUMMARY.md)
**Phase ID / Name:** `phase-004` — Workflow, Verification, and Release
**Status:** Completed

## Design References

- [../design/status-events.design.md](../design/status-events.design.md)

## Patch References

- [../patch/status-events-layer.patch.md](../patch/status-events-layer.patch.md)

## Objective

Wire status event regeneration into GitHub Actions and verify the public status page behavior end to end.

## Action Checklist

- [x] Add `.github/workflows/status-events.yml` as NodeClaw-owned custom workflow.
- [x] Trigger on status event issue changes, issue comments, manual dispatch, relevant file changes, and successful `Setup CI` completion.
- [x] Commit generated `api/status-events.json` safely.
- [x] Ensure public Pages output can serve the generated JSON.
- [x] Create or normalize repository labels used by status events.
- [x] Run local static checks.
- [x] Run GitHub workflow checks.
- [x] Verify the public page renders status events outside incidents.

## Out of Scope

- Replacing Upptime monitoring.
- Migrating historical Upptime incidents into the custom event model.
- Private/internal status communication.

## Verification

- Local YAML parsing passes.
- Local compiler syntax and fixture checks pass.
- `Setup CI` completed successfully after the release push.
- `Status Events CI` completed successfully after the Pages publishing fix.
- GitHub Pages deployment completed successfully after `api/status-events.json` reached `gh-pages`.
- Public `api/status-events.json` returns HTTP 200 with Issue #6 as one active `announcement` event and `invalidCount: 0`.
- Headless browser-rendered public DOM contains `Announcements`, Issue #6 title/link/summary, and no `Active Incidents` section.
- NodeNetwork Website and NodeClaw App Health endpoints return HTTP 200 after release.

## Closeout Summary

Phase 004 delivered the public release and verification gate. The practical impact is that NodeClaw can now open a GitHub Issue as a public status event and have it appear on the public status page as an announcement instead of as an Upptime incident.

## Exit Criteria

- NodeClaw can open a GitHub Issue as a public status event and have it appear on the status page without being treated as an Upptime incident.
