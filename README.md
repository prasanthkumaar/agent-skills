# agent-skills

Personal agent skills (private repo: `prasanthkumaar/agent-skills`). **Clone location:** `~/ai/agent-skills`.

Skills are edited here, then installed globally into `~/.agents/skills/` (Claude Code symlinks from `~/.claude/skills/`).

## Skills in this repo

| Skill | Use when |
|-------|----------|
| `build-context` | ≤300w brief from Slack/Notion/memory/codebase before grill |
| `to-plan` | After grill: harness Plan mode, one plan file, ends with `build-pr` step |
| `build-pr` | Approved plan/current branch → draft PR or stack, internally reviewed and evidence-backed |
| `update-pr` | Existing PR or stack → apply deltas, rerun review/fix loop, refresh evidence and descriptions |
| `ready-pr` | Existing PR or stack → start at multi-review and drive findings to readiness |
| `code-writing` | Document-shaped code with explicit contracts and readable structure |
| `write-readable-english` | Writes and checks readable English at Grade 9 by default |
| `docs-check` | Read-only documented-pattern check for framework/library/API/config/test/story changes |
| `research-options` | Compare broad options before deciding |
| `multi-review` | Run all fresh-context review lanes across a branch or stack |
| `review-code-quality` | Review repo conventions, code readability, and maintainability smells |
| `review-spec` | Review whether a diff matches the originating issue, PRD, ticket, or spec |
| `triage` | Classify review findings, GitHub comments, CI, chat feedback, and manual verification |
| `fix-and-verify` | Apply triaged fixes with branch-owned fresh-context fix agents |
| `capture-evidence` | Capture local command/browser/screenshot evidence into an OS-temp manifest |
| `write-pr-description` | Create draft PRs or update PR descriptions, images, and evidence links |
| `reply-github-comment` | Post verified GitHub replies only, never resolve threads |
| `explain-diff-html` | Rich interactive HTML explainer for a diff, branch, PR, or code change |
| `explain-diff-notion` | Rich Notion explainer for a diff, branch, PR, or code change |
| `explain-with-html` | Visual temp HTML explainer for code, PRs, diffs, transcripts, and decisions |
| `research-web` | Bounded source-backed web research |
| `voice-slack` | Draft Slack messages in your voice |

### End-to-end workflow

```text
build-context → grill-me | grill-with-docs → to-plan → build-pr → ready-pr | update-pr
```

- **`build-context`** — recon only; [sources](skills/build-context/resources/sources.md)
- **`to-plan`** — Plan mode; one file at harness default; [template](skills/to-plan/resources/plan-template.md)
- **`build-pr`** — draft PR creation + deterministic review/fix/evidence loop
- **`ready-pr`** — existing PR/stack readiness loop when no new requested change is needed
- **`update-pr`** — existing PR/stack update loop

### PR readiness loop

`build-pr`, `ready-pr`, and `update-pr` are thin orchestrators. They route through:

```text
code-writing → docs-check/research-options as needed → multi-review → triage → fix-and-verify → capture-evidence → write-pr-description → reply-github-comment
```

`multi-review` runs every review lane for the full branch diff:

- `review-docs-check`
- `review-bug`
- `review-security`
- `review-code-quality`
- `review-spec`
- `review-pr-accuracy`

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
for s in build-context to-plan build-pr ready-pr update-pr code-writing write-readable-english docs-check research-options multi-review review-docs-check review-bug review-security review-code-quality review-spec review-pr-accuracy triage fix-and-verify capture-evidence write-pr-description reply-github-comment explain-diff-html explain-diff-notion explain-with-html research-web voice-slack; do
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
