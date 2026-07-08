---
name: check-readability
description: Checks and rewrites prose against a deterministic Grade 9 readability target using a bundled CLI. Use when writing, rewriting, editing, reviewing, simplifying, or shortening text where the user asks for clear writing, plain English, Hemingway-style readability, or a grade-level target.
---

# Check Readability

Use this skill to make prose easier to read. The default target is Grade 9 or lower.

## Quick Start

1. Draft or rewrite the text.
2. Save the candidate text to a temporary file.
3. Run:

```sh
node /Users/prasanth/.agents/skills/check-readability/scripts/check-readability.js --file /tmp/candidate.txt --max-grade 9
```

4. If it fails, rewrite the flagged sentences and run the checker again.
5. Only report the final text as passing when the checker exits `0`.

## Rules

- Treat the checker as the source of truth for grade, hard sentences, and pass/fail.
- Aim for Grade 9 or lower unless the user gives a different target.
- Fix every sentence above the target grade, not only the document average.
- Prefer shorter sentences, concrete verbs, common words, and direct order.
- Remove hedges such as `I think`, `maybe`, and `perhaps` unless meaning requires them.
- Replace passive voice with active voice when the actor is known.
- Keep domain terms when they are necessary; simplify the sentence around them.
- Preserve facts, names, dates, numbers, legal meaning, and commitments.

## Rewrite Workflow

1. Split any failing sentence into smaller statements.
2. Put the main actor and action early.
3. Replace abstract nouns with verbs where possible.
4. Remove filler and duplicated qualifiers.
5. Re-run the checker.
6. Repeat until:
   - document grade is `<= max-grade`
   - every sentence grade is `<= max-grade`
   - no very hard sentences remain

## Output

When returning edited prose, include the final verification line:

```text
Verified by: check-readability.js --max-grade 9 exited 0
```
