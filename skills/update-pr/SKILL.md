---
name: update-pr
description: Updates an existing PR or stacked PR set after an approved follow-up change, chat feedback, GitHub comments, CI failures, or review findings, then returns it to agent-owned merge readiness. Use when the user says update PR, implement a chosen option, address this stack, revise the PR, fix review feedback, or rerun review after changes.
---

# Update PR

Thin orchestrator for existing PRs. It applies deltas, reruns review, refreshes evidence, and updates PR descriptions without duplicating the composable skill prompts.

## Quick start

1. Identify the existing PR or stack, branch order, base branches, and current draft/ready state.
2. Reuse the active review ledger when repo, PR numbers, and branch stack match.
3. Gather all new inputs: user chat, GitHub review comments, CI failures, stale PR description items, manual verification issues.
4. Split inputs into approved changes and judgement-needed feedback.
5. Run the deterministic loop below.

## Input routing

- If the user has already chosen the change, such as "implement option 4", convert it directly into a `fix` action for `fix-and-verify`.
- Do not rerun `triage` to re-decide an approved user choice.
- Lightweight routing is still required: identify the owner branch, stack order, affected PRs, and any safety blocker before editing.
- Run `triage` only for inputs that still need judgement, such as review findings, GitHub comments, CI failures, stale PR evidence, unclear chat feedback, or tradeoff calls.

## Deterministic loop

Work bottom-up for stacks.

1. Route approved changes to the correct owner branch or branch batch.
2. Run `triage` only for judgement-needed inputs plus open ledger items.
3. If `triage` returns `needs-user`, stop and ask with the relevant options.
4. If a fix belongs in an earlier branch, fix that branch first.
5. Run `fix-and-verify` with a fresh-context fix agent for each branch batch.
6. If code changed, run `multi-review` for that branch with all `review-*` lanes.
7. Run `triage` on new review findings and still-open ledger items. Repeat until no `fix` or `needs-user` items remain.
8. Restack children after parent changes, then continue upward.
9. Run `capture-evidence` when code, UI, story, or verification evidence changed.
10. Run `write-pr-description` for every affected PR.
11. Run `reply-github-comment` only for verified reply drafts that should be posted.

## Hard rules

- Do not create a new PR unless the branch has no PR.
- Do not switch an existing ready PR back to draft.
- Do not ask a bot to re-review when no code was pushed.
- Do not resolve GitHub threads.
- GitHub writes happen only through `write-pr-description` or `reply-github-comment`.
- Do not re-litigate an approved user choice; only route it, implement it, and verify it.

## Exit

Report what changed, which PR descriptions were updated, which comments were replied to, and what evidence proves the stack is back to agent-owned merge readiness.
