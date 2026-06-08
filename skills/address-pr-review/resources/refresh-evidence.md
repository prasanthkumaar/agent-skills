# Refresh evidence

Mandatory after **any** code change in `address-pr-review`. The PR description must remain the single place to review current behaviour.

## Trigger

Run full refresh when:

- Any source file changed in response to review.
- E2e or test files changed.
- Copy/UI changed that affects screenshot states.

Skip only when **reply-only** resolutions with zero code or description changes — still re-read description for accuracy.

## Approach

Re-run the **`ship-pr` verification pipeline** (steps 2–6 of that skill): bootstrap env → verify matrix → capture screenshots → host via `gh image` → update PR body.

Both skills should be installed. Do not link across skill folders — load `ship-pr` and follow its resource files for the mechanical steps. This file is the **when and what** checklist for review passes.

## Steps

### 1. Read current matrix from PR

Parse **Test plan** and **Screenshots** tables from `gh pr view --json body`.

If tables missing, reconstruct from design decisions in the description or ask the user.

### 2. Bootstrap environment

Follow `ship-pr` → bootstrap environment (detect dev/test commands, start app, confirm health). Do not assume a dev server is still running from an earlier session.

### 3. Re-run all checks

Follow `ship-pr` → verify evidence matrix.

- Every ID in Test plan — not just rows touched by the fix.
- Update Result column and run timestamp.

### 4. Re-capture all screenshots

Follow `ship-pr` → capture screenshots.

Full page, every ID — **even if you expect no visual change**.

### 5. Re-host images

Follow `ship-pr` → host screenshots (`gh image` → `user-attachments` URLs).

Replace **all** URLs in description tables.

### 6. Update PR body

Follow `ship-pr` → compose PR body.

- Preserve template structure and non-screenshot sections.
- Update Test plan results.
- Replace Screenshots URLs.
- Optional note: `Evidence refreshed after review pass (<date>, commit <sha>).`

```bash
gh pr view {n} --json body -q .body > /tmp/pr-body.md
# … edit …
gh pr edit {n} --body-file /tmp/pr-body.md
```

### 7. Push

Follow `ship-pr` → push policy (`git push --force-with-lease` when updating an open PR branch).

## Exit

- [ ] Description Test plan matches latest run.
- [ ] Description Screenshots URLs all fresh (`user-attachments`).
- [ ] User can review PR without running tests locally.
