---
name: pr-review-cycle
description: Work through pull request review feedback in a scoped, repeatable way. Use when the user wants review comments addressed on a specific PR, whether from a human reviewer or a bot.
---

# PR Review Cycle

## Overview

Use this skill when a pull request is ready for comment handling and the job is to work through review feedback cleanly, keep the fixes scoped to that PR, and report back on what changed.

This skill is for any PR review comments, not only bot comments.

## When To Use It

Use this skill when the user says things like:

```text
PR 4 is done
address the review comments
work through PR feedback
reply to the PR comments
```

## Workflow

1. Check the PR branch and current scope first.
   - Understand the PR goal before touching code.
   - Watch for scope leaks. Keep fixes inside the PR's purpose.

2. Gather all review feedback.
   - Include human comments, bot comments, review threads, and summary notes.
   - Treat inline and non-inline comments separately.

3. Classify each comment.
   - Straightforward fix: implement it, test it, reply on the thread.
   - Real tradeoff: stop and ask the user with options, tradeoffs, and sample code.

4. Make only PR-scoped changes.
   - Fix the comment directly.
   - Do not opportunistically refactor unrelated code.
   - Do not rewrite or append PR descriptions unless the user explicitly asks.

5. Test for that PR specifically.
   - Run happy cases for the feature that PR introduces.
   - Run edge cases for the same feature.
   - Prefer checks that prove the review comment is actually resolved.

6. Reply on every addressed thread.
   - Be concrete.
   - Start each reply by tagging the reviewer handle that made the comment, for example `@claude` or `@chatgpt-codex-connector`.
   - Say what changed and where.
   - If a comment was a tradeoff and you did not implement it yet, say that clearly.

7. Resolve review threads only when explicitly told.
   - Default is to leave threads unresolved after replying.

## Response Rules

When a review comment is straightforward:

```text
fix it
test it
reply on the thread
report back briefly
```

When a review comment has multiple valid solutions:

```text
stop
show options
include tradeoffs
include sample code
wait for the user's choice
```

## Scope Checklist

Before finishing, check:

```text
does every code change map to a review comment or to the PR's goal?
did I avoid unrelated cleanup?
did I test the exact behaviour under review?
did I reply on each addressed thread?
did I leave threads unresolved unless told otherwise?
```
