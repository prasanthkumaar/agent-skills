# Output format

## User reply (mandatory)

**≤100 words** in the chat reply. British English. No filler.

Structure (flexible, stay under limit):

1. One-line verdict or answer
2. 2–4 URL-backed bullets (inline `[text](url)` links)
3. Optional one-line gap: "Unverified: …" or "Sources disagree: …"

Count words before sending. URLs do not count toward the limit if using markdown links, but prefer tight prose.

## Not in the user reply

- Long source lists grouped by type
- Full subagent dumps
- Evidence-quality essays

If the user asks for depth, offer a follow-up or write a scratch report under `$TMPDIR/deep-research-{topic}.md` and give the path — still keep chat reply ≤100 words unless user explicitly asks for the full report.

## Internal work (not shown)

Subagents may return long notes. Parent distils only what fits the 100-word reply.

## Date

Prefix reply with research date only if it fits within 100 words (usually skip).
