#!/usr/bin/env node
"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const CLI_PATH = path.join(__dirname, "check-english-readability.js");

testMultipleInputsAndMarkdownFile();
testStdinAndRichObservations();
testPreservationComparison();
testSentenceSplittingAndPassiveSignals();
console.log("check-english-readability tests passed");

function testMultipleInputsAndMarkdownFile() {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "readability-"));
  const markdownPath = path.join(tempDirectory, "draft.md");
  fs.writeFileSync(markdownPath, "# Update\n\nClear Markdown text.\n");

  const result = runCli(["--json", "First text.", "Second text.", "--file", markdownPath]);
  assert.equal(result.status, 0, result.stderr);

  const report = JSON.parse(result.stdout);
  assert.equal(report.inputs.length, 3);
  assert.equal(report.inputs[2].stats.sentences, 2);
}

function testStdinAndRichObservations() {
  const text = "The implementation was carefully reviewed, and perhaps additional documentation should be provided before deployment commences.";
  const result = runCli(["--json"], text);
  assert.equal(result.status, 0, result.stderr);

  const report = JSON.parse(result.stdout);
  assert.equal(report.candidates[0].readability, "veryHard");
  assert.deepEqual(report.candidates[0].observations.adverbs, ["carefully"]);
  assert.deepEqual(report.candidates[0].observations.qualifiers, ["perhaps"]);
  assert.deepEqual(report.candidates[0].observations.complexTerms, ["additional"]);
  assert.ok(report.candidates[0].observations.passiveVoice.length > 0);
  assert.equal(Object.hasOwn(report, "passes"), false);
  assert.doesNotMatch(result.stdout, /"(?:pass|fail)(?:es)?"\s*:/i);
}

function testPreservationComparison() {
  const original = "# Plan\n\nUse `db plan` from the [guide](https://example.test) only if 30 users may join.";
  const edited = "# Plan\n\nUse the guide if users join.";
  const result = runCli(["--json", "--reference", original, edited]);
  assert.equal(result.status, 0, result.stderr);

  const preservation = JSON.parse(result.stdout).preservation;
  const missing = preservation.missing;
  assert.deepEqual(missing.headings, []);
  assert.deepEqual(missing.links, ["[guide](https://example.test)"]);
  assert.deepEqual(missing.codeSpans, ["`db plan`"]);
  assert.deepEqual(missing.numbers, ["30"]);
  assert.equal(Object.hasOwn(missing, "modalAndConditions"), false);
  assert.ok(preservation.markerChange.source.includes("only if"));
  assert.ok(preservation.markerChange.source.includes("may"));
  assert.deepEqual(preservation.markerChange.candidate, ["if"]);
}

function testSentenceSplittingAndPassiveSignals() {
  const text = "Dr. Smith measured 3.14 seconds. The operator is tired. The change was carefully reviewed by the operator.";
  const result = runCli(["--json", text]);
  assert.equal(result.status, 0, result.stderr);

  const report = JSON.parse(result.stdout);
  assert.equal(report.stats.sentences, 3);
  assert.deepEqual(
    report.candidates.flatMap((candidate) => candidate.observations.passiveVoice),
    ["was carefully reviewed by"],
  );

  const exactSplit = JSON.parse(
    runCli(["--json", "Dr. Smith measured 3.14 seconds. The API was stable."]).stdout,
  );
  assert.equal(exactSplit.stats.sentences, 2);
}

function runCli(argumentsList, stdin) {
  return spawnSync(process.execPath, [CLI_PATH, ...argumentsList], {
    encoding: "utf8",
    input: stdin,
  });
}
