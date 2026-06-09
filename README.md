# agent-skills

Personal agent skills (private repo). Installed globally into `~/.agents/skills/` with symlinks for Claude Code and other agents.

**Clone location:** `~/ai/agent-skills`

## First install (local source)

Use the **local clone** as source of truth on this machine. Run interactively (omit `-y`) to pick agents.

```bash
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

Repeat for each skill you want. Optional: remove an old copy first with `npx skills remove <skill-name> -g`.

Verify:

```bash
npx skills list -g
ls ~/.agents/skills/
```

Ignore **PromptScript** install failures — it does not support global install.

## Day-to-day workflow

**1. Edit** skill files in `~/ai/agent-skills/skills/…`

**2. Refresh** after editing (no push required to test locally):

```bash
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

Use `add` from the local path, not `update` — `update` pulls from GitHub and ignores uncommitted edits.

**3. Ship** when the change is good:

```bash
cd ~/ai/agent-skills
git add -A && git commit -m "…" && git push
```

**4. Other machines** — clone to the same path, then either:

```bash
git clone git@github.com:prasanthkumaar/agent-skills.git ~/ai/agent-skills
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

or pull + update if already installed from GitHub:

```bash
cd ~/ai/agent-skills && git pull
npx skills update <skill-name> -g
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
