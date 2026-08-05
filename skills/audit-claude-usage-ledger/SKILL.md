---
name: audit-claude-usage-ledger
description: Audits the current month of local Claude usage, reconciles it with the total the user reads from Claude Settings, writes attributable work and a separate cloud-only remainder to the configured Notion ledger, and reconstructs a dated report. Use when reviewing Claude usage while updating the persistent ledger.
---

# Audit Claude Usage Ledger

Turn local Claude transcripts into a compact monthly cost audit while keeping
cloud-only usage separate from attributable work.

## Workflow

1. Use the invocation calendar month and `Asia/Singapore` timezone unless the
   user supplies a different month or timezone.
2. Ask the user to open `Claude > Settings > Usage` and provide the displayed
   current-month estimated API-equivalent total and its `as of` date, if shown.
   Do not require a screenshot. Skip this step when the user already supplied
   the amount.
3. Run `node scripts/collect-usage.mjs --timezone Asia/Singapore` without
   `--authoritative-total-usd`. Pass `--month YYYY-MM` only when overriding the
   invocation month, and replace the timezone only when the user requests one.
4. Treat the collector output as the local evidence ledger. It includes Claude
   Code, existing `claude -p` sessions, and subagent costs attributed to their
   parent session and initiating human prompt date. Do not scale or redistribute
   these costs to match Claude Settings.
5. Calculate cloud-only usage as the Claude Settings total minus
   `localEstimatedMonthCostUSD`. Keep this amount separate because it is not
   attributable from local transcripts. It may include claude.ai, another
   device, remote Claude Code sessions, Cowork, or other cloud activity.
6. Turn local cost-bearing prompts into concise breakdown items. Merge repeated
   attempts at the same activity and sum their costs. Do not split one prompt's
   cost across multiple items; use one combined item when needed.
7. Infer the relevant scope for every local workstream. For project-specific
   work, use the product or project name without adding a redundant team name.
   For team-wide work, include the team name. For personal work with no project
   or team scope, use first-person wording such as `Maintaining my Claude usage
   audit ledger`. Never invent an association. If sampled prompts are
   insufficient, inspect the relevant transcript read-only for grounded names.
8. Write each substantial local workstream as a natural, goal-led parent `Issue`
   and each dated breakdown item as its native Notion sub-item. Put other local
   activity under `Miscellaneous Claude usage`.
9. Read [resources/notion-ledger.md](resources/notion-ledger.md). Reuse existing
   parents, append missing local rows, and create or update the single monthly
   cloud-only reconciliation child as instructed there. Never distribute its
   cost across local workstreams.
10. Query the database after writing and reconstruct the current month's report
    from its dated native sub-items. Group local children by `Parent item`, then
    `Work date`, and sum unrounded `Raw cost` values. Treat the dedicated
    cloud-only parent as a separate report section rather than a numbered local
    workstream.
11. Return only the reconstructed Markdown report in chat. Do not create a
    report file.

## Output format

```md
**Claude Usage from <D Month> to <D Month YYYY>: $<Claude Settings total>**

**Local usage (attributable): $<local total>**

1. <Goal-led local workstream in its project, team, or personal context>: **$<cost>**
   - Breakdown:
     - <Date>: **$<cost>**
       - <Concise activity summary>
       - <Concise activity summary>

**Cloud-only usage (not attributable): $<Settings total minus local total>**

Calculated as the Claude Settings total minus local attributable usage. This may
include claude.ai, another device, remote Claude Code sessions, Cowork, or other
cloud activity.
```

Order local workstreams by estimated cost, highest first. Format USD with a
dollar sign and two decimal places. Sum raw values before rounding.

## Hard rules

- The unrounded numbered-workstream sum must equal
  `localEstimatedMonthCostUSD`, not the Claude Settings total.
- Never distribute cloud-only usage across local workstreams.
- The local subtotal plus the cloud-only amount must equal the Claude Settings
  total before rounding.
- If the Settings total is lower than the local total, stop before writing the
  monthly cloud row, report a reconciliation anomaly, and ask for a matching
  date or refreshed Settings value. Never store negative cloud usage.
- Treat every dollar figure as estimated API-equivalent cost, not subscription
  spend or actual per-task billing.
- Never output a generic label when grounded project or team context exists.
- Never add separate `Context` or `Objective` bullets.
- Do not append a team name when the project or product already scopes the work.
- Do not omit the team name from team-wide work.
- Use `my` for personal work with no grounded project or team association.
- Do not expose raw prompts, credentials, secrets, PII, or private source
  content.
- Do not omit local cost-bearing activity; put one-off work under miscellaneous.
- Do not claim that a rendered formula or rollup was verified when the connector
  returned `<omitted />` or an unresolved `formulaResult://` reference.
- If the collector fails, report the exact command and error. Do not invent
  costs.
