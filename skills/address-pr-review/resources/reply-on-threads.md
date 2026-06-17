# Reply on review threads

Hard rules for posting review responses. The most common failure: posting a **root PR comment** instead of an **inline thread reply**, or using **`@claude[bot]`** instead of **`@claude`**.

## Two comment types — do not mix them

| Action | API | When |
|--------|-----|------|
| **Address review feedback** | Inline thread reply only | Always, for every triaged thread |
| **Trigger bot re-review** | Root issue comment (`gh pr comment`) | Only after fixes pushed; body is `@claude please re-review…` |

**Never** use `gh pr comment` or a new issue comment to answer an inline review thread. That does not attach to the line, does not notify the reviewer on that thread, and forces the user to delete and redo.

## Inline reply — required path

1. From triage, read **Reply target** (`replies/{comment_id}` or GraphQL `PRRT_…`).
2. Post via **one of**:
   - REST: `gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/replies -f body='…'`
   - GraphQL: `addPullRequestReviewThreadReply` with `pullRequestReviewThreadId`
3. Body **starts with** normalized `@mention` (see below), then fix summary + commit SHA.

If the thread has an inline comment ID, use `replies/{id}` — not `gh pr comment`.

## Normalize `@mention` (mandatory)

| `USER:` login | First word of reply |
|---------------|---------------------|
| `claude[bot]` | `@claude` |
| `coderabbitai[bot]` | `@coderabbitai` |
| `chatgpt-codex-connector` | `@chatgpt-codex-connector` |

Rule: strip `[bot]` suffix. **Never** post `@claude[bot]` — GitHub shows the text but the bot often does not re-check the thread.

## Verify after every post batch

```bash
# No accidental root comment for thread work
gh api repos/{owner}/{repo}/issues/{number}/comments --paginate \
  -q '.[-3:] | .[] | {id, user: .user.login, body: .body[0:120]}'

# Inline replies use in_reply_to_id; mentions are normalized
gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate \
  -q '.[] | select(.in_reply_to_id != null) | {id, in_reply_to: .in_reply_to_id, body: .body[0:80]}'
```

Check:

- [ ] Each addressed thread has a new inline reply with `in_reply_to_id` set (or GraphQL thread shows your reply).
- [ ] No stray root issue comment that duplicates thread content.
- [ ] No `@…[bot]` in any reply body — only `@claude`, `@coderabbitai`, etc.

## If wrong post type was used

1. Delete root issue comment: `gh api -X DELETE repos/{owner}/{repo}/issues/comments/{id}`
2. Delete bad inline reply if needed: `gh api -X DELETE repos/{owner}/{repo}/pulls/comments/{id}`
3. Repost on the correct inline thread with normalized `@mention`.
4. Re-run verify commands above.

## Issue comments — allowed uses only

- Trigger `@claude please re-review after …` (whole PR, not a line).
- Reply to a **bot summary** issue comment when there is no inline thread (record `Source: issue` in triage table).

For bot **inline** threads, always reply inline — even when the bot also posted an issue summary.
