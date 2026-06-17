# Resolution interview

Use for threads classified **`needs-user`**. **Ping the user immediately** — autonomous loop stops until they decide.

Also use when a **human reviewer** thread is `open` and the user has not replied.

## Opening

For thread `#N` from `@mention` on `path:line`:

> **Thread N (`needs-user`):** "@mention says: *<one-line summary>*  
> How would you like to resolve this?"

For unreplied human thread:

> **Human reviewer on #{pr}** (`path:line`) — you have not replied yet. Draft a reply or pick an approach.

## Options

| Choice | When |
|--------|------|
| **A. Fix in code** | Pick approach; agent implements + replies after pick |
| **B. Reply only** | Intentional; agent posts explanation |
| **C. Defer** | Follow-up issue; agent posts defer reply |
| **D. Need options** | Agent presents 2–3 approaches with tradeoffs |

If **D**, present options with pros/cons; recommend one; **wait for explicit pick**.

## After decision

1. Record choice.
2. **Interactive override only:** show draft and wait for OK before post.
3. **Default autonomous:** implement + post after user picks approach.
4. Thread status → **`addressed`** until reviewer replies.

## Batch

- Default: one `needs-user` thread per question when resolutions differ.
- User may say "same approach for all needs-user".

## Related

Classification: [triage-rules.md](triage-rules.md). Table: `triage-pr-comments` → triage-table.
