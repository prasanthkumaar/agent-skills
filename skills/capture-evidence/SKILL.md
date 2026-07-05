---
name: capture-evidence
description: Captures local verification evidence for a PR or stack and writes an OS-temp evidence manifest without writing to GitHub. Use before write-pr-description, after code changes, or when UI, Storybook, browser, CI, screenshots, or command evidence must be mapped to the correct branch or PR.
---

# Capture Evidence

Local-only evidence capture. GitHub writes belong to `write-pr-description`.

## Process

1. Identify branch or stack order and current SHAs.
2. Run required verification commands or collect existing CI links.
3. For UI, Storybook, browser, or visual changes, interact with the page and capture screenshots.
4. Store artefacts in OS temp, not the repo.
5. Write or update the evidence manifest.

## Manifest

Use [resources/evidence-manifest.md](resources/evidence-manifest.md).

The manifest maps evidence to the correct branch or PR so screenshots and claims do not drift across stacked PRs.

## Output

Return the manifest path and a concise per-branch evidence summary.

## Hard rules

- Do not upload images.
- Do not write to GitHub.
- Do not update PR descriptions.
- Do not commit evidence artefacts.
- Do not claim visual verification without inspecting the screenshot.
