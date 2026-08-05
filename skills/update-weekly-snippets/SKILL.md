---
name: update-weekly-snippets
description: Reconstructs Prasanth's weekly work, validates each claim against Slack and Notion, drafts a designer snippet in his Slack voice, and posts it only after approval. Use when preparing, checking, or posting a weekly update in #team-logs or the latest Designer Snippets thread.
---

# Update Weekly Snippets

Create an evidence-backed weekly update without turning agent activity into
unsupported accomplishments.

## Workflow

1. Set the reporting window to Monday through today in `Asia/Singapore`, unless
   the user gives another range.
2. Use one policy-compliant `claude -p --model haiku` Slack researcher in
   read-only mode to find:
   - the purpose and recurring norms of `#team-logs`;
   - representative recent designer replies and their structure;
   - the latest Designer Snippets parent thread and exact permalink.
3. Discover candidate work in Mempalace across Cursor, Claude, and Codex
   transcripts. Search by date, project, and outcome rather than relying on one
   broad semantic query.
4. If Mempalace is stale or times out, inspect its persisted index and original
   transcript paths read-only. Use repository history only as a declared
   cross-check, never as hidden replacement evidence.
5. Build a candidate ledger before drafting. Record the workstream, claimed
   outcome, date, transcript source, and confidence.
6. Validate every candidate independently in Slack and Notion. Classify each as
   `direct`, `partial`, `contradicted`, or `not found`; record exact permalinks
   or canonical page URLs.
7. Remove contradicted claims. Soften partial claims. State source gaps. When
   validation materially changes a claim, show the user the before and after.
8. Default to a workstream skeleton. Offer alternatives only when structure is
   genuinely unresolved. Load `voice-slack` before writing the final draft.
9. Present the draft in chat and wait. Posting requires explicit approval in
   the current conversation.
10. After approval, reply to the verified latest Designer Snippets parent.
    Read the reply back, confirm its parent timestamp and exact body, then
    return the reply permalink.

Read [resources/evidence-workflow.md](resources/evidence-workflow.md) before
searching or validating sources.

## Default draft shape

```text
• Workstream
  • outcome or decision
  • meaningful follow-up or signal
```

Use two or three substantial workstreams. Omit a week-number heading unless the
user requests one. Small maintenance PRs belong only when they materially
affected the team.

## Hard rules

- Discovery is not validation. Mempalace can suggest claims but cannot prove
  that Slack or Notion records them.
- Never infer project work from adjacent experiments, infrastructure, or agent
  orchestration. If no separate evidence exists, omit it.
- Never claim something was announced, shipped, published, or reviewed without
  direct evidence of that state.
- Never expose secrets, raw survey responses, respondent comments, or PII.
- Do not dump private messages or full Notion pages; return compact paraphrases.
- Do not create a channel-level post when the target is a thread reply.
- Do not post while the user is choosing options, reviewing evidence, or asking
  for a draft.

## Completion

Report the reporting window, included workstreams, excluded or softened claims,
target thread, and posting state. End with `Verified by: <evidence>`.
