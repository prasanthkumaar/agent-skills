# Research Web — subagent protocol

Include in every subagent prompt:

```
You are doing source-backed web research on [SCOPE]. Do multiple rounds of web searches.
For important findings, fetch the actual source page to verify accuracy.

Do not call Skill(research-web), Skill(deep-research), any other research wrapper skill,
Agent, Workflow, Task, or any subagent-spawning tool. You are a leaf researcher.
Use only direct web search/fetch/browser tools and local file reads if the prompt provides paths.

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
- Do not spawn child agents or delegate
- Stop after 25 search/fetch/browser tool calls; return gaps instead of continuing
- Research only — no code
```

Subagent config: parallel 2–4 scopes; `model: sonnet` if available; 15–25 tool calls each; descriptive names. Never exceed 4 researchers without explicit user approval.

Parent synthesises subagent returns before the 100-word user reply.
