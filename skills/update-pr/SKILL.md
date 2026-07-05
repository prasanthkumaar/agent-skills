---
name: update-pr
description: Updates an existing PR or stacked PR set after chat feedback, GitHub comments, CI failures, or follow-up changes, then returns it to agent-owned merge readiness. Use when the user says update PR, address this stack, revise the PR, fix review feedback, or rerun review after changes.
---

# Update PR

Thin orchestrator for existing PRs. It applies deltas, reruns review, refreshes evidence, and updates PR descriptions without duplicating the composable skill prompts.

## Quick start

1. Identify the existing PR or stack, branch order, base branches, and current draft/ready state.
2. Reuse the active review ledger when repo, PR numbers, and branch stack match.
3. Gather all new inputs: user chat, GitHub review comments, CI failures, stale PR description items, manual verification issues.
4. Run the deterministic loop below.

## Deterministic loop

Work bottom-up for stacks.

1. Run `triage` on all new inputs plus open ledger items.
2. If a fix belongs in an earlier branch, fix that branch first.
3. Run `fix-and-verify` with a fresh-context fix agent for each branch batch.
4. If code changed, run `multi-review` for that branch with all `review-*` lanes.
5. Run `triage` again. Repeat until no `fix` or `needs-user` items remain.
6. Restack children after parent changes, then continue upward.
7. Run `capture-evidence` when code, UI, story, or verification evidence changed.
8. Run `write-pr-description` for every affected PR.
9. Run `reply-github-comment` only for verified reply drafts that should be posted.

## Hard rules

- Do not create a new PR unless the branch has no PR.
- Do not switch an existing ready PR back to draft.
- Do not ask a bot to re-review when no code was pushed.
- Do not resolve GitHub threads.
- GitHub writes happen only through `write-pr-description` or `reply-github-comment`.

## Exit

Report what changed, which PR descriptions were updated, which comments were replied to, and what evidence proves the stack is back to agent-owned merge readiness.
