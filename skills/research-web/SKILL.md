---
name: research-web
description: Bounded source-backed web research with URL-verified claims, distilled to a ≤100-word answer for the user. Use when the user asks for web research, source-backed research, official-source verification, current documentation checks, or a concise researched answer.
---

# Research Web

Bounded web research with source verification — **user sees ≤100 words**, not a long report.

## Quick start

1. Decompose the question into 2–4 scopes; state scopes briefly (can be one line).
2. Research locally with web tools first. Use subagents only when the user or active environment explicitly allows them.
3. If subagents are used, dispatch at most 4 first-level researchers → [resources/subagent-protocol.md](resources/subagent-protocol.md).
4. Synthesise internally; every claim must have a URL before you cite it.
5. Reply to user → [resources/output-format.md](resources/output-format.md) — **max 100 words**.

## Hard rules

- **≤100 words** in the chat reply. No exceptions unless user explicitly asks for the full report.
- **URL-backed claims only** in the reply — no URL, no claim.
- Fetch primary sources for concrete facts (defaults, limits, versions).
- Read relevant codebase files before subagents if the question is repo-specific.
- **Parent-only skill.** Subagents must not invoke this skill, any research wrapper skill, or any Agent/Workflow/Subagent tool.
- **Max agent depth: 1.** The parent may create researcher subagents; researcher subagents may not create children.
- **Max parallel researchers: 4.** If more scope is needed, return the gap or ask before continuing.
- **One invocation at a time.** Do not run this skill alongside parallel manual research agents for the same question.
- Research only — no code changes.

## Workflow

1. **Decompose** — official, community, counter-evidence, trade-offs, user context.
2. **Research** — direct web tools locally; optionally first-level subagents per scope when allowed.
3. **Distil** — resolve contradictions internally; drop weak claims.
4. **Reply** — verdict + inline-linked bullets within 100 words.

## Anti-patterns

- Recursive skill invocation · subagents spawning subagents · unbounded parallel agents · long markdown reports in chat · source appendix after a 100-word cap · padding · single secondary-source facts · skipping counter-evidence

## Related

Protocol: [resources/subagent-protocol.md](resources/subagent-protocol.md). Format: [resources/output-format.md](resources/output-format.md).
