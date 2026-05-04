# NodeClaw Status Events

NodeClaw Status Events extends the Upptime status page with public communication that is not limited to online/down monitoring.

## What this is

- A GitHub Issue-driven announcement and reporting layer.
- A public status communication system for announcements, notices, scheduled work, operational reports, and manual incident reports.
- A companion to Upptime, not a replacement for Upptime checks.

## What this is not

- It is not a way to force ordinary announcements into Upptime `Active Incidents`.
- It is not raw issue-body rendering.
- It is not direct editing of generated `gh-pages/index.html`.

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
components: status-page, app-health
audience: public
-->

NodeClaw Status monitoring is now active.

This page tracks NodeNetwork Website and NodeClaw App Health availability.
```

Required metadata:

- `type`
- `severity`
- `state`
- `audience: public`

The first public paragraph after metadata becomes the public summary.

## Public safety

Only public-safe details should be written in the public summary section. Do not include internal supplier identity, secrets, private routing details, raw request payloads, or operator-only investigation notes.

## Status page behavior

The status page reads:

```text
/Nodeclaw-Status/api/status-events.json
```

Then renders separate sections before the Upptime status summary:

- Announcements
- Current Notices
- Scheduled Maintenance
- Operational Reports
- Manual Incident Reports

These sections are intentionally separate from Upptime `Active Incidents`.
