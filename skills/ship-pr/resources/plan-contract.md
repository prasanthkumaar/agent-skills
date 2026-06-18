# Plan file contract

The **approved harness plan** from `to-plan` is the single handoff into `ship-pr`. It lives at the harness default plan location (see `to-plan` → `harness-plan-mode.md`). User must approve the plan before implementation.

## Required sections

Same structure as `to-plan` → [plan-template.md](../../to-plan/resources/plan-template.md):

- Problem, Solution, User stories
- Implementation decisions, Testing decisions (TDD seams)
- Design decisions
- Happy paths table (`H1`, …)
- Edge cases table (`E1`, …)
- Out of scope
- Implementation steps
- Final step — ship (`ship-pr`)

## Rules

- Every happy-path and edge-case row must be **testable** and **screenshot-able**.
- IDs (`H1`, `E1`) are stable — they appear in PR Test plan and Screenshots.
- **Design decisions** copy into PR body (meta cleaned only).
- If edge cases are missing, stop and ask before shipping.

## Discovering the plan

```bash
ls -t ~/.cursor/plans/*.plan.md 2>/dev/null | head -1
ls -t ~/.claude/plans/*.md 2>/dev/null | head -1
```

Use the file from **this** planning session. User may paste path explicitly.

## Legacy

If no harness plan exists but a pasted locked-spec matches this structure, treat it as equivalent.
