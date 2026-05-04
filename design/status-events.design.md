# NodeClaw Status Events Design

> **Current Version:** 0.1.0
> **Status:** Active implementation target
> **Session:** 519ee145-4708-49b8-9b9e-e57227b2ade7
> **Full history:** [../changelog/status-events.changelog.md](../changelog/status-events.changelog.md)

## Purpose

NodeClaw Status needs to communicate more than `online` / `down`. Upptime remains the uptime monitor and incident automation layer, while NodeClaw adds a separate Issue-driven Status Events layer for announcements, notices, scheduled work, operational reports, and manual incident reports.

## Target Outcome

GitHub Issues become the editorial surface for public status communication without causing ordinary announcements to appear under Upptime `Active Incidents`.

```text
GitHub Issue with NodeClaw status-event label and public metadata
  -> status event compiler
  -> api/status-events.json
  -> customBodyHtml renderer
  -> public status sections outside Active Incidents
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
- renders status communication sections on the status page
- keeps announcements, notices, scheduled work, reports, and manual incident reports separate from Upptime `Active Incidents`

## Event Types

| Type | Meaning | Public section |
|---|---|---|
| `announcement` | General public announcement | Announcements |
| `notice` | Minor or soft operational notice that is not a full outage | Current Notices |
| `maintenance` | Planned work, future schedule, or current maintenance note | Scheduled Maintenance |
| `operational-report` | Status report or post-change summary | Operational Reports |
| `incident` | Human-authored incident communication, separate from automatic Upptime outage issues | Manual Incident Reports |

Automatic Upptime downtime issues remain separate unless a later phase explicitly maps them into the NodeClaw event model.

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
components: status-page, app-health
audience: public
-->

NodeClaw Status monitoring is now active.

This page tracks NodeNetwork Website and NodeClaw App Health availability.
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

## Rendering Contract

The status page renderer is injected through `.upptimerc.yml`:

- `customHeadHtml` owns CSS for status event sections.
- `customBodyHtml` owns the renderer mount and browser-side script.
- The renderer fetches `/Nodeclaw-Status/api/status-events.json` from the status page base URL.
- The renderer inserts the event section after the main page header and before Upptime live incident/status sections.
- User-provided event fields are assigned through `textContent`, not `innerHTML`.

Target page order:

```text
NodeClaw System Status
introMessage
Status Events sections
All systems / Active Incidents
Live Status
Past Incidents
```

## Security and Privacy Rules

- Do not render raw issue body HTML.
- Publish only issues with `audience: public`.
- Do not publish supplier identity, internal routing, credentials, raw request payloads, private incident notes, or provider secrets.
- Keep component slugs public-safe.
- Failed metadata validation must exclude the event from public JSON.
- Issue comments become public updates only when a later explicit public-update marker is supported.

## Implementation Components

| Component | Role |
|---|---|
| `scripts/generate-status-events.mjs` | Reads GitHub issues and writes `api/status-events.json` |
| `.github/workflows/status-events.yml` | Regenerates status events after issue changes or manual dispatch |
| `.github/ISSUE_TEMPLATE/status-event.md` | Provides a safe issue authoring template |
| `.upptimerc.yml` | Injects renderer CSS and JS through Upptime-supported custom HTML fields |
| `api/status-events.json` | Public static event data contract |

## Upptime Template Update Boundary

Existing Upptime workflow files warn that direct edits may be overwritten by template updates. NodeClaw custom status-events workflow and scripts must be additive and clearly owned by NodeClaw rather than editing generated Upptime workflow bodies.

## Verification

Required checks:

- YAML parses.
- Compiler syntax passes.
- Compiler generates valid JSON from fixture input.
- Compiler generates valid JSON from real GitHub issues.
- Public renderer markers appear on the generated status page.
- Issue-driven announcement does not appear under Upptime `Active Incidents`.
- `api/status-events.json` contains only public-safe fields.
