# Capture screenshots

Full-screen evidence for PR description — not cropped components.

## Requirements

- **Full page** the reviewer would see: use Playwright `fullPage: true` or browser MCP full viewport at a consistent desktop size (e.g. 1440×900).
- **Both columns / full layout** when the UI is split (sidebar + main, receipt + list, etc.).
- **One screenshot per matrix row** (H1, E1, …) unless two rows share identical UI state (then note in table).
- Capture **after** the check for that row passes (correct data loaded, not mid-spinner).

## Playwright pattern

Temporary spec (delete before commit):

```typescript
test("capture evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  // … navigate to state for H1 …
  await page.screenshot({ path: "shots/H1-happy-pay-guest.png", fullPage: true })
})
```

Run with repo's `PLAYWRIGHT_BASE_URL` or discovered dev URL.

## Browser MCP pattern

1. Navigate to state.
2. Wait for stable UI (no loading skeletons).
3. `browser_take_screenshot` with fullPage if supported.
4. Save to a temp directory outside git tracking.

## Naming

```
shots/{ID}-{short-slug}.png
```

Examples: `H1-review-gate.png`, `E3-owner-no-pay-button.png`

## Anti-patterns

- Cropping to a single card or component.
- Screenshot before async data loads ($0.00, empty lists).
- Committing PNGs to the branch.
- Using stale screenshots from an earlier design iteration.

## Timing

- Wait for assertions that prove state (`expect(...).toBeVisible()`) before capture.
- For toggle animations, wait for button enabled / progress bar settled.
