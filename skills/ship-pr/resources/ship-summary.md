# Ship PR summary

Deliver to the user **after** push and `gh pr create` succeed. Purpose: close the loop and show how each reviewer performed for future tuning of [reviewers.md](reviewers.md).

Save draft under `$EVIDENCE_DIR/ship-summary.md` (OS temp). Do not commit.

## Tracking (during pre-PR loop)

Parent agent maintains a **reviewer log** across all rounds. After each round, append per enabled reviewer from [reviewers.md](reviewers.md):

| Field | Record |
|-------|--------|
| `reviewer_id` | bullet id (e.g. `codex-adversarial`) |
| `round` | 1, 2, 3… |
| `verdict` | LGTM / N findings / error |
| `raw_count` | findings before dedupe |
| `findings` | severity, location, one-line summary |

Carry log through loop exit → ship steps → final summary below.

## Template (deliver after PR is open)

```markdown
## Ship PR — complete

**PR:** {url} · **Branch:** `{branch}` · **Commit:** `{sha}`

### Pre-PR review loop
- **Outcome:** {Loop-clean | Stopped on tradeoff — user decided | …}
- **Rounds:** {N} · **Loop commits:** {shas}

### Per-reviewer performance

Use one subsection per **enabled** reviewer from `reviewers.md`. Helps compare signal quality over time.

#### {reviewer_id} ({Skill or Slash})
- **Focus:** {from reviewers.md}
- **Final round verdict:** {LGTM | N raw findings}
- **Totals:** {raw findings across all rounds} raw · {fixed} fixed · {false-positive} FP · {defer} defer · {unique-only} unique-only
- **Unique catches** (only this reviewer flagged, before dedupe):
  - `{path}:{line}` — {summary} — {outcome: fixed | FP | defer | open}
- **All findings by round:**
  - **Round {n}:** {verdict} — {bullet list or "none"}
- **Notes:** {one line — e.g. strong on edge cases, noisy on style, agreed with codex-review on X}

{repeat for each enabled reviewer}

### Cross-reviewer
- **Agreed** (2+ reviewers, same root cause): {count} — {brief list}
- **Deduped total → acted:** {fixed} fixed · {needs-user} tradeoff · {open} still open

### Evidence
- Matrix: {all green | rows with notes}
- Screenshots: in PR description

### Next
- `triage-pr-comments` → `address-pr-review` when external review arrives
```

## Rules

- **Every enabled reviewer gets a subsection** — even LGTM (note "0 findings, LGTM all rounds").
- **Unique catches** = findings with only one `Finding source tag` before dedupe; key metric for tuning who to keep enabled.
- Do not paste full Codex/subagent output; one-line summaries only.
- If a reviewer errored, note `error` and blocker instead of omitting the subsection.
