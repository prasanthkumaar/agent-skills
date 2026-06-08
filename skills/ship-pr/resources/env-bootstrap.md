# Environment bootstrap

Repo-agnostic steps to run the app and tests locally. Exhaust these before declaring the environment blocked.

## Detection order

1. **Docs** — `README`, `README.md`, `CONTRIBUTING`, `docs/development`, `AGENTS.md`.
2. **Package scripts** — root and app `package.json` → `scripts.dev`, `scripts.start`, `scripts.test`, `scripts.e2e`, `scripts.typecheck`, `scripts.lint`.
3. **Make / task runners** — `Makefile`, `justfile`, `Taskfile.yml`, `mise.toml`.
4. **Containers** — `docker-compose.yml`, `compose.yaml`, `devcontainer.json`.
5. **Language defaults** — only if nothing else found:
   - Node: `npm run dev` / `pnpm dev` / `yarn dev`
   - Python: `uv run`, `poetry run`, `make dev`
   - Go: `go run ./cmd/...`

## Start the app

1. Check if something already listens on the expected port (`lsof`, `curl`).
2. Start dev server in a **managed background** process (tool backgrounding — not bare `&` in a subshell that gets reaped).
3. Poll until HTTP responds or logs show ready (`Ready`, `Local:`, `listening`).
4. Record the base URL (e.g. `http://localhost:3000`) for tests and screenshots.

## Environment variables

1. Look for `.env.example`, `.env.sample`, `.env.template`, `env.schema`, docs listing required vars.
2. Check if the repo documents a secret loader (direnv, 1Password, vault wrapper) — **follow repo docs**, do not invent stack-specific commands.
3. If vars are missing, ask the user once with **names only** (never echo values).
4. Do not copy `.env` files from other checkouts without user approval.

## Tests

Discover from the same sources:

| Kind | Common patterns |
|------|-----------------|
| Unit | `npm test`, `pytest`, `go test ./...` |
| E2E | `playwright test`, `cypress run`, `npm run e2e` |
| Typecheck | `npm run typecheck`, `tsc --noEmit` |
| Lint | `npm run lint`, `ruff check` |

Run the checks the repo defines before opening or updating the PR.

## Blocked checklist

Only say "blocked" when all of:

- [ ] Read README and package scripts.
- [ ] Attempted documented dev command (or asked user for command).
- [ ] Attempted documented secret/env setup (or asked for missing var names).
- [ ] User confirmed no local env available.

When blocked, state exactly what is missing and what the user must provide.
