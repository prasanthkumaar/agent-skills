# agent-skills

Personal agent skills (private repo). Installed globally into `~/.agents/skills/` with symlinks for Claude Code and other agents.

**Clone location:** `~/ai/agent-skills`

## Skills

| Skill | Purpose |
|-------|---------|
| [ship-pr](skills/ship-pr/SKILL.md) | Locked spec → PR with verified evidence |
| [triage-pr-comments](skills/triage-pr-comments/SKILL.md) | Classify PR review feedback (read-only) |
| [address-pr-review](skills/address-pr-review/SKILL.md) | Review loop: triage → user OK → act → poll |
| [code-writing](skills/code-writing/SKILL.md) | TypeScript style guide |
| [deep-research](skills/deep-research/SKILL.md) | Multi-source web research |
| [research-options](skills/research-options/SKILL.md) | Options analysis before deciding |
| [voice-slack](skills/voice-slack/SKILL.md) | Slack message voice |

PR pipeline: `ship-pr` → `triage-pr-comments` → `address-pr-review`.

## First install (local source)

Use the **local clone** as source of truth on this machine. Run interactively (omit `-y`) to pick agents.

```bash
# Optional: remove old remote-sourced copies first
npx skills remove ship-pr triage-pr-comments address-pr-review -g

npx skills add ~/ai/agent-skills -s ship-pr -g
npx skills add ~/ai/agent-skills -s triage-pr-comments -g
npx skills add ~/ai/agent-skills -s address-pr-review -g
```

Add other skills from this repo the same way (`code-writing`, `deep-research`, etc.).

Verify:

```bash
npx skills list -g
ls ~/.agents/skills/
```

Ignore **PromptScript** install failures — it does not support global install.

## Day-to-day workflow

**1. Edit** skill files in `~/ai/agent-skills/skills/…`

**2. Refresh one skill** after editing (no push required to test locally):

```bash
npx skills add ~/ai/agent-skills -s address-pr-review -g
```

**3. Ship** when the change is good:

```bash
cd ~/ai/agent-skills
git add -A && git commit -m "…" && git push
```

**4. Other machines** — clone to the same path, then either:

```bash
git clone git@github.com:prasanthkumaar/agent-skills.git ~/ai/agent-skills
npx skills add ~/ai/agent-skills -s ship-pr -g   # … each skill
```

or pull + update if already installed from GitHub:

```bash
cd ~/ai/agent-skills && git pull
npx skills update ship-pr triage-pr-comments address-pr-review -g
```

## Switching source (remote → local)

If skills were installed from `prasanthkumaar/agent-skills` on GitHub, remove then re-add from local:

```bash
npx skills remove <skill-name> -g
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

You do **not** need remove + add for every edit — only when changing source or renaming a skill.

## New chat sessions

Skills load from `~/.agents/skills/` automatically. No reinstall per chat.

After editing skills, run `npx skills add ~/ai/agent-skills -s … -g` once, then start a new chat if the old session cached stale skill text.
