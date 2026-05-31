# Code Writing Rules

## 1. Contracts First

- Parse external data at the boundary.
- Prefer schema parse or explicit checks over `as`.
- Throw explicit errors when the contract is broken.
- Do not silently skip bad data unless the user explicitly wants best-effort behaviour.

## 2. Keep the Structure Boring

- Start with the simplest structure that fits the problem.
- Keep the main function near the top.
- Put helpers below the main function.
- Avoid helper stacks where the reader has to keep jumping around the file.
- Inline one-off logic when extraction makes the file more abstract, not more readable.

## 3. Use a Predictable File Shape

```text
imports
types
consts
main function
helper functions below
```

For TSX files, use:

```text
imports
types
consts
exported component
small render helpers
static config last
```

## 4. Keep Naming Honest

- Name things by domain meaning and role.
- Keep transport or API-specific naming at the boundary.
- Avoid names that describe local implementation trivia instead of what the thing is.

## 5. Avoid Duplicated State

- Keep one source of truth.
- Derive booleans from the real source when practical.
- Avoid storing both raw inputs and duplicated derived flags unless the duplication clearly helps readability.

## 6. Keep Types Honest

- Export shared types when they are real contracts between files.
- Do not invent wrapper types only used once.
- Add a new type only when it removes real complexity.
- Use `undefined` when a field is absent because a source did not contribute it.
- Use `null` only when the upstream domain has a meaningful null state that differs from absence.

## 7. Prefer Simple Expressions

- Use direct branches over dense expressions.
- Avoid clever iteration or tuple-heavy code if a plain loop is clearer.
- Prefer readable loops over abstraction-heavy array pipelines when the loop carries business rules.
- Avoid selector booleans and hidden side effects.

## 8. Choose Data Structures for Readability

- For small in-memory datasets, prefer `rows.find(...)` if it keeps the rules obvious.
- Use `Map` or `Set` when the lookup model is the point, or when repeated lookups make the indexed form clearer.
- Do not introduce custom stores or multi-index wrappers unless the simpler form is genuinely worse.

## 9. Comments and JSDoc

- Code is the source of truth for behaviour.
- Comments and JSDoc should be rare.
- Keep them concise, simple, and helpful.
- Use them to explain why a non-obvious line, helper, branch, constraint, or tradeoff exists.
- Do not restate obvious code.

## 10. Errors

- Helpers throw, boundaries decide how to present the error.
- Avoid log-and-throw.
- Error messages should say what broke, not dump internal detail.

## 11. Git Safety

- Prefer adding a new commit over amending an existing commit.
- Never force-push.

## 12. Verification

- After edits, run the repo’s required checks.
- For frontend work, verify the actual page state in the browser when practical.
