---
name: audit-claude-usage-ledger
description: Audits the current month of local Claude usage, appends costed activity rows to the configured Notion ledger, and reconstructs a dated context-aware report from that database. Use when reviewing Claude usage while updating or reconciling the persistent Notion audit ledger.
---

# Audit Claude Usage Ledger

Turn local Claude transcripts into a compact, outcome-level monthly cost audit.

## Workflow

1. Use the calendar month in which the skill is invoked and the
   `Asia/Singapore` timezone, unless the user supplies a different month or
   timezone.
2. Obtain the current-month estimated API-equivalent total displayed by Claude.
   If it is not available programmatically or supplied by the user, ask for it;
   do not silently substitute a locally reconstructed total.
3. Run `node scripts/collect-usage.mjs --authoritative-total-usd <amount>
   --timezone Asia/Singapore`. Pass `--month YYYY-MM` only when overriding the
   invocation month, and replace the timezone only when the user requests one.
4. Treat the collector output as an evidence ledger. It includes Claude Code,
   existing `claude -p` sessions, and subagent costs attributed to their parent
   session and initiating human prompt date. The collector preserves their
   relative weights while reconciling the sum to Claude's displayed total.
5. Turn cost-bearing prompts into concise breakdown items. Merge repeated attempts
   at the same activity and sum their costs. Do not split one prompt's cost across
   multiple items; use one combined item when needed.
6. Infer the relevant scope for every workstream. For project-specific work, use
   the product or project name without adding a redundant team name. For work
   about how the whole team operates, use the team name. For personal work that
   is not scoped to a project or team, use first-person wording such as
   `Maintaining my Claude usage audit ledger`. Never invent a project or team
   association. If sampled prompts are insufficient, inspect the relevant
   transcript read-only for grounded names in page titles, database titles,
   assistant text, and tool results.
7. Write each substantial workstream as a natural, goal-led parent `Issue` that
   combines the task, objective, and appropriate project, team, or personal
   scope. Write
   each dated breakdown item as its native Notion sub-item. Put all other
   cost-bearing activity under the `Miscellaneous Claude usage` parent, with each
   unique activity kept as its own native sub-item.
8. Read [resources/notion-ledger.md](resources/notion-ledger.md). Reuse existing
   parents and append missing parents and new native sub-items to the configured
   Notion database without updating or deleting old rows.
9. Query the database after writing and reconstruct the current month's report
   from its dated native sub-items. Group children by their native `Parent item`,
   then `Work date`, and sum unrounded child `Raw cost` values before formatting
   them. Do not depend on a duplicate text or formula property for the parent
   name. Do not treat connector schema metadata or child-cost arithmetic as
   proof that Notion rendered a computed parent value. When repairing the schema
   or verifying rendered totals, follow the live-UI checks in the ledger
   resource.
10. Return the reconstructed Markdown report in chat. Do not create a report file.

## Output format

```md
1. <Goal-led prose describing the work in its project, team, or personal context>: `$<estimated cost>`
   - Breakdown:
     - <Date>: `$<estimated cost>`
       - <Concise activity summary>
       - <Concise activity summary>
```

Examples of suitable headers:

- `Standardising the Postman SMS CSAT codebook and historical responses for automation`
- `Testing whether Notion can replace Linear as the SGC team's project and artefact tracker`

Order workstreams by estimated cost, highest first. Format costs as Claude does:
USD with a dollar sign and two decimal places. Sum raw values before rounding.

## Hard rules

- Label the figures as estimated API-equivalent cost when introducing the audit.
- The final unrounded ledger sum must equal Claude's authoritative displayed total.
- Report both local and authoritative totals when reconciliation changes the sum.
- Never present subscription spend as actual per-task billing.
- Never output a generic label when a grounded project or team context exists.
- Never add separate `Context` or `Objective` bullets.
- Do not append a team name when the project or product already scopes the work.
- Do not omit the team name from work about team-wide processes or organisation.
- Use `my` for personal work with no grounded project or team association.
- Do not expose raw prompts, credentials, secrets, PII, or private source content.
- Do not omit cost-bearing activity; put one-off work under miscellaneous usage.
- Do not claim that a rendered formula or rollup was verified when the connector
  returned `<omitted />` or an unresolved `formulaResult://` reference.
- If the collector fails, report the exact command and error. Do not invent costs.
