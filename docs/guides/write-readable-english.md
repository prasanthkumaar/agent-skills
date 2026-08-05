# Write Readable English

Run commands from `skills/write-readable-english/`. The checker reports
advisory readability signals; it does not pass, fail, or rewrite text.

```sh
# Text
node scripts/check-english-readability.js --json "Text to check."

# Multiple text or Markdown inputs
node scripts/check-english-readability.js --json "First input." "Second input." --file README.md --file SKILL.md

# One Markdown file
node scripts/check-english-readability.js --json --file README.md

# Standard input
printf '%s' "Text to check." | node scripts/check-english-readability.js --json

# Compare an edit with its source for preservation
node scripts/check-english-readability.js --json --reference "Original text." "Edited text."

# Checker tests
node scripts/check-english-readability.test.js
```

## Eval

```sh
# No-cost deterministic validation
node evals/run.js

# One Claude writer call
node evals/run.js --provider claude --model sonnet --output /tmp/readable-english-claude.json

# One Codex writer call
node evals/run.js --provider codex --model <model-id> --output /tmp/readable-english-codex.json
```

Writer mode uses one writer and no judge. Manually review all eight repair
outputs for clarity, preserved meaning, oversimplification, and minimum
necessary change.

Model aliases such as `sonnet` float to newer versions; use a full model ID for
repeatable results. The runner has no profile option, and Luna and Terra are not
configured profiles. The deterministic run validates the corpus, checker
output, and hard preservation signals, but cannot judge prose quality.
