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

## Install (local)

Symlink or copy into your agent skills directory, e.g.:

```bash
ln -sf "$PWD/skills/ship-pr" ~/.claude/skills/ship-pr
ln -sf "$PWD/skills/address-pr-review" ~/.claude/skills/address-pr-review
```

Or publish via [skills.sh](https://skills.sh/) when ready.

## Replaced

- `pr-review-cycle` → superseded by `address-pr-review`

## Cross-skill composition (Matt Pocock pattern)

Skills do **not** link to each other with relative file paths (`../other-skill/...`).

- **Within a skill:** sibling files under `resources/` (or flat `.md` next to `SKILL.md`).
- **Between skills:** prose only — e.g. "`address-pr-review` re-runs the `ship-pr` verification pipeline".
- **Optional repo setup:** Matt uses a `setup-*` skill that writes `docs/agents/*.md` per repo; these PR skills stay repo-agnostic and discover commands from the target repo at runtime.

Install both `ship-pr` and `address-pr-review` for the full loop.

## Related (not in this repo)

- `grill-me` — produces the locked spec input for `ship-pr`
- `split-to-prs` — split work before shipping
- `babysit` — CI green / merge conflicts (orthogonal)
