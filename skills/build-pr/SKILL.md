---
name: build-pr
description: Builds one draft PR or a stacked draft PR set from an approved plan or current branch, then drives it to agent-owned merge readiness. Use when the user says build PR, raise PR, create draft PRs, prepare this branch, or after to-plan is approved.
---

# Build PR

Thin orchestrator for first-time PR creation. It does not contain review, fixing, evidence, or PR-body logic itself; it routes to the composable skills.

## Quick start

1. Identify repo, branch, base, and whether this is one PR or a stack.
2. If no PR exists, plan for draft PR creation through `write-pr-description`.
3. Run the deterministic loop below until every branch is agent-owned merge ready.
4. Leave new PRs in draft. Do not mark ready for review unless the user explicitly asks in normal chat.

## Deterministic loop

Work bottom-up for stacks.

1. `code-writing` implements the approved scope for the current branch.
2. Use `research-options` for broad non-obvious pattern choices.
3. Use `docs-check` before changing framework, library, API, config, test, or story patterns.
4. Run `multi-review` for the whole branch diff against its parent.
5. Run `triage` across all inputs: review findings, GitHub comments, CI, chat feedback, and manual verification.
6. Run `fix-and-verify` for compatible triaged fixes on the current branch.
7. If code changed, rerun `multi-review` for that branch.
8. Repeat until `triage` has no `fix` or `needs-user` items.
9. Move to the child branch. If a child exposes a parent issue, return to the parent, fix there, then restack upward.
10. Run `capture-evidence`.
11. Run `write-pr-description` to create missing draft PRs or update existing descriptions.

## Hard rules

- Fresh-context reviewer agents are separate from fix agents.
- Reviewers are read-only.
- New PRs are draft by default.
- Existing ready PRs stay ready; never switch them back to draft.
- PRs should be one coherent change, ideally under 300 lines unless the domain makes that impractical.
- Do not split for its own sake.
- GitHub writes happen only through `write-pr-description` or `reply-github-comment`.

## Exit

Report branch or PR list, review status, triage status, evidence captured, and PR description status.
