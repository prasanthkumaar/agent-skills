---
name: reply-github-comment
description: Posts verified GitHub review replies to the correct inline or root comment target and never resolves threads. Use after fix-and-verify has drafted evidence-backed replies, or when the user asks to reply to GitHub comments without changing code.
---

# Reply GitHub Comment

Single side-effect skill for posting GitHub replies.

## Process

1. Read verified reply drafts from `fix-and-verify` or the orchestrator.
2. Confirm each reply target: inline review comment, review thread, issue comment, or root PR comment.
3. Post to the exact target.
4. Record posted reply URLs or IDs.

## Rules

- Inline review feedback gets an inline/thread reply, not a root PR comment.
- Root PR comments are only for root-level discussion or explicit bot re-review triggers.
- Strip bot suffixes from mentions when needed, for example use `@claude`, not `@claude[bot]`.
- Keep replies factual and evidence-backed.

## Hard rules

- Never resolve threads.
- Never edit code.
- Never update PR descriptions.
- Never post duplicate replies.
- Do not ask bots to re-review when no code was pushed.
