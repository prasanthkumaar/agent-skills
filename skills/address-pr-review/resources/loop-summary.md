# Loop summary

Deliver when the review loop exits — bot-clean, stopped on tradeoff, or stopped on human ping.

## Template

```markdown
## PR review loop — {outcome}

**Outcome:** {Claude-clean | Stopped on tradeoff | Stopped — unreplied human thread}

### Per PR

| PR | Branch | Commits | Bot verdict | Bot threads |
|----|--------|---------|-------------|-------------|
| #225 | `chore/…` | `abc1234` | LGTM | all resolved |
| #232 | `chore/…` | `def5678` | LGTM | all resolved |

### Still open (does not block loop exit)

- **Human reviewers:** {count} threads on #{pr} — user replied; awaiting reviewer resolve/reply
- **CI:** {green | pending | failing — list checks}

### Tradeoffs pending (if any)

- #{pr} `{path}` — {one-line summary} — awaiting user decision

### Next steps

- [ ] Merge-ready: human threads resolved, approvals, CI green, evidence refresh
- [ ] Or: user decision on tradeoff above
```

## Outcome values

| Outcome | When |
|---------|------|
| **Claude-clean** | No blocking bot threads; latest bot issue comment LGTM on each PR |
| **Stopped on tradeoff** | `needs-user` hit — present options, no further autonomous act |
| **Stopped — unreplied human thread** | Human thread needs user's reply before loop continues |

## Keep it brief

- List SHAs for commits pushed this loop only.
- Generic "human reviewer" language — no specific reviewer names unless user asks.
- Link PR URLs; do not paste full comment bodies.
