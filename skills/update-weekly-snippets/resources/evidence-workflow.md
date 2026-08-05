# Evidence workflow

Use this reference to keep weekly discovery, validation, drafting, and posting
as separate gates.

## 1. Fix the time window

- Default timezone: `Asia/Singapore`.
- Default range: Monday 00:00 through the current time.
- State exact dates before searching.
- A transcript's ingestion date is not necessarily its session date. Prefer the
  timestamp inside the transcript or source filename.

## 2. Research the Slack convention

If the exact Slack MCP tool names are unknown, first run discovery without
accessing company data:

```bash
claude -p 'Discover only the exact Slack MCP tool names needed to search messages, read threads, and resolve permalinks. Do not access Slack data.' \
  --model haiku \
  --permission-mode dontAsk \
  --output-format json \
  --no-chrome \
  --no-session-persistence \
  --tools ToolSearch \
  --allowedTools 'ToolSearch'
```

Then run the Slack-scoped query with every required tool explicitly allowed:

```bash
claude -p '<Slack-scoped reconnaissance prompt>' \
  --model haiku \
  --permission-mode dontAsk \
  --output-format json \
  --no-chrome \
  --no-session-persistence \
  --tools ToolSearch \
  --allowedTools 'ToolSearch,mcp__<server>__<exact-tool>[,mcp__<server>__<exact-tool>...]'
```

Keep both calls read-only. The source query must ask for:

- channel purpose, prompt cadence, and reply convention;
- three to five recent designer examples;
- author, date, structural pattern, and exact permalink for each;
- the newest designer-specific parent post;
- any fixed questions the prompt expects people to answer.

Accept the source query only when the process exits successfully, the JSON has
`is_error: false`, `permission_denials` is empty, and `result` contains Slack
evidence. If a denial names an omitted required tool, add that exact tool and
retry once. Stop on a repeated denial, authentication failure, malformed JSON,
or missing evidence. Never switch to Chrome, an interactive Claude session,
`bypassPermissions`, or `--dangerously-skip-permissions`.

Do not treat birthday, recognition, or unrelated bot messages as weekly snippet
examples.

## 3. Discover candidate work

Search Mempalace by:

1. each date in the reporting window;
2. known active project names;
3. outcome terms such as `published`, `opened`, `announced`, `tested`,
   `decided`, `drafted`, and `shipped`;
4. agent source: Cursor, Claude, and Codex.

If the semantic endpoint fails:

1. inspect the Mempalace taxonomy and source metadata;
2. query `~/.mempalace/store/sqlite_exact.sqlite3` in read-only mode;
3. follow `source_file` to the original transcript when present;
4. declare the latest indexed timestamp;
5. use Git or other product state only to cross-check the missing period.

Do not interpret a keyword in a subagent prompt as proof that the main task was
completed.

## 4. Build the pre-validation ledger

For every candidate, record:

| Field | Meaning |
|---|---|
| Workstream | User-facing project or responsibility |
| Candidate claim | The strongest wording suggested by transcripts |
| Activity date | When the work occurred |
| Transcript evidence | Source path, session, or drawer |
| State verb | Researched, drafted, announced, published, opened, shipped |
| Confidence | High, medium, or low before external validation |

Prefer outcomes and decisions over meetings or implementation trivia.

## 5. Validate externally

Search Slack and Notion independently for each candidate. Use direct sources:

- the user's own update or announcement;
- a project thread, review request, or linked PR preview;
- a canonical Notion project page, analysis, codebook, or decision record;
- a dated page edit that supports the claimed state.

Classify the result:

| Verdict | Rule |
|---|---|
| Direct | The source supports the actor, action, state, and date |
| Partial | The workstream exists, but details or state are not supported |
| Contradicted | The source shows a different state |
| Not found | Neither system supplies relevant evidence |

For each source, retain its author or page title, date, compact paraphrase, and
exact URL. A missing Notion page does not invalidate direct Slack evidence, and
vice versa, but the gap must remain visible.

## 6. Reconcile before drafting

- Direct: keep the claim.
- Partial: remove unsupported details and weaken the state verb.
- Contradicted: replace it with the supported state.
- Not found: omit it unless the user explicitly wants a transcript-only item.

Show a before/after comparison when reconciliation changes meaning. Typical
corrections include:

- `drafted` → `announced`;
- `prototype` → `published analysis`;
- detailed implementation → `continued work and moved into review`.

Do not use a broad project label when all evidence concerns only an adjacent
workflow experiment.

## 7. Draft and approve

Load `voice-slack`. Default to:

- lowercase-first language;
- workstream headings with nested outcome bullets;
- two or three substantial workstreams;
- no greeting, sign-off, corporate summary, or week-number heading;
- no maintenance-only PRs unless they had meaningful impact.

Present the complete text in a code block. Say clearly that nothing has been
posted. Apply user edits exactly and keep the latest approved body as the only
posting candidate.

## 8. Post and verify

Only explicit instructions such as `post`, `send`, or `reply in the thread`
authorise the Slack write.

Before posting, resolve the exact channel, parent permalink, and parent
timestamp. Post once as a thread reply. Then verify:

1. returned channel matches `#team-logs`;
2. `thread_ts` equals the selected parent;
3. body and line breaks match the approved draft;
4. no extra heading or preamble was added;
5. a direct reply permalink is available.

If verification fails, do not silently post a second copy. Report the mismatch
and ask before editing or retrying.
