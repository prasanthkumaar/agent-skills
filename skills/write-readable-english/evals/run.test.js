#!/usr/bin/env node
"use strict";

const assert = require("assert/strict");
const path = require("path");
const { spawnSync } = require("child_process");

const {
  buildClaudeCommand,
  buildCodexCommand,
  evaluateGeneratedOutput,
  loadCases,
  validateCorpus,
  validateGeneratedCases,
} = require("./run");

const cases = loadCases();
const report = validateCorpus(cases);

assert.deepEqual(report, {
  caseCount: 12,
  noOpCount: 4,
  repairCount: 8,
  analysedTextCount: 24,
  errors: [],
});

const brokenCases = structuredClone(cases);
brokenCases[0].source = "http://example.com";
brokenCases[0].expected = "Changed text";
const brokenReport = validateCorpus(brokenCases);
assert(brokenReport.errors.some((error) => error.includes("source must use HTTPS")));
assert(brokenReport.errors.some((error) => error.includes("expected does not contain preserved literal")));
assert(brokenReport.errors.some((error) => error.includes("expected 4 no-op cases, found 3")));

const brokenCheckerReport = validateCorpus(cases, {
  analyseText: () => ({ stats: { readingGrade: 8 }, candidates: [] }),
  comparePreservation: () => ({
    missing: { headings: [], links: [], codeSpans: [], numbers: [] },
  }),
});
assert(brokenCheckerReport.errors.some((error) => error.includes("approved hard-sentence signal")));
assert(brokenCheckerReport.errors.some((error) => error.includes("approved passive-voice signal")));

const schema = { type: "object" };
assert.deepEqual(buildClaudeCommand({ model: "test-model", prompt: "test prompt", schema }), {
  executable: "claude",
  args: [
    "-p", "test prompt", "--safe-mode", "--no-chrome", "--disable-slash-commands",
    "--tools", "", "--permission-mode", "dontAsk", "--no-session-persistence",
    "--output-format", "json", "--json-schema", JSON.stringify(schema),
    "--model", "test-model", "--max-budget-usd", "1",
  ],
});
assert.deepEqual(buildCodexCommand({
  model: "test-model",
  workingDirectory: "/tmp/work",
  schemaPath: "/tmp/schema.json",
  outputPath: "/tmp/output.json",
}), {
  executable: "codex",
  args: [
    "exec", "--ignore-user-config", "--ignore-rules", "--ephemeral",
    "--sandbox", "read-only", "--skip-git-repo-check", "--cd", "/tmp/work",
    "--model", "test-model", "--output-schema", "/tmp/schema.json",
    "--output-last-message", "/tmp/output.json", "--color", "never", "-",
  ],
});

const inertCandidates = Object.fromEntries(cases.map((fixture) => [fixture.id, fixture.input]));
assert.throws(
  () => validateGeneratedCases({ cases: { ...inertCandidates, unexpected: "text" } }, cases),
  /missing or unexpected case ids/,
);
const inertReport = evaluateGeneratedOutput(
  cases,
  inertCandidates,
  { provider: "codex", model: "test-model" },
);
assert.equal(inertReport.deterministicGatesPass, false);
assert(inertReport.rows.some((row) => row.failures.includes("did not change approved repair text")));

const cli = spawnSync(process.execPath, [path.join(__dirname, "run.js")], { encoding: "utf8" });
assert.equal(cli.status, 0, cli.stderr || cli.stdout);
assert.equal(
  cli.stdout.trim(),
  "Deterministic eval: 12 cases (4 no-op, 8 repair), 24 texts analysed",
);

console.log("readable-english eval tests passed");
