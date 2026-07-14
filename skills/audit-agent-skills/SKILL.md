---
name: audit-agent-skills
description: Audits current content parity and Claude link topology across the agent-skills repository, ~/.agents/skills, and ~/.claude/skills without changing them. Use when checking for missing, stale, loose, divergent, dangling, or unexplained skill installations.
---

# Audit Agent Skills

## Contract

Treat `~/ai/agent-skills/skills/` as the source of truth for custom skills. Audit only; never install, update, remove, edit, commit, or push while this skill is active.

Do not use mutating `npx skills` commands during an audit. Do not treat `.skill-lock.json` as authoritative for local-source global installs.

This audit proves current tree parity and Claude link topology. It cannot prove historical provenance, including whether `skills.sh` originally created an installation. Treat repo-name matches and external classifications as current-state evidence only.

## Quick start

Run the bundled deterministic audit:

```bash
python3 ~/.agents/skills/audit-agent-skills/scripts/audit_agent_skills.py
```

For machine-readable evidence:

```bash
python3 ~/.agents/skills/audit-agent-skills/scripts/audit_agent_skills.py --json
```

The command exits non-zero when any content or Claude topology defect is found. An `installed-only` result remains informational by itself, but a Claude defect on the same external entry is a failure.

## Workflow

1. Confirm the source, install, and Claude paths. Override defaults with `--repo-root`, `--agents-dir`, and `--claude-dir` when needed.
2. Run the script without changing any files.
3. Report every repo-owned content or Claude topology issue. A skill can have both, so report every value in `issues` rather than only `status`.
4. Report external and Claude-only entries separately, including their Claude topology defects. Classify them before proposing removal because other managers may own them.
5. Give exact repair commands, but do not execute them. Route requested repairs to `manage-agent-skills`.
6. Preserve the audit output as verification evidence when useful.

## Classifications

- `healthy`: installed content matches the repo and Claude resolves to the expected current install. This does not establish how it was installed.
- `missing-install`: a repo skill has no matching global install.
- `divergent`: repo and installed trees differ.
- `missing-claude-link`: no Claude entry exists for a repo-owned installed skill.
- `loose-claude`: the Claude entry is not a symlink.
- `dangling`: the Claude symlink target does not exist.
- `unknown-source`: the Claude symlink resolves somewhere other than the expected `~/.agents/skills` entry.
- `installed-only`: a global agent skill has no matching repo source; this is informational and its provenance is unknown.

## Reporting

Include:

- Paths audited and the command run.
- Counts by issue, including simultaneous content and link issues.
- Repo-owned failures, with content and Claude topology reported separately.
- External entries, separating informational ownership uncertainty from Claude topology failures.
- The explicit limitation that current-state checks do not prove `skills.sh` provenance.
- Repair commands that `manage-agent-skills` can run.

End with `Verified by: <audit command and result>`.

## Anti-patterns

- Do not repair during discovery.
- Do not delete an unexplained installed skill.
- Do not compare only names; verify complete tree parity.
- Do not accept a loose Claude directory as a managed installation.
- Do not claim success when the script exits non-zero.
