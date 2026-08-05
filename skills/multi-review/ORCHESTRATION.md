# Full Review Orchestration

Use this workflow for generic, full, multi-lane, and stacked reviews.

## Establish the review scope

1. Resolve the repository, branches, fixed parents, and PRs.
2. Record each branch head SHA.
3. Capture one complete diff command per branch against its fixed parent.
4. Review stacks bottom-up. Assign a finding to the earliest branch that
   introduced it.

## Select lanes

Always run:

- [BUG.md](BUG.md)
- [SECURITY.md](SECURITY.md)
- [CODE_QUALITY.md](CODE_QUALITY.md)

Run when applicable:

- [DOCS_CONFORMANCE.md](DOCS_CONFORMANCE.md) when the diff changes a framework,
  library, API, configuration, test, or story pattern.
- [SPEC.md](SPEC.md) when an issue, ticket, PRD, spec, or relevant PR claim
  exists.
- [PR_ACCURACY.md](PR_ACCURACY.md) when a PR or draft description exists.

When applicability is uncertain, run the lane. Use `not-applicable` only when
the lane truly cannot apply. Missing required access or evidence is
`incomplete`.

## Run reviewers

- Give each lane to a separate fresh, cheaper subagent.
- Give every lane the complete branch diff and only its lane file.
- Launch applicable lanes concurrently up to available agent capacity. Queue
  the remainder without hard-coding a concurrency limit or model.
- Require an explicit `no findings` result from a successful clean lane.
- Retry a failed, timed-out, or malformed lane once with a fresh subagent.
- After a second failure, mark the lane `incomplete`.

## Consolidate

1. Reject speculative findings that fail their lane's evidence threshold.
2. Merge findings with the same underlying issue and location.
3. Choose the lane that best describes the risk as primary. Add evidence from
   other lanes without creating a reviewer list.
4. Preserve an existing v3 finding ID when the same primary lane, location,
   and underlying issue reappear.
5. Assign new IDs as `multi-review:<lane>:<branch-slug>:<number>`.
6. Order findings by branch, then by the consequence of leaving them
   unresolved. Put user-facing failures and security risks first.

## Ledger

Use [REVIEW_LEDGER.md](REVIEW_LEDGER.md) for full reviews only. Targeted
single-lane reviews return findings directly.

## Output

Return:

1. A lane-status table using `completed`, `not-applicable`, or `incomplete`.
2. Numbered decision-ready findings.
3. The ledger path.
4. An explicit list of incomplete lanes.

Report no actionable findings only when every applicable lane completed.
