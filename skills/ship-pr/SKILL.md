---
name: ship-pr
description: Turns a locked design spec into a merge-ready pull request with verified happy-path and edge-case tests and full-page screenshots embedded in the PR description. Use when the user says ship it, raise the PR, plan to PR, or after a design/spec session is finalized and ready to implement.
---

# Ship PR

Turn a **locked spec** into a PR that is ready for review: implemented, verified, screenshotted, and described — without mentioning how the spec was produced.

## Quick start

1. Confirm the locked spec exists (see [resources/locked-spec-contract.md](resources/locked-spec-contract.md)).
2. Implement → bootstrap env → run evidence matrix → capture screenshots → compose PR body → push.
3. Exit only when every matrix row is green and every screenshot URL is in the **PR description** (not on the branch).

## Input

A **locked spec** artifact with: Problem, Solution, Design decisions, Happy paths, Edge cases, Out of scope.  
If any section is missing, stop and fill gaps with the user before coding.

## Hard rules

- **Verify before push.** Do not declare the environment blocked until [resources/env-bootstrap.md](resources/env-bootstrap.md) is exhausted.
- **Evidence before PR.** Every happy-path and edge-case row needs a passing check **and** a full-page screenshot.
- **Screenshots in the description only.** Upload via `gh image` (`user-attachments` CDN). Never commit PNGs. See [resources/host-screenshots.md](resources/host-screenshots.md).
- **Follow the repo PR template** if one exists; otherwise use [resources/pr-body.md](resources/pr-body.md).
- **No meta references** to how the spec was produced (no "grill", "interview", "prototype canvas", etc.) in commits, PR title, or body.
- **Stacked PRs:** use `git push --force-with-lease`, never bare `--force`. See [resources/git-push.md](resources/git-push.md).

## Anti-patterns

- Pushing before local verification runs.
- Cropping screenshots to a single component instead of the full screen the reviewer will see.
- Posting screenshots as a PR comment instead of embedding them in the description.
- Committing screenshot files to git.
- Skipping edge cases that were locked in the spec.
- Assuming stack-specific env tooling without reading the repo first.

## Workflow

### 0. Preflight

- [ ] Confirm current branch and base (main, feature branch, or worktree — do not over-fit to one layout).
- [ ] `git fetch`; merge or rebase onto default branch if behind.
- [ ] Read locked spec; confirm happy + edge matrix is complete.

### 1. Implement

- [ ] Scope = locked spec only; no drive-by refactors.

### 2. Bootstrap environment

→ [resources/env-bootstrap.md](resources/env-bootstrap.md)

- [ ] Detect dev and test commands from the repo.
- [ ] Start the app; confirm it responds.
- [ ] Only then declare env blocked (with specific missing var **names**, never values).

### 3. Verify evidence matrix

→ [resources/evidence-matrix.md](resources/evidence-matrix.md)

- [ ] For each happy-path and edge-case row: run automated test or scripted manual check.
- [ ] Record command + result for the PR Test plan section.

### 4. Capture screenshots

→ [resources/capture-screenshots.md](resources/capture-screenshots.md)

- [ ] Full viewport or fullPage — both columns / full screen, not a cropped card.
- [ ] One screenshot per matrix row (or grouped table in description).

### 5. Host screenshots

→ [resources/host-screenshots.md](resources/host-screenshots.md)

- [ ] Upload via `gh image`; embed `user-attachments` URLs in description.
- [ ] Do not leave PNGs in the working tree for commit.

### 6. Compose PR body

→ [resources/pr-body.md](resources/pr-body.md)

- [ ] Merge repo template (if any) + Problem / Solution / Design decisions / Test plan / Screenshots.
- [ ] Design decisions copied from spec; wording cleaned of session meta.
- [ ] Screenshots section is mandatory.

### 7. Push and open PR

→ [resources/git-push.md](resources/git-push.md)

- [ ] `git push --force-with-lease` when updating an existing branch.
- [ ] `gh pr create` or `gh pr edit` with body from file (`--body-file`).

### 8. Exit checklist

- [ ] All matrix rows verified.
- [ ] All screenshots in description; branch has no PNG commits.
- [ ] Typecheck / lint run if the repo defines them.
- [ ] PR description is the source of truth for the evidence matrix (used later by `address-pr-review`).

## Related

Upstream: locked spec (`grill-me` or equivalent). After review: `address-pr-review`. Split first: `split-to-prs`.
