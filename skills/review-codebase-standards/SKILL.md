---
name: review-codebase-standards
description: Reviews a full branch diff against repository conventions, AGENTS.md, CLAUDE.md, local docs, naming, file structure, and code readability. Use inside multi-review or when the user asks whether a branch follows codebase standards.
---

# Review Codebase Standards

Read-only standards review lane.

## Process

1. Read repository guidance: `AGENTS.md`, `CLAUDE.md`, app/package guidance, `CONTRIBUTING.md`, ADRs, and relevant convention docs.
2. Read the full branch diff against its parent.
3. Check naming, file placement, structure, comments, tests, and whether code reads clearly in local project style.
4. Skip issues already enforced by formatting or lint tools unless the diff shows a likely tooling gap.

## Output

For each finding include:

- branch and owner branch
- location
- violated standard with file path or quote
- why this matters
- suggested triage judgement if obvious

## Hard rules

- Read-only.
- Cite the local standard when claiming a standards violation.
- Do not impose external taste when the repo has a documented local pattern.
