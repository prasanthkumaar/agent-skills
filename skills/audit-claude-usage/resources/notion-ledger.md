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

The helper rollup must resolve to relation property `Sub-item` (`bkFpSg`),
target property `Raw cost` (`Q19lVQ`), and aggregation `sum`. A matching property
name alone is insufficient because reversing the native relation sides leaves
parent totals at zero. Connector schema read-back can misreport which side of a
native sub-item relation the rollup uses. When configuring or repairing this
property, inspect the live Notion UI and confirm `Sub-item` -> `Raw cost` ->
`Sum`. Treat the rendered UI as authoritative for this setting.

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
   reciprocal relations, calculated overarching-task reference, formula
   expression, and raw child-cost sum. Treat the write as successful only when
   permission denials are empty and the available read-back matches. For a
   schema repair, also inspect the live Notion property editor and confirm the
   helper rollup is `Sub-item` -> `Raw cost` -> `Sum`.
8. Notion connector reads may return computed properties as `<omitted />` or
   `formulaResult://...` references that the fetch tool cannot resolve. Never
   infer a rendered parent value from its children and call it verified. Report
   that the rendered calculation was not verified unless a supported tool or
   the Notion desktop UI returns the actual numeric value. For UI verification,
   refresh Notion, confirm each affected parent shows the expected total, and
   confirm the `Estimated cost (USD)` footer equals the authoritative monthly
   total.
9. Never run `ALTER COLUMN "Estimated cost (USD)" SET NUMBER FORMAT ...` through
   `notion-update-data-source`. The current connector converts the formula into
   a plain number property. Preserve the formula type and expression; treat
   currency display formatting as a separate manual/UI concern when the
   connector cannot update it safely.
10. Query all dated child rows for the audit month again. Build the chat report
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
authoritative total before reporting success. Do not substitute this arithmetic
check for rendered formula or rollup verification.

Use direct Notion tools when available. If they are unavailable, use a scoped
`claude -p` call after collection with `--permission-mode dontAsk`, JSON output,
and exact allow-listing for only the required Notion query, create, and fetch
tools. Never use a broad permission bypass.
