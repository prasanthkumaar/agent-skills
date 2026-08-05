---
name: write-readable-english
description: Improves English phrases, sentences, paragraphs, and pages with the smallest useful edit while preserving technical meaning and voice. Use when drafting or rewriting prose for clarity without oversimplifying it.
---

# Write Readable English

Improve clarity without flattening meaning. Leave already-clear text unchanged or near-unchanged.

## Core Contract

- Preserve facts, technical meaning, names, quantities, code, links, scope, conditions, caveats, certainty, tone, and commitments.
- Add no unsupported claims.
- Make the minimum necessary edit.
- Prefer natural cohesion over shorter sentences.
- Never treat reading grade as a target unless the user explicitly requests one.
- Keep technical and domain terms. If the user requests a lay explanation, explain the term instead of replacing it with a broader or less precise word.

## Workflow

Use `scripts/check-english-readability.js` once on every input, including a phrase, sentence, paragraph, or page.

1. Infer the audience and purpose from context.
2. Scan the text once. For multiple inputs, scan them together.
3. Treat reading grade and hard or very-hard labels, passive voice, adverb, and qualifier matches as mechanical advisory observations.
4. Identify a concrete clarity problem before editing. A warning is not itself a problem.
5. Ignore any or all warnings that do not harm clarity. Leave the text unchanged when no useful edit exists.
6. Make the smallest edit that fixes the concrete problem.
7. Run the preservation check against the source. Restore missing headings, links, code spans, and numbers unless the change was intentional.
8. Review missing modal and condition markers semantically. Preserve the original certainty and relationship, but not necessarily the same word.
9. Stop when the prose is clear enough for its purpose.

The scan has no pass or fail result. Do not expose its grades or warning labels unless the user asks for diagnostics. Write readable prose directly rather than simplifying mechanically towards a score.

## Editing Scale

### Phrase

- Change only unclear, vague, or unnatural wording.
- Preserve established terminology and intended emphasis.

### Sentence

- Fix the specific problem: buried action, ambiguous referent, weak connection, unnecessary repetition, or overloaded structure.
- Split or join only when it makes the relationship clearer.

### Paragraph or Page

- Work section by section.
- Preserve headings, Markdown, examples, and argument order unless structure is the problem.
- Do not rewrite clean passages for stylistic uniformity.

## Clarity Rules

- Put the actor and action early when that helps.
- Keep qualifiers and conditions attached to what they modify.
- When restructuring, keep purposes, expected outcomes, limitations, and contingencies attached to their original subject.
- Preserve causal, conditional, comparative, temporal, and evidential relationships.
- Make headings and summaries specific enough to state the actual change or subject; do not leave a vague summary above a clearer body.
- Use bullets only for genuine lists.
- Remove filler only when it carries no meaning or tone.
- Keep long sentences that are clear.
- Join short sentences when separation weakens cohesion.
- Respect the source's dialect, voice, formatting, and level of formality.

## Output

Return the revised text by default. For file edits, return the file path.
Briefly explain a material choice only when useful.
When no edit is necessary, return the original text unchanged; mention that it was unchanged only if the user asks for an explanation.
