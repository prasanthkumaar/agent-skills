# Resolution interview

Use **only** for threads classified **`needs-user`** during `triage-pr-comments`. Do not interview on straightforward, reply-only, defer, or false-positive threads unless the user asks for options.

**Nothing posts without user OK** — interview produces a decision and a **draft** reply; `address-pr-review` posts only after approval.

## Opening

For thread `#N` from `@mention` on `path:line`:

> **Thread N (`needs-user`):** "@mention says: *<one-line summary>*  
> How would you like to resolve this?"

## Options

| Choice | When |
|--------|------|
| **A. Fix in code** | Pick approach; agent drafts fix + reply after you choose |
| **B. Reply only** | Intentional; agent drafts explanation |
| **C. Defer** | Follow-up issue; agent drafts defer reply |
| **D. Need options** | Agent presents 2–3 approaches with tradeoffs + sample code |

If **D**, present options with pros/cons; recommend one; **wait for explicit pick**.

## After decision

1. Record: `Thread {id} (@mention) → {choice} → draft ready`.
2. Show **draft reply** and fix summary — **wait for OK** before implement/post.
3. After post, thread status → **`addressed`** (not `resolved` until reviewer replies).

## Batch

- Default: one `needs-user` thread per question when resolutions differ.
- User may say "same approach for all needs-user" — still OK each draft before post.

## Related

Classification: [triage-rules.md](triage-rules.md). Table format: `triage-pr-comments` → triage-table.
