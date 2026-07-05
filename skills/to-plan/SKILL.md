---
name: to-plan
description: Synthesises grill decisions into one implementation plan using the harness Plan mode (Cursor, Claude, Codex). Plan includes Matt-style PRD/TDD seams, evidence matrix, build steps, and a final step to run build-pr. Use after grill-me or grill-with-docs when alignment is complete, or when the user says to-plan or make the plan.
---

# To plan

Turn **shared understanding** from grilling into **one approved plan file** via the **harness Plan mode** — not Agent mode. Do not implement.

## Quick start

1. Confirm grilling is complete (no open decision branches).
2. Enter Plan mode → [resources/harness-plan-mode.md](resources/harness-plan-mode.md).
3. Fill [resources/plan-template.md](resources/plan-template.md) in the harness plan output.
4. User approves plan → **stop** → next skill is `build-pr` (not auto-invoked).

## Hard rules

- **Plan mode only** for authoring — no file edits except the harness plan artifact.
- **No implementation** in this skill.
- **No re-interview** — synthesise grill context only; explore repo for seams/tests if needed.
- **One plan file** — harness default location; do not duplicate to a second spec file.
- **Do not auto-run `build-pr`** — plan must include it as the explicit final implementation step.
- Confirm **test seams** with user before locking plan (Matt `to-prd` step).

## Exit gate

Plan approved by user → tell user to invoke **`build-pr`** (or user says build it). Record plan path for `build-pr`.

## Anti-patterns

- Agent mode plan in chat only · skipping happy/edge matrix · implementing after plan · auto-ship without approval

## Related

Template: [resources/plan-template.md](resources/plan-template.md). Harness: [resources/harness-plan-mode.md](resources/harness-plan-mode.md). Downstream: `build-pr` reads approved plan. Upstream: `grill-me`, `grill-with-docs`, `build-context`.
