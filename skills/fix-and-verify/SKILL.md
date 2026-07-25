---
name: fix-and-verify
description: Applies explicitly selected review-ledger findings with fresh-context branch-owned fix agents, verifies fixes, and drafts evidence-backed replies without posting them. Use when the user selects finding IDs from multi-review for one PR or a stacked PR set.
---

# Fix And Verify

Executes selected review actions. Reviewer agents and fix agents must stay separate.

## Process

1. Read the review ledger and the user's explicit list of selected finding IDs.
2. Confirm every selected ID exists and read its judgement, owner branch, trade-off, and next action. Stop on a missing or ambiguous ID.
3. Batch selected `fix` items by owner branch.
4. Assign one fresh-context fix agent per branch batch.
5. Fix parent branches before child branches.
6. Run branch-relevant checks after edits.
7. Commit and push verified code changes.
8. Append fix evidence to the selected ledger findings.
9. Draft replies for selected `reply-only`, `false-positive`, `acceptable-tradeoff`, and fixed items when useful.

## Stack rules

- If a child branch exposes a parent issue, stop child work and fix the parent first.
- After parent changes, restack or rebase children upward before continuing.
- Do not edit across branch ownership unless the orchestrator assigns it.

## Commit and push

Commit only after branch-relevant checks pass.

For a single branch:

1. Commit the verified changes with a clear conventional commit message.
2. Push the branch.

For a stack:

1. Commit on the owner branch where the fix belongs.
2. Work upward from the parent branch to children.
3. If Graphite is installed and the repo uses it, use the Graphite CLI to restack and submit the stack.
4. If Graphite is not available for the repo, restack with Git and push changed stacked branches with `--force-with-lease`.
5. Never use bare `--force`.

If no code changed, do not push just to post replies or update descriptions.

## Verification

Use the strongest practical checks for the changed branch: tests, type checks, lint, build, browser checks, Storybook checks, or direct command output.

## Output

- branches changed
- commits and pushed branches
- items fixed
- selected finding IDs and any selected items that required no code change
- checks run with outputs
- reply drafts with target comment IDs when available
- whether code changed and `multi-review` must rerun

## Hard rules

- Do not post GitHub replies.
- Do not update PR descriptions.
- Do not resolve threads.
- Do not claim fixed without fresh verification evidence.
- Do not act on an open finding unless the user selected its ID.
