---
name: multi-review
description: Reviews complete branch or PR diffs through independent bug, security, code-quality, documentation, spec, and PR-accuracy lanes. Use for a targeted review concern or a full parallel review of one branch, one PR, or an ordered stack.
---

# Multi Review

Routes targeted and full read-only reviews. It never edits code, pushes,
comments, resolves threads, or updates PR descriptions.

## Inputs

- Repository path.
- Branch or ordered stack.
- Fixed parent for each branch.
- PR body, evidence, issue, ticket, PRD, or spec when available.

## Route

1. Resolve the fixed parent and complete branch diff once.
2. Load only the lane files needed for the request:
   - functional correctness: [BUG.md](BUG.md)
   - security: [SECURITY.md](SECURITY.md)
   - standards and maintainability: [CODE_QUALITY.md](CODE_QUALITY.md)
   - external documented patterns: [DOCS_CONFORMANCE.md](DOCS_CONFORMANCE.md)
   - issue, ticket, PRD, or spec: [SPEC.md](SPEC.md)
   - PR body and evidence: [PR_ACCURACY.md](PR_ACCURACY.md)
3. For a named concern, run that lane in one fresh, cheaper subagent and
   return its findings directly.
4. For a generic, full, multi-lane, or stacked review, follow
   [ORCHESTRATION.md](ORCHESTRATION.md).

## Defaults

- “Review this PR” means a full review.
- A named concern such as security or spec coverage runs only that lane.
- Give every selected lane the complete diff against the same fixed parent.
- Review stacks bottom-up.
- Do not discover repository-local review skills.
- Choose an available cheaper subagent without naming or hard-coding a model.

## Finding shape

Every finding states:

- location
- issue
- evidence
- what happens if it is not addressed
- credible options and each option's trade-off
- recommended option and why

Do not invent alternatives when one clear fix exists.

## Examples

- “Security-review this PR” runs `SECURITY.md` only.
- “Run a full review on this stack” runs every applicable lane in parallel.

## Hard rules

- Read-only.
- Prefer fewer high-confidence findings.
- Never report a clean review while an applicable lane is incomplete.
