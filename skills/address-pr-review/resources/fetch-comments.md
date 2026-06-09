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

| # | Source | USER (login) | MENTION | Location | Summary | Status |
|---|--------|--------------|---------|----------|---------|--------|
| 1 | inline | `foo[bot]` | `@foo` | `path:42` | … | open |

**Status:** open → addressed → deferred → reply-only

Skip already-replied threads unless user asks to revisit.

## Filter noise

- Ignore resolved threads if GitHub marks them resolved (unless user wants full history).
- Deduplicate bot summaries that repeat inline findings.
- Read comment **bodies** and minimum location — do not dump full JSON to user.

## Reply on a thread

After user OK on the draft, post on the **inline** thread (or issue comment for bot summaries). Every reply must tag the original reviewer with normalized **`@mention`**.

**Draft first.** `triage-pr-comments` / `address-pr-review` show reply text for approval; do not call the API until the user says OK.

### `USER:` vs `@mention` (important)

Fetch stores **`USER:`** = GitHub `user.login` (API identity). The **first word of your reply** must be the **`@mention` handle** GitHub actually notifies — they are not always the same string.

**Normalize `USER:` → `@mention` before posting:**

1. Start from `USER:` (never the display name).
2. If the login ends with `[bot]`, **drop the suffix** for the mention: `something[bot]` → `@something`.
3. Otherwise use the login as-is: `chatgpt-codex-connector` → `@chatgpt-codex-connector`.
4. Record both in the triage table when they differ: `USER: foo[bot]` · `MENTION: @foo`.

Common mappings:

| `USER:` (login) | `@mention` in reply |
|-----------------|---------------------|
| `claude[bot]` | `@claude` |
| `coderabbitai[bot]` | `@coderabbitai` |
| `chatgpt-codex-connector` | `@chatgpt-codex-connector` |

**Anti-pattern:** `@foo[bot]` — GitHub accepts the text but the reviewer app often **does not** get notified and will not reply.

### Rule

1. Read `USER:` from fetch for that thread.
2. Derive **`@mention`** with the normalization above.
3. Start the reply with that `@mention`, then the resolution (commit, file, or explanation).

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
