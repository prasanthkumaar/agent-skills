---
name: reply-github-comment
description: Posts verified GitHub review replies to the exact inline or root target, mentions the original author, and preserves thread resolution state. Use after fix-and-verify drafts evidence-backed replies or when the user asks to reply, respond, or follow up on GitHub PR comments without changing code.
---

# Reply GitHub Comment

Post replies only. Do not change code, PR metadata, or review-thread resolution state.

## Workflow

1. Read the verified reply drafts.
2. Inspect each exact target and record:
   - PR number and target ID
   - Target type: inline review comment, review thread, issue comment, or root PR comment
   - Original author login
   - Current resolved state, when applicable
   - Existing replies
3. Normalise the author mention. Strip bot suffixes, for example `claude[bot]` becomes `@claude`.
4. Make every reply begin with `@<original-author>` followed by the factual response.
5. Skip an equivalent existing reply. Never post duplicates.
6. Post to the exact target.
7. Read the target again. Verify the reply exists, begins with the author mention, and did not change the resolved state.
8. Record the posted reply URL or ID and the unchanged resolved state.

## Reply format

```text
@author <concise, evidence-backed response>
```

An inline mention acknowledges and notifies the author. It is not a request for a fresh review.

## Rules

- Inline review feedback gets an inline/thread reply, not a root PR comment.
- Root PR comments are only for root-level discussion or explicit bot re-review triggers.
- Keep replies factual and evidence-backed.
- If any target, author, evidence, or duplicate status is uncertain, stop before posting and report the ambiguity.

## Hard rules

- Never call `resolveReviewThread`, `unresolveReviewThread`, or any equivalent resolution operation.
- Never change a thread's resolved state, including when another active skill permits resolution.
- Never edit code.
- Never update PR descriptions.
- Never post duplicate replies.
- Words such as “address”, “finish”, “close”, or “zero unresolved” do not authorise resolution.
- Do not ask bots to re-review unless code was pushed and the user explicitly requested it.
- If the user explicitly requests resolution, finish and verify the replies first, then stop and hand resolution to a separate workflow.
- Stop immediately and report the failure if any postcondition is not met.
