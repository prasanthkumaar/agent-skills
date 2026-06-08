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

## Auth

```bash
gh auth status -h github.com
```
