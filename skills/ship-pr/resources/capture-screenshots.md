# Capture screenshots

Full-screen evidence for PR description — not cropped components.

Set up the temp directory first — see [temp-artifacts.md](temp-artifacts.md).

## Requirements

- **Full page** the reviewer would see: use Playwright `fullPage: true` or browser MCP full viewport at a consistent desktop size (e.g. 1440×900).
- **Both columns / full layout** when the UI is split (sidebar + main, receipt + list, etc.).
- **One screenshot per matrix row** (H1, E1, …) unless two rows share identical UI state (then note in table).
- Capture **after** the check for that row passes (correct data loaded, not mid-spinner).
- **Save all PNGs under `$EVIDENCE_DIR/shots/`** — not inside the repo.

## Playwright pattern

Temporary spec in OS temp (never commit):

```bash
EVIDENCE_DIR="${TMPDIR:-${TEMP:-/tmp}}/cursor-pr-evidence-$(git branch --show-current | tr '/' '-')"
mkdir -p "$EVIDENCE_DIR"/{shots,playwright}
```

```typescript
// $EVIDENCE_DIR/playwright/capture-evidence.spec.ts — delete when done
test("capture evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  // … navigate to state for H1 …
  await page.screenshot({
    path: `${process.env.EVIDENCE_DIR}/shots/H1-happy-pay-guest.png`,
    fullPage: true,
  })
})
```

Run with repo's `PLAYWRIGHT_BASE_URL` or discovered dev URL. Pass `EVIDENCE_DIR` into the test env if needed.

## Browser MCP pattern

1. Navigate to state.
2. Wait for stable UI (no loading skeletons).
3. `browser_take_screenshot` with fullPage if supported.
4. Save to `$EVIDENCE_DIR/shots/` — not the repo workspace.

## Naming

```
$EVIDENCE_DIR/shots/{ID}-{short-slug}.png
```

Examples: `H1-review-gate.png`, `E3-owner-no-pay-button.png`

## Anti-patterns

- Cropping to a single card or component.
- Screenshot before async data loads ($0.00, empty lists).
- Saving PNGs or temp specs under the repo root, `shots/`, or `playwright/` in the workspace.
- Committing capture artifacts to git.
- Using stale screenshots from an earlier design iteration.

## Timing

- Wait for assertions that prove state (`expect(...).toBeVisible()`) before capture.
- For toggle animations, wait for button enabled / progress bar settled.
