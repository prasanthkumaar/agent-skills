# Agent skills — PR workflow

Composable skills for shipping and maintaining pull requests with verified evidence.

## Pipeline

```text
grill-me (elsewhere)  →  locked spec
        ↓
    ship-pr  →  PR awaiting review (tests + screenshots in description)
        ↓
triage-pr-comments  →  classify feedback (read-only)
        ↓
address-pr-review  →  user OK → fix/reply → poll → re-triage loop
```

## Skills in this repo

| Skill | Purpose |
|-------|---------|
| [ship-pr](skills/ship-pr/SKILL.md) | Locked spec → implement → verify → screenshot → open PR |
| [triage-pr-comments](skills/triage-pr-comments/SKILL.md) | Fetch + classify review feedback (read-only) |
| [address-pr-review](skills/address-pr-review/SKILL.md) | Review loop: triage → user OK → act → poll → re-triage |

Install **ship-pr**, **triage-pr-comments**, and **address-pr-review** for the full loop.

## Install (skills.sh)

```bash
npx skills add prasanthkumaar/agent-skills \
  -s ship-pr -s triage-pr-comments -s address-pr-review -g -y -a cursor

# Local clone while iterating
npx skills add ~/Desktop/repos/agent-skills \
  -s ship-pr -s triage-pr-comments -s address-pr-review -g -y -a cursor
```

Update after push:

```bash
npx skills update ship-pr triage-pr-comments address-pr-review -g -y
```

## Cross-skill composition

Skills refer to each other **by name only** (no relative paths across folders). `address-pr-review` loads `triage-pr-comments` each round and re-runs the `ship-pr` evidence pipeline after code changes.

## Replaced

- `pr-review-cycle` → `address-pr-review` + `triage-pr-comments`

## Related (not in this repo)

- `grill-me` — locked spec for `ship-pr`
- `split-to-prs` — split work before shipping
- `babysit` — CI green / merge conflicts (orthogonal)
