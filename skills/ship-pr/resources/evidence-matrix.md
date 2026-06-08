# Evidence matrix

Maps locked-spec rows to verification artifacts in the PR.

## Matrix → PR mapping

| Locked spec | PR Test plan | PR Screenshots |
|-------------|--------------|----------------|
| H1, H2, … | Pass/fail + command run | Full-page image URL |
| E1, E2, … | Pass/fail + command run | Full-page image URL |

## Running checks

**Prefer automated tests** named in the spec row. If none exist yet:

1. Add focused e2e or integration test covering the row (minimal scope).
2. Or document a **manual script** (exact clicks/inputs) and mark `manual` in Test plan.

Each row must record:

```markdown
| ID | Check | Command | Result |
|----|-------|---------|--------|
| H1 | Guest sees pay CTA | `PLAYWRIGHT_BASE_URL=… npx playwright test -g "guest pays"` | pass |
| E1 | Owner has no pay button | same spec, owner test | pass |
```

## Order of execution

1. Typecheck / lint (if repo has them) — fast gate.
2. Unit tests touching changed modules.
3. E2e or manual matrix rows — happy paths first, then edge cases.

## Failure handling

- Fix and re-run failed row before PR.
- Do not open PR with failing matrix rows unless user explicitly accepts debt (note in Test plan).

## For `address-pr-review`

Re-read the matrix from the **current PR description** Test plan and Screenshots tables. Re-run **every row** after code changes — no partial refresh.
