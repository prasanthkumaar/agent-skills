---
name: manage-agent-skills
description: Manages custom skills whose source of truth is ~/ai/agent-skills. Use when creating, updating, installing, removing, committing, or publishing a repo-owned skill through npx skills.
---

# Manage Agent Skills

Keep `~/ai/agent-skills/skills/<skill-name>/` as the source of truth. Installed copies are derived state.

## Preflight

1. Confirm the requested skill name and operation: create, update, install, remove, or publish.
2. Read `~/ai/agent-skills/README.md` and the target skill. For a new or rewritten prompt, load `write-a-skill`.
3. Run `git -C ~/ai/agent-skills status --short`. Record unrelated changes and do not stage, alter, revert, or commit them.
4. Define proof before changing anything: structural validation, source/install comparison, manager inventory, Claude link, and Git diff.

## Create or update

1. Edit only `~/ai/agent-skills/skills/<skill-name>/` and any explicitly requested repository index or documentation.
2. Validate the source prompt:

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/ai/agent-skills/skills/<skill-name>
```

3. Install the named skill from the local working tree:

```bash
npx skills add ~/ai/agent-skills \
  -s <skill-name> \
  -g \
  --agent claude-code codex
```

Use `-y` only when unattended prompt acceptance is intentional. Never run an untargeted add.

4. Verify the derived installation:

```bash
diff -qr ~/ai/agent-skills/skills/<skill-name> ~/.agents/skills/<skill-name>
realpath ~/.claude/skills/<skill-name>
npx skills list -g
```

The diff must be empty, the Claude path must resolve to `~/.agents/skills/<skill-name>`, and the global inventory must contain the skill.

## Remove

1. Check references to the skill before removal:

```bash
rg -n '<skill-name>' ~/ai/agent-skills
```

2. Remove its source and update explicitly affected repository documentation.
3. Remove the manager-owned global installation:

```bash
npx skills remove <skill-name> -g
```

4. Verify that the source, global installation, and Claude entry are absent and that the global inventory no longer lists the skill.

## Publish

Publish only after local verification and when the user has explicitly requested or approved a push.

```bash
git -C ~/ai/agent-skills diff --check
git -C ~/ai/agent-skills diff -- skills/<skill-name>
git -C ~/ai/agent-skills add -- skills/<skill-name>
git -C ~/ai/agent-skills diff --cached --check
git -C ~/ai/agent-skills commit -m '<type>(<skill-name>): <summary>'
git -C ~/ai/agent-skills push
```

Include explicitly requested index or documentation paths in the scoped diff and add commands. Inspect the staged diff before committing. Confirm the remote branch contains the new commit.

## Hard rules

- Never edit or manually delete `~/.agents/skills/` or `~/.claude/skills/`; use `npx skills`.
- Never use `npx skills update` to test uncommitted local source. It reads the published source instead.
- Never run `npx skills check` as an audit or help probe; it may update installations.
- Never create project-local `.agents/skills` while performing a global install.
- Never stage, commit, or push unrelated dirty work.
- Stop on validation, install, comparison, link, inventory, commit, or push failure and report the exact evidence.

## Report

Return the operation, changed source paths, validation result, installation or removal proof, commit SHA, and remote branch. End with `Verified by: <evidence>`.
