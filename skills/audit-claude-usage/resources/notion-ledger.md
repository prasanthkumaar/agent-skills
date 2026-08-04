# Notion ledger

Use this database and data source:

- Database: `https://app.notion.com/p/opengov/3b177dbba7888089a4b4caa2ff327388?v=3b177dbba78880fc80a0000c10e827f8&source=copy_link`
- Data source: `collection://3b177dbb-a788-8036-9d79-000ba56a24fe`

## Required schema

| Property | Type |
|---|---|
| `Issue` | title |
| `Parent item` | native sub-item parent relation to this data source; property ID `XWBdaA` |
| `Sub-item` | native reciprocal sub-item relation; property ID `bkFpSg` |
| `Overarching task` | formula: `if(empty(prop("Parent item")), prop("Issue"), prop("Parent item"))`; property ID `dEV8ew` |
| `Work date` | date |
| `Raw cost` | number, US dollar format; editable on dated sub-items only; property ID `Q19lVQ` |
| `Total cost (USD)` | helper rollup: sum of `Raw cost` over `Sub-item`; property ID `QjxAQQ` |
| `Estimated cost (USD)` | formula: `if(empty(prop("Sub-item")), prop("Raw cost"), prop("Total cost (USD)"))`; property ID `T3BeVg` |

`Parent item` and `Sub-item` must be the database's native sub-item properties,
not an ordinary self-relation pair with similar names. Stop before writing if
the property names, IDs, or types differ. Ask the user to enable native sub-items
when these properties are missing. Never create substitute relation properties,
add schema properties, or modify views.

Parent issues represent natural, goal-led workstreams and persist across months.
Their `Work date` and `Raw cost` must remain blank. Each dated breakdown item is
a native sub-item with exactly one `Parent item` and an editable `Raw cost`. Set
only the child's `Parent item`; let Notion populate the reciprocal `Sub-item`
relation. Never write `Estimated cost (USD)` or `Total cost (USD)` directly.
Notion calculates both from the hierarchy. The visible `Estimated cost (USD)`
shows a sub-item's raw cost or a parent's all-time child total.

## Append workflow

1. Finish collecting and grouping usage before making any Notion call. A Notion
   fallback invoked through `claude -p` becomes eligible for the next audit, not
   the snapshot currently being written.
2. Query all existing parents and all dated sub-items for the audit month,
   following pagination.
3. Reuse the parent whose `Issue` exactly matches the full natural
   task-and-objective prose. Create an undated, uncosted parent only when no exact
   match exists. Reuse the same parent in later months.
4. Represent each breakdown item as a child row with `Issue`, `Parent item`,
   `Work date`, and the unrounded `Raw cost`. Do not write `Overarching task`,
   `Sub-item`, `Estimated cost (USD)`, or `Total cost (USD)` directly.
5. Before creating a child, compare the exact tuple of `Issue`, `Parent item`,
   `Work date`, and unrounded `Raw cost` with existing children. Skip exact
   matches. This is the duplicate guard; there is no usage-ID property.
6. Append missing parents and unmatched children only. Never update, delete,
   archive, or replace a row outside the explicit corrections workflow.
7. Read the created rows and affected parents back. Verify the child fields,
   reciprocal relations, calculated overarching-task value, helper rollup, and
   displayed estimated cost. Treat the write as successful only when permission
   denials are empty and the read-back matches.
8. Query all dated child rows for the audit month again. Build the chat report
   only from this query, grouping by parent. Sum `Raw cost` on the children and
   never sum `Estimated cost (USD)` across mixed parent and child rows, which
   would double-count usage.

## Corrections

When the user explicitly asks to correct an existing audit after supplying a new
authoritative Claude total, update the matching current-month sub-items in place.
Keep their `Issue`, `Parent item`, and dates unchanged. Replace only their
unrounded `Raw cost` values using the collector's reconciled prompt weights. Do
not append revised duplicates. Read every corrected child and affected parent
back, then require the sum of that month's child raw costs to equal the
authoritative total before reporting success.

Use direct Notion tools when available. If they are unavailable, use a scoped
`claude -p` call after collection with `--permission-mode dontAsk`, JSON output,
and exact allow-listing for only the required Notion query, create, and fetch
tools. Never use a broad permission bypass.
