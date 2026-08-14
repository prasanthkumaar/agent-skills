---
name: manage-agent-skills
description: Manages custom skills whose source of truth is ~/ai/agent-skills. Explicit user invocation only for creating, updating, installing, removing, committing, or publishing a repo-owned skill through npx skills.
disable-model-invocation: true
---

# Manage Agent Skills

Keep `~/ai/agent-skills/skills/<skill-name>/` as the source of truth. Installed copies are derived state.

## Preflight

1. Confirm the requested skill name and operation: create, update, install, remove, or publish.
2. Read `~/ai/agent-skills/README.md` and the target skill. For a new or rewritten prompt, load `write-a-skill`.
3. Run `git -C ~/ai/agent-skills status --short`. Record unrelated changes and do not stage, alter, revert, or commit them.
4. Define proof before changing anything: structural validation and scoped Git diff before the ready PR; merge, source/install parity, manager inventory, and Claude link after merge.

## Create or update

1. Edit only `~/ai/agent-skills/skills/<skill-name>/` and any explicitly requested repository index or documentation.
2. Validate the source prompt:

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/ai/agent-skills/skills/<skill-name>
```

Any failure is fatal unless its complete output is exactly `Unexpected key(s) in SKILL.md frontmatter: disable-model-invocation. Allowed properties are: allowed-tools, description, license, metadata, name`. For only that known schema-lag failure, validate both invocation guards:

```bash
ruby -e 'require "yaml"; text = File.read(ARGV[0]); data = YAML.safe_load(text.split(/^---\s*$\n/)[1]); abort unless data["disable-model-invocation"] == true' ~/ai/agent-skills/skills/<skill-name>/SKILL.md
ruby -e 'require "yaml"; data = YAML.safe_load(File.read(ARGV[0])); abort unless data.dig("policy", "allow_implicit_invocation") == false' ~/ai/agent-skills/skills/<skill-name>/agents/openai.yaml
```

3. Do not install or refresh derived copies before the PR merges.

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

## Publish as a ready PR

Publish only after validation and explicit user approval. A push is incomplete until its non-`main` branch has an open ready-for-review PR to `main`.

```bash
git -C ~/ai/agent-skills diff --check
git -C ~/ai/agent-skills diff -- skills/<skill-name>
git -C ~/ai/agent-skills add -- skills/<skill-name>
git -C ~/ai/agent-skills diff --cached --check
git -C ~/ai/agent-skills commit -m '<type>(<skill-name>): <summary>'
git -C ~/ai/agent-skills branch --show-current
git -C ~/ai/agent-skills push -u origin HEAD
```

Include explicitly requested index or documentation paths in the scoped diff and add commands. Inspect the staged diff before committing. Never publish directly from `main`.

After every push, inspect the current branch with `gh pr view --json url,state,isDraft,headRefName,baseRefName`. If no PR exists, create one with `gh pr create --base main --head <branch> --fill`. If the existing PR is a draft, run `gh pr ready <PR>`. Reuse an existing open PR; never duplicate it. Verify `state` is `OPEN`, `isDraft` is `false`, the base is `main`, and the remote contains the commit. Return the ready PR URL, then stop without installing.

## Install after merge

Continue only after the user says the PR was merged. Verify `gh pr view <PR> --json state,mergedAt,mergeCommit,url` reports `MERGED`, fetch `origin/main`, and confirm the published commit is its ancestor. Safely synchronise the source checkout to `origin/main`; never switch, reset, or overwrite unrelated work.

Install only the named skill from the merged source, using `-y` only for intentional unattended acceptance:

```bash
npx skills add ~/ai/agent-skills -s <skill-name> -g --agent claude-code codex
diff -qr ~/ai/agent-skills/skills/<skill-name> ~/.agents/skills/<skill-name>
realpath ~/.claude/skills/<skill-name>
npx skills list -g
```

Require an empty diff, a Claude path resolving to `~/.agents/skills/<skill-name>`, and an inventory entry for the skill.

## Hard rules

- Never edit or manually delete `~/.agents/skills/` or `~/.claude/skills/`; use `npx skills`.
- Never use `npx skills update` to test uncommitted local source. It reads the published source instead.
- Never run `npx skills check` as an audit or help probe; it may update installations.
- Never create project-local `.agents/skills` while performing a global install.
- Never stage, commit, or push unrelated dirty work.
- Never install an unmerged skill or report a push as published before verifying its ready PR.
- Stop on validation, commit, push, ready-PR, merge, install, comparison, link, or inventory failure and report the exact evidence.

## Report

Before merge, return the changed paths, validation result, commit SHA, remote branch, ready PR URL, and `installation deferred until merge`. After merge, add merge and installation proof. End with `Verified by: <evidence>`.
