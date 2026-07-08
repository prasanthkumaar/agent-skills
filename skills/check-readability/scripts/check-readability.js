#!/usr/bin/env node
"use strict";

const fs = require("fs");

const DEFAULT_MAX_GRADE = 9;
const DEFAULT_READING_TARGET = "NORMAL";

const READABILITY_THRESHOLDS = {
  ACCESSIBLE: {
    tooFewWordCount: 8,
    hardReadabilityLevel: 8,
    veryHardReadabilityLevel: 12,
  },
  NORMAL: {
    tooFewWordCount: 14,
    hardReadabilityLevel: 10,
    veryHardReadabilityLevel: 14,
  },
  TECHNICAL: {
    tooFewWordCount: 14,
    hardReadabilityLevel: 14,
    veryHardReadabilityLevel: 18,
  },
};

const SENTENCE_DELIMITER_SOURCE = String.raw`[.?!]{1,2}["”'\)]?(?:\s|$)|\n+`;
const WORD_DELIMITER_SOURCE = String.raw`[^\w'-]`;
const ABBREVIATION_AT_END = /\b(Mr|Ms|Mrs|Dr|U\.S|Col|Sgt|Lt|Adm|Maj|Sen|Rep|Jan|Feb|Apr|Mar|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|Pvt|Cpl|Capt|Gen|Ave|St|inc|ft|Gov|Jr|Sr|ltd|Rev|M|Mme|Prof|Pres|Hon|etc|vs|\.\.|e\.g|i\.e|a\.m|p\.m|[A-Z])$/;

const ADVERB_EXCEPTIONS = new Set([
  "actually",
  "ally",
  "apply",
  "assembly",
  "belly",
  "butterfly",
  "completely",
  "comply",
  "costly",
  "currently",
  "daily",
  "early",
  "elderly",
  "family",
  "finally",
  "friendly",
  "generally",
  "hardly",
  "holy",
  "immediately",
  "july",
  "kindly",
  "lately",
  "likely",
  "lively",
  "lonely",
  "lovely",
  "only",
  "particularly",
  "previously",
  "rarely",
  "recently",
  "reply",
  "shortly",
  "silly",
  "supply",
  "timely",
  "ugly",
  "unlikely",
  "usually",
  "weekly",
  "wholly",
  "yearly",
]);

const IRREGULAR_PARTICIPLES = new Set([
  "beaten",
  "been",
  "begun",
  "bent",
  "bitten",
  "blown",
  "bought",
  "broken",
  "brought",
  "built",
  "caught",
  "chosen",
  "done",
  "drawn",
  "driven",
  "eaten",
  "fallen",
  "felt",
  "found",
  "given",
  "grown",
  "held",
  "hidden",
  "known",
  "laid",
  "led",
  "left",
  "lost",
  "made",
  "meant",
  "paid",
  "proven",
  "read",
  "ridden",
  "risen",
  "run",
  "said",
  "seen",
  "sent",
  "shown",
  "sold",
  "spoken",
  "spent",
  "split",
  "stolen",
  "struck",
  "taken",
  "taught",
  "thought",
  "thrown",
  "told",
  "torn",
  "understood",
  "won",
  "worn",
  "written",
]);

const QUALIFIERS = new Set([
  "i believe",
  "i consider",
  "i don't believe",
  "i don't consider",
  "i don't feel",
  "i don't suggest",
  "i don't think",
  "i feel",
  "i hope to",
  "i might",
  "i suggest",
  "i think",
  "i was wondering",
  "i will try",
  "i wonder",
  "in my opinion",
  "is kind of",
  "is sort of",
  "just",
  "maybe",
  "perhaps",
  "possibly",
  "we believe",
  "we consider",
  "we don't believe",
  "we don't consider",
  "we don't feel",
  "we don't suggest",
  "we don't think",
  "we feel",
  "we hope to",
  "we might",
  "we suggest",
  "we think",
  "we were wondering",
  "we will try",
  "we wonder",
]);

const COMPLEX_ALTERNATIVES = new Map([
  ["additional", ["more", "extra"]],
  ["adjacent to", ["next to"]],
  ["advise", ["tell"]],
  ["approximately", ["about"]],
  ["ascertain", ["find out"]],
  ["assistance", ["help"]],
  ["at this time", ["now"]],
  ["commence", ["begin", "start"]],
  ["concerning", ["about"]],
  ["consequently", ["so"]],
  ["demonstrate", ["show", "prove"]],
  ["due to the fact that", ["because"]],
  ["eliminate", ["cut", "remove"]],
  ["endeavor", ["try"]],
  ["facilitate", ["help", "ease"]],
  ["for the purpose of", ["to"]],
  ["in addition", ["also"]],
  ["in order to", ["to"]],
  ["in regard to", ["about"]],
  ["in the near future", ["soon"]],
  ["indicate", ["say", "show"]],
  ["initiate", ["start"]],
  ["multiple", ["many"]],
  ["necessitate", ["need", "cause"]],
  ["nevertheless", ["still"]],
  ["numerous", ["many"]],
  ["obtain", ["get"]],
  ["participate", ["take part"]],
  ["pertaining to", ["about"]],
  ["previously", ["before"]],
  ["prior to", ["before"]],
  ["purchase", ["buy"]],
  ["regarding", ["about"]],
  ["require", ["need", "must"]],
  ["reside", ["live"]],
  ["sufficient", ["enough"]],
  ["terminate", ["end", "stop"]],
  ["therefore", ["so"]],
  ["transmit", ["send"]],
  ["utilise", ["use"]],
  ["utilize", ["use"]],
  ["with respect to", ["about"]],
]);

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    const text = readInput(options);
    const report = analyseText(text, options);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHumanReport(report);
    }

    process.exitCode = report.passes ? 0 : 1;
  } catch (error) {
    console.error(`check-readability: ${error.message}`);
    process.exitCode = 2;
  }
}

function parseArguments(args) {
  const options = {
    file: undefined,
    json: false,
    maxGrade: DEFAULT_MAX_GRADE,
    readingTarget: DEFAULT_READING_TARGET,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--file") {
      options.file = requireValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--max-grade") {
      const rawValue = requireValue(args, index, arg);
      const parsed = Number.parseInt(rawValue, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("--max-grade must be a non-negative integer");
      }
      options.maxGrade = parsed;
      index += 1;
      continue;
    }
    if (arg === "--target") {
      const target = requireValue(args, index, arg).toUpperCase();
      if (!READABILITY_THRESHOLDS[target]) {
        throw new Error("--target must be ACCESSIBLE, NORMAL, or TECHNICAL");
      }
      options.readingTarget = target;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    throw new Error(`unknown argument: ${arg}`);
  }

  return options;
}

function requireValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function readInput(options) {
  if (options.file && options.file !== "-") {
    return fs.readFileSync(options.file, "utf8");
  }

  if (!process.stdin.isTTY) {
    return fs.readFileSync(0, "utf8");
  }

  throw new Error("provide text on stdin or with --file");
}

function analyseText(text, options = {}) {
  const maxGrade = options.maxGrade ?? DEFAULT_MAX_GRADE;
  const readingTarget = normaliseReadingTarget(options.readingTarget);
  const parserSettings = { readingLevelTarget: readingTarget };
  const paragraphTexts = splitParagraphs(text);
  const paragraphs = paragraphTexts.map((paragraphText, index) =>
    analyseParagraph(paragraphText, index + 1, parserSettings),
  );

  const sentences = paragraphs.flatMap((paragraph) => paragraph.sentences);
  const totals = sumSentenceStats(sentences);
  const readingLevel = calculateGrade({
    letters: totals.letters,
    sentences: sentences.length,
    words: totals.words,
  });
  const readability = classifyReadability({
    parserSettings,
    readingLevel,
    words: totals.words,
  });
  const targetGradeBreaches = sentences.filter((sentence) => sentence.readingLevel > maxGrade);
  const veryHardSentences = sentences.filter((sentence) => sentence.readability === "veryHard");
  const hardSentences = sentences.filter((sentence) => sentence.readability === "hard");
  const complexWords = sentences.flatMap((sentence) => sentence.issues.complex);
  const qualifiers = sentences.flatMap((sentence) => sentence.issues.qualifiers);
  const adverbs = sentences.flatMap((sentence) => sentence.issues.adverbs);
  const passiveVoice = sentences.flatMap((sentence) => sentence.issues.passiveVoice);
  const passes =
    readingLevel <= maxGrade &&
    targetGradeBreaches.length === 0 &&
    veryHardSentences.length === 0;

  return {
    passes,
    target: {
      maxGrade,
      readingTarget,
    },
    stats: {
      adverbs: adverbs.length,
      characters: text.length,
      complexWords: complexWords.length,
      hardSentences: hardSentences.length,
      letters: totals.letters,
      paragraphs: paragraphs.length,
      passiveVoice: passiveVoice.length,
      qualifiers: qualifiers.length,
      readability,
      readingLevel,
      sentences: sentences.length,
      targetGradeBreaches: targetGradeBreaches.length,
      veryHardSentences: veryHardSentences.length,
      words: totals.words,
    },
    sentences,
    issues: {
      adverbs,
      complexWords,
      hardSentences,
      passiveVoice,
      qualifiers,
      targetGradeBreaches,
      veryHardSentences,
    },
  };
}

function normaliseReadingTarget(target) {
  const readingTarget = (target ?? DEFAULT_READING_TARGET).toUpperCase();
  if (!READABILITY_THRESHOLDS[readingTarget]) {
    throw new Error(`unknown reading target: ${target}`);
  }
  return readingTarget;
}

function splitParagraphs(text) {
  return text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function analyseParagraph(text, paragraphNumber, parserSettings) {
  const rawSentences = splitSentences(text);
  const sentences = rawSentences.map((sentenceText, index) =>
    analyseSentence(sentenceText, {
      parserSettings,
      paragraphNumber,
      sentenceNumber: index + 1,
    }),
  );

  return {
    paragraphNumber,
    sentences,
    text,
  };
}

function splitSentences(text) {
  const parts = splitWithDelimiters(text, SENTENCE_DELIMITER_SOURCE);
  const sentences = [];

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (isDelimiter(part, SENTENCE_DELIMITER_SOURCE) || part.trim().length === 0) {
      continue;
    }

    let sentenceText = part;
    while (ABBREVIATION_AT_END.test(sentenceText) && parts[index + 1] && parts[index + 2]) {
      sentenceText += parts[index + 1] + parts[index + 2];
      index += 2;
    }

    sentences.push(sentenceText.trim());
  }

  return sentences;
}

function analyseSentence(text, context) {
  const words = splitWords(text);
  const letters = countLetters(words);
  const readingLevel = calculateGrade({
    letters,
    sentences: 1,
    words: words.length,
  });
  const readability = classifyReadability({
    parserSettings: context.parserSettings,
    readingLevel,
    words: words.length,
  });

  return {
    paragraphNumber: context.paragraphNumber,
    sentenceNumber: context.sentenceNumber,
    text,
    stats: {
      letters,
      words: words.length,
    },
    readability,
    readingLevel,
    issues: detectIssues(text, words),
  };
}

function splitWithDelimiters(text, delimiterSource) {
  return text.split(new RegExp(`(${delimiterSource})`, "g"));
}

function isDelimiter(value, delimiterSource) {
  return new RegExp(delimiterSource).test(value);
}

function splitWords(text) {
  return splitWithDelimiters(text, WORD_DELIMITER_SOURCE).filter((part) => {
    return !isDelimiter(part, WORD_DELIMITER_SOURCE) && part.trim().length > 0;
  });
}

function countLetters(words) {
  let letters = 0;
  for (const word of words) {
    const matches = word.match(/\w/g);
    letters += matches ? matches.length : 0;
  }
  return letters;
}

function calculateGrade({ letters, sentences, words }) {
  if (words === 0 || sentences === 0) {
    return 0;
  }

  return Math.max(Math.round((letters / words) * 4.71 + (words / sentences) * 0.5 - 21.43), 0);
}

function classifyReadability({ parserSettings, readingLevel, words }) {
  const thresholds = READABILITY_THRESHOLDS[parserSettings.readingLevelTarget];

  if (words < thresholds.tooFewWordCount) {
    return "normal";
  }
  if (readingLevel >= thresholds.veryHardReadabilityLevel) {
    return "veryHard";
  }
  if (readingLevel >= thresholds.hardReadabilityLevel) {
    return "hard";
  }
  return "normal";
}

function sumSentenceStats(sentences) {
  const totals = {
    letters: 0,
    words: 0,
  };

  for (const sentence of sentences) {
    totals.letters += sentence.stats.letters;
    totals.words += sentence.stats.words;
  }

  return totals;
}

function detectIssues(text, words) {
  return {
    adverbs: detectAdverbs(words),
    complex: detectComplexAlternatives(text),
    passiveVoice: detectPassiveVoice(text),
    qualifiers: detectQualifiers(text),
  };
}

function detectAdverbs(words) {
  return words
    .filter((word) => /ly$/i.test(word))
    .filter((word) => !ADVERB_EXCEPTIONS.has(word.toLowerCase()));
}

function detectPassiveVoice(text) {
  const matches = text.match(/(^|\s)(is|are|was|were|be|been|being)\s([a-z]{2,30})\b(\sby\b)?/gi);
  if (!matches) {
    return [];
  }

  return matches
    .map((match) => match.trim())
    .filter((match) => {
      const participleMatch = match.match(/([a-z]+)\b(\sby\b)?$/i);
      if (!participleMatch) {
        return false;
      }

      const participle = participleMatch[1].toLowerCase();
      return participle.endsWith("ed") || IRREGULAR_PARTICIPLES.has(participle);
    });
}

function detectQualifiers(text) {
  return detectPhrases(text, QUALIFIERS).map((match) => match.phrase);
}

function detectComplexAlternatives(text) {
  return detectPhrases(text, new Set(COMPLEX_ALTERNATIVES.keys())).map((match) => ({
    phrase: match.phrase,
    alternatives: COMPLEX_ALTERNATIVES.get(match.phrase),
  }));
}

function detectPhrases(text, phrases) {
  const words = [];
  const wordPattern = /\b[\w'-]+\b/gi;
  let match;

  while ((match = wordPattern.exec(text)) !== null) {
    words.push({
      index: match.index,
      text: match[0],
    });
  }

  const matches = [];
  for (let index = 0; index < words.length; index += 1) {
    const candidates = buildPhraseCandidates(words, index);
    for (const candidate of candidates) {
      const lowerPhrase = candidate.phrase.toLowerCase();
      if (phrases.has(lowerPhrase)) {
        matches.push({
          phrase: lowerPhrase,
          index: candidate.index,
        });
        break;
      }
    }
  }

  return matches;
}

function buildPhraseCandidates(words, startIndex) {
  const candidates = [];
  let phrase = "";

  for (let offset = 0; offset < 4 && words[startIndex + offset]; offset += 1) {
    phrase = offset === 0 ? words[startIndex].text : `${phrase} ${words[startIndex + offset].text}`;
    candidates.push({
      index: words[startIndex].index,
      phrase,
    });
  }

  return candidates.reverse();
}

function printHumanReport(report) {
  const status = report.passes ? "PASS" : "FAIL";
  console.log(`Readability: ${status}`);
  console.log(`Grade: ${report.stats.readingLevel} (target <= ${report.target.maxGrade})`);
  console.log(
    `Words: ${report.stats.words} | Sentences: ${report.stats.sentences} | Letters: ${report.stats.letters}`,
  );
  console.log(
    `Hard: ${report.stats.hardSentences} | Very hard: ${report.stats.veryHardSentences} | Above target: ${report.stats.targetGradeBreaches}`,
  );
  console.log(
    `Adverbs: ${report.stats.adverbs} | Passive voice: ${report.stats.passiveVoice} | Qualifiers: ${report.stats.qualifiers} | Simpler alternatives: ${report.stats.complexWords}`,
  );

  const sentencesToRevise = report.issues.targetGradeBreaches;
  if (sentencesToRevise.length > 0) {
    console.log("");
    console.log("Sentences to revise:");
    for (const sentence of sentencesToRevise) {
      console.log(
        `${sentence.paragraphNumber}.${sentence.sentenceNumber} Grade ${sentence.readingLevel}, ${sentence.readability}, ${sentence.stats.words} words: ${sentence.text}`,
      );
    }
  }
}

function printHelp() {
  console.log(`Usage:
  check-readability.js --file <path> [--max-grade 9] [--target NORMAL] [--json]
  cat text.txt | check-readability.js [--max-grade 9]

Options:
  --file <path>       Read text from a file. Use "-" for stdin.
  --max-grade <n>     Required maximum document and sentence grade. Default: 9.
  --target <name>     ACCESSIBLE, NORMAL, or TECHNICAL Hemingway thresholds. Default: NORMAL.
  --json              Print structured JSON.
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  analyseText,
  calculateGrade,
  classifyReadability,
  splitSentences,
  splitWords,
};
