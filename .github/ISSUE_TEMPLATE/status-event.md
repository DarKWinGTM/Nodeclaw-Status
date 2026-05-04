---
name: NodeClaw Status Event
about: Publish a public announcement, notice, scheduled maintenance note, operational report, or manual incident report on NodeClaw Status.
title: "[Status Event] "
labels: "status:event"
assignees: ""
---

<!--
type: announcement
severity: info
state: active
pinned: false
startsAt:
endsAt:
scheduledFor:
components: status-page
audience: public
-->

Write the public summary here.

Keep this public-safe. Do not include secrets, supplier identity, private routing details, raw request payloads, or operator-only investigation notes.

## Type guide

- `announcement` — general public announcement
- `notice` — minor or soft operational notice, not a full outage
- `maintenance` — planned work or schedule notice
- `operational-report` — status report or post-change summary
- `incident` — human-authored incident communication

## Required label

- `status:event`

## Optional mirror/fallback labels

The metadata block above is the primary contract. Add these labels when you want searchable mirrors or fallback values:

- `status:type:announcement`, `status:type:notice`, `status:type:maintenance`, `status:type:operational-report`, or `status:type:incident`
- `status:severity:info`, `status:severity:minor`, `status:severity:major`, or `status:severity:critical`
- `status:state:scheduled`, `status:state:active`, or `status:state:resolved`
- `status:pinned`
- `component:<public-component-slug>`

Use metadata `state: draft` or `state: archived` for hidden events that should not publish.
