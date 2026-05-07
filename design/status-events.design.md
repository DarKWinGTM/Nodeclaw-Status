# NodeClaw Status Events Design

> **Current Version:** 0.2.4
> **Status:** Active local implementation; release verification pending
> **Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7
> **Full history:** [../changelog/status-events.changelog.md](../changelog/status-events.changelog.md)

## Purpose

NodeClaw Status needs to communicate more than the current `online` / `down` snapshot. Upptime remains the uptime monitor and incident automation layer, while NodeClaw adds two public communication layers: Issue-driven Status Events for editorial announcements/notices/reports, and a Git/Upptime-derived Status Timeline for visible 24-hour uptime percentages and daily incident history.

## Target Outcome

GitHub Issues become the editorial surface for public status communication without causing ordinary announcements to appear under Upptime `Active Incidents`.

```text
GitHub Issue with NodeClaw status-event label and public metadata
  -> status event compiler
  -> api/status-events.json
  -> customBodyHtml event renderer
  -> public status sections outside Active Incidents

Upptime check/history updates and Git check commits
  -> status timeline compiler
  -> api/status-timeline/index.json + api/status-timeline/days/YYYY-MM-DD.json
  -> customBodyHtml timeline renderer
  -> public 24-hour uptime percentage, timeline, and daily incident history outside Active Incidents
```

## Design Boundary

### Upptime-owned behavior

- checks `sites` from `.upptimerc.yml`
- records uptime, response time, summaries, graphs, and history
- opens/closes real downtime incidents
- owns the default incident and maintenance semantics

### NodeClaw-owned behavior

- labels and parses issues with `status:event`
- compiles public-safe event data into `api/status-events.json`
- compiles Upptime/Git history into public status timeline JSON
- renders status communication, uptime percentage, and timeline sections on the status page
- keeps announcements, notices, scheduled work, reports, manual incident reports, and timeline history separate from Upptime `Active Incidents`

## Event Types

| Type | Meaning | Public section |
|---|---|---|
| `announcement` | General public announcement | Announcements |
| `notice` | Minor or soft operational notice that is not a full outage | Current Notices |
| `maintenance` | Planned work, future schedule, or current maintenance note | Scheduled Maintenance |
| `operational-report` | Status report or post-change summary | Operational Reports |
| `incident` | Human-authored incident communication, separate from automatic Upptime outage issues | Manual Incident Reports |

Automatic Upptime downtime issues remain separate unless a later phase explicitly maps them into the NodeClaw event model.

## Status Timeline and Incident History

The Status Timeline layer turns Upptime's checked history into a public, component-based timeline with visible uptime percentages. It is not a replacement for Upptime's current-status summary or automatic incident engine; it is a clearer history renderer for outage samples and uptime context that already exist in Git/history data.

### Timeline data sources

- Upptime `history/*.yml`, response/uptime API snapshots, and check-result commits are valid inputs.
- Git commit/check history is the preferred source for reconstructing short 502/down samples that rounded uptime summaries may hide.
- GitHub Issue status events remain editorial records and can annotate the timeline only through explicit public-safe mapping.
- The renderer must not query raw GitHub history on every page load; timeline data should be compiled into static JSON first.

### Timeline windows

| Window | Public behavior |
|---|---|
| Current 24 hours | Default component timeline showing 24-hour uptime % and exactly 24 fixed hourly bars; the rightmost bar ends at the current window end and bars to the left cover the previous 24 hours. |
| Daily archive | Date-selectable `YYYY-MM-DD` views with 24 fixed hourly bars, observed daily uptime %, and grouped incidents so users can inspect a specific past day. |
| Incident detail | Grouped down/degraded windows with first observed failure, last observed failure, recovery sample when present, status code, response-time samples, affected component, observed duration, and incident impact on observed uptime %. |

### Incident grouping rules

- Consecutive non-up samples for the same component belong to one incident window until an `up` sample closes it.
- A later non-up sample after an intervening `up` sample starts a new incident.
- If checks are sparse or delayed, duration wording must be `observed duration` / `observed window`, not exact downtime.
- HTTP `502` from Cloudflare or origin failure is a down sample when the returned status code is `502`.
- Body-marker checks such as `__dangerous__body_down` are optional defense-in-depth for false-200 error pages, not the primary rule for normal HTTP 502 detection.

### Uptime percentage rules

- Component rows should show uptime percentage near the timeline so users can read numeric reliability and visual history together.
- `upptimeUptimePercent` may mirror Upptime-generated percentage JSON when the scope matches the displayed window.
- `observedUptimePercent` is computed from timeline samples/windows and must be labelled as observed uptime when exact second-level availability cannot be proven.
- Daily archive rows should include sample counts such as `sampleCount`, `upSampleCount`, `downSampleCount`, `degradedSampleCount`, and `unknownSampleCount` so the percentage has context.
- Rounded `100%` values must not hide incident count or down/degraded timeline segments.
- Timeline `segments` are fixed hourly display buckets, not one DOM bar per observed sample; sparse windows still render unknown/no-sample bars so the page keeps a consistent 24-hour visual shape.

## State Model

| State | Meaning | Public output |
|---|---|---|
| `draft` | Not published to the public status page | Hidden |
| `scheduled` | Visible as future/planned work if its time window is public | Visible |
| `active` | Current visible event | Visible |
| `resolved` | Completed/resolved event retained in public status communication | Visible |
| `archived` | Hidden from primary public sections unless history mode is added later | Hidden |

## Label Contract

Required routing label:

```text
status:event
```

Recommended mirror/fallback labels:

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
status:pinned
```

The compiler prefers metadata for `type`, `severity`, and `state`, then falls back to labels when those metadata fields are absent. Hidden states such as `draft` and `archived` are metadata states and are excluded from public JSON.

Component labels use:

```text
component:<public-component-slug>
```

Examples:

```text
component:status-page
component:node-network
component:app-health
component:runtime-health
component:payg
component:dashboard
```

## Issue Metadata Contract

The compiler reads a YAML-like metadata block at the top of the issue body:

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

Required fields:

- `type`
- `severity`
- `state`
- `audience: public`

Optional fields:

- `pinned`
- `startsAt`
- `endsAt`
- `scheduledFor`
- `components`

The issue title becomes the event title. The first public paragraph after metadata becomes the event summary.

## Generated JSON Contract

`api/status-events.json` is the public static interface consumed by the status page.

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-05-04T15:43:01.676Z",
  "source": {
    "owner": "DarKWinGTM",
    "repo": "Nodeclaw-Status",
    "label": "status:event"
  },
  "invalidCount": 0,
  "events": [
    {
      "id": "6",
      "issueNumber": 6,
      "sourceIssue": "https://github.com/DarKWinGTM/Nodeclaw-Status/issues/6",
      "title": "NodeClaw Status monitoring is now active",
      "type": "announcement",
      "severity": "info",
      "state": "active",
      "pinned": true,
      "components": ["status-page", "app-health"],
      "startsAt": "2026-05-04T15:00:00.000Z",
      "endsAt": null,
      "scheduledFor": null,
      "publishedAt": "2026-05-04T15:42:24.000Z",
      "updatedAt": "2026-05-04T15:42:24.000Z",
      "summary": "NodeClaw public status monitoring is now active.",
      "updates": []
    }
  ]
}
```

`api/status-timeline/index.json` is the public static index for the latest timeline window and available daily archives.

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-05-08T00:00:00.000Z",
  "source": {
    "owner": "DarKWinGTM",
    "repo": "Nodeclaw-Status",
    "type": "upptime-git-history"
  },
  "currentWindow": {
    "label": "latest 24 hours",
    "startsAt": "2026-05-07T00:00:00.000Z",
    "endsAt": "2026-05-08T00:00:00.000Z"
  },
  "availableDays": [
    {
      "date": "2026-05-07",
      "path": "api/status-timeline/days/2026-05-07.json"
    }
  ],
  "components": [
    {
      "slug": "runtime-health",
      "name": "NodeClaw Runtime Health",
      "publicUrl": "https://runtime.nodenetwork.ovh/health",
      "uptime": {
        "window": "24h",
        "upptimeUptimePercent": 100,
        "observedUptimePercent": 99.3,
        "sampleCount": 288,
        "upSampleCount": 286,
        "downSampleCount": 2,
        "degradedSampleCount": 0,
        "unknownSampleCount": 0,
        "incidentCount": 1
      },
      "segments": [
        {
          "state": "unknown",
          "startsAt": "2026-05-07T00:00:00.000Z",
          "endsAt": "2026-05-07T01:00:00.000Z",
          "observedDurationSeconds": 3600,
          "sampleCount": 0,
          "statusCode": null,
          "statusCodes": [],
          "responseTimeMs": null,
          "source": null,
          "bucketIndex": 0,
          "bucketCount": 24
        }
      ],
      "incidents": []
    }
  ]
}
```

`api/status-timeline/days/YYYY-MM-DD.json` carries the selected day detail.

```json
{
  "schemaVersion": 1,
  "date": "2026-05-06",
  "components": [
    {
      "slug": "runtime-health",
      "uptime": {
        "window": "day",
        "observedUptimePercent": 99.3,
        "sampleCount": 288,
        "upSampleCount": 286,
        "downSampleCount": 2,
        "degradedSampleCount": 0,
        "unknownSampleCount": 0
      },
      "segments": [
        {
          "state": "down",
          "startsAt": "2026-05-06T23:00:00.000Z",
          "endsAt": "2026-05-07T00:00:00.000Z",
          "observedDurationSeconds": 3600,
          "sampleCount": 1,
          "statusCode": 502,
          "statusCodes": [502],
          "responseTimeMs": 714,
          "source": "git-check",
          "bucketIndex": 23,
          "bucketCount": 24
        }
      ],
      "incidents": [
        {
          "state": "down",
          "startsAt": "2026-05-06T23:38:32.724Z",
          "lastObservedAt": "2026-05-06T23:38:32.724Z",
          "endsAt": "2026-05-06T23:43:32.724Z",
          "recoveryAt": "2026-05-06T23:43:32.724Z",
          "observedDurationSeconds": 300,
          "sampleCount": 1,
          "statusCodes": [502],
          "maxResponseTimeMs": 714,
          "summary": "Down samples observed with HTTP 502. Duration is an observed window from sparse checks."
        }
      ]
    }
  ]
}
```

## Rendering Contract

The status page renderer is injected through `.upptimerc.yml`:

- `customHeadHtml` owns the NodeNetwork-aligned page theme and status event/timeline section CSS.
- `customBodyHtml` owns the renderer mount and browser-side script.
- The event renderer fetches `/Nodeclaw-Status/api/status-events.json` from the status page base URL.
- The timeline renderer fetches `/Nodeclaw-Status/api/status-timeline/index.json` and the selected `api/status-timeline/days/YYYY-MM-DD.json` day file.
- The renderer shows uptime % next to each component timeline row, using `24h uptime` for the default window and `observed uptime` for daily archive rows when sample-derived.
- The renderer displays the compiler-provided 24 fixed hourly `segments` as pill bars, with the rightmost bar representing the current 24-hour window end in the default view.
- The renderer inserts event, uptime, and timeline sections after the main page header and before Upptime live incident/status sections.
- User-provided event, uptime, and timeline fields are assigned through `textContent`, not `innerHTML`.

Target page order:

```text
NodeClaw System Status
introMessage
Status Timeline and Incident History
Status Events sections
All systems / Active Incidents
Live Status
Past Incidents
```

## Security and Privacy Rules

- Do not render raw issue body HTML.
- Publish only issues with `audience: public`.
- Do not publish supplier identity, internal routing, credentials, raw request payloads, private incident notes, provider secrets, raw headers, or raw provider error HTML.
- Timeline output may publish public component name/slug, uptime percentage, sample counts, observed state, timestamp window, status code, response time, and public summary only.
- Keep component slugs public-safe.
- Failed metadata validation must exclude the event from public JSON.
- Issue comments become public updates only when a later explicit public-update marker is supported.
- Timeline-derived incident summaries must stay evidence-calibrated and avoid claiming exact downtime when only sparse check samples exist.

## Implementation Components

| Component | Role |
|---|---|
| `scripts/generate-status-events.mjs` | Reads GitHub issues and writes `api/status-events.json` |
| `scripts/generate-status-timeline.mjs` | Reads Upptime history/Git check data and writes status timeline JSON |
| `.github/workflows/status-events.yml` | Regenerates status events after issue changes, manual dispatch, Setup CI, or Static Site CI so `api/status-events.json` is restored after site deploys |
| `.github/workflows/status-timeline.yml` | Regenerates timeline JSON after Upptime check/history changes, manual dispatch, or Static Site CI so `api/status-timeline/*` is restored after site deploys |
| `.github/ISSUE_TEMPLATE/status-event.md` | Provides a safe issue authoring template |
| `.upptimerc.yml` | Injects renderer CSS and JS through Upptime-supported custom HTML fields |
| `api/status-events.json` | Public static event data contract |
| `api/status-timeline/index.json` | Public static timeline index and current 24-hour pointer |
| `api/status-timeline/days/YYYY-MM-DD.json` | Public static daily timeline detail contract |

## Upptime Template Update Boundary

Existing Upptime workflow files warn that direct edits may be overwritten by template updates. NodeClaw custom status-events and status-timeline workflows and scripts must be additive and clearly owned by NodeClaw rather than editing generated Upptime workflow bodies.

Generated Upptime `Static Site CI` may republish the public `gh-pages` site without preserving custom `api/` files. NodeClaw-owned API workflows therefore republish `api/status-events.json` and `api/status-timeline/*` after successful `Static Site CI` runs, with `keep_files: true`, so public JSON remains available without editing generated Upptime workflow bodies. The NodeClaw-owned API workflows share one API publish concurrency group so their `gh-pages` publishes serialize instead of racing each other after `Static Site CI`.

## Verification

Required checks:

- YAML parses.
- Status event compiler syntax passes.
- Status event compiler generates valid JSON from fixture input.
- Status event compiler generates valid JSON from real GitHub issues.
- Timeline compiler generates valid index/day JSON from fixture Upptime/Git history, including an HTTP 502 sample.
- Public renderer and whole-page theme markers appear on the generated status page.
- Status Timeline shows current 24-hour uptime %, exactly 24 fixed hourly bars for the current window, and a date-selectable daily archive with observed uptime %.
- Issue-driven announcement does not appear under Upptime `Active Incidents`.
- `api/status-events.json` and timeline JSON contain only public-safe fields.
- Timeline verification distinguishes observed check windows and observed uptime % from exact outage duration or second-level availability.
