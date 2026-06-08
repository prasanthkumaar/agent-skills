# Agent skills — PR workflow

Composable skills for shipping and maintaining pull requests with verified evidence.

## Pipeline

```text
grill-me (elsewhere)  →  locked spec
        ↓
    ship-pr  →  PR (tests + full-page screenshots in description)
        ↓
address-pr-review  →  updated PR after review comments
```

## Skills in this repo

| Skill | Purpose |
|-------|---------|
| [ship-pr](skills/ship-pr/SKILL.md) | Locked spec → implement → verify → screenshot → open PR |
| [address-pr-review](skills/address-pr-review/SKILL.md) | Review comments → interview → fix/reply → refresh all evidence |

Install **both** for the full loop. `address-pr-review` re-runs the `ship-pr` verification pipeline after fixes.

## Install (skills.sh)

```bash
# From GitHub (after push)
npx skills add prasanthkumaar/agent-skills@ship-pr -g -y -a cursor
npx skills add prasanthkumaar/agent-skills@address-pr-review -g -y -a cursor

# From local clone (while iterating)
npx skills add ~/Desktop/repos/agent-skills \
  -s ship-pr -s address-pr-review -g -y -a cursor
```

Remove superseded skill:

```bash
npx skills remove pr-review-cycle -g -y
```

Update after push:

```bash
npx skills update ship-pr address-pr-review -g -y
```

## Cross-skill composition

Skills do **not** link across folders with relative paths. `address-pr-review` refers to `ship-pr` by name only (Matt Pocock pattern).

## Replaced

- `pr-review-cycle` → `address-pr-review`
- `gh-address-comments` → folded into `address-pr-review` (optional to uninstall)

## Related (not in this repo)

- `grill-me` — produces the locked spec input for `ship-pr`
- `split-to-prs` — split work before shipping
- `babysit` — CI green / merge conflicts (orthogonal)
