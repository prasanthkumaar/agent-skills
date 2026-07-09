---
name: review-code-quality
description: Reviews a full branch diff for code quality, repo conventions, local standards, naming, structure, maintainability, and Fowler-style smells. Use inside multi-review or when the user asks whether a branch follows codebase conventions, reads well, or has maintainability issues.
---

# Review Code Quality

Read-only code quality review lane. Adapted from Matt Pocock's Standards axis:
https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md

## Process

1. Read the full branch diff against its parent.
2. Read repository guidance: `AGENTS.md`, `CLAUDE.md`, `CODING_STANDARDS.md`, `CODEBASE_CONVENTIONS.md`, `CONTRIBUTING.md`, ADRs, app/package guidance, and relevant convention docs.
3. Check that the code follows this repo's documented coding standards.
4. Apply the smell baseline below when the repo documents nothing or leaves a gap.
5. Skip checks that tools already enforce, unless the diff shows a tooling gap.

## Standards Source Rules

- The repo overrides. A documented repo standard always wins. When it endorses something the baseline would flag, suppress the smell.
- Always a judgement call. Each smell is a labelled heuristic, never a hard violation.
- Cite the repo standard when claiming a standards violation.
- Do not impose external taste when the repo has a documented local pattern.

## Smell Baseline

Each smell reads what it is, then how to fix it. Match it against the diff:

- Mysterious Name: a function, variable, or type whose name does not reveal what it does or holds. Rename it; if no honest name comes, the design is murky.
- Duplicated Code: the same logic shape appears in more than one hunk or file. Extract the shared shape, call it from both.
- Feature Envy: a method reaches into another object's data more than its own. Move the method onto the data it envies.
- Data Clumps: the same few fields or params keep travelling together. Bundle them into one type, pass that.
- Primitive Obsession: a primitive or string stands in for a domain concept. Give the concept its own small type.
- Repeated Switches: the same `switch` or `if` cascade on the same type recurs across the change. Replace with polymorphism, or one map both sites share.
- Shotgun Surgery: one logical change forces scattered edits across many files in the diff. Gather what changes together into one module.
- Divergent Change: one file or module is edited for several unrelated reasons. Split so each module changes for one reason.
- Speculative Generality: abstraction, parameters, or hooks were added for needs the spec does not have. Delete it; inline back until a real need shows.
- Message Chains: long `a.b().c().d()` navigation the caller should not depend on. Hide the walk behind one method on the first object.
- Middle Man: a class or function mostly just delegates onward. Cut it, call the real target direct.
- Refused Bequest: a subclass or implementer ignores or overrides most of what it inherits. Drop the inheritance. Use composition.

## Output

For each finding include:

- branch and owner branch
- location
- finding summary
- evidence from the diff and cited standard or named smell
- whether it is a hard documented-standard violation or a judgement call
- why this matters
- suggested triage judgement if obvious

## Hard Rules

- Read-only.
- Review the full branch diff against its parent, not changed-file slices.
- Do not edit, push, comment, resolve threads, or update PR bodies.
- Do not report a finding without either a cited repo standard or a named smell.
