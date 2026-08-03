# Notion ledger

Use this database and data source:

- Database: `https://app.notion.com/p/opengov/3b177dbba7888089a4b4caa2ff327388?v=3b177dbba78880fc80a0000c10e827f8&source=copy_link`
- Data source: `collection://3b177dbb-a788-8036-9d79-000ba56a24fe`

## Required schema

| Property | Type |
|---|---|
| `Breakdown item` | title |
| `Overarching task` | rich text |
| `Work date` | date |
| `Estimated cost (USD)` | number, US dollar format |

Stop before writing if the property names or types differ. Do not add properties
or modify views.

## Append workflow

1. Finish collecting and grouping usage before making any Notion call. A Notion
   fallback invoked through `claude -p` becomes eligible for the next audit, not
   the snapshot currently being written.
2. Query all existing rows for the audit month, following pagination.
3. Represent every row with exactly the four required properties. Use the full
   natural task-and-objective prose as the `Overarching task` rich-text value.
4. Before creating a row, compare the exact tuple of breakdown item, overarching
   task, work date, and unrounded cost with existing rows. Skip exact matches.
   This is the duplicate guard; there is no usage-ID property.
5. Append unmatched rows only. Never update, delete, archive, or replace a row.
6. Read the created rows back and verify every property exactly. Treat the write
   as successful only when permission denials are empty and the read-back matches.
7. Query all rows for the audit month again. Build the chat report only from this
   query, not from the pre-write draft.

## Corrections

When the user explicitly asks to correct an existing audit after supplying a new
authoritative Claude total, update the matching current-month rows in place. Keep
their titles, task values, and dates unchanged. Replace only their unrounded costs
using the collector's reconciled prompt weights. Do not append revised duplicates.
Read every corrected row back and require the month sum to equal the authoritative
total before reporting success.

Use direct Notion tools when available. If they are unavailable, use a scoped
`claude -p` call after collection with `--permission-mode dontAsk`, JSON output,
and exact allow-listing for only the required Notion query, create, and fetch
tools. Never use a broad permission bypass.
