---
name: research-options
description: "Validate multiple options before recommending. Triggers on: give me options, what are my options, which approach, help me decide, research options."
---

# Research Options

Use this skill to give options that have actually been tried, verified, and compared. Do not present untested options as recommendations.

## Workflow

1. Define the decision, constraints, proof of success, and validation method.
2. Iterate until there are 3-5 validated options. Use a different number only when the user explicitly asks for it.
3. Research project-local constraints first. Use current official sources when external behaviour, APIs, libraries, or browser tooling may have changed.
4. Use worker agents when available and useful, with one option per worker. Do not let workers leave trial changes behind.
5. For each option, apply the smallest reversible change that can prove or disprove it.
6. Verify the option with the strongest practical evidence. For UI or visual work, this means browser interaction plus a screenshot. If the screenshot does not show the expected result, iterate.
7. Repeat the option loop until either the option works, fails for a clear reason, or is no longer worth pursuing.
8. Save proof for working options: screenshots, diffs, command output, measurements, benchmarks, or source links.
9. Revert trial code and clean temporary exploration files before moving to the next option, unless the user explicitly asks to keep one option applied.
10. End with the working tree back to the pre-exploration state, except for files the user explicitly asked to change and proof artifacts saved outside the repo.

## Visual Option Loop

For UI, layout, Storybook, Chromatic, browser, or screenshot-sensitive choices:

1. Make one option visible in the app or story.
2. Open the relevant page in the browser.
3. Interact with it like a user would.
4. Capture a screenshot.
5. Inspect the screenshot yourself.
6. If it does not meet the success criteria, adjust and repeat.
7. Keep the final screenshot for that option.
8. Revert the option before testing the next one.

Never claim a visual option works without screenshot proof.

## Reporting

Return only validated options. For each option include:

- What changed.
- Proof, including a screenshot for visual work.
- Pros.
- Cons.
- Risks or unknowns.

Finish with a recommendation and the reason it is strongest.
