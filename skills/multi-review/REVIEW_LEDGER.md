# Review Ledger

Use a ledger for full reviews only. Store it in the OS temporary directory:

```text
$TMPDIR/pr-review-ledger-v3-<repo-slug>-<scope>.json
```

Do not migrate or reuse older ledger versions.

## Shape

```json
{
  "version": 3,
  "repo": "/absolute/repo/path",
  "scopeId": "pr-123-or-stack-123-124",
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
      "id": "multi-review:bug:feature-name:001",
      "lane": "bug",
      "branch": "feature/name",
      "ownerBranch": "feature/name",
      "location": "path/file.ts:42",
      "issue": "Short issue statement",
      "evidence": "Concrete evidence",
      "consequence": "What happens if it is not addressed",
      "options": [
        {
          "option": "Implement the bounded fix",
          "tradeoff": "Benefit, cost, and remaining risk"
        }
      ],
      "recommendation": "Preferred option and why",
      "status": "open"
    }
  ]
}
```

Statuses are:

- `open`: a current review found the issue.
- `fixed`: a fixer implemented and locally verified the selected approach.
- `closed`: a fresh review confirmed the issue is gone.

## Reuse

- Reuse a v3 ledger only when the repository and scope identity match.
- Preserve the ID when the same primary lane, location, and underlying issue
  reappear.
- Set a `fixed` finding to `closed` when a fresh applicable lane confirms it is
  gone.
- Reopen it with current evidence when the issue remains.
- Leave it `fixed` when the confirming lane is incomplete.

## Optional fixer update

A fixing workflow may update a supplied ledger, but must not require one.

- Direct fix instructions remain the source of truth.
- Update only explicit finding IDs supplied with those instructions.
- Set an item to `fixed` only after relevant local verification passes.
- If the ledger is missing, malformed, or incompatible, skip the update and
  report why. Do not block the code fix.
