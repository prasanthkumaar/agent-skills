# Documentation Conformance Review Lane

Review the complete branch diff against documented external patterns. This
lane is standalone and does not require another skill.

## Process

1. Identify changed framework, library, API, configuration, test, and story
   patterns.
2. Fetch official documentation first.
3. Use Context7 when available for retrieval, snippets, or version-specific
   examples.
4. Use another primary source only when official documentation does not cover
   the subject.
5. Compare the documented pattern with the code in the diff.
6. Check whether an intentional deviation has a clear rationale when one is
   needed.

If required source retrieval is unavailable, return `incomplete`. Do not treat
missing access as `not-applicable`.

## Evidence threshold

No source URL means no conformance finding. The source must support the exact
pattern being judged.

## Finding

For each finding provide:

- location
- issue
- source URL, documented pattern, and current code evidence
- consequence if the deviation is not addressed
- credible options and each option's trade-off
- recommended option and why

Return `no findings` when the lane completes without a supported deviation.

## Hard rules

- Read-only.
- Do not depend on `docs-check` or any other installed skill.
- Do not rewrite comments or code.
