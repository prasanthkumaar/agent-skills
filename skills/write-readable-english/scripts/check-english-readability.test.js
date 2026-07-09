#!/usr/bin/env node
"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const {
  isMarkdownPath,
  prepareInputText,
  stripMarkdownForReadability,
} = require("./check-english-readability");

const CLI_PATH = path.join(__dirname, "check-english-readability.js");

runTests();

function runTests() {
  testMarkdownPathDetection();
  testMarkdownHappyCase();
  testMarkdownEdgeCases();
  testNonMarkdownInputIsUnchanged();
  testCliAcceptsMarkdownAndScoresVisibleProseOnly();
  console.log("check-english-readability tests passed");
}

function testMarkdownPathDetection() {
  assert.equal(isMarkdownPath("/tmp/draft.md"), true);
  assert.equal(isMarkdownPath("/tmp/draft.MARKDOWN"), true);
  assert.equal(isMarkdownPath("/tmp/draft.txt"), false);
  assert.equal(isMarkdownPath("-"), false);
  assert.equal(isMarkdownPath(undefined), false);
}

function testMarkdownHappyCase() {
  const markdown = [
    "# Release note",
    "",
    "We fixed the billing flow for new teams.",
    "",
    "- Checkout now shows the right tax.",
    "- Admins can resend invites from **Team settings**.",
    "",
    "Read the [migration guide](https://example.com/guide) before rollout.",
  ].join("\n");

  assert.equal(
    stripMarkdownForReadability(markdown),
    [
      "Release note",
      "",
      "We fixed the billing flow for new teams.",
      "",
      "Checkout now shows the right tax.",
      "Admins can resend invites from Team settings.",
      "",
      "Read the migration guide before rollout.",
    ].join("\n"),
  );
}

function testMarkdownEdgeCases() {
  const markdown = [
    "---",
    "title: Hidden metadata",
    "---",
    "",
    "<!-- hidden comment -->",
    "",
    "## Visible heading ##",
    "",
    "> A quoted line with `inline code` and <strong>HTML</strong>.",
    "",
    "```js",
    "const ignored = true;",
    "```",
    "",
    "    ignoredIndentedCode();",
    "",
    "![Diagram alt text](./diagram.png)",
    "",
    "| Name | Status |",
    "| ---- | ------ |",
    "| Import | Ready |",
    "",
    "[hidden-ref]: https://example.com",
    "",
    "1. [x] Ship the **small** update.",
    "2. Use `.md` files in the checker.",
    "",
    "---",
  ].join("\n");

  assert.equal(
    stripMarkdownForReadability(markdown),
    [
      "Visible heading",
      "",
      "A quoted line with inline code and HTML.",
      "",
      "Diagram alt text",
      "",
      "Name. Status",
      "",
      "Import. Ready",
      "",
      "Ship the small update.",
      "Use .md files in the checker.",
    ].join("\n"),
  );
}

function testNonMarkdownInputIsUnchanged() {
  const text = "# This remains plain text.";
  assert.equal(prepareInputText(text, "/tmp/plain.txt"), text);
}

function testCliAcceptsMarkdownAndScoresVisibleProseOnly() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "readability-md-"));
  const markdownPath = path.join(tempDir, "candidate.md");
  fs.writeFileSync(
    markdownPath,
    [
      "# Team update",
      "",
      "We fixed the import flow for new teams.",
      "",
      "```",
      "Antidisestablishmentarianism Antidisestablishmentarianism Antidisestablishmentarianism.",
      "```",
    ].join("\n"),
  );

  const result = spawnSync(
    process.execPath,
    [CLI_PATH, "--file", markdownPath, "--max-grade", "9", "--json"],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.passes, true);
  assert.equal(report.stats.sentences, 2);
  assert.deepEqual(
    report.sentences.map((sentence) => sentence.text),
    ["Team update", "We fixed the import flow for new teams"],
  );
}
