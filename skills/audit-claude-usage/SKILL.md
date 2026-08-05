---
name: audit-claude-usage
description: Audits the current month of local Claude usage, reconciles it with the total the user reads from Claude Settings, and returns attributable workstreams plus a separate cloud-only remainder in chat without accessing Notion. Use for a quick Claude usage or cost breakdown rather than a persistent ledger update.
---

# Audit Claude Usage

Turn the current month's local Claude transcripts into a concise, outcome-level
cost summary while keeping cloud-only usage separate from attributable work.

## Workflow

1. Audit from the first day of the current calendar month through the invocation
   date. Use `Asia/Singapore` unless the user supplies another timezone.
2. Ask the user to open `Claude > Settings > Usage` and provide the displayed
   current-month estimated API-equivalent total and its `as of` date, if shown.
   Do not require a screenshot. Skip this step when the user already supplied
   the amount.
3. Run `node scripts/collect-usage.mjs --timezone Asia/Singapore` without
   `--authoritative-total-usd`. Pass `--month YYYY-MM` only when overriding the
   invocation month, and replace the timezone only when the user requests one.
4. Treat the collector output as the local evidence ledger. It includes Claude
   Code, `claude -p`, and subagent costs attributed to the parent session and
   initiating human prompt date. Do not scale or otherwise redistribute these
   costs to match Claude Settings.
5. Calculate cloud-only usage as the Claude Settings total minus
   `localEstimatedMonthCostUSD`. Keep this amount separate because it is not
   attributable from local transcripts. It may include claude.ai, another
   device, remote Claude Code sessions, Cowork, or other cloud activity.
6. Group every local cost-bearing prompt into a natural, goal-led workstream
   combining the task, objective, and appropriate project, team, or personal
   context. Merge repeated attempts and closely related outcomes. Do not split
   one prompt's cost across multiple workstreams.
7. For project-specific work, use the product or project name without adding a
   redundant team name. For team-wide work, include the team name. For personal
   work with no project or team scope, use first-person wording such as
   `Maintaining my Claude usage audit ledger`. Never invent an association. If
   sampled prompts are insufficient, inspect the relevant transcript read-only
   for grounded names.
8. Within each workstream, merge activity across dates into unique, concise
   one-line bullets. Do not show dates or costs on individual bullets. Put
   remaining one-off local work under `Miscellaneous Claude usage`, retaining
   one bullet for each unique activity.
9. Sum unrounded local costs within each workstream, order workstreams by cost
   from highest to lowest, format dollars to two decimal places, and return only
   the Markdown summary in chat. Do not create a file or access Notion.

## Output format

```md
**Claude Usage from <D Month> to <D Month YYYY>: $<Claude Settings total>**

**Local usage (attributable): $<local total>**

1. <Goal-led workstream in its project, team, or personal context>: **$<cost>**
   - <Concise activity summary>
   - <Concise activity summary>

2. Miscellaneous Claude usage: **$<cost>**
   - <Concise one-off activity>

**Cloud-only usage (not attributable): $<Settings total minus local total>**

Calculated as the Claude Settings total minus local attributable usage. This may
include claude.ai, another device, remote Claude Code sessions, Cowork, or other
cloud activity.
```

Do not add a total line at the bottom or `Breakdown`, `Context`, or `Objective`
headings. The numbered workstream line carries the combined task and objective.

## Hard rules

- The header range always begins on the first day of the invocation month and
  ends on the invocation date, even when the first day has no usage.
- The unrounded numbered-workstream sum must equal
  `localEstimatedMonthCostUSD`, not the Claude Settings total.
- Never distribute cloud-only usage across local workstreams.
- The local subtotal plus the cloud-only amount must equal the Claude Settings
  total before rounding.
- If the Settings total is lower than the local total, report a reconciliation
  anomaly and ask for a matching date or refreshed Settings value. Never report
  negative cloud usage.
- Treat every dollar figure as estimated API-equivalent cost, not subscription
  spend or actual per-task billing.
- Do not omit local cost-bearing activity; place unmatched work under
  miscellaneous.
- Use `my` for personal work with no grounded project or team association.
- Do not expose raw prompts, credentials, secrets, PII, or private source
  content.
- Do not read from, write to, or modify the Notion audit ledger.
- If the collector fails, report the exact command and error. Do not invent
  costs.
