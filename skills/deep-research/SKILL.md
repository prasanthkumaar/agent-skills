---
name: deep-research
description: "Deep, multi-round web research with source verification. Dispatches parallel subagents covering different angles, fetches source pages to verify claims, cross-references findings, and presents only URL-backed information. Triggers on: deep research, research this deeply, investigate thoroughly, I need you to deeply research."
---

# Deep Research

Thorough, multi-round research on a topic using parallel subagents, source verification, and cross-referencing.

---

## The Job

1. Understand the research question and its angles
2. Decompose into 3-5 independent research scopes
3. Dispatch subagents in parallel (one per scope)
4. Synthesise findings, resolving contradictions
5. Present with every claim backed by a URL

**Important:** Every factual claim in the final output MUST have a source URL. No URL, no claim.

---

## Step 1: Decompose the Question

Break the research topic into 3-5 independent angles. Good decompositions cover:

- **Official sources**: docs, specs, RFCs, announcements
- **Real-world evidence**: repos, examples, production usage
- **Community signal**: GitHub issues, discussions, blog posts, tweets
- **Trade-off analysis**: architectural, operational, maintenance
- **Decision context**: the user's specific repo, stack, constraints

State the scopes before dispatching so the user can adjust.

---

## Step 2: Dispatch Parallel Subagents

Launch 3-5 Agent subagents simultaneously. Each subagent must:

### Research protocol (include in every subagent prompt)

```
You are doing deep research on [SCOPE]. Do multiple rounds of web searches.
For important findings, fetch the actual source page to verify accuracy.

**Round structure:**
- Round 1: Official/primary sources (docs, specs, official repos)
- Round 2: Community sources (GitHub issues, discussions, blog posts)
- Round 3: Counter-evidence and edge cases (search for failures, limitations, known bugs)
- Round 4: Cross-reference (verify claims from earlier rounds, fill gaps)

**For each finding:**
1. State what you found (quote key parts where possible)
2. Source type: official docs | source code | GitHub issue | blog post | tweet | forum
3. Author credibility: maintainer | contributor | experienced user | unknown
4. Exact URL
5. Date (if available)
6. Still relevant? (check if superseded by newer information)

**Rules:**
- Do NOT include any claim you cannot back with a URL
- If two sources contradict, note both and flag the contradiction
- If a claim is widely repeated but has no primary source, flag it as unverified
- Distinguish: "docs say X" vs "community believes X" vs "one person reported X"
- Search for the CURRENT year when looking for recent information
- **For concrete facts (defaults, limits, version numbers, config values): ALWAYS fetch the primary source page (official docs, not blog posts or search snippets) and quote the exact value.** Blog posts and community guides go stale fast. A blog saying "the default is X" is not evidence if the official docs page says otherwise. Fetch the docs page, read the table or paragraph, and quote it.
- **Never trust a single secondary source for a factual claim.** If a blog post states a number or default, verify it against the official docs before including it. If you cannot find the official source, mark the claim as "unverified, from secondary source only".

This is research only. Do not write code.
```

### Subagent configuration

- Use `model: sonnet` for subagents (fast, capable enough for research)
- Each subagent should do 15-30 tool calls (searches + page fetches)
- Name subagents descriptively (e.g., "Official docs research", "Community patterns")

---

## Step 3: Synthesise Findings

After all subagents return, compile into a single report.

### Structure

```markdown
## Research: [Topic]

### 1. [First major finding area]

[Findings with inline source links]

**Evidence quality:** [strong/moderate/weak] - [why]

### 2. [Second major finding area]

...

### N. Contradictions and Gaps

- [Where sources disagree]
- [What nobody has proven]
- [What is assumed but unverified]

---

## Sources

- [Title](URL) - [one-line description of what it proves]
- ...
```

### Rules for synthesis

- **Findings first, opinions second.** State what the evidence shows before interpreting
- **Distinguish evidence tiers:**
  - Proven by official docs (strongest)
  - Proven by source code
  - Proven by multiple independent examples
  - Claimed by one credible source
  - Community consensus (no primary source)
  - Inferred / engineering judgment (weakest)
- **Flag contradictions explicitly.** "Source A says X, Source B says Y"
- **Note recency.** A 2024 blog post about a 2026 library version is stale
- **Quantify where possible.** "3 of 5 examples use pattern X" not "most examples"
- **Verify concrete facts during synthesis.** If a subagent reports a specific number, default, or limit, check whether it came from a primary source (official docs page that was actually fetched and read) or a secondary source (blog post, search snippet, community guide). If only secondary, either fetch the primary source yourself before including it, or mark it as unverified. This is the most common failure mode: a confidently stated number that was true 2 years ago but has since changed.

---

## Step 4: Present Sources

End with a flat list of all URLs referenced, grouped by type:

```markdown
## Sources

### Official Documentation
- [Title](URL) - what it proves

### Source Code / Repos
- [Title](URL) - what it proves

### GitHub Issues / Discussions
- [Title](URL) - what it proves

### Blog Posts / Articles
- [Title](URL) - what it proves

### Social / Forums
- [Title](URL) - what it proves
```

---

## Rules

- Every claim needs a URL. No exceptions
- Fetch important pages to verify, don't rely on search snippets alone
- Search for counter-evidence, not just confirming evidence
- If the research question involves the user's codebase, read relevant files before dispatching subagents
- If a subagent returns vague findings, send a follow-up message asking for specifics
- Do not pad the report. If there's nothing solid on a topic, say "insufficient evidence" and move on
- Keep the final synthesis concise. The subagents do the heavy lifting; the synthesis distils it
- Include the date of research at the top of the report
