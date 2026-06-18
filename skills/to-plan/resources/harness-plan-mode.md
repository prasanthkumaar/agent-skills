# Harness Plan mode

Model-agnostic: use **whatever Plan mode the current harness provides**. Do not hardcode one editor path in instructions — discover where the plan was written after exit.

## Enter Plan mode

| Harness | Action |
|---------|--------|
| **Cursor** | `SwitchMode` → `target_mode_id: plan` (or user `/plan` / Plan UI) |
| **Claude Code** | Plan mode / plan subagent per product UI |
| **Codex** | Codex plan flow if available; else read-only plan draft then user confirms |

Stay in Plan mode until the user **approves** the plan. No edit tools in Plan mode.

## Plan file location (discover, don't assume)

After approval, find the **most recently modified** plan in the harness default store:

```bash
# Cursor (common)
ls -t ~/.cursor/plans/*.plan.md 2>/dev/null | head -1

# Claude Code (if present)
ls -t ~/.claude/plans/*.md 2>/dev/null | head -1
```

If multiple harnesses or paths exist, pick the file modified during **this** planning session. Pass that path to `ship-pr`.

**Do not commit** plan files unless the repo convention requires it.

## Frontmatter

Cursor plans use YAML frontmatter (`name`, `overview`, `todos`). Populate `todos` for implementation steps; **last todo** must be invoking `ship-pr`.
