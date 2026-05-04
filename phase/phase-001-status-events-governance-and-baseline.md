# Phase 001 — Status Events Governance and Baseline

**Summary File:** [SUMMARY.md](SUMMARY.md)
**Phase ID / Name:** `phase-001` — Status Events Governance and Baseline
**Status:** Completed

## Design References

- [../design/status-events.design.md](../design/status-events.design.md)

## Patch References

- [../patch/status-events-layer.patch.md](../patch/status-events-layer.patch.md)

## Objective

Establish a clean Nodeclaw-Status subproject baseline and governed plan for Issue-driven public status events.

## Why This Phase Exists

The status page preview proved that `customHeadHtml` and `customBodyHtml` can inject content, but the preview blocks were temporary and not a production event system. This phase clears preview state and establishes the governance/implementation order before production work begins.

## Action Checklist

- [x] Remove temporary preview `customHeadHtml` and `customBodyHtml` blocks.
- [x] Keep the real `introMessage` baseline.
- [x] Create status subproject docs/design/changelog/TODO/phase/patch artifacts.
- [x] Define the ordered phase map.
- [x] Keep Upptime-generated workflow and output boundaries explicit.

## Out of Scope

- Implementing the compiler.
- Implementing the renderer.
- Creating production issue labels remotely.
- Editing generated `gh-pages` output directly.

## Verification

- `.upptimerc.yml` parses as YAML.
- Preview marker strings are removed from `.upptimerc.yml`.
- Governance artifacts exist under `status/`, not main core.

## Closeout Summary

Phase 001 delivered the clean governance baseline for a separate Nodeclaw-Status status-events component. The practical impact is that implementation can proceed inside `status/` without mixing status-page communication work into the main NodeClaw core governance chain.

## Exit Criteria

- Clean baseline and governance set are ready for Phase 002.
