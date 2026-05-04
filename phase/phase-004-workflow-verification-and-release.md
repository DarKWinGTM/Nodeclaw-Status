# Phase 004 — Workflow, Verification, and Release

**Summary File:** [SUMMARY.md](SUMMARY.md)
**Phase ID / Name:** `phase-004` — Workflow, Verification, and Release
**Status:** Active

## Design References

- [../design/status-events.design.md](../design/status-events.design.md)

## Patch References

- [../patch/status-events-layer.patch.md](../patch/status-events-layer.patch.md)

## Objective

Wire status event regeneration into GitHub Actions and verify the public status page behavior end to end.

## Action Checklist

- [x] Add `.github/workflows/status-events.yml` as NodeClaw-owned custom workflow.
- [x] Trigger on status event issue changes, issue comments, manual dispatch, and relevant file changes.
- [ ] Commit generated `api/status-events.json` safely.
- [ ] Ensure public Pages output can serve the generated JSON.
- [x] Create or normalize repository labels used by status events.
- [x] Run local static checks.
- [ ] Run GitHub workflow checks.
- [ ] Verify the public page renders status events outside incidents.

## Out of Scope

- Replacing Upptime monitoring.
- Migrating historical Upptime incidents into the custom event model.
- Private/internal status communication.

## Verification

- Local YAML parsing passes before push.
- Local compiler syntax and fixture checks pass before push.
- Workflow completes successfully after push.
- Public page fetches the generated JSON after Pages publish.
- Test event appears in the correct section.
- Upptime checks remain unchanged.

## Closeout Summary

Phase 004 is the release gate. It turns the local Status Events Layer into a public verified behavior by pushing the implementation, letting GitHub Actions publish JSON to `gh-pages`, and checking that Issue #6 appears as an announcement outside Upptime `Active Incidents`.

## Exit Criteria

- NodeClaw can open a GitHub Issue as a public status event and have it appear on the status page without being treated as an Upptime incident.
