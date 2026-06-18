# Context sources

Traverse in order of relevance to the query. Skip unavailable tools; note what was skipped.

## Priority

| Source | How | When |
|--------|-----|------|
| **Codebase** | Search + read `CONTEXT.md`, `docs/adr/`, `ARCHITECTURE.md` | Repo open |
| **Notion** | Notion MCP `search` / plugin `find` / `database-query` | Product specs, wiki |
| **Slack** | `claude -p` (elevated) for channel/thread search | Recent decisions, threads |
| **mempalace** | `mempalace_search`, `mempalace_traverse`, `mempalace_kg_query` | Long-term memory |
| **pauls-brain** | `vault_search`, `policy_search`, `ops_briefing`, `repo_search_code` | SGC / org context |
| **Linear** | pauls-brain `linear_list_issues` or Linear MCP | Active delivery work |

## Slack

Use programmatic `claude -p` in a non-sandboxed session (standing approval). Search threads relevant to the query; extract decisions and links, not full message bodies.

## Notion

Prefer official spec pages and ADRs linked from search results. One fetch per high-value page.

## Parallelism

Launch independent source reads in parallel (subagents or batched MCP). Synthesise into one brief.

## Failure

If a source is auth-blocked, record `"Slack: blocked"` etc. in **Sources** and continue.
