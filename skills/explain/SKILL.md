---
name: explain
description: Explains unfamiliar technical subjects from zero context, starting with the big picture and progressively moving into mechanics and syntax. Use when the user wants to understand a concept, codebase, documentation, system, or code without assumed prior knowledge.
---

# Explain

Use this skill as `/explain`.

This skill is standalone. Do not invoke, require, or refer to another skill.

## Reader assumption

Assume the reader has zero prior knowledge of:

- the subject;
- the codebase or documentation;
- its architecture and terminology;
- the programming language or syntax shown.

Do not infer knowledge from the wording of the request or from technical terms
the user repeats. Skip foundational context only when the user explicitly says
they already understand it.

## Explanation flow

Explain from the outside in:

1. State what this is, what problem it solves, and why it exists.
2. Show where it fits in the larger subject or system.
3. Introduce the few important parts and how they relate.
4. Trace one concrete example from beginning to end.
5. Explain the mechanics behind that example.
6. Decode relevant code, syntax, symbols, or notation.
7. Add edge cases and deeper details last.
8. Finish with a short summary of what matters most.

Use a connected narrative with descriptive headings. Do not organise the
response as Q&A, even when the user asks several questions. Answer those
questions within the explanation.

## Source-specific orientation

For a codebase, begin with its purpose, entry points, major components, and
overall data or control flow before discussing individual files or functions.

For documentation, begin with the product or concept, its mental model, the
typical workflow, and how the relevant sections fit together.

For a general technical concept, begin with the problem it solves and its place
among related concepts before explaining its internal mechanics.

## Language

Use ordinary, direct language. Avoid jargon and insider shorthand.

Use a technical term only when it is the precise name needed for accuracy.
Define it immediately in ordinary language on first use. Never use one
unexplained technical term to define another. Expand acronyms on first use.

Assume syntax may also be unfamiliar. Explain what important keywords,
operators, symbols, and code structures mean and what role they play. Connect
the syntax to the larger behaviour instead of merely paraphrasing code line by
line.

## Grounding

Link claims to relevant documentation, files, or source lines when available.
Separate facts supported by the source from interpretation. Say clearly when
the available evidence does not support a conclusion.

## Example shape

For a caching explanation, first describe why repeated work is wasteful and
where caching fits. Then map the requester, cache, and original data source;
trace one cache miss and one cache hit; explain the relevant code or syntax;
and finish with the main trade-offs.

Do not begin with a cache API, a list of definitions, or separate answers to
isolated questions.
