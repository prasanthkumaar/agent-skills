# Git push policy

## Default push

```bash
git push -u origin HEAD
```

First push on a new branch uses `-u` to set upstream.

## Updating an existing PR branch

```bash
git push --force-with-lease
```

Use `--force-with-lease` when:

- Rebasing onto default branch.
- Amending or rewriting commits on a branch that already has an open PR.
- Stacked PRs where the branch was previously pushed.

**Never** use bare `--force` unless the user explicitly requests it.

## Stacked PRs

When PR B depends on PR A:

1. Branch B from A's branch (or merge A first — follow team convention).
2. Push A; wait for CI if required.
3. Push B with `--force-with-lease` after rebasing onto updated A.

Prefer independent PRs off default when slices are truly independent (`split-to-prs`).

## Pre-push gate

Do not push until:

- [ ] Local verification from evidence matrix completed.
- [ ] Screenshots hosted and PR body drafted (or ready to edit immediately after push).
- [ ] No secrets in diff (`.env`, credentials, session tokens).

## gh auth

Verify before PR operations:

```bash
gh auth status -h github.com
```

If not authenticated, ask user to `gh auth login` — do not proceed with PR create/edit.
