# NodeClaw Status Events

NodeClaw Status Events extends the Upptime status page with public communication that is not limited to online/down monitoring.

## What this is

- A GitHub Issue-driven announcement and reporting layer.
- A public status communication system for announcements, notices, scheduled work, operational reports, and manual incident reports.
- A Git/Upptime-derived timeline layer for 24-hour and daily incident history.
- A companion to Upptime, not a replacement for Upptime checks.

## What this is not

- It is not a way to force ordinary announcements into Upptime `Active Incidents`.
- It is not raw issue-body rendering.
- It is not direct editing of generated `gh-pages/index.html`.
- It is not proof of exact outage duration when the data source only has sparse check samples.

## Issue labels

Every status event issue must include:

```text
status:event
```

The compiler reads `type`, `severity`, and `state` from the metadata block first. These labels are recommended as searchable mirrors and fallback values when metadata is missing:

```text
status:type:announcement
status:type:notice
status:type:maintenance
status:type:operational-report
status:type:incident
status:severity:info
status:severity:minor
status:severity:major
status:severity:critical
status:state:scheduled
status:state:active
status:state:resolved
```

Optional labels:

```text
status:pinned
component:<public-component-slug>
```

Hidden states such as `draft` and `archived` belong in metadata when needed; they are excluded from the generated public event list.

## Issue body format

Place metadata at the top of the issue:

```md
<!--
type: announcement
severity: info
state: active
pinned: true
startsAt: 2026-05-04T15:00:00Z
endsAt:
scheduledFor:
components: status-page, app-health, runtime-health
audience: public
-->

NodeClaw Status monitoring is now active.

This page tracks NodeNetwork Website, NodeClaw App Health, and NodeClaw Runtime Health availability.
```

Required metadata:

- `type`
- `severity`
- `state`
- `audience: public`

The first public paragraph after metadata becomes the public summary.

## Public safety

Only public-safe details should be written in the public summary section. Do not include internal supplier identity, secrets, private routing details, raw request payloads, raw provider error HTML, raw headers, or operator-only investigation notes. Timeline data should publish public component names/slugs, uptime percentage, sample counts, fixed hourly bucket state, status code, response-time summary, and observed window only.

## Status page behavior

The implemented source renderer reads these public static JSON contracts:

```text
/Nodeclaw-Status/api/status-events.json
/Nodeclaw-Status/api/status-timeline/index.json
/Nodeclaw-Status/api/status-timeline/days/YYYY-MM-DD.json
```

It renders separate public sections before the Upptime status summary:

- Status Timeline and Incident History
- Announcements
- Current Notices
- Scheduled Maintenance
- Operational Reports
- Manual Incident Reports

Phase 005 has local source and fixture verification for timeline generation/rendering. Until the fixed-bucket timeline and serialized API publish changes are committed, pushed, and verified after GitHub Pages deployment, the live public page should still be treated as release-verification pending. Both Status Events and timeline sections are intentionally separate from Upptime `Active Incidents`.

The public JSON files must remain available on `gh-pages` after Upptime rebuilds the static site. NodeClaw-owned Status Events and Status Timeline workflows republish their API JSON after successful `Static Site CI` runs because the generated Upptime site deploy can replace the public page output without preserving custom `api/` files. The two API publish workflows share one concurrency group so their `gh-pages` publishes serialize instead of racing each other.

## Status Timeline and Incident History

The timeline implementation uses Upptime/Git check history as the event source, then compiles it into static public JSON before the page renders it.

```text
Upptime check/history data
  -> status timeline compiler
  -> api/status-timeline/index.json
  -> api/status-timeline/days/YYYY-MM-DD.json
  -> public 24-hour uptime %, timeline, and daily archive
```

Target behavior:

- The default timeline shows uptime % and exactly 24 hourly bars for each monitored public component.
- The rightmost bar represents the current 24-hour window end, and bars to the left walk back through the previous 24 hours.
- Empty hours still render as `unknown`/no-sample bars so the timeline keeps a consistent shape instead of shrinking to only observed samples.
- Users can select a day such as `2026-05-06` to inspect that day's observed uptime % and incidents.
- Consecutive down/degraded samples for one component are grouped into one incident window until a later up sample closes it.
- HTTP `502` samples are down samples when the returned status code is `502`.
- The public copy should say `observed duration` or `observed window` when GitHub Action cadence means exact downtime length cannot be proven.
- Rounded uptime badge values such as `100%` are not enough by themselves to decide whether a short incident should be visible.
- The UI should keep uptime % beside the timeline, not replace timeline pills or incident count with the percentage alone.
- `Observed uptime` means sample/window-derived uptime and should be labelled differently from Upptime's generated summary percentage when both are shown.
