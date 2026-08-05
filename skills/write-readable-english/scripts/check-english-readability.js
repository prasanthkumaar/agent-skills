#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const DEFAULT_READING_TARGET = "NORMAL";
const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown", ".mdown", ".mkd", ".mkdn"]);
const READABILITY_THRESHOLDS = {
  ACCESSIBLE: { minimumWords: 8, hard: 8, veryHard: 12 },
  NORMAL: { minimumWords: 14, hard: 10, veryHard: 14 },
  TECHNICAL: { minimumWords: 14, hard: 14, veryHard: 18 },
};
const IRREGULAR_PARTICIPLES = new Set([
  "beaten", "been", "begun", "bent", "blown", "bought", "broken", "brought", "built",
  "caught", "chosen", "done", "drawn", "driven", "eaten", "fallen", "felt", "found",
  "given", "grown", "held", "hidden", "known", "laid", "led", "left", "lost", "made",
  "meant", "paid", "proven", "read", "ridden", "risen", "run", "said", "seen", "sent",
  "shown", "sold", "spoken", "spent", "split", "stolen", "struck", "taken", "taught",
  "thought", "thrown", "told", "torn", "understood", "won", "worn", "written",
]);
const ADVERB_EXCEPTIONS = new Set([
  "actually", "ally", "apply", "assembly", "belly", "butterfly", "completely", "comply",
  "costly", "currently", "daily", "early", "elderly", "family", "finally", "friendly",
  "generally", "hardly", "holy", "immediately", "july", "kindly", "lately", "likely",
  "lively", "lonely", "lovely", "only", "particularly", "previously", "rarely", "recently",
  "reply", "shortly", "silly", "supply", "timely", "ugly", "unlikely", "usually", "weekly",
  "wholly", "yearly",
]);
const QUALIFIERS = [
  "i believe", "i consider", "i don't believe", "i don't consider", "i don't feel",
  "i don't suggest", "i don't think", "i feel", "i hope to", "i might", "i suggest",
  "i think", "i was wondering", "i will try", "i wonder", "in my opinion", "is kind of",
  "is sort of", "just", "maybe", "perhaps", "possibly", "we believe", "we consider",
  "we don't believe", "we don't consider", "we don't feel", "we don't suggest",
  "we don't think", "we feel", "we hope to", "we might", "we suggest", "we think",
  "we were wondering", "we will try", "we wonder",
];
const COMPLEX_TERMS = [
  "additional", "adjacent to", "advise", "approximately", "ascertain", "assistance",
  "at this time", "commence", "concerning", "consequently", "demonstrate",
  "due to the fact that", "eliminate", "endeavor", "facilitate", "for the purpose of",
  "in addition", "in order to", "in regard to", "in the near future", "indicate", "initiate",
  "multiple", "necessitate", "nevertheless", "numerous", "obtain", "participate",
  "pertaining to", "previously", "prior to", "purchase", "regarding", "require", "reside",
  "sufficient", "terminate", "therefore", "transmit", "utilise", "utilize", "with respect to",
];
const MODAL_AND_CONDITION_PATTERNS = [
  /\bmust\b/gi,
  /\bmust not\b/gi,
  /\bmay\b/gi,
  /\bmight\b/gi,
  /\bshould\b/gi,
  /\bshould not\b/gi,
  /\bcan\b/gi,
  /\bcannot\b/gi,
  /\bif\b/gi,
  /\bonly if\b/gi,
  /\bunless\b/gi,
  /\bwhen\b/gi,
  /\bbefore\b/gi,
  /\bafter\b/gi,
];
const PASSIVE_ADJECTIVE_EXCEPTIONS = new Set([
  "afraid", "alive", "alone", "asleep", "aware", "bored", "concerned", "excited", "glad",
  "interested", "pleased", "ready", "satisfied", "surprised", "tired", "upset", "worried",
]);
const SENTENCE_PERIOD_PLACEHOLDER = "\uE000";

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    const inputs = readInputs(options);
    const reference = readReference(options);

    if (reference && inputs.length !== 1) {
      throw new Error("preservation comparison requires exactly one input");
    }

    const reports = inputs.map((input) => {
      const report = analyseText(prepareInputText(input.text, input.sourcePath), {
        readingTarget: options.readingTarget,
      });
      return {
        source: input.label,
        ...report,
        ...(reference ? { preservation: comparePreservation(reference.text, input.text) } : {}),
      };
    });

    if (options.json) {
      console.log(JSON.stringify(reports.length === 1 ? reports[0] : { inputs: reports }, null, 2));
    } else {
      printHumanReports(reports);
    }
  } catch (error) {
    console.error(`check-english-readability: ${error.message}`);
    process.exitCode = 2;
  }
}

function parseArguments(args) {
  const options = {
    inputs: [],
    json: false,
    readingTarget: DEFAULT_READING_TARGET,
    reference: undefined,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--file") {
      const sourcePath = requireValue(args, index, argument);
      options.inputs.push({ kind: "file", value: sourcePath });
      index += 1;
      continue;
    }
    if (argument === "--reference") {
      options.reference = { kind: "text", value: requireValue(args, index, argument) };
      index += 1;
      continue;
    }
    if (argument === "--reference-file") {
      options.reference = { kind: "file", value: requireValue(args, index, argument) };
      index += 1;
      continue;
    }
    if (argument === "--target") {
      const readingTarget = requireValue(args, index, argument).toUpperCase();
      if (!READABILITY_THRESHOLDS[readingTarget]) {
        throw new Error("--target must be ACCESSIBLE, NORMAL, or TECHNICAL");
      }
      options.readingTarget = readingTarget;
      index += 1;
      continue;
    }
    if (argument === "--json") {
      options.json = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      printHelp();
      process.exit(0);
    }
    if (argument.startsWith("--")) {
      throw new Error(`unknown argument: ${argument}`);
    }

    options.inputs.push({ kind: "text", value: argument });
  }

  return options;
}

function requireValue(args, index, flag) {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function readInputs(options) {
  if (options.inputs.length === 0) {
    if (process.stdin.isTTY) {
      throw new Error("provide quoted text, --file, or text on stdin");
    }
    return [{ label: "stdin", text: fs.readFileSync(0, "utf8") }];
  }

  return options.inputs.map((input, index) => {
    if (input.kind === "file") {
      return {
        label: input.value,
        sourcePath: input.value,
        text: fs.readFileSync(input.value, "utf8"),
      };
    }
    return { label: `text:${index + 1}`, text: input.value };
  });
}

function readReference(options) {
  if (!options.reference) {
    return undefined;
  }
  if (options.reference.kind === "file") {
    return { text: fs.readFileSync(options.reference.value, "utf8") };
  }
  return { text: options.reference.value };
}

function prepareInputText(text, sourcePath) {
  return isMarkdownPath(sourcePath) ? stripMarkdownForReadability(text) : text;
}

function isMarkdownPath(sourcePath) {
  return Boolean(sourcePath && MARKDOWN_EXTENSIONS.has(path.extname(sourcePath).toLowerCase()));
}

function stripMarkdownForReadability(markdown) {
  let text = markdown.replace(/\r\n?/g, "\n");
  text = text.replace(/^---\n[\s\S]*?\n(?:---|\.\.\.)\s*\n/, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/^\s{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s{0,3}\1\s*$/gm, "");

  return text
    .split("\n")
    .filter((line) => !/^\s{4}|^\t/.test(line))
    .filter((line) => !/^\s{0,3}\[[^\]]+\]:\s+\S+/.test(line))
    .filter((line) => !/^\s{0,3}(?:[-*_]\s*){3,}$/.test(line))
    .map((line) => line
      .replace(/^\s{0,3}#{1,6}\s*/, "")
      .replace(/^\s{0,3}>\s?/, "")
      .replace(/^\s{0,3}(?:[-+*]|\d{1,9}[.)])\s+/, "")
      .replace(/^\s*\[[ xX]\]\s+/, "")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/(?:\*\*|__|~~)(.*?)(?:\*\*|__|~~)/g, "$1")
      .replace(/[*_](.*?)[*_]/g, "$1")
      .replace(/<[^>\n]+>/g, "")
      .trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function analyseText(text, options = {}) {
  const readingTarget = options.readingTarget ?? DEFAULT_READING_TARGET;
  const paragraphs = splitParagraphs(text);
  const sentences = [];

  for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
    const sentenceTexts = splitSentences(paragraphs[paragraphIndex]);
    for (let sentenceIndex = 0; sentenceIndex < sentenceTexts.length; sentenceIndex += 1) {
      sentences.push(analyseSentence(sentenceTexts[sentenceIndex], {
        paragraph: paragraphIndex + 1,
        readingTarget,
        sentence: sentenceIndex + 1,
      }));
    }
  }

  const words = sentences.reduce((total, sentence) => total + sentence.words, 0);
  const letters = sentences.reduce((total, sentence) => total + sentence.letters, 0);
  const readingGrade = calculateGrade({ letters, sentences: sentences.length, words });
  const candidates = buildCandidates(sentences);

  return {
    target: readingTarget,
    stats: {
      paragraphs: paragraphs.length,
      sentences: sentences.length,
      words,
      letters,
      readingGrade,
      hardSentences: sentences.filter((sentence) => sentence.readability === "hard").length,
      veryHardSentences: sentences.filter((sentence) => sentence.readability === "veryHard").length,
      adverbs: countIssues(sentences, "adverbs"),
      passiveVoice: countIssues(sentences, "passiveVoice"),
      qualifiers: countIssues(sentences, "qualifiers"),
      complexTerms: countIssues(sentences, "complexTerms"),
    },
    candidates,
  };
}

function splitParagraphs(text) {
  return text.split(/\r?\n+/).map((value) => value.trim()).filter(Boolean);
}

function splitSentences(text) {
  const protectedText = text
    .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e|U\.S)\./gi, (match) => {
      return match.replaceAll(".", SENTENCE_PERIOD_PLACEHOLDER);
    })
    .replace(/(\d)\.(?=\d)/g, `$1${SENTENCE_PERIOD_PLACEHOLDER}`);
  const matches = protectedText.match(/[^.!?]+(?:[.!?]+["”')]*|$)/g) ?? [];

  return matches
    .map((value) => value.replaceAll(SENTENCE_PERIOD_PLACEHOLDER, ".").trim())
    .filter(Boolean);
}

function analyseSentence(text, context) {
  const wordList = text.match(/\b[\w'-]+\b/g) ?? [];
  const letters = wordList.reduce((total, word) => total + (word.match(/\w/g) ?? []).length, 0);
  const readingGrade = calculateGrade({ letters, sentences: 1, words: wordList.length });
  const thresholds = READABILITY_THRESHOLDS[context.readingTarget];
  let readability = "normal";
  if (wordList.length >= thresholds.minimumWords && readingGrade >= thresholds.veryHard) {
    readability = "veryHard";
  } else if (wordList.length >= thresholds.minimumWords && readingGrade >= thresholds.hard) {
    readability = "hard";
  }

  return {
    location: { paragraph: context.paragraph, sentence: context.sentence },
    text,
    words: wordList.length,
    letters,
    readingGrade,
    readability,
    issues: {
      adverbs: detectAdverbs(wordList),
      passiveVoice: detectPassiveVoice(text),
      qualifiers: detectPhrases(text, QUALIFIERS),
      complexTerms: detectPhrases(text, COMPLEX_TERMS),
    },
  };
}

function calculateGrade({ letters, sentences, words }) {
  if (words === 0 || sentences === 0) {
    return 0;
  }
  return Math.max(Math.round((letters / words) * 4.71 + (words / sentences) * 0.5 - 21.43), 0);
}

function detectAdverbs(words) {
  return words
    .filter((word) => /ly$/i.test(word))
    .filter((word) => !ADVERB_EXCEPTIONS.has(word.toLowerCase()));
}

function detectPassiveVoice(text) {
  const passivePattern = /\b(?:is|are|was|were|be|been|being)\s+(?:(?:[a-z]+ly)\s+){0,2}([a-z]{2,30})(?:\s+by\b)?/gi;
  const signals = [];
  let match;

  while ((match = passivePattern.exec(text)) !== null) {
    const participle = match[1].toLowerCase();
    const looksLikeParticiple = participle.endsWith("ed") || IRREGULAR_PARTICIPLES.has(participle);
    if (looksLikeParticiple && !PASSIVE_ADJECTIVE_EXCEPTIONS.has(participle)) {
      signals.push(match[0]);
    }
  }

  return signals;
}

function detectPhrases(text, phrases) {
  const lowerText = text.toLowerCase();
  return phrases.filter((phrase) => new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i").test(lowerText));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countIssues(sentences, issueName) {
  return sentences.reduce((total, sentence) => total + sentence.issues[issueName].length, 0);
}

function buildCandidates(sentences) {
  return sentences
    .filter((sentence) => sentence.readability !== "normal" || Object.values(sentence.issues).some((items) => items.length > 0))
    .map((sentence) => ({
      location: sentence.location,
      text: sentence.text,
      readingGrade: sentence.readingGrade,
      readability: sentence.readability,
      observations: sentence.issues,
    }));
}

function comparePreservation(reference, candidate) {
  const referenceTokens = extractPreservedTokens(reference);
  const candidateTokens = extractPreservedTokens(candidate);
  const missing = {};

  for (const category of ["headings", "links", "codeSpans", "numbers"]) {
    const tokens = referenceTokens[category];
    const candidateCounts = countTokens(candidateTokens[category]);
    const missingTokens = [];
    for (const token of tokens) {
      const key = token.toLowerCase();
      const available = candidateCounts.get(key) ?? 0;
      if (available === 0) {
        missingTokens.push(token);
      } else {
        candidateCounts.set(key, available - 1);
      }
    }
    missing[category] = missingTokens;
  }

  return {
    missing,
    markerChange: {
      source: referenceTokens.modalAndConditions,
      candidate: candidateTokens.modalAndConditions,
    },
  };
}

function extractPreservedTokens(text) {
  return {
    headings: findMatches(text, /^\s{0,3}#{1,6}\s+.+$/gm),
    links: findMatches(text, /\[[^\]]+\]\([^)]+\)/g),
    codeSpans: findMatches(text, /`[^`\n]+`/g),
    numbers: findMatches(text, /\b\d+(?:[.,]\d+)*(?:%|\b)/g),
    modalAndConditions: MODAL_AND_CONDITION_PATTERNS.flatMap((pattern) => findMatches(text, pattern)),
  };
}

function findMatches(text, pattern) {
  pattern.lastIndex = 0;
  return text.match(pattern) ?? [];
}

function countTokens(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    const key = token.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function printHumanReports(reports) {
  for (let index = 0; index < reports.length; index += 1) {
    const report = reports[index];
    if (reports.length > 1) {
      console.log(`${index + 1}. ${report.source}`);
    }
    console.log(`Reading grade: ${report.stats.readingGrade}`);
    console.log(`Words: ${report.stats.words} | Sentences: ${report.stats.sentences}`);
    console.log(`Hard: ${report.stats.hardSentences} | Very hard: ${report.stats.veryHardSentences}`);
    console.log(
      `Adverbs: ${report.stats.adverbs} | Passive voice: ${report.stats.passiveVoice} | Qualifiers: ${report.stats.qualifiers} | Complex terms: ${report.stats.complexTerms}`,
    );
    for (const candidate of report.candidates) {
      console.log(
        `${candidate.location.paragraph}.${candidate.location.sentence} Grade ${candidate.readingGrade}, ${candidate.readability}: ${candidate.text}`,
      );
    }
    if (report.preservation) {
      console.log(`Missing preserved content: ${JSON.stringify(report.preservation.missing)}`);
      console.log(
        `Modal and condition markers: source ${JSON.stringify(report.preservation.markerChange.source)} | candidate ${JSON.stringify(report.preservation.markerChange.candidate)}`,
      );
    }
    if (index < reports.length - 1) {
      console.log("");
    }
  }
}

function printHelp() {
  console.log(`Usage:
  check-english-readability.js [--json] [--target NORMAL] "Text" ["More text"]
  check-english-readability.js [--json] --file draft.md [--file plan.md]
  cat draft.txt | check-english-readability.js [--json]
  check-english-readability.js --reference "Original" "Edited"
  check-english-readability.js --reference-file original.md --file edited.md

The report is advisory. Reading grades and sentence observations do not decide whether text should change.

Options:
  --file <path>            Add a text or Markdown file as an input. May be repeated.
  --reference <text>       Compare one input with original text for preservation.
  --reference-file <path>  Compare one input with an original file for preservation.
  --target <name>          ACCESSIBLE, NORMAL, or TECHNICAL thresholds. Default: NORMAL.
  --json                   Print structured JSON.
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  analyseText,
  calculateGrade,
  comparePreservation,
  isMarkdownPath,
  prepareInputText,
  stripMarkdownForReadability,
};
