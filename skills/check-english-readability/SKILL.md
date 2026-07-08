---
name: check-english-readability
description: Checks and rewrites Markdown prose into a deterministic target-grade readability band using a bundled CLI that strips Markdown syntax before scoring. Use when writing, rewriting, editing, reviewing, simplifying, or shortening Markdown text where the user asks for clear writing, plain English, Hemingway-style readability, or a grade-level target.
---

# Check English Readability

Use this skill to make Markdown prose easier to read without flattening it. The default target is Grade 9 with an acceptable document band of Grade 8-9.

## Quick Start

1. Draft or rewrite the Markdown.
2. Save the original and candidate Markdown to temporary `.md` files.
3. Run:

```sh
node /Users/prasanth/.agents/skills/check-english-readability/scripts/check-english-readability.js --file /tmp/candidate.md --reference-file /tmp/original.md --max-grade 9
```

4. If it fails, rewrite the flagged sentences and run the checker again.
5. Only report the final text as passing when the checker exits `0`.

## Markdown Input

- Pass `.md` files directly to `--file` and `--reference-file`; do not convert them to `.txt` first.
- The checker cleans Markdown before it scores the text.
- It removes front matter and comments.
- It removes code blocks and rules.
- It removes link reference lines.
- It keeps text from links, images, tables, headings, quotes, and lists.
- It removes the Markdown marks around that text.
- Visible prose remains in the cleaned text.
- It keeps paragraph breaks after cleanup. Shape checks still catch edits to structure.

## Rules

- Treat the checker as the source of truth for grade band, hard sentences, and pass/fail.
- Aim for the raw visible grade band, not the lowest possible grade. For the default target, stop at Grade 8-9.
- Do not simplify below the minimum grade unless the user explicitly asks for simpler text.
- Let the checker's protected-term adjustment prevent false failures from product names, agency names, and acronyms.
- Fix every sentence above the target grade, not only the document average.
- Prefer shorter sentences, concrete verbs, common words, and direct order, but keep adult tone.
- Preserve the original paragraph count and line breaks unless the user asks for restructuring.
- Do not split a sentence only because it contains a long product name, agency name, acronym, or parenthetical expansion.
- Keep necessary proper nouns and acronyms inline. Do not expand them into separate explanatory sentences unless the original did.
- Remove hedges such as `I think`, `maybe`, and `perhaps` unless meaning requires them.
- Replace passive voice with active voice when the actor is known.
- Keep domain terms when they are necessary; simplify the sentence around them.
- Preserve facts, names, dates, numbers, legal meaning, and commitments.

## Rewrite Workflow

1. Make the smallest edit that moves the text into the target band.
2. Put the main actor and action early.
3. Split only the clause that makes a sentence fail, and keep the result in the same paragraph.
4. Replace abstract nouns with verbs where possible.
5. Remove filler and duplicated qualifiers.
6. Re-run the checker.
7. Repeat until:
   - document grade is between `min-grade` and `max-grade`
   - every sentence grade is `<= max-grade`
   - no very hard sentences remain
   - paragraph count matches the reference text when `--reference-file` is used
   - sentence count has not increased by more than the checker allows

## Output

When returning edited prose, include the final verification line:

```text
Verified by: check-english-readability.js --file /tmp/candidate.md --reference-file /tmp/original.md --max-grade 9 exited 0
```
