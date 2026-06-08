# Temporary artifacts

PR evidence must not clutter the repo workspace. Write ephemeral files to the **OS temp directory** unless the project explicitly requires in-repo paths (e.g. committed Playwright fixtures).

## Directory

```bash
EVIDENCE_DIR="${TMPDIR:-${TEMP:-/tmp}}/cursor-pr-evidence-$(git branch --show-current | tr '/' '-')"
mkdir -p "$EVIDENCE_DIR"/{shots,playwright}
```

- macOS / Linux: `$TMPDIR` (falls back to `/tmp`)
- Windows (Git Bash, WSL): `$TEMP` or `$TMP`

Reuse the same `EVIDENCE_DIR` for the whole ship or review pass.

## What goes here

| Artifact | Path |
|----------|------|
| Screenshot PNGs | `$EVIDENCE_DIR/shots/` |
| Temporary Playwright capture specs | `$EVIDENCE_DIR/playwright/` |
| Playwright traces / local test output | `$EVIDENCE_DIR/playwright/` |
| PR body drafts | `$EVIDENCE_DIR/pr-body.md` |
| `gh image` stdout / upload notes | `$EVIDENCE_DIR/` |

## Rules

- Do not create `shots/`, scratch Playwright specs, or PNG dumps inside the repo for PR evidence.
- Delete temp files when the pass completes (or at session end).
- Never commit artifacts from `$EVIDENCE_DIR` or workspace scratch dirs.
- Permanent test files belong in the repo's normal test layout; one-off capture specs do not.

## Anti-patterns

- Leaving PNGs in the working tree.
- Committing `shots/` or throwaway Playwright specs used only for PR screenshots.
- Saving PR body drafts inside the repo.
