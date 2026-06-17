# agent-skills

Personal agent skills (private repo: `prasanthkumaar/agent-skills`). **Clone location:** `~/ai/agent-skills`.

Skills are edited here, then installed globally into `~/.agents/skills/` (Claude Code symlinks from `~/.claude/skills/`).

## Skills in this repo

| Skill | Use when |
|-------|----------|
| `address-pr-review` | PR review loop — triage, fix, re-review, poll |
| `triage-pr-comments` | Classify PR feedback before acting |
| `ship-pr` | Open PR with evidence, screenshots, push policy |
| `code-writing` | TypeScript/TSX style and workflow |
| `deep-research` | Multi-round web research |
| `research-options` | Compare approaches before deciding |
| `voice-slack` | Draft Slack messages in your voice |

Other skills may exist globally (`~/.agents/skills/`) but not yet in this repo — migrate here when you want them versioned.

## Workflow

**1. Edit** — only under `skills/<name>/` in this repo. Never edit `~/.agents/skills/` or `~/.claude/skills/` directly.

**2. Refresh global install** (test locally; no push required):

```bash
npx skills add ~/ai/agent-skills -s <skill-name> -g -y
```

Refresh all repo skills:

```bash
for s in address-pr-review triage-pr-comments ship-pr code-writing deep-research research-options voice-slack; do
  npx skills add ~/ai/agent-skills -s "$s" -g -y
done
```

Use **`add` from the local path**, not `update` — `update` pulls from GitHub and ignores uncommitted edits.

**3. Ship:**

```bash
cd ~/ai/agent-skills
git add -A && git commit -m "…" && git push
```

**4. New chat** — start a fresh session if the agent cached old skill text.

## First install

```bash
git clone git@github.com:prasanthkumaar/agent-skills.git ~/ai/agent-skills
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

Verify: `npx skills list -g` and `ls ~/.agents/skills/`.

Ignore **PromptScript** global install failures.

## Other machines

After `git pull`:

```bash
npx skills update <skill-name> -g
```

Or re-run `npx skills add ~/ai/agent-skills -s <skill-name> -g` from a local clone.

## Switching source (GitHub → local)

```bash
npx skills remove <skill-name> -g
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

Only needed when changing install source or renaming a skill — not for every edit.

## Repo boundaries

- **`skills/`** — source of truth; commit and push changes here.
- **`npx skills add … -g`** — copies to `~/.agents/skills/` only. Does not write into this repo (no `.agents/` folder here).
