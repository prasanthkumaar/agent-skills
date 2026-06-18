# Deep Research — subagent protocol

Include in every subagent prompt:

```
You are doing deep research on [SCOPE]. Do multiple rounds of web searches.
For important findings, fetch the actual source page to verify accuracy.

Round structure:
1. Official/primary sources (docs, specs, official repos)
2. Community sources (GitHub issues, discussions, blog posts)
3. Counter-evidence and edge cases
4. Cross-reference and fill gaps

For each finding record: claim, source type, URL, date if known, relevance.

Rules:
- No claim without a URL
- Flag contradictions and unverified claims
- Fetch primary docs for defaults, limits, version numbers — do not trust blogs alone
- Research only — no code
```

Subagent config: parallel 3–5 scopes; `model: sonnet` if available; 15–30 tool calls each; descriptive names.

Parent synthesises subagent returns before the 100-word user reply.
