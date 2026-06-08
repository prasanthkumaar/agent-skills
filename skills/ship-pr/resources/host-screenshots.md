# Host screenshots

Embed images in the **PR description only** via GitHub's `user-attachments` CDN. Do not commit PNGs to the branch. Do not use release assets.

## Prerequisites

```bash
gh auth status -h github.com
gh extension list | grep image          # e.g. drogers0/gh-image
gh extension install drogers0/gh-image  # if missing
gh extension upgrade gh-image           # if outdated
gh image --help
```

`gh image` uploads to `https://github.com/user-attachments/assets/...` — the same CDN as pasting an image into the GitHub web editor.

## Session token

`gh image` needs a GitHub **web session token** (`GH_SESSION_TOKEN`), not a normal `gh auth` PAT.

1. Try auto-extract (Chrome, Brave, Edge, Opera, Safari):

   ```bash
   gh image extract-token   # prints export line — do not log in shared output
   gh image check-token     # confirms username
   ```

2. If auto-extract fails (e.g. Arc, or no supported browser profile):

   - Ask the user once to provide the token via a secure one-time channel, **or**
   - Store it in macOS Keychain and load per session:

     ```bash
     # one-time (user runs locally)
     security add-generic-password -a "$USER" -s gh-image-session -w "<token>" -U

     # each upload session
     export GH_SESSION_TOKEN="$(security find-generic-password -s gh-image-session -w)"
     gh image check-token
     ```

   Never echo the token. Never commit it. Clear `GH_SESSION_TOKEN` from the shell when done.

3. Do not hand-roll browser cookie decryption in the agent workflow unless the user explicitly approves that one-time setup and Keychain storage afterward.

## Upload

After captures land in `$EVIDENCE_DIR/shots/` (see [temp-artifacts.md](temp-artifacts.md)):

```bash
EVIDENCE_DIR="${TMPDIR:-${TEMP:-/tmp}}/cursor-pr-evidence-$(git branch --show-current | tr '/' '-')"
OWNER_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

gh image --repo "$OWNER_REPO" \
  "$EVIDENCE_DIR/shots/H1-review-gate.png" \
  "$EVIDENCE_DIR/shots/H2-pay-guest.png"
  # … all matrix IDs …
```

The command prints markdown image lines. Capture stdout to map filename → URL for the PR body.

Re-upload **all** screenshots on every evidence refresh — replace every URL in the description tables.

## PR description layout

```markdown
## Screenshots

Captured locally on branch `<branch>` (<date>). Full-page, desktop viewport.

### Happy paths
| ID | Scenario | Screenshot |
|----|----------|------------|
| H1 | … | ![H1](https://github.com/user-attachments/assets/…) |

### Edge cases
| ID | Scenario | Screenshot |
|----|----------|------------|
| E1 | … | ![E1](https://github.com/user-attachments/assets/…) |
```

## Rules

- URLs live in the **description**, not PR comments.
- Artifacts stay in `$EVIDENCE_DIR` (OS temp) — never commit PNGs or temp specs.
- On refresh, update **every** screenshot URL even if the image looks unchanged.

## Update existing PR

1. Re-upload all PNGs from `$EVIDENCE_DIR/shots/` via `gh image`.
2. Rewrite Screenshots tables in `$EVIDENCE_DIR/pr-body.md`.
3. `gh pr edit <num> --body-file "$EVIDENCE_DIR/pr-body.md"`
