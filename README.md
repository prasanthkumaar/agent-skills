# agent-skills

Personal agent skills (private repo: `prasanthkumaar/agent-skills`). **Clone location:** `~/ai/agent-skills`.

Skills are edited here, then installed globally into `~/.agents/skills/` (Claude Code symlinks from `~/.claude/skills/`).

## Skills in this repo

| Skill | Use when |
|-------|----------|
| `build-context` | ≤300w brief from Slack/Notion/memory/codebase before grill |
| `to-plan` | After grill — harness Plan mode, one plan file, ends with `ship-pr` step |
| `address-pr-review` | PR review loop — triage, fix, re-review, poll |
| `triage-pr-comments` | Classify PR feedback before acting |
| `ship-pr` | Locked spec → implement → pre-PR reviewer loop (`reviewers.md`) → evidence + screenshots → push; ship summary per reviewer |
| `code-writing` | TypeScript/TSX style and workflow |
| `research-web` | Bounded source-backed web research |
| `research-options` | Compare approaches before deciding |
| `voice-slack` | Draft Slack messages in your voice |

### End-to-end workflow

```text
build-context → grill-me | grill-with-docs → to-plan → ship-pr → address-pr-review
```

- **`build-context`** — recon only; [sources](skills/build-context/resources/sources.md)
- **`to-plan`** — Plan mode; one file at harness default; [template](skills/to-plan/resources/plan-template.md)
- **`ship-pr`** — implement plan + pre-PR reviewers + push

### `ship-pr` reviewers (editable)

Pre-push loop runs every **enabled** reviewer in `skills/ship-pr/resources/reviewers.md` in parallel (Codex review, Codex adversarial, Bugbot, security). Parent dedupes, fixes straightforward items, pings on tradeoffs. After push, deliver per-reviewer summary from `resources/ship-summary.md`.

Other skills may exist globally (`~/.agents/skills/`) but not yet in this repo — migrate here when you want them versioned.

## Day-to-day workflow

**1. Edit** — only under `skills/<name>/`. Never edit `~/.agents/skills/` or `~/.claude/skills/` directly.

**2. Refresh global install** (local test; no push required):

```bash
npx skills add ~/ai/agent-skills -s <skill-name> -g -y
```

Use **`add` from the local path**, not `update` — `update` pulls from GitHub and ignores uncommitted edits.

**3. Ship** — **ping user before** `git push` (see [Updating a skill](#updating-a-skill) for full gate).

**4. New chat** — start a fresh session if the agent cached old skill text.

Refresh all repo skills:

```bash
for s in build-context to-plan address-pr-review triage-pr-comments ship-pr code-writing research-web research-options voice-slack; do
  npx skills add ~/ai/agent-skills -s "$s" -g -y
done
```

## Updating a skill

Use when fixing a skill after a bad agent run or adding a new skill.

### 1. Draft with write-a-skill

Load the **write-a-skill** skill (global: `~/.agents/skills/write-a-skill/`). Follow its checklist:

- Description with "Use when…" triggers
- `SKILL.md` under 100 lines; split detail to `resources/`
- Concrete examples and anti-patterns

Edit only `skills/<name>/` in this repo.

### 2. Install globally (local test)

```bash
npx skills add ~/ai/agent-skills -s <skill-name> -g -y
```

This updates `~/.agents/skills/` only — not files in this repo.

### 3. Verify before ship

**Diff repo vs global:**

```bash
diff -qr ~/ai/agent-skills/skills/<skill-name> ~/.agents/skills/<skill-name>
npx skills list -g | grep <skill-name>
```

**Fresh subagent check** — launch a subagent with no prior thread context. Prompt:

> Read `~/.agents/skills/<skill-name>/SKILL.md` and key `resources/`. List the hard rules and anti-patterns. Confirm whether [specific fix, e.g. "inline replies only, @claude not @claude[bot]"] is present. PASS/FAIL.

Optionally spot-check Claude symlink:

```bash
readlink ~/.claude/skills/<skill-name>
# should point to ~/.agents/skills/<skill-name>
```

Codex and Cursor load from `~/.agents/skills/` via `npx skills` — same files.

### 4. Ping user before push

Stop and ask the user before:

- `git push` to GitHub
- Re-running global install on another machine (if applicable)

Include: skill name, summary of change, subagent verify result, `diff` clean.

### 5. Ship after OK

```bash
cd ~/ai/agent-skills
git add skills/<skill-name>
git commit -m "fix(<skill-name>): …"
git push
```

Global install on this machine is already done in step 2. Other machines: `git pull` then `npx skills update <skill-name> -g`.

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

## Switching source (GitHub → local)

```bash
npx skills remove <skill-name> -g
npx skills add ~/ai/agent-skills -s <skill-name> -g
```

Only when changing install source or renaming a skill — not for every edit.

## Repo boundaries

- **`skills/`** — source of truth; commit and push here.
- **`npx skills add … -g`** — copies to `~/.agents/skills/` only. Does not create `.agents/` in this repo.
