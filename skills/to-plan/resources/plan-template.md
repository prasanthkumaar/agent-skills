# Plan template

Embed this structure in the harness plan body (after YAML frontmatter if the harness uses it). Adapted from Matt Pocock [`to-prd`](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-prd/SKILL.md) + `ship-pr` evidence matrix.

```markdown
# {Feature title}

## Problem
Who is affected; what is broken or missing.

## Solution
High-level change from the user's perspective.

## User stories
Numbered list — extensive enough to cover the feature.

## Implementation decisions
Modules, interfaces, architecture, schema/API contracts. No stale file paths unless stable.

## Testing decisions (TDD seams)
- What makes a good test (external behaviour, not internals)
- **Test seams** — prefer existing, highest-level seams; ideal count = one
- Modules under test; prior art in repo
- Red/green approach for this change

## Design decisions
Bulleted decisions from grill — no session meta.

## Happy paths
| ID | Steps | Expected UI / behaviour | Test |
|----|-------|-------------------------|------|
| H1 | … | … | command or manual |

## Edge cases
| ID | Steps | Expected UI / behaviour | Test |
|----|-------|-------------------------|------|
| E1 | … | … | … |

## Out of scope

## Implementation steps
Ordered build steps (vertical slices OK). Reference `code-writing` if TS/React.

## Final step — ship
After user approves this plan, run skill **`ship-pr`** against this plan file:
- Implement scope only
- Pre-PR reviewer loop (`reviewers.md`)
- Evidence matrix + screenshots in PR description
- Push and open PR
- Hand off to `address-pr-review` for external review
```

## Frontmatter todos (Cursor)

Map **Implementation steps** + **Final step — ship** to `todos` entries. Last todo id suggestion: `ship-pr`.
