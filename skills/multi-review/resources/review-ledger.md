# Review Ledger Format

Store the ledger in the OS temp directory. It tracks finding lifecycle only, not screenshots or command artefacts.

Recommended path:

```text
$TMPDIR/pr-review-ledger-<repo-slug>-<stack-or-pr>.json
```

## JSON shape

```json
{
  "version": 2,
  "repo": "/absolute/repo/path",
  "stackId": "pr-123-or-stack-123-124",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "branches": [
    {
      "branch": "feature/name",
      "parent": "main",
      "pr": 123,
      "headSha": "abc123"
    }
  ],
  "findings": [
    {
      "id": "review-docs-check:feature-name:001",
      "branch": "feature/name",
      "pr": 123,
      "reviewers": ["review-docs-check"],
      "sources": ["multi-review", "github"],
      "location": "path/file.ts:42",
      "summary": "Short issue summary",
      "evidence": "Short quoted evidence or URL",
      "firstSeenAt": "ISO-8601",
      "lastCheckedAt": "ISO-8601",
      "status": "open | fixed-by-code | reviewer-confirmed | false-positive | accepted-tradeoff | needs-user | already-addressed",
      "judgement": "fix | acceptable-tradeoff | false-positive | reply-only | needs-user | already-addressed",
      "ownerBranch": "feature/name",
      "tradeoff": "Benefit of the recommendation; cost or risk accepted",
      "nextAction": "What should happen next",
      "fixEvidence": "Command output, commit, or note after fix"
    }
  ]
}
```

## Ownership

- Review lanes supply evidence and a recommended action.
- `multi-review` deduplicates findings, preserves stable IDs, and sets judgement, status, owner branch, trade-off, and next action.
- `fix-and-verify` acts only on explicitly selected finding IDs, appends fix evidence, and marks code fixes `fixed-by-code`.
- A later fresh reviewer pass marks `reviewer-confirmed`.
