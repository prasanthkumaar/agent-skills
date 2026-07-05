---
name: write-pr-description
description: Creates missing draft PRs or updates existing PR descriptions from the repo template, review ledger, and evidence manifest. Use after build-pr, update-pr, capture-evidence, code changes, or when PR bodies, screenshots, or rationale need to be accurate and low-jargon.
---

# Write PR Description

The only skill that creates draft PRs, updates PR descriptions, uploads PR images, or embeds uploaded image URLs.

## Process

1. Identify PR or stack branches and existing PR state.
2. Create a draft PR only when a branch has no PR.
3. Do not switch an existing ready PR back to draft.
4. Read the repo PR template when present.
5. Read the review ledger and evidence manifest.
6. Upload local screenshots when needed and update the manifest with uploaded URLs.
7. Write or update each PR description.
8. Self-check each PR description against its branch diff and evidence manifest.

## Description style

- Minimal jargon.
- Explain the problem, solution, and why.
- Keep each PR scoped to one coherent change.
- Do not mention grill, plan mode, agents, or internal skill names.
- Include screenshots only for that PR's branch.
- Include comments or rationale for non-obvious documented deviations only when relevant.

## Hard rules

- Never post review replies.
- Never resolve threads.
- Never claim evidence that is not in the evidence manifest.
- Never embed screenshots from a child branch in a parent PR.

## Output

Return PR links, draft or ready state, uploaded image URLs, and any PR accuracy concerns that still need triage.
