---
name: audit-agent-skills
description: Checks whether agent skills have correct source ownership, installed-content parity, and Claude symlinks. Use only when explicitly asked to audit or verify agent-skill installations.
disable-model-invocation: true
---

# Audit Agent Skills

## Contract

Audit only. Never install, update, remove, edit, commit, or push while this
skill is active.

Use these ownership rules in order:

- A matching directory in `~/ai/agent-skills/skills/` is personal and is the
  source of truth. Compare its full tree with the installed copy.
- Otherwise, use `~/.agents/.skill-lock.json` to identify an external source.
  Do not claim external content parity.
- An installed skill found in neither source is `LOOSE` and fails.
- A lock record without an installed skill is `NOT INSTALLED` and warns.

## Run

```bash
python3 ~/.agents/skills/audit-agent-skills/scripts/audit_agent_skills.py
```

```bash
python3 ~/.agents/skills/audit-agent-skills/scripts/audit_agent_skills.py --json
```

Override paths with `--repo-root`, `--agents-dir`, `--claude-dir`, and
`--lock-file`. The command is read-only and exits non-zero on any failure.

## Report

Return:

1. Summary counts for healthy, warning, and failure rows.
2. One table per source group.
3. Next actions for failures only.
4. `Verified by: <audit command and result>`.
