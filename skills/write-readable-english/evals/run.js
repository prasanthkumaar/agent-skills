#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const readabilityChecker = require("../scripts/check-english-readability");

const SKILL_PATH = path.join(__dirname, "..", "SKILL.md");
const CORPUS_PATH = path.join(__dirname, "evals.json");
const EXPECTED_FIELDS = ["id", "genre", "input", "expected", "preserve", "source"];
const EXPECTED_CASE_COUNT = 12;
const EXPECTED_NO_OP_COUNT = 4;

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const cases = loadCases();
    const corpusReport = validateCorpus(cases);
    if (corpusReport.errors.length > 0) {
      throw new EvaluationError(corpusReport.errors.join("\n"));
    }

    if (!options.provider) {
      printDeterministicSummary(corpusReport);
      return;
    }

    const candidates = runWriter(options, cases);
    const writerReport = evaluateGeneratedOutput(cases, candidates, options);
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, `${JSON.stringify(writerReport, null, 2)}\n`, "utf8");
    printWriterSummary(writerReport, outputPath);
    process.exitCode = writerReport.deterministicGatesPass ? 0 : 1;
  } catch (error) {
    const label = error instanceof EvaluationError ? "invalid corpus" : "runtime error";
    console.error(`readable-english eval: ${label}: ${error.message}`);
    process.exitCode = error instanceof EvaluationError ? 1 : 2;
  }
}

class EvaluationError extends Error {}

function parseArguments(args) {
  if (args.length === 0) return {};
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    return { help: true };
  }

  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!["--provider", "--model", "--output"].includes(flag)) {
      throw new Error(`unknown argument: ${flag}`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    options[flag.slice(2)] = value;
    index += 1;
  }

  const suppliedWriterOptions = [options.provider, options.model, options.output].filter(Boolean).length;
  if (suppliedWriterOptions !== 3) {
    throw new Error("--provider, --model, and --output must be supplied together");
  }
  if (!["claude", "codex"].includes(options.provider)) {
    throw new Error("--provider must be claude or codex");
  }
  return options;
}

function runWriter(options, cases) {
  const schema = generationSchema(cases);
  const prompt = generationPrompt(cases);

  if (options.provider === "claude") {
    const command = buildClaudeCommand({ model: options.model, prompt, schema });
    const result = runCommand(command, { input: undefined });
    return validateGeneratedCases(parseClaudeOutput(result.stdout), cases);
  }

  return runCodexWriter({ model: options.model, prompt, schema, cases });
}

function runCodexWriter({ model, prompt, schema, cases }) {
  const workingDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "readable-english-codex-work-"));
  const artifactDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "readable-english-codex-output-"));
  const schemaPath = path.join(artifactDirectory, "schema.json");
  const outputPath = path.join(artifactDirectory, "output.json");

  try {
    fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
    const command = buildCodexCommand({ model, workingDirectory, schemaPath, outputPath });
    runCommand(command, { input: prompt });
    const document = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    return validateGeneratedCases(document, cases);
  } finally {
    fs.rmSync(workingDirectory, { recursive: true, force: true });
    fs.rmSync(artifactDirectory, { recursive: true, force: true });
  }
}

function buildClaudeCommand({ model, prompt, schema }) {
  return {
    executable: "claude",
    args: [
      "-p", prompt,
      "--safe-mode",
      "--no-chrome",
      "--disable-slash-commands",
      "--tools", "",
      "--permission-mode", "dontAsk",
      "--no-session-persistence",
      "--output-format", "json",
      "--json-schema", JSON.stringify(schema),
      "--model", model,
      "--max-budget-usd", "1",
    ],
  };
}

function buildCodexCommand({ model, workingDirectory, schemaPath, outputPath }) {
  return {
    executable: "codex",
    args: [
      "exec",
      "--ignore-user-config",
      "--ignore-rules",
      "--ephemeral",
      "--sandbox", "read-only",
      "--skip-git-repo-check",
      "--cd", workingDirectory,
      "--model", model,
      "--output-schema", schemaPath,
      "--output-last-message", outputPath,
      "--color", "never",
      "-",
    ],
  };
}

function runCommand(command, options) {
  const result = spawnSync(command.executable, command.args, {
    encoding: "utf8",
    input: options.input,
    maxBuffer: 10 * 1024 * 1024,
    shell: false,
  });
  if (result.error) throw new Error(`could not run ${command.executable}: ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(`${command.executable} failed: ${(result.stderr || result.stdout).trim()}`);
  }
  return result;
}

function generationPrompt(cases) {
  const skill = fs.readFileSync(SKILL_PATH, "utf8");
  const publicCases = cases.map((fixture) => ({
    id: fixture.id,
    genre: fixture.genre,
    input: fixture.input,
    diagnostics: readabilityChecker.analyseText(fixture.input),
  }));
  return `Apply the writing skill to every case. Diagnostics are advisory, so leave clear text unchanged. Do not call tools, inspect files, or explain edits. Return only JSON matching the supplied schema.\n\nSKILL\n${skill}\n\nCASES\n${JSON.stringify(publicCases, null, 2)}`;
}

function generationSchema(cases) {
  const ids = cases.map((fixture) => fixture.id);
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      cases: {
        type: "object",
        additionalProperties: false,
        properties: Object.fromEntries(ids.map((id) => [id, { type: "string" }])),
        required: ids,
      },
    },
    required: ["cases"],
  };
}

function parseClaudeOutput(output) {
  const envelope = JSON.parse(output);
  if (isPlainObject(envelope.structured_output)) return envelope.structured_output;
  if (isPlainObject(envelope.structuredOutput)) return envelope.structuredOutput;
  if (isPlainObject(envelope.result)) return envelope.result;
  if (typeof envelope.result === "string") return JSON.parse(envelope.result);
  return envelope;
}

function validateGeneratedCases(document, cases) {
  if (!isPlainObject(document) || Object.keys(document).length !== 1 || !isPlainObject(document.cases)) {
    throw new EvaluationError("writer must return only a cases object");
  }

  const expectedIds = cases.map((fixture) => fixture.id).sort();
  const actualIds = Object.keys(document.cases).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new EvaluationError("writer returned missing or unexpected case ids");
  }

  for (const id of expectedIds) {
    if (typeof document.cases[id] !== "string" || document.cases[id].trim() === "") {
      throw new EvaluationError(`writer returned an empty candidate for ${id}`);
    }
  }
  return document.cases;
}

function evaluateGeneratedOutput(cases, candidates, options) {
  const rows = cases.map((fixture) => {
    const candidate = candidates[fixture.id];
    const failures = [];

    if (fixture.input === fixture.expected && candidate !== fixture.input) {
      failures.push("changed approved no-op text");
    }
    if (fixture.input !== fixture.expected && candidate === fixture.input) {
      failures.push("did not change approved repair text");
    }
    for (const literal of fixture.preserve) {
      if (!candidate.includes(literal)) failures.push(`lost preserved literal ${JSON.stringify(literal)}`);
    }
    const preservation = readabilityChecker.comparePreservation(fixture.input, candidate);
    for (const category of ["headings", "links", "codeSpans", "numbers"]) {
      if (preservation.missing[category].length > 0) {
        failures.push(`lost ${category}: ${preservation.missing[category].join(", ")}`);
      }
    }

    return {
      id: fixture.id,
      genre: fixture.genre,
      input: fixture.input,
      candidate,
      expected: fixture.expected,
      failures,
    };
  });

  return {
    schemaVersion: 1,
    provider: options.provider,
    model: options.model,
    deterministicGatesPass: rows.every((row) => row.failures.length === 0),
    gateCasesPassed: rows.filter((row) => row.failures.length === 0).length,
    total: rows.length,
    rows,
  };
}

function loadCases() {
  const cases = JSON.parse(fs.readFileSync(CORPUS_PATH, "utf8"));
  if (!Array.isArray(cases)) {
    throw new EvaluationError("evals.json must contain an array");
  }
  return cases;
}

function validateCorpus(cases, checker = readabilityChecker) {
  const errors = [];
  const ids = new Set();
  let noOpCount = 0;

  if (cases.length !== EXPECTED_CASE_COUNT) {
    errors.push(`expected ${EXPECTED_CASE_COUNT} cases, found ${cases.length}`);
  }

  for (const [index, fixture] of cases.entries()) {
    const location = fixture?.id || `case ${index + 1}`;
    if (!isPlainObject(fixture)) {
      errors.push(`${location}: must be an object`);
      continue;
    }

    validateFields(fixture, location, errors);

    if (typeof fixture.id === "string") {
      if (ids.has(fixture.id)) errors.push(`${location}: duplicate id`);
      ids.add(fixture.id);
    }

    if (fixture.input === fixture.expected) noOpCount += 1;
    validateSource(fixture.source, location, errors);
    validatePreservedLiterals(fixture, location, errors);
  }

  if (noOpCount !== EXPECTED_NO_OP_COUNT) {
    errors.push(`expected ${EXPECTED_NO_OP_COUNT} no-op cases, found ${noOpCount}`);
  }

  validateCheckerContract(cases, checker, errors);

  return {
    caseCount: cases.length,
    noOpCount,
    repairCount: cases.length - noOpCount,
    analysedTextCount: cases.length * 2,
    errors,
  };
}

function validateCheckerContract(cases, checker, errors) {
  if (typeof checker?.analyseText !== "function" || typeof checker?.comparePreservation !== "function") {
    errors.push("checker must export analyseText and comparePreservation");
    return;
  }

  for (const fixture of cases) {
    if (!isPlainObject(fixture)) continue;
    const location = fixture.id || "unknown case";
    const analyses = {};

    for (const [version, text] of [["input", fixture.input], ["expected", fixture.expected]]) {
      if (typeof text !== "string") continue;
      const analysis = checker.analyseText(text);
      analyses[version] = analysis;
      if (!Number.isFinite(analysis?.stats?.readingGrade)) {
        errors.push(`${location}: checker did not return a reading grade for ${version}`);
      }
      if (!Array.isArray(analysis?.candidates)) {
        errors.push(`${location}: checker did not return candidates for ${version}`);
      }
    }

    if (
      fixture.id === "sentence-logical-chain-no-op" &&
      !analyses.input?.candidates?.some((candidate) => ["hard", "veryHard"].includes(candidate.readability))
    ) {
      errors.push(`${location}: checker did not identify the approved hard-sentence signal`);
    }
    if (
      fixture.id === "instruction-passive-no-op" &&
      !analyses.input?.candidates?.some((candidate) => candidate.observations?.passiveVoice?.length > 0)
    ) {
      errors.push(`${location}: checker did not identify the approved passive-voice signal`);
    }

    if (typeof fixture.input !== "string" || typeof fixture.expected !== "string") continue;
    const comparison = checker.comparePreservation(fixture.input, fixture.expected);
    const hardCategories = ["headings", "links", "codeSpans", "numbers"];
    for (const category of hardCategories) {
      const missing = comparison?.missing?.[category];
      if (!Array.isArray(missing)) {
        errors.push(`${location}: checker did not return missing ${category}`);
      } else if (missing.length > 0) {
        errors.push(`${location}: approved output lost ${category}: ${missing.join(", ")}`);
      }
    }
  }
}

function validateFields(fixture, location, errors) {
  const fields = Object.keys(fixture).sort();
  const expectedFields = [...EXPECTED_FIELDS].sort();
  if (JSON.stringify(fields) !== JSON.stringify(expectedFields)) {
    errors.push(`${location}: must contain exactly ${EXPECTED_FIELDS.join(", ")}`);
  }

  for (const field of ["id", "genre", "input", "expected", "source"]) {
    if (typeof fixture[field] !== "string" || fixture[field].trim() === "") {
      errors.push(`${location}: ${field} must be a non-empty string`);
    }
  }
  if (!Array.isArray(fixture.preserve) || fixture.preserve.length === 0) {
    errors.push(`${location}: preserve must be a non-empty array`);
  }
}

function validateSource(source, location, errors) {
  if (typeof source !== "string") return;
  try {
    if (new URL(source).protocol !== "https:") {
      errors.push(`${location}: source must use HTTPS`);
    }
  } catch {
    errors.push(`${location}: source must be a valid HTTPS URL`);
  }
}

function validatePreservedLiterals(fixture, location, errors) {
  if (!Array.isArray(fixture.preserve)) return;

  for (const literal of fixture.preserve) {
    if (typeof literal !== "string" || literal === "") {
      errors.push(`${location}: preserve values must be non-empty strings`);
      continue;
    }
    if (typeof fixture.input === "string" && !fixture.input.includes(literal)) {
      errors.push(`${location}: input does not contain preserved literal ${JSON.stringify(literal)}`);
    }
    if (typeof fixture.expected === "string" && !fixture.expected.includes(literal)) {
      errors.push(`${location}: expected does not contain preserved literal ${JSON.stringify(literal)}`);
    }
  }
}

function printDeterministicSummary(report) {
  console.log(
    `Deterministic eval: ${report.caseCount} cases (${report.noOpCount} no-op, ${report.repairCount} repair), ${report.analysedTextCount} texts analysed`,
  );
}

function printWriterSummary(report, outputPath) {
  console.log(
    `Deterministic gates: ${report.deterministicGatesPass ? "PASS" : "FAIL"} (${report.gateCasesPassed}/${report.total}), ${report.provider}/${report.model}; manual review required`,
  );
  console.log(`Report: ${outputPath}`);
}

function printHelp() {
  console.log(`Usage:
  node evals/run.js
  node evals/run.js --provider claude --model <id> --output <path>
  node evals/run.js --provider codex --model <id> --output <path>

Without writer flags, validates the corpus and checker deterministically.
Writer mode makes one generation call, applies deterministic preservation gates, and writes a JSON report.`);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

if (require.main === module) main();

module.exports = {
  buildClaudeCommand,
  buildCodexCommand,
  evaluateGeneratedOutput,
  loadCases,
  validateCorpus,
  validateGeneratedCases,
};
