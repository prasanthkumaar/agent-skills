---
name: research-web
description: Performs bounded source-backed web research with URL-verified claims and a concise answer. Use when the user asks for web research, source-backed research, official-source verification, current documentation checks, or a concise researched answer.
---

# Research Web

Bounded web research with source verification. Keep the user-facing answer short; keep the source-checking rigorous.

## Quick start

1. State the research scopes briefly: 2-4 angles maximum.
2. Search/fetch sources yourself first. Prefer official or primary sources for facts, versions, limits, defaults, and documented patterns.
3. If subagents are available and allowed, dispatch at most 4 first-level researchers using [resources/subagent-protocol.md](resources/subagent-protocol.md).
4. Drop every claim that lacks a verified URL.
5. Reply using [resources/output-format.md](resources/output-format.md): max 100 words unless the user explicitly asks for a full report.

## Hard rules

- **100 words max** in the chat reply. No exceptions unless user explicitly asks for the full report.
- **URL-backed claims only** in the reply. No URL, no claim.
- Fetch primary sources for concrete facts (defaults, limits, versions).
- Read relevant codebase files before subagents if the question is repo-specific.
- **Parent-only skill.** Subagents must not invoke this skill, any research wrapper skill, or any Agent/Workflow/Subagent tool.
- **Max agent depth: 1.** The parent may create researcher subagents; researcher subagents may not create children.
- **Max parallel researchers: 4.** If more scope is needed, return the gap or ask before continuing.
- **One invocation at a time.** Do not run this skill alongside parallel manual research agents for the same question.
- Research only — no code changes.

## Examples

- "Check the official Storybook/Vite/TanStack pattern for this config."
- "Research whether this package version fixed the issue."
- "Find source-backed options and tell me which one is documented."

## Workflow

1. **Decompose**: official docs, implementation examples, counter-evidence, and user/repo context.
2. **Research**: direct web tools locally; optional first-level subagents only when allowed.
3. **Distil**: resolve contradictions internally; keep source quality higher than breadth.
4. **Reply**: verdict + inline-linked bullets within 100 words.

## Anti-patterns

- Recursive skill invocation · subagents spawning subagents · unbounded parallel agents · long markdown reports in chat · source appendix after a 100-word cap · padding · single secondary-source facts · skipping counter-evidence

## Advanced features

Use [resources/subagent-protocol.md](resources/subagent-protocol.md) only when first-level researchers are allowed. Use [resources/output-format.md](resources/output-format.md) for every final answer.
