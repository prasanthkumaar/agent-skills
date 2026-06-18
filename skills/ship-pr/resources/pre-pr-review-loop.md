# Pre-PR review loop

Internal review gate **before** push and `gh pr create`. Mirrors `address-pr-review` (triage → act → re-review) but uses local reviewers instead of PR bot threads.

**Reviewer list:** [reviewers.md](reviewers.md) — edit enabled reviewers there.

## Exit gate

**Loop-clean** when, after dedupe, there are **no `open` findings** classified as straightforward-fix or needs-user blocking act. All enabled reviewers may report LGTM or only false-positive / defer / already-fixed items.

**Stopped on tradeoff** when any finding is `needs-user` — ping user with options; do not push until decided.

**Max rounds:** 3 full review rounds autonomously. After round 3 with remaining `open` blocking findings, ping user with summary instead of pushing.

## Hard rules

- **No push until loop-clean** (or user explicitly accepts debt after tradeoff ping).
- **Launch only enabled reviewers** from [reviewers.md](reviewers.md), in parallel each round.
- **Triage/dedupe before every fix** — parent agent only; reviewers return raw findings tagged with `Finding source tag`.
- **Autonomous by default** — fix straightforward items without per-item OK. Interactive override: *"wait for my OK on each fix"* → present drafts first.
- **Research when uncertain** — codebase search, read references, or web search before classifying false-positive vs needs-user.
- **Local checks after every code change** — see `address-pr-review` → [refresh-evidence.md](../../address-pr-review/resources/refresh-evidence.md) local tier.
- **Re-verify evidence matrix** after any loop fix that could affect behaviour or UI — full matrix, not partial.
- **Screenshots after loop** — capture only once code is loop-clean.

## Anti-patterns

- Push before loop-clean · screenshots before loop completes · parallel parent fixes without dedupe · treating reviewer inference as blocking without verification · skipping re-review after fixes · launching disabled reviewers · editing invoke commands outside `reviewers.md`

## Round workflow

### 1. Review (parallel)

Read [reviewers.md](reviewers.md). For each entry with `Enabled: yes`:

- **codex slash-command** → run `Invoke` command (or `--background` + poll `/codex:status`).
- **cursor subagent via skill** → load the `Skill` and launch the `Subagent` per that skill.

Record raw findings with `Finding source tag`, severity, location, summary. **Append to reviewer log** (see [ship-summary.md](ship-summary.md)).

### 2. Dedupe (parent)

Merge findings that share the same `file:line` and substantially the same root cause. Keep highest severity. Note when multiple reviewers agree.

### 3. Classify (parent)

Use the same spirit as `address-pr-review` → [triage-rules.md](../../address-pr-review/resources/triage-rules.md):

| Class | Autonomous act |
|-------|----------------|
| `straightforward-fix` | Implement fix + local checks |
| `needs-user` | Ping user with options; stop push |
| `false-positive` | Drop after evidence |
| `defer` | Out of scope for this PR; drop |
| `already-fixed` | Drop after verifying diff |

Mark each deduped finding `open` or `dropped` with reason.

### 4. Gate

- Any `needs-user` → ping user; exit loop as **Stopped on tradeoff**.
- Else if any `open` + `straightforward-fix` → act (step 5).
- Else if no `open` blocking findings → **loop-clean**; proceed to re-verify matrix and screenshots.

### 5. Act

Fix all `straightforward-fix` items in one batch when possible. Research before fixing when the correct behaviour is unclear.

Run local checks (typecheck, lint, targeted tests). Re-run failed evidence-matrix rows if behaviour changed.

### 6. Re-review

Return to step 1. Increment round counter.

## Loop summary (deliver when exiting loop)

Ping user when loop exits (clean, tradeoff, or max rounds). Full ship summary with per-reviewer tables comes after PR push — [ship-summary.md](ship-summary.md).

```markdown
## Pre-PR review loop — {outcome}

**Outcome:** {Loop-clean | Stopped on tradeoff | Stopped — open findings after max rounds}

**Reviewers this loop:** {list enabled ids from reviewers.md}

**Rounds:** {N} · **Commits during loop:** {shas or "none"}

### Per-reviewer snapshot (this exit)
{one line per reviewer: id — final verdict — raw total — fixed/FP/defer counts}

### Findings addressed
- `{path}:{line}` — {one-line fix} — sources: {tags}

### Still open (if any)
- `{path}:{line}` — {summary} — {needs-user | unresolved}

### Next
- [ ] Loop-clean → capture screenshots, compose PR body, push → deliver [ship-summary.md](ship-summary.md)
- [ ] Or user decision on tradeoff above
```

## Handoff

Loop-clean → continue `ship-pr` from **re-verify evidence matrix** (if code changed) → screenshots → PR body → push. After PR exists → `triage-pr-comments` → `address-pr-review` for external review.
