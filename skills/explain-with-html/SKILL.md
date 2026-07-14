---
name: explain-with-html
description: Creates or updates self-contained HTML explainers in temporary storage, organised around the user's questions with plain language and layered evidence. Use when unfamiliar code, diffs, transcripts, architecture, or decisions need a visual explanation or revision.
---

# Explain With HTML

Create a visual HTML artefact that answers the user's main question quickly, preserves necessary technical detail, and makes supporting proof available without forcing it into the main reading path.

## Quick Start

1. Identify the source and the main question the explainer must answer.
2. Reuse the existing HTML path from the conversation when available. Otherwise create one self-contained `.html` file in the real OS temp folder.
3. Read only the source material needed. Do not edit repositories, source data, Git state, or documentation.
4. Outline the page around the user's questions, not around files or modules.
5. Write the HTML with inline CSS and JavaScript only when interaction genuinely helps.
6. Preview it using the user's requested browser surface and report the absolute path.

## Temp File

Resolve the temp folder at runtime. Never return a literal `$TMPDIR` path.

```bash
tmpdir="${TMPDIR:-/tmp}"
path="$tmpdir/explain-with-html-$(date +%Y%m%d-%H%M%S)-<topic>.html"
```

Use a short safe topic slug. Preserve the same path for follow-up revisions.

## Clarity Order

- **Answer first.** State the purpose, conclusion, or key distinction at the top.
- **Organise by user questions.** Prefer sections such as purpose, daily use, evaluation, limits, and file locations over a file-by-file tour.
- **Give each section one job.** Remove repeated explanations and merge overlapping panels.
- **Keep technical terms.** Define unavoidable terms beside their first use instead of replacing them with vague wording.
- **Use direct comparisons.** “Stayed / Changed”, “Daily use / Evaluation”, and “Covers / Does not cover” make exact differences easier to scan.
- **Separate different kinds of fact.** Distinguish warnings from pass gates, suggestions from automatic changes, and permanent source files from temporary artefacts.
- **Layer the evidence.** Keep the main explanation short. Put commands, line ranges, long snippets, and detailed proof in a collapsed `<details>` section.
- **State the proof boundary.** Say what the evidence establishes and what it cannot prove.
- **Stop when clear.** Do not add sections, diagrams, or words merely to make the page look substantial.

## Hard Rules

- Read-only except for the HTML artefact.
- One self-contained HTML file by default. No sidecar folder, CDN, remote font, external CSS, or external JavaScript.
- Preserve meaning, scope, technical terms, paths, quantities, caveats, and uncertainty from the source.
- Prefer four to six focused sections for a single-topic explainer, but let the material determine the final length.
- Use a relationship map only when it makes a real dependency, sequence, or hierarchy easier to understand.
- Prefer CSS boxes, arrows, small tables, or inline SVG when a visual materially improves understanding.
- Embed required images as base64 when practical. Otherwise link the absolute path and explain why.
- Use code or quotes only when they clarify the explanation.
- No quiz. A checkpoint states what should now be clear.
- Never overstate source evidence or present an inference as a verified fact.

## Suggested Shape

Use only the parts that help:

1. **Header:** direct answer and one-sentence purpose.
2. **Small relationship map:** the smallest useful flow, comparison, or hierarchy.
3. **Question-led panels:** one section per decision or user concern.
4. **Evidence:** concise source links and a collapsed detailed-proof block.
5. **Limits:** what the explanation or test does not establish.
6. **Checkpoint or update note:** one short closing summary.

For example, explain a test through **Purpose / Daily use / Evaluation / Limits**, not one section per source file.

## Browser and Follow-up Behaviour

- Respect the requested browser surface. If the user says in-app browser only, never call an OS opener, Safari, Chrome, or Finder.
- Otherwise prefer an available agent-controlled browser. Use an OS opener only when no agent browser is available and the user has not restricted it.
- If a local `file://` page cannot be reloaded through the permitted browser, update the file and ask the user to refresh that tab. Do not bypass the browser policy.
- On feedback, re-read the same HTML, keep useful content, and make the smallest revision that resolves the comment.
- Verify important visible changes in the permitted browser when possible. Also check required text, links, balanced structure, and external-asset count.

## Anti-patterns

- Beginning with methodology before answering the user's question.
- A giant wall of text, a file-by-file tour, or several sections making the same point.
- Decorative diagrams that do not clarify a relationship.
- Jargon without a nearby definition, or simplification that removes technical meaning.
- Mixing detailed proof into the main explanation when it can be collapsed.
- Confusing warnings with failures, suggestions with automatic edits, or temporary files with permanent source.
- Marketing language, vague claims, or conclusions stronger than the evidence.
- Rebuilding from scratch when a focused update to the existing file is enough.
