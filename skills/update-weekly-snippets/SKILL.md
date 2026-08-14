---
name: update-weekly-snippets
description: Reconstructs Prasanth's weekly work, checks material claims against authoritative primary sources, drafts it in his Slack voice, and posts only after approval. Use when preparing or posting a weekly update in the Designer Snippets thread.
disable-model-invocation: true
---

# Update Weekly Snippets

Create a concise, evidence-backed weekly update.

## Workflow

1. Use Monday through today in `Asia/Singapore`, unless the user gives another
   range.
2. Use Mempalace to find candidate work across Cursor, Claude, and Codex
   transcripts. Search by date, project, and outcome.
3. Check material outcomes against the strongest direct primary source for the
   claim. Use GitHub for repository, PR, review, CI, and merge state; Slack for
   discussions, announcements, and coordination; and Notion for documented
   decisions, plans, and artefacts. Use Calendar to prove a session happened and
   who attended, not what was decided. Keep supporting URLs for verification,
   but do not require Slack when another authoritative source proves the claim.
4. Select only the most meaningful personally attributable work. Prefer two
   plain theme groups over repository-by-repository reporting. Omit audit detail,
   test counts, and exhaustive PR lists unless they materially help the update.
5. Load `voice-slack`, then draft the update using native Slack formatting and
   selective inline links. Show the complete draft and state that it has not
   been posted.
6. Find and show the exact latest Designer Snippets parent in `#team-logs` before
   requesting approval. After approval, verify it is still latest and post one
   thread reply.
7. Read the reply back. Confirm the thread, exact body, and permalink.

## Default draft shape

```text
• design learning
  ◦ wrapped the first <URL|Design Studio> cycle

• SGC
  ◦ reviewing the <URL|Storybook PR stack>
  ◦ did a UI bug bash with a teammate
```

Use `•` for themes and `◦` for their items. Keep each item to one short line when
possible. Omit a week-number heading unless requested. Include small maintenance
work only when it materially affected the team.

## Hard rules

- Keep discovery and validation read-only. Do not post, edit, react, or create
  content during those steps.
- Transcripts suggest candidates; they do not prove outcomes.
- Match evidence to the claim. Repository work may be proven directly in
  GitHub; it does not need a separate Slack mention.
- Evidence is not the final copy. Link the main artefact when useful; do not add
  a link to every collaboration item or expose the verification trail.
- Preserve current status and shared credit. Use `reviewing` for ongoing work and
  `reviewed` only when complete. Say `did X with Y` unless direct evidence proves
  Prasanth led or ran it.
- Prefer plain verbs over inflated summaries. Do not turn routine work into
  `refreshed`, `settled`, or `completed` outcomes unless that wording is exact.
- Treat the user's choices as authoritative. Keep their theme names, exclusions,
  and requested emphasis; do not re-add omitted work.
- Do not claim `announced`, `shipped`, `published`, or `reviewed` without direct
  evidence of that state.
- Never expose secrets, raw survey responses, respondent comments, or PII.
- Paraphrase private sources. Do not dump messages or full pages.
- Never post without explicit approval in the current conversation.
- Reply in the verified thread. Do not create a channel-level post.

## Completion

Return the reporting window, final text, posting state, and permalink when posted.
