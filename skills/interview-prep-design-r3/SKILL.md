---
name: interview-prep-design-r3
description: Creates interviewer prep for Round 3 designer interviews directly in the correct Notion meeting page. Use when the user says /interview-prep-design-r3 with a candidate and a design hire requirements Notion link.
---

# Interview Prep Design R3

## Connector Gate
Before checking connectors or doing any lookup, the command must include both:
- Candidate name
- Design hire requirements Notion link
If the requirements link is missing, blocked, ambiguous, or not a Notion page, stop and tell the user: "Blocked: missing usable design hire requirements Notion link." Do not infer the requirements page from Slack, Calendar, Notion search, or prior runs.

Before drafting, writing, or messaging anywhere, check that all required connectors are available and usable:
- Calendar
- Recruitee
- Notion
- Slack
If any connector is missing, blocked, unauthorised, or unreliable, stop and tell the user which connector is blocked. Do not draft from partial access.
Create interviewer prep only. Never draft candidate-facing prep or messages as part of this skill.

## Identity Checks
Before writing, determine all of these unambiguously:
- Candidate identity
- Design hire requirements Notion page supplied by the user
- Calendar interview event
- Recruitee candidate profile
- Pre-created Notion meeting page linked to the Calendar event
- Seat context anchored on the supplied requirements page
Use evidence in this order:
1. Recruitee first for candidate evidence, prior feedback, profile, role, stage, and interview history.
2. Calendar for event, panel, date, format, and linked meeting page.
3. The supplied design hire requirements page for what the seat needs.
4. Notion for the meeting page and durable hiring docs.
5. Slack for hiring state, role context, decisions, and corroboration.
If multiple plausible candidates, events, profiles, pages, or seat definitions match, ask the user before drafting or writing.

## Notion Write
Write directly to the pre-created Notion meeting page once identity, page, and source access are unambiguous. Preserve the meeting notes block at the top. Write or replace only the interviewer prep section below it. Never create a new Notion page unless the user explicitly asks.
Default structure:
```md
## Interview context
**Panel:**
**Format:**
**Purpose:**
**Requirements source:**
**Seat need:**

## Prior round signals
**R1 - [interviewer] - [Display rating]**
- **Strength - [signal]:** [evidence]
- **Gap - [gap]:** [evidence]

**R2 - [interviewer] - [Display rating]**
- **Strength - [signal]:** [evidence]
- **Gap - [gap]:** [evidence]

## Aspects to probe in Round 3
- **[Ability to ...]:** In previous rounds [candidate] has not yet shown [specific ability]. [Interviewer] saw [concrete evidence or missing evidence]. This matters for this seat because [requirement from the supplied design hire requirements page].

## Questions
### [same aspect heading]
[Question as a plain paragraph, not a numbered list]
*Look for:* [tradeoffs, choices, and evidence that would raise or lower confidence]
```
Do not include Candidate Q&A or Note for panel.

## Prep Rules
Use simple British English at Hemingway grade 4 or below. Use short words, short sentences, and concrete verbs. Avoid em dashes, jargon, and the phrase "gap filling". Ask 5-6 main questions, grouped under the same aspect headings used in "Aspects to probe in Round 3".
Use exact Recruitee rating categories but display them as: No, Not sure, Yes, Strong Yes. Never write neutral.
Prior round signals must use bold round headers like `**R1 - Samantha Soh - Yes**`, followed by flat bullets like `- **Strength - Clear product taste:** ...` or `- **Gap - UI craft could be sharper:** ...`. Do not use Notion toggles. Do not use nested labels like "What they saw" or "Why it matters". Each strength or gap bullet needs enough context for a first-time reader: name the project or interview moment when known, state what the interviewer saw, and explain the judgement in 2-4 short sentences. Do not write one-line summaries unless the source note itself is only one line. Do not list a gap unless the notes contain evidence. If evidence is weak, say "Weak signal" or omit it.
Before choosing questions, read the supplied design hire requirements page and anchor the prep on it. Use Slack and other Notion docs only to fill gaps or corroborate. Do not bake in role-specific needs from old candidates. For high-senior roles, do not assume people leadership, mentoring, growing designers, or running critique is central unless the requirements page or strong prior feedback makes it central.
Keep AI concepts separate: AI prototyping means using AI to build or test prototypes; AI as a product feature means putting AI into the user-facing feature set. Do not merge these into one signal or question.
Spell out abbreviations and replace product jargon with plain words. Use "hands-on design work" instead of "IC design", "main user flow" instead of "core loop", "simple priority map" instead of "impact-effort matrix", and "clear problem statement" instead of "job-to-be-done statement".
Use "Aspects to probe in Round 3" as the only rationale section before questions. Each aspect must link three things in plain language: the ability still not proven, the prior-round evidence or missing evidence, and why the supplied design hire requirements make it worth probing. Use aspect headings that are short but clear enough to stand alone, for example "Ability to design defensively against spoofs". Do not use vague headings like "Strategy", "Craft", or "Risk".
Questions must not use numbered lists. Each question section heading must match one aspect heading exactly. Under each heading, write the question as plain paragraph text, then an italic `Look for:` line. `Look for:` must state the tradeoffs the designer is making, the choices to listen for, and what would raise or lower confidence for this hire.
Do not ask candidates to bring artefacts. It is fine to say they can share screen if useful while answering.
Example patterns:
- If prior feedback says post-launch iteration needs more evidence, ask: "Tell us about a shipped project where you changed the design after launch. What signal led to the change, what did you choose, and what happened afterwards? You can share your screen if an artefact helps."
- If prior feedback says stakeholder influence is unclear, ask: "Walk us through a time when product, engineering, and design disagreed. What tradeoff did you recommend, what did you give up, and how did the decision land?"
- If prior feedback says strategic range is uncertain, ask: "Pick a project where the problem was ambiguous at the start. How did you narrow the brief, what alternatives did you reject, and how did you know the direction was working?"

## Slack State Thread
After the first Notion draft, send a Slack DM to Pras with the Notion link. That Slack message thread becomes the state machine for progress updates, blockers, and final approval. Batch Slack progress updates after each edit pass. Do not send one Slack reply per Notion comment.

## Comment Loop
Do not call the skill production-ready until this loop has been tested on a real or disposable Notion draft.
Watch or re-check Notion comments on the meeting page. For each actionable comment:
1. Apply the edit in Notion.
2. Reply in that Notion comment thread with a short factual note.
3. Do not resolve comments.
If a comment is ambiguous, ask in the Notion comment thread.
End only when Pras approves in the Slack thread with approved, done, ship, looks good, LGTM, or clear equivalent. If approval is unclear, ask once in the Slack thread.
