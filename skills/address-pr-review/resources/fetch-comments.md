# Fetch PR comments

Gather all feedback before triaging. For stacks, repeat per PR — see [stack-orchestration.md](stack-orchestration.md).

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

## Review threads (resolved state)

```bash
gh api graphql -f query='
query($owner:String!,$repo:String!,$number:Int!) {
  repository(owner:$owner,name:$repo) {
    pullRequest(number:$number) {
      reviewThreads(first:100) {
        nodes { id isResolved path line
          comments(first:20) { nodes { databaseId author { login } body createdAt } }
        }
      }
    }
  }
}' -f owner={owner} -f repo={repo} -F number={number}
```

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

Use [triage-table.md](../../triage-pr-comments/resources/triage-table.md) columns including `reviewer_type`, `scope_pr`, `blocking`.

## Filter noise

- Deduplicate bot summaries that repeat inline findings.
- Read comment **bodies** and minimum location — do not dump full JSON to user.

## Reply on a thread

Post after triage classifies the thread (autonomous mode: no per-item OK unless interactive override). Every reply tags the original reviewer with normalized **`@mention`**.

### `USER:` vs `@mention` (important)

Fetch stores **`USER:`** = GitHub `user.login`. The **first word of your reply** must be the **`@mention` handle** GitHub notifies.

**Normalize `USER:` → `@mention`:**

1. Start from `USER:` (never the display name).
2. If login ends with `[bot]`, **drop the suffix**: `claude[bot]` → `@claude`.
3. Otherwise use login as-is.

**Anti-pattern:** `@foo[bot]` — often does not notify.

### Post via gh

**REST (comment ID from fetch):**

```bash
gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/replies \
  -f body='@claude Fixed in abc1234. …'
```

**GraphQL (thread ID from reviewThreads):**

```bash
gh api graphql -f query='
mutation($threadId:ID!,$body:String!) {
  addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$threadId, body:$body}) {
    comment { id }
  }
}' -f threadId=PRRT_… -f body='@claude …'
```

### Resolve bot thread (autonomous, after bot confirms)

```bash
gh api graphql -f query='
mutation($id:ID!) {
  resolveReviewThread(input:{threadId:$id}) { thread { isResolved } }
}' -f id=PRRT_…
```

Never resolve human threads without user ask.

## Auth

```bash
gh auth status -h github.com
```
