# PR body composition

## Find repo template

Check in order (first hit wins):

- `.github/pull_request_template.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/pull_request_template.md`
- `PULL_REQUEST_TEMPLATE/` directory (use default or ask user)

If a template exists, **fill its sections** — do not ignore it.

## Fallback structure

When no template exists:

```markdown
## Summary
<1–3 sentences from Solution>

## Problem
<from locked spec>

## Design decisions
<from locked spec — no session meta>

## Test plan
| ID | Check | Command | Result |
|----|-------|---------|--------|
| H1 | … | … | pass |

## Screenshots
<tables from host-screenshots.md>

## Out of scope
<from locked spec>
```

## Template merge rules

| Locked spec section | Typical template slot |
|---------------------|----------------------|
| Problem | Summary / Context / Motivation |
| Solution | Summary / What changed |
| Design decisions | New section or "Decisions" if template has room |
| Happy + edge (tests) | Test plan |
| Screenshots | Screenshots (add section if template lacks it) |
| Out of scope | Notes / Non-goals |

Preserve template headings the repo expects (e.g. CodeRabbit config blocks, checklist items).

## Writing rules

- Complete sentences; no telegraphic lists in Summary.
- Design decisions = **what** was decided, not **how** it was decided.
- Test plan must list **every** matrix ID with command and pass/fail.
- Link PR to issue if template or branch name implies it (`Fixes #123`).

## Edit vs create

- **Create:** `gh pr create --base main --head <branch> --title "…" --body-file /tmp/pr-body.md`
- **Update:** `gh pr edit <num> --body-file /tmp/pr-body.md`

Use `--body-file` (heredoc) to preserve markdown tables.
