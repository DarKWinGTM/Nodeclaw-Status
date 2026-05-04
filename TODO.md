# Nodeclaw-Status - TODO
> **Last Updated:** 2026-05-04

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
- Added a custom workflow to regenerate status events after issue changes and manual dispatch.
- Created GitHub Issue #6 as the first public status event and generated local JSON from it.

---

## 📋 Tasks To Do

### Status Events Release Verification

- [ ] Push the production Status Events Layer changes to `DarKWinGTM/Nodeclaw-Status`.
- [ ] Verify `Status Events CI` completes and publishes `api/status-events.json` to `gh-pages`.
- [ ] Verify GitHub Issue #6 renders under `Announcements` outside Upptime `Active Incidents` on the public status page.
- [ ] Verify Upptime uptime checks and real incidents still work independently after release.

---

## 📜 History

| Date | Changes |
|------|---------|
| 2026-05-04 | Initialized status subproject tracking for the Issue-driven Status Events Layer. |
| 2026-05-04 | Implemented local Status Events compiler, renderer, issue template, workflow, and generated event JSON; public release verification remains pending. |
