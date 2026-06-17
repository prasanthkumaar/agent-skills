# Stack orchestration

Use when multiple PRs form a stack (Graphite or manual base-chain).

## Detect stack

1. **Graphite** (preferred if available):

```bash
which gt && gt log short
```

2. **Manual chain** — PR bases another PR:

```bash
gh pr view {n} --json number,headRefName,baseRefName
```

Build ordered list bottom → top (closest to `main` first).

## Fix ownership

- Map each finding to the PR whose **diff contains the file**.
- Fix **bottom-up** when lower branches touch shared files.
- After a lower branch changes: restack entire stack before next fix round.

## Push policy

**If Graphite available:**

```bash
gt sync
gt restack
gt submit --stack --no-edit
```

No manual `git push --force`.

**If no Graphite** — safe manual restack:

1. Checkout bottom branch, commit fix.
2. Rebase each upstack branch onto its new base (`git rebase {base-branch}`).
3. Push each branch via `ship-pr` policy (`--force-with-lease`).

## Bot re-review trigger

Post on **each PR** in the stack — tag the bot reviewer with its normalized `@mention` from triage:

```bash
gh pr comment $pr --body "@<mention> please re-review after <summary>."
```

Record each trigger comment `ID` for delta polling.

**Gotcha:** pinging bot on an upstack PR will not re-check downstack fixes. Always trigger the PR that contains the changed diff.

## Poll (multi-PR)

Single poll round checks **all** stack PRs:

- Issue comments: `id > lastTriggerCommentId`, author is bot.
- Unresolved review threads: GraphQL `reviewThreads` where `isResolved == false`.

## Node / hooks

If repo uses Husky and fails on older Node (e.g. `node:sqlite`), use Node 22+ before commit.
