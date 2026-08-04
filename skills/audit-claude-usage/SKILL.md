---
name: audit-claude-usage
description: Audits the current month of local Claude usage and returns a concise context-aware cost summary in chat without reading or writing Notion. Use when the user wants a quick Claude usage or cost breakdown rather than a persistent ledger update.
---

# Audit Claude Usage

Turn the current month's local Claude transcripts into a concise, outcome-level cost summary in chat.

## Workflow

1. Audit from the first day of the current calendar month through the invocation
   date. Use `Asia/Singapore` unless the user supplies another timezone.
2. Obtain the current-month estimated API-equivalent total displayed by Claude.
   If it is unavailable programmatically or supplied by the user, ask for it;
   never substitute a locally reconstructed total silently.
3. Run `sh scripts/collect-usage.sh --authoritative-total-usd <amount>
   --timezone Asia/Singapore`. Replace the timezone only when the user requests
   another one.
4. Treat the collector output as the evidence ledger. It includes Claude Code,
   `claude -p`, and subagent costs attributed to the parent session and initiating
   human prompt date. Preserve relative weights while reconciling to Claude's
   displayed total.
5. Group every cost-bearing prompt into a natural, goal-led workstream that
   combines the task, objective, and appropriate project, team, or personal
   context.
   Merge repeated attempts and closely related outcomes. Do not split one
   prompt's cost across multiple workstreams.
6. For project-specific work, use the product or project name without adding a
   redundant team name. For work about how the whole team operates, include the
   team name. For personal work that is not scoped to a project or team, use
   first-person wording such as `Maintaining my Claude usage audit ledger`.
   Never invent a project or team association. If sampled prompts are
   insufficient, inspect the relevant local transcript read-only for grounded
   names.
7. Within each workstream, merge activity across dates into unique, concise
   one-line bullets. Do not show dates or costs on individual bullets. Put all
   remaining one-off work under `Miscellaneous Claude usage`, retaining one
   bullet for each unique activity.
8. Sum unrounded costs within each workstream, order workstreams by cost from
   highest to lowest, format dollars to two decimal places, and return only the
   Markdown summary in chat. Do not create a file or access Notion.

## Output format

```md
**Claude Usage from <D Month> to <D Month YYYY>: $<total>**

1. <Goal-led workstream in its project, team, or personal context>: **$<cost>**
   - <Concise activity summary>
   - <Concise activity summary>

2. Miscellaneous Claude usage: **$<cost>**
   - <Concise one-off activity>
```

Do not add a total line at the bottom, `Breakdown`, `Context`, or `Objective`
headings. The numbered workstream line carries the combined task and objective.

## Hard rules

- The header range always begins on the first day of the invocation month and
  ends on the invocation date, even when the first day has no usage.
- The unrounded workstream sum must equal Claude's authoritative displayed total.
- Treat every dollar figure as an estimated API-equivalent cost, not subscription
  spend or actual per-task billing.
- Do not omit cost-bearing activity; place unmatched work under miscellaneous.
- Use `my` for personal work with no grounded project or team association.
- Do not expose raw prompts, credentials, secrets, PII, or private source content.
- Do not read from, write to, or modify the Notion audit ledger.
- If the collector fails, report the exact command and error. Do not invent costs.
