---
name: review-pr
description: Reviews an existing PR or stacked PR set, then drives any findings through triage, fixing, evidence capture, and PR description updates. Use when the user asks to review an already-open PR or stack, run the full review loop, make PRs merge ready, or rerun multi-review without a new requested code change.
---

# Review PR

Thin orchestrator for an existing PR or stack. Use this when the starting point is "review what is already up", not "make a new requested change".

## Quick start

1. Identify repo, PR number or stack, branch order, parent branches, and current draft/ready state.
2. Reuse the active review ledger when repo, PR numbers, and branch stack match.
3. Run the deterministic loop below bottom-up.
4. Do not switch ready PRs back to draft.

## Deterministic loop

For each branch, starting from the earliest parent:

1. Run `multi-review` on the full branch diff against its parent.
2. Run `triage` across review findings, GitHub comments, CI failures, chat feedback, manual verification, and PR accuracy issues.
3. If `triage` has `needs-user`, stop and ask with the relevant options.
4. If `triage` has `fix` or `reply-only` items, run `fix-and-verify` for a compatible branch batch.
5. If code changed, rerun `multi-review` for that branch.
6. Repeat until `triage` has no `fix` or `needs-user` items for that branch.
7. Move to the child branch. If a child reveals a parent issue, return to the parent, fix there, restack upward, then continue.
8. Run `capture-evidence` when evidence is missing or stale.
9. Run `write-pr-description` for affected PRs.
10. Run `reply-github-comment` only for verified reply drafts that should be posted.

## Hard rules

- No new requested code change is required to use this skill.
- Reviewers are fresh-context and read-only.
- Fix agents are separate fresh-context agents.
- Do not create new PRs unless an expected stack branch has no PR.
- Do not mark PRs ready for review unless the user explicitly asks in normal chat.
- Do not resolve GitHub threads.
- GitHub writes happen only through `write-pr-description` or `reply-github-comment`.

## Exit

Report PR or stack status, open triage items, fixes made, evidence captured, PR descriptions updated, and replies posted.
