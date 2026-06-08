# Resolution interview

When a thread is not a straightforward fix, interview the user **one thread at a time** (same rhythm as a design Q&A).

## Opening

For thread `#N` from `@author` on `path:line`:

> **Thread N:** "@author says: *<one-line summary>*  
> How would you like to resolve this?"

## Options to offer

| Choice | When |
|--------|------|
| **A. Fix in code** | You want behaviour changed; agent implements after you pick approach |
| **B. Reply only** | Current behaviour is intentional; explain in thread |
| **C. Defer** | Valid but not this PR |
| **D. Need options** | Agent presents 2–3 approaches with tradeoffs + sample code |

## If D (tradeoff)

Present:

```markdown
### Option 1 — <name>
- Pros: …
- Cons: …
- Sample: ```diff … ``` or pseudocode

### Option 2 — …
```

Recommend one; wait for explicit pick.

## Constraints to ask (fix path)

Only when relevant:

- Must match existing pattern in file X?
- Must not change API / schema?
- Must add test row to evidence matrix?

## Batch vs one-at-a-time

- **Default:** one thread per question when resolutions differ.
- **Batch OK:** when user says "fix all the straightforward ones" — still stop for any tradeoff thread.

## Record decisions

Keep a running log for the final summary:

```text
Thread 3372726489 → Option A (guard on shared→settled) → commit abc123
Thread 3372726495 → Reply only (honour system intentional)
```

## After interview

Proceed to implementation only when every **open** thread has a recorded resolution.
