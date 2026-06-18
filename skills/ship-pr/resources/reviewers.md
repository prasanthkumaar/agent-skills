# Reviewers

**Edit this file** to change which reviewers run in the pre-PR loop. Parent agent launches every **enabled** entry in parallel each round, then dedupes.

## Active reviewers

- **codex-adversarial**
  - Enabled: yes
  - Kind: codex slash-command
  - Slash: `/codex:adversarial-review`
  - Skill: none (companion script)
  - Invoke:
    ```bash
    node "/Users/prasanth/.claude/plugins/cache/openai-codex/codex/1.0.4/scripts/codex-companion.mjs" adversarial-review --wait --scope working-tree
    ```
  - Focus: challenge implementation, design choices, tradeoffs, assumptions
  - Finding source tag: `adversarial`

- **codex-review**
  - Enabled: yes
  - Kind: codex slash-command
  - Slash: `/codex:review`
  - Skill: none (companion script)
  - Invoke:
    ```bash
    node "/Users/prasanth/.claude/plugins/cache/openai-codex/codex/1.0.4/scripts/codex-companion.mjs" review --wait --scope working-tree
    ```
  - Focus: implementation defects, correctness, regressions
  - Finding source tag: `review`

- **bugbot**
  - Enabled: yes
  - Kind: cursor subagent via skill
  - Slash: `/review-bugbot`
  - Skill: `review-bugbot` (`.cursor/skills-cursor/review-bugbot`)
  - Subagent: `bugbot`, `readonly: true`
  - Diff: `branch changes` (default) or `uncommitted changes`
  - Focus: bugs, logic errors, edge cases in the diff
  - Finding source tag: `bugbot`

- **security-review**
  - Enabled: yes
  - Kind: cursor subagent via skill
  - Slash: `/review-security`
  - Skill: `review-security` (`.cursor/skills-cursor/review-security`)
  - Subagent: `security-review`, `readonly: true`
  - Diff: `branch changes` (default) or `uncommitted changes`
  - Focus: auth, injection, secrets, unsafe defaults, data exposure
  - Finding source tag: `security`

## How to change

1. Set `Enabled: yes` / `no` on each reviewer.
2. Add a new bullet with the same fields (`Kind`, `Invoke` or `Skill` + `Subagent`, `Finding source tag`).
3. Remove or comment out reviewers you do not want (delete the bullet).
4. Parent always dedupes across all enabled reviewers — no other file needs editing.

## Kinds

| Kind | What it is |
|------|------------|
| `codex slash-command` | OpenAI Codex via `codex-companion.mjs` (`/codex:review`, `/codex:adversarial-review`) |
| `cursor subagent via skill` | Cursor Task subagent launched by a review skill (`review-bugbot`, `review-security`) |

## Notes

- Codex reviewers: use `--background` + `/codex:status` for large diffs; default `--wait` in-session.
- Subagent reviewers: follow the linked skill's prompt shape; do not pre-compute the diff.
- Standalone `/codex:review` and `/review-bugbot` are review-only; **ship-pr** may fix after parent triage.
