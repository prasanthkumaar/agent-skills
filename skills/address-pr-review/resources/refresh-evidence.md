# Refresh evidence

Two tiers: **local checks** (every code change in the loop) and **full PR-body refresh** (merge-ready only).

## Local checks (autonomous loop — after every code change)

Run before push. Pick commands the repo uses:

```bash
pnpm check-types   # or equivalent
pnpm lint
pnpm build         # and storybook build if relevant
```

Do **not** skip because the fix looks trivial. Fix failures before push.

## Full refresh (merge-ready or user asks)

Mandatory when declaring **merge-ready** after code changed during the review loop. The PR description must remain the single place to review current behaviour.

### Trigger

- Declaring merge-ready after review-loop code changes.
- User explicitly asks to refresh evidence.
- E2e, test, or copy/UI changes that affect screenshot states.

Skip full refresh during autonomous loop rounds — local checks suffice.

### Approach

Re-run the **`ship-pr` verification pipeline** (steps 2–6): bootstrap env → verify matrix → capture screenshots → host via `gh image` → update PR body. Use OS temp for artifacts (`ship-pr` → temp-artifacts).

Load `ship-pr` and follow its resource files for mechanical steps.

### Steps

1. Parse Test plan / Screenshots from `gh pr view --json body`.
2. Bootstrap environment (`ship-pr`).
3. Re-run full verify matrix — every ID, not just touched rows.
4. Re-capture all screenshots — full page, every ID.
5. Re-host via `gh image`; replace all URLs in description.
6. Update PR body; note `Evidence refreshed after review pass (<date>, commit <sha>).`
7. Push via Graphite or `ship-pr` policy.

## Exit (merge-ready)

- [ ] Local checks passed on latest commit.
- [ ] Description Test plan matches latest run (if full refresh run).
- [ ] Description Screenshots URLs fresh (if full refresh run).
- [ ] User can review PR without running tests locally.
