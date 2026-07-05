---
name: explain-with-html
description: Creates or updates a self-contained HTML explainer canvas in the OS temp folder, then opens it. Use when the user wants unfamiliar code changes, PR stacks, diffs, transcripts, architecture, or decisions explained visually with plain language, relationships, code snippets, sources, and follow-up revisions.
---

# Explain With HTML

Create a visual, self-contained HTML artefact that helps the user understand unfamiliar material and decide whether they can move on.

## Quick Start

1. Identify the source: code/diff/PR, Cursor transcript, pasted text, YouTube transcript, docs, or current chat context.
2. If an HTML path from this skill already exists in the current conversation, update that file. If the user gives a path, update that file. Otherwise create a new file in the real OS temp folder.
3. Read only what is needed. Do not edit repo files, git state, PRs, docs, or source data.
4. Write one self-contained `.html` file with inline CSS/JS.
5. Open it with the OS opener (`open` on macOS, `xdg-open` on Linux, `start` on Windows) and report the absolute path.

## Temp File

Resolve the temp folder at runtime. Do not print literal `$TMPDIR` as the path.

```bash
tmpdir="${TMPDIR:-/tmp}"
path="$tmpdir/explain-with-html-$(date +%Y%m%d-%H%M%S)-<topic>.html"
```

Use a safe short topic slug. If the file is being updated, preserve the same path.

## Hard Rules

- **Read-only except the HTML artefact.**
- **Single HTML file by default.** No manifest. No sidecar asset folder unless the user explicitly asks.
- **Self-contained by default.** No CDN, remote font, external CSS, or external JS.
- **Plain language first.** Avoid jargon. Define unavoidable terms beside the first use.
- **Decision explainer by default.** Explain what changed, why, how parts connect, tradeoffs, and what should be clear before moving on.
- **Preserve useful content on updates.** Incorporate feedback by revising, adding, or reconnecting panels in the same file.
- **No quiz.** Use checkpoints as clarity targets, not questions to test the user.

## HTML Shape

Include these sections when relevant:

- **Top relationship map** — connected nodes for files, PRs, concepts, claims, decisions, risks, screenshots, tests, or transcript topics.
- **Explanation panels** — one panel per important node; simple explanation, why it matters, and links to related panels.
- **Code or quote panels** — short snippets only when they clarify the idea.
- **Source evidence panel** — concise list of files, PRs, transcript ranges, docs, commands, or screenshots read.
- **Checkpoint panel** — concrete items that should be clear before the user moves topic.
- **Update notes** — what changed in the HTML after the latest feedback.

For non-code transcripts, use nodes like `topic`, `claim`, `example`, `speaker`, `timeline`, `contradiction`, `takeaway`, and `open question`.

For code or PRs, use nodes like `file`, `function`, `component`, `branch`, `PR`, `decision`, `risk`, `screenshot`, `test`, and `open question`.

## Visuals

- Prefer inline SVG, CSS boxes, simple arrows, and small tables.
- Embed needed images as base64 data URIs when practical.
- If an image is too large, resize/compress in temp before embedding.
- If embedding would make the file unreasonable, link the original absolute path and explain why.

## Follow-up Feedback

When the user comments on the artefact:

1. Re-read the current HTML and the new feedback.
2. Update the same file if its path is known.
3. Keep useful existing panels.
4. Add deeper explanations, new nodes, corrected links, or simpler wording.
5. Open the updated file and report the same absolute path.

## Anti-patterns

- Chat-only explanation when the user asked for HTML.
- A giant wall of text with no map.
- Marketing-style pages, decorative visuals, or vague diagrams.
- Jargon without examples.
- Creating repo files or committing screenshots.
- Rebuilding from scratch on every comment when a targeted update would work.
