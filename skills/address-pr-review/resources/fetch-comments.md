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

Three rules:

1. **Inline only** — use `pulls/comments/{id}/replies` (or GraphQL thread reply). Never `gh pr comment` to answer a review thread.
2. **Root comment only** to trigger bot re-review after pushing fixes — tag the bot with its normalized `@mention` from triage.
3. **Normalize `@mention`** from thread `USER:` login — strip `[bot]` suffix if present. Never `@foo[bot]` in the reply body.

Record both `USER:` and `@mention` in the triage table when they differ.

| `USER:` login | `@mention` |
|---------------|------------|
| `claude[bot]` | `@claude` |
| `coderabbitai[bot]` | `@coderabbitai` |
| `chatgpt-codex-connector` | `@chatgpt-codex-connector` |

Body starts with the thread reviewer's `@mention`, then fix + commit SHA.

**REST (comment ID from fetch):**

```bash
gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/replies \
  -f body='@reviewer Fixed in abc1234. …'
```

**GraphQL (thread ID from reviewThreads):**

```bash
gh api graphql -f query='
mutation($threadId:ID!,$body:String!) {
  addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$threadId, body:$body}) {
    comment { id }
  }
}' -f threadId=PRRT_… -f body='@reviewer …'
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
