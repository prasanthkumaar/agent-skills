---
name: update-weekly-snippets
description: Reconstructs Prasanth's weekly work, checks material claims against Slack or Notion, drafts it in his Slack voice, and posts only after approval. Use when preparing or posting a weekly update in the Designer Snippets thread.
---

# Update Weekly Snippets

Create a concise, evidence-backed weekly update.

## Workflow

1. Use Monday through today in `Asia/Singapore`, unless the user gives another
   range.
2. Use Mempalace to find candidate work across Cursor, Claude, and Codex
   transcripts. Search by date, project, and outcome.
3. Check material outcomes against direct Slack or Notion evidence. Keep the
   supporting permalink or page URL. Omit unsupported claims and soften claims
   that the source supports only in part.
4. Load `voice-slack`, then draft two or three substantial workstreams. Show the
   complete draft and state that it has not been posted.
5. Wait for explicit approval. Then find the latest Designer Snippets parent in
   `#team-logs` and post one thread reply.
6. Read the reply back. Confirm the thread, exact body, and permalink.

## Default draft shape

```text
• Workstream
  • outcome or decision
  • meaningful follow-up or signal
```

Omit a week-number heading unless requested. Include small maintenance work only
when it materially affected the team.

## Hard rules

- Keep discovery and validation read-only. Do not post, edit, react, or create
  content during those steps.
- Transcripts suggest candidates; they do not prove outcomes.
- Do not claim `announced`, `shipped`, `published`, or `reviewed` without direct
  evidence of that state.
- Never expose secrets, raw survey responses, respondent comments, or PII.
- Paraphrase private sources. Do not dump messages or full pages.
- Never post without explicit approval in the current conversation.
- Reply in the verified thread. Do not create a channel-level post.

## Completion

Return the reporting window, final text, posting state, and permalink when posted.
