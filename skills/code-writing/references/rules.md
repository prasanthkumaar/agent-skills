# Code Writing Rules

## 1. Document-Shaped Code

- Code should read top-down like a clear document.
- Prefer explicit variable names, direct branches, and local context over clever compression.
- Length is acceptable when it improves scanning and understanding.
- Keep the main path easy to follow before optimising for brevity.

## 2. Contracts First

- Parse external data at the boundary.
- Prefer schema parse or explicit checks over `as`.
- Throw explicit errors when the contract is broken.
- Do not silently skip bad data unless the user explicitly wants best-effort behaviour.

## 3. Documented Patterns

- Before changing framework, library, API, config, test, or story patterns, use `docs-check`.
- If `docs-check` returns `needs-user`, ask before editing.
- If using an acceptable deviation, include a short why comment with the relevant source link when useful.

## 4. Keep the Structure Boring

- Start with the simplest structure that fits the problem.
- Keep the main function near the top.
- Put helpers below the main function.
- Avoid helper stacks where the reader has to keep jumping around the file.
- Inline one-off logic when extraction makes the file more abstract, not more readable.

## 5. Use a Predictable File Shape

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

## 6. Keep Naming Honest

- Name things by domain meaning and role.
- Keep transport or API-specific naming at the boundary.
- Avoid names that describe local implementation trivia instead of what the thing is.

## 7. Avoid Duplicated State

- Keep one source of truth.
- Derive booleans from the real source when practical.
- Avoid storing both raw inputs and duplicated derived flags unless the duplication clearly helps readability.

## 8. Keep Types Honest

- Export shared types when they are real contracts between files.
- Do not invent wrapper types only used once.
- Add a new type only when it removes real complexity.
- Use `undefined` when a field is absent because a source did not contribute it.
- Use `null` only when the upstream domain has a meaningful null state that differs from absence.

## 9. Prefer Simple Expressions

- Use direct branches over dense expressions.
- Avoid clever iteration or tuple-heavy code if a plain loop is clearer.
- Prefer readable loops over abstraction-heavy array pipelines when the loop carries business rules.
- Avoid selector booleans and hidden side effects.

## 10. Choose Data Structures for Readability

- For small in-memory datasets, prefer `rows.find(...)` if it keeps the rules obvious.
- Use `Map` or `Set` when the lookup model is the point, or when repeated lookups make the indexed form clearer.
- Do not introduce custom stores or multi-index wrappers unless the simpler form is genuinely worse.

## 11. Comments and JSDoc

- Code is the source of truth for behaviour.
- Comments and JSDoc should be rare.
- Keep them concise, simple, and helpful.
- Use them to explain why a non-obvious line, helper, branch, constraint, or tradeoff exists.
- Use comments for heavy config, framework glue, workarounds, or acceptable deviations from documented patterns.
- Explain why this approach was chosen over the main documented alternative.
- Include the documentation or workaround link when relevant.
- Keep comments plain and readable. No jargon.
- Do not restate obvious code.

## 12. Errors

- Helpers throw, boundaries decide how to present the error.
- Avoid log-and-throw.
- Error messages should say what broke, not dump internal detail.

## 13. Git Safety

- Prefer adding a new commit over amending an existing commit.
- Never force-push.

## 14. Verification

- After edits, run the repo’s required checks.
- For frontend work, verify the actual page state in the browser when practical.
