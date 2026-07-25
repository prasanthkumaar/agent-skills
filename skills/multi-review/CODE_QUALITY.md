# Code Quality Review Lane

Review the complete branch diff for repository standards and maintainability.

## Process

1. Read repository guidance such as `AGENTS.md`, `CLAUDE.md`,
   `CODING_STANDARDS.md`, `CODEBASE_CONVENTIONS.md`, `CONTRIBUTING.md`, ADRs,
   and package guidance.
2. Apply documented repository rules before general heuristics.
3. Skip checks already enforced by tools unless the diff exposes a tooling gap.
4. When local guidance leaves a gap, use the named smells below as judgement
   aids rather than hard rules.

## Named smells

- Mysterious Name: a name does not reveal what the value or function means.
  Rename it; if no honest name fits, revisit the design.
- Duplicated Code: the same logic shape appears in more than one place.
  Extract and share that shape.
- Feature Envy: a method works with another object's data more than its own.
  Move the behaviour towards the data it uses.
- Data Clumps: the same fields or parameters keep travelling together.
  Introduce one type for the group.
- Primitive Obsession: a primitive stands in for a domain concept. Give the
  concept a small type.
- Repeated Switches: the same conditional over one type appears repeatedly.
  Centralise it with polymorphism or a shared map.
- Shotgun Surgery: one logical change requires scattered edits. Gather the
  changing behaviour into one module.
- Divergent Change: one module changes for unrelated reasons. Split those
  responsibilities.
- Speculative Generality: an abstraction supports needs absent from the spec.
  Remove or inline it until a real need exists.
- Message Chains: callers navigate a long object chain. Hide the navigation
  behind a method on the first object.
- Middle Man: a function or class mostly delegates. Remove it and call the
  real target.
- Refused Bequest: an implementation ignores most inherited behaviour. Prefer
  composition over that inheritance.

## Evidence threshold

Do not report a finding without a cited repository rule or a named smell.
State whether it is a documented violation or a judgement call.

## Finding

For each finding provide:

- location
- issue
- evidence and the cited rule or named smell
- maintainability consequence if it is not addressed
- credible options and each option's trade-off
- recommended option and why

Return `no findings` when the lane completes without a supported issue.

## Hard rules

- Read-only.
- Repository conventions override external taste.
