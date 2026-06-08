---
name: address-pr-review
description: Works through pull request review comments by interviewing the user on each thread's resolution, applying scoped fixes or replies, then re-running the full evidence matrix and refreshing PR description screenshots. Requires ship-pr to be installed for evidence refresh. Use when review comments arrive, or the user says address PR feedback, resolve review comments, or work through PR feedback.
---

# Address PR Review

Take an open PR with review feedback and return it to **evidence-complete** state: scoped fixes, thread replies, fresh tests, fresh full-page screenshots, and an updated PR description the user can review without re-running anything.

## Quick start

1. Fetch all feedback on the PR.
2. Interview the user per thread (fix / reply / defer / tradeoff).
3. Apply scoped changes → **mandatory** full evidence refresh → push → reply on threads.

## Hard rules

- **Interview before acting** on non-obvious items — one thread at a time. See [resources/resolution-interview.md](resources/resolution-interview.md).
- **Tradeoffs → stop.** Present options, tradeoffs, sample code; wait for choice. See [resources/triage-rules.md](resources/triage-rules.md).
- **After any code change:** re-run the **entire** evidence matrix from the PR description and re-capture **all** screenshots (even if unchanged). See [resources/refresh-evidence.md](resources/refresh-evidence.md).
- **Update the PR description**, not a comment, for Test plan and Screenshots sections.
- **Reply on every addressed thread** — start with the reviewer's **GitHub handle** (`@claude`, `@chatgpt-codex-connector`, `@coderabbitai`, …). Use the `USER:` value from fetch output (`user.login`), not the display name. Then state what changed (commit, file, or explanation). Never reply without `@handle`.
- **Do not resolve review threads** unless the user explicitly asks.
- **Scope:** fixes map to a comment or the PR's stated goal — no opportunistic refactors.

## Anti-patterns

- Fixing code without re-running tests and re-screenshotting.
- Posting new screenshots only as a PR comment.
- Auto-fixing tradeoff comments without user input.
- Resolving GitHub threads without being asked.
- Replying on a thread **without** the reviewer's `@handle` at the start of the message.
- Rewriting unrelated sections of the PR description.

## Workflow

### 1. Identify PR and scope

- [ ] `gh pr view` — branch, title, body, URL.
- [ ] Read Problem / Solution / Design decisions / evidence matrix from description.
- [ ] Understand PR goal before touching code.

### 2. Fetch all feedback

→ [resources/fetch-comments.md](resources/fetch-comments.md)

- [ ] Inline review comments, issue comments, bot threads, review summaries.
- [ ] Build a numbered list: id, author, file:line, summary, status (open/addressed/defer).

### 3. Classify and interview

→ [resources/triage-rules.md](resources/triage-rules.md)  
→ [resources/resolution-interview.md](resources/resolution-interview.md)

For each open thread:

- **Obvious fix** → propose fix; confirm if uncertain.
- **Tradeoff** → stop; options + sample code; wait.
- **Reply only** → draft reply; confirm before posting.
- **Defer / reject** → draft reply explaining why; confirm.

Ask one thread at a time when multiple resolutions differ.

### 4. Apply scoped fixes

- [ ] One commit (or focused commits) mapping to approved threads.
- [ ] No unrelated cleanup.

### 5. Refresh evidence (mandatory if code changed)

→ [resources/refresh-evidence.md](resources/refresh-evidence.md)

Re-run the **`ship-pr` verification pipeline** (bootstrap → matrix → screenshots → `gh image` → update body). Load `ship-pr` for the step-by-step resources. Ephemeral artifacts (screenshots, temp Playwright specs, PR body drafts) go to OS temp — see `ship-pr` → temp-artifacts.

- [ ] Re-bootstrap env if needed.
- [ ] Re-run **all** matrix rows from PR description.
- [ ] Re-capture **all** full-page screenshots.
- [ ] Re-upload via `gh image`; update description (`gh pr edit --body-file`).
- [ ] Tick completed review items in Test plan if applicable.

### 6. Push and reply

Follow `ship-pr` push policy (`--force-with-lease` when updating the PR branch).

For each thread, post a reply that **begins with the reviewer's `@handle`** (from fetch `USER:`), whether you fixed code or are explaining/deferring only.

- [ ] `git push --force-with-lease` when updating branch.
- [ ] Post reply on each addressed thread — body **starts with `@handle`** (see [resources/fetch-comments.md](resources/fetch-comments.md)).
- [ ] Leave threads unresolved unless told otherwise.

### 7. Exit checklist

- [ ] Every thread has a reply or explicit defer note — each reply **starts with the reviewer's `@handle`**.
- [ ] PR description Test plan reflects latest run (date/command/result).
- [ ] PR description Screenshots section has current URLs.
- [ ] No scope creep beyond review feedback + PR goal.
- [ ] User can review solely from updated description + screenshots.

## Related

Opens PRs: `ship-pr`. CI/merge only: `babysit`.
