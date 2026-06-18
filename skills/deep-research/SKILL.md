---
name: deep-research
description: Deep multi-round web research via parallel subagents with URL-verified claims, distilled to a ≤100-word answer for the user. Use when the user says deep research, research this deeply, investigate thoroughly, or /deep-research.
---

# Deep Research

Multi-round research with parallel subagents and source verification — **user sees ≤100 words**, not a long report.

## Quick start

1. Decompose the question into 3–5 scopes; state scopes briefly (can be one line).
2. Dispatch parallel subagents → [resources/subagent-protocol.md](resources/subagent-protocol.md).
3. Synthesise internally; every claim must have a URL before you cite it.
4. Reply to user → [resources/output-format.md](resources/output-format.md) — **max 100 words**.

## Hard rules

- **≤100 words** in the chat reply. No exceptions unless user explicitly asks for the full report.
- **URL-backed claims only** in the reply — no URL, no claim.
- Fetch primary sources for concrete facts (defaults, limits, versions).
- Read relevant codebase files before subagents if the question is repo-specific.
- Research only — no code changes.

## Workflow

1. **Decompose** — official, community, counter-evidence, trade-offs, user context.
2. **Parallel research** — subagents per scope.
3. **Distil** — resolve contradictions internally; drop weak claims.
4. **Reply** — verdict + inline-linked bullets within 100 words.

## Anti-patterns

- Long markdown reports in chat · source appendix after a 100-word cap · padding · single secondary-source facts · skipping counter-evidence

## Related

Protocol: [resources/subagent-protocol.md](resources/subagent-protocol.md). Format: [resources/output-format.md](resources/output-format.md).
