# Fetch PR comments

Gather all feedback on a PR before triaging.

## Identify PR

```bash
gh pr view --json number,title,url,headRefName,baseRefName,body
```

If no PR for current branch:

```bash
gh pr list --head "$(git branch --show-current)"
```

Ask user for PR number or URL if ambiguous.

## Inline review comments (code threads)

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate \
  -q '.[] | "ID:\(.id)\nPATH:\(.path):\(.line // .original_line)\nUSER:\(.user.login)\nBODY:\(.body)\n---"'
```

Get owner/repo from `gh repo view --json nameWithOwner`.

## Issue comments (general PR comments)

```bash
gh api repos/{owner}/{repo}/issues/{number}/comments --paginate \
  -q '.[] | "ID:\(.id)\nUSER:\(.user.login)\nBODY:\(.body)\n---"'
```

## Reviews (APPROVE / REQUEST_CHANGES / COMMENT)

```bash
gh pr view {number} --json reviews -q '.reviews[] | "\(.author.login) [\(.state)] \(.body)"'
```

## Build triage table

| # | Source | Author | Location | Summary | Status |
|---|--------|--------|----------|---------|--------|
| 1 | inline | @bot | `path:42` | … | open |

**Status:** open → addressed → deferred → reply-only

Skip already-replied threads unless user asks to revisit.

## Filter noise

- Ignore resolved threads if GitHub marks them resolved (unless user wants full history).
- Deduplicate bot summaries that repeat inline findings.
- Read comment **bodies** and minimum location — do not dump full JSON to user.

## Reply on a thread

After fixing **or** reply-only (explain / defer / reject), post on the **inline** thread. Every reply must tag the original reviewer.

### Rule

1. Read `USER:` from the fetch output for that thread (e.g. `claude`, `chatgpt-codex-connector`, `coderabbitai[bot]`).
2. Start the reply body with `@login` — use the GitHub username, not display name.
3. For bot apps, use the login GitHub shows (`coderabbitai`, not `CodeRabbit`).

### Examples

**After a code fix:**

```text
@chatgpt-codex-connector Fixed in abc1234. `setPaid` now rejects `editing` bills and only settles from `shared`.
```

**Reply-only (intentional design):**

```text
@coderabbitai Intentional for v1 — `setPaid` mirrors the existing `setDone` honour-system model. Tracked separately if we add auth later.
```

**Defer:**

```text
@claude Good catch — deferring to a follow-up issue; out of scope for this PR.
```

### Post via gh

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments/{comment_id}/replies \
  -f body="$(cat <<'EOF'
@chatgpt-codex-connector Fixed in abc1234. …
EOF
)"
```

Get `comment_id` from the fetch output (`ID:` field) for that thread.

## Auth

```bash
gh auth status -h github.com
```
