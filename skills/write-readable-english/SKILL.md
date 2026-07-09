---
name: write-readable-english
description: Writes, rewrites, and checks Markdown prose so it is clear without being flattened. Use when drafting or editing PR descriptions, Notion docs, GitHub comments, docs, announcements, or other Markdown where readable English matters.
---

# Write Readable English

Use this skill to draft clear prose first. Then verify it with the checker script.

```text
scripts/check-english-readability.js
```

The default target is Grade 9 with no minimum grade.

## Before Writing

Classify the text before drafting or editing.

```text
Text type: PR description, Notion doc, GitHub comment, Slack message, docs, announcement, review comment, or other.
Audience: reviewer, team, exec, public user, support, maintainer, or one named person.
Purpose: explain, decide, persuade, announce, unblock, document, or review.
```

If the Markdown file is not a codebase artifact, write draft files in OS temp. Do not put scratch prose in the repo.

## Draft To Pass

- Put the main actor and action early.
- Keep one main idea per sentence.
- Use bullets for lists of conditions, decisions, risks, or steps.
- Keep domain terms that matter, but make the sentence around them direct.
- Avoid filler starts and stacked clauses.
- Avoid hedge words and vague nouns.
- Preserve facts, names, and links.
- Keep legal meaning and commitments.

## Check

Save the original and candidate Markdown, then run:

```sh
node /Users/prasanth/.agents/skills/write-readable-english/scripts/check-english-readability.js --file /tmp/candidate.md --reference-file /tmp/original.md --max-grade 9
```

For new prose, omit `--reference-file`.

## Minimal Rewrite Loop

1. Run the checker once.
2. List only failed sentences.
3. For each failed sentence, name the likely cause.
4. Make the smallest local edit for that cause.
5. Do not rewrite clean sentences.
6. Re-run the checker.
7. Stop after two passes unless the user asked for polish.

Common causes:

```text
too many clauses
long noun phrase
stacked abstractions
passive voice
vague actor
punctuation chain
repeated hedge words
technical terms
```

## Output

Return the final prose or file path, then include:

```text
Verified by: check-english-readability.js --file [candidate] --max-grade 9 exited 0
```
