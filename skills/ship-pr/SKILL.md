---
name: ship-pr
description: Implements an approved to-plan harness plan into a merge-ready pull request with pre-PR reviewer loop, verified happy-path and edge-case tests, and full-page screenshots in the PR description. Use when the user says ship it, raise the PR, or after to-plan is approved.
---

# Ship PR

Turn an **approved plan** (`to-plan`) into a PR ready for review: implemented, internally reviewed, verified, screenshotted, and described.

## Quick start

1. Load approved plan file — [resources/plan-contract.md](resources/plan-contract.md) (harness default location).
2. Implement → bootstrap env → verify matrix → pre-PR review loop → re-verify if needed → screenshots → PR body → push.
3. Exit when loop-clean, matrix green, screenshots in PR description only.

## Input

Approved **plan file** from `to-plan` with: Problem, Solution, design/testing decisions, happy paths, edge cases, out of scope, implementation steps.  
Discover path via harness defaults or user-provided path. Legacy locked-spec paste OK if same structure.  
If required sections are missing, stop before coding.

## Hard rules

- **No push until pre-PR loop-clean.** See [resources/pre-pr-review-loop.md](resources/pre-pr-review-loop.md).
- **Verify before push.** Do not declare the environment blocked until [resources/env-bootstrap.md](resources/env-bootstrap.md) is exhausted.
- **Evidence before PR.** Every happy-path and edge-case row needs a passing check **and** a full-page screenshot.
- **Screenshots after loop.** Capture only after internal review fixes are done.
- **Screenshots in the description only.** Upload via `gh image` (`user-attachments` CDN). Never commit PNGs. See [resources/host-screenshots.md](resources/host-screenshots.md).
- **Ephemeral artifacts in OS temp.** See [resources/temp-artifacts.md](resources/temp-artifacts.md).
- **Follow the repo PR template** if one exists; otherwise use [resources/pr-body.md](resources/pr-body.md).
- **No meta references** to grill, plan mode, or session tooling in commits, PR title, or body.
- **Stacked PRs:** use `git push --force-with-lease`, never bare `--force`. See [resources/git-push.md](resources/git-push.md).

## Anti-patterns

- Pushing before pre-PR loop-clean or local verification.
- Screenshots before the review loop completes.
- Cropping screenshots to a single component instead of the full screen.
- Committing PNGs or temp specs to the repo workspace.
- Skipping edge cases locked in the spec.

## Workflow

### 0. Preflight

- [ ] Confirm branch and base; `git fetch`; rebase/merge if behind.
- [ ] Read approved plan; confirm happy + edge matrix complete — [resources/plan-contract.md](resources/plan-contract.md).

### 1. Implement

- [ ] Scope = approved plan only; no drive-by refactors.

### 2. Bootstrap environment

→ [resources/env-bootstrap.md](resources/env-bootstrap.md)

### 3. Verify evidence matrix (initial)

→ [resources/evidence-matrix.md](resources/evidence-matrix.md)

### 4. Pre-PR review loop

→ [resources/pre-pr-review-loop.md](resources/pre-pr-review-loop.md) · reviewers: [resources/reviewers.md](resources/reviewers.md)

- [ ] Launch **enabled** reviewers from `reviewers.md` in parallel each round.
- [ ] Parent dedupes → classify → fix straightforward items autonomously; ping on tradeoffs.
- [ ] Re-run until loop-clean (max 3 rounds autonomously).
- [ ] Deliver loop summary when exiting.

### 5. Re-verify matrix (if loop changed code)

→ [resources/evidence-matrix.md](resources/evidence-matrix.md) — full matrix, every row.

### 6. Capture screenshots

→ [resources/capture-screenshots.md](resources/capture-screenshots.md), [resources/temp-artifacts.md](resources/temp-artifacts.md)

### 7. Host screenshots

→ [resources/host-screenshots.md](resources/host-screenshots.md)

### 8. Compose PR body

→ [resources/pr-body.md](resources/pr-body.md)

### 9. Push and open PR

→ [resources/git-push.md](resources/git-push.md)

### 10. Exit checklist

- [ ] Pre-PR loop-clean; matrix green; screenshots in description only.
- [ ] Typecheck / lint if the repo defines them.
- [ ] **Deliver ship summary** to user — [resources/ship-summary.md](resources/ship-summary.md) (per-reviewer performance).
- [ ] PR **awaiting review** — hand off to `triage-pr-comments` → `address-pr-review`.

## Related

Upstream: `build-context` → `grill-me` / `grill-with-docs` → `to-plan`. After PR: `triage-pr-comments` → `address-pr-review`.
