# Phase 002 — Status Event Compiler and Issue Contract

**Summary File:** [SUMMARY.md](SUMMARY.md)
**Phase ID / Name:** `phase-002` — Status Event Compiler and Issue Contract
**Status:** Completed

## Design References

- [../design/status-events.design.md](../design/status-events.design.md)

## Patch References

- [../patch/status-events-layer.patch.md](../patch/status-events-layer.patch.md)

## Objective

Add the NodeClaw-owned issue contract and compiler that converts public-safe GitHub Issues into `api/status-events.json`.

## Action Checklist

- [x] Add `.github/ISSUE_TEMPLATE/status-event.md`.
- [x] Add `scripts/generate-status-events.mjs`.
- [x] Parse issue labels and metadata.
- [x] Exclude non-public or invalid issues.
- [x] Write `api/status-events.json` with schema version and public-safe fields.
- [x] Add local fixture or dry-run support for bounded checks.

## Out of Scope

- Public page rendering.
- Workflow deployment.
- Upptime incident remapping.

## Verification

- Compiler syntax passes with `node --check`.
- Fixture generation produces one public event and excludes one internal event.
- Real GitHub Issue #6 generates `api/status-events.json` with `invalidCount: 0`.
- Output contains only public-safe fields used by the renderer.

## Closeout Summary

Phase 002 delivered the Issue-to-JSON data path. The practical impact is that NodeClaw can author public status events in GitHub Issues while the compiler filters out non-public or invalid records before anything reaches the status page.

## Exit Criteria

- `api/status-events.json` can be generated deterministically from valid status event issues or fixtures.
