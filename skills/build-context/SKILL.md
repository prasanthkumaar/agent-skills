---
name: build-context
description: Gathers relevant context from Slack, Notion, memory MCPs, and the codebase into a ≤300-word brief before grill or planning. Use when starting work on a feature, before grill-me, or when the user says build context or needs background on a topic like sgc-brain.
---

# Build context

Pre-grill reconnaissance. **Read only** — no code changes, no planning, no implementation.

## Quick start

1. Take the user's query (feature, area, or ticket).
2. Traverse sources in [resources/sources.md](resources/sources.md) — parallel where possible.
3. Deliver a **≤300-word** brief for the next step (`grill-me` or `grill-with-docs`).

## Hard rules

- **300 words max** in the delivered brief (exclude URLs).
- **No interview** — synthesise only; do not start grilling.
- **No implementation** or plan mode.
- **Redact** secrets and PII; name missing env vars, never values.
- Save scratch notes under `$TMPDIR` if needed; brief can be chat or temp file.

## Brief template

```markdown
## Context brief — {topic}
**Query:** {one line}
**Repo / area:** {path or product}

### What exists today
- …

### Decisions & constraints (from Slack / Notion / memory)
- …

### Gaps / unknowns for grill
- …

### Suggested grill focus
- …

**Sources:** {short list of what was consulted — not full dumps}
```

## Handoff

End with: **Next:** `grill-me` (general) or `grill-with-docs` (codebase + `CONTEXT.md`).

## Anti-patterns

- Dumping raw Slack/Notion paste · exceeding 300 words · skipping codebase when repo is open · grilling in this skill

## Related

Chain: `build-context` → `grill` → `to-plan` → `ship-pr` → `address-pr-review`. Sources: [resources/sources.md](resources/sources.md).
