---
name: fix-and-verify
description: Applies triaged fixes with fresh-context branch-owned fix agents, verifies the fixes, and drafts evidence-backed replies without posting them. Use after triage has produced fix or reply-only items for one PR or a stacked PR set.
---

# Fix And Verify

Executes triaged actions. Reviewer agents and fix agents must stay separate.

## Process

1. Read the triage action table and review ledger.
2. Batch compatible `fix` items by owner branch.
3. Assign one fresh-context fix agent per branch batch.
4. Fix parent branches before child branches.
5. Run branch-relevant checks after edits.
6. Commit and push verified code changes.
7. Append fix evidence to the review ledger.
8. Draft replies for `reply-only`, `false-positive`, `acceptable-tradeoff`, and fixed items when useful.

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
- checks run with outputs
- reply drafts with target comment IDs when available
- whether code changed and `multi-review` must rerun

## Hard rules

- Do not post GitHub replies.
- Do not update PR descriptions.
- Do not resolve threads.
- Do not claim fixed without fresh verification evidence.
