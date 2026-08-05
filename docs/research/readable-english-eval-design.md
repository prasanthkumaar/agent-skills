# Designing an eval for readable English without oversimplification

## Recommendation

Build a small regression set that asks one question: does the skill make the minimum change needed for this audience and purpose while preserving the writer's meaning?

Use twelve cases across realistic genres. Include text that should remain unchanged, text with one concrete clarity problem, and text that is easy to damage by simplifying it. Run deterministic checks for facts and structure, then use a separately calibrated LLM judge for clarity and editorial judgement. Do not use a reading grade or Hemingway warning as a pass condition.

## What readable English means

Readable English is audience-specific. The US Government's plain-language guidance explicitly says that plain language does not mean “dumbing down” content and that writers should account for the audience's knowledge and expertise ([Digital.gov, Principles of plain language](https://digital.gov/guides/plain-language/principles)). The UK Department for Education similarly permits specialist terminology when users need it, with an explanation only when the audience requires one ([DfE, Guidance to meet the Plain Language standard](https://design.education.gov.uk/content-design/plain-language)).

The skill should therefore optimise for:

1. **Meaning preservation:** retain facts, quantities, conditions, uncertainty, scope, commitments and necessary technical terms.
2. **Clearer reading:** fix an identifiable obstacle such as an ambiguous actor, buried condition, weak verb, overloaded sentence or poor information order.
3. **Minimum necessary change:** leave already-readable text alone and stop editing once the obstacle is removed.
4. **Fitness for the genre:** preserve the purpose, expected information and Markdown structure of the document.

These dimensions must be assessed separately. Research on document simplification finds that simplicity and meaning preservation can move in opposite directions, so combining them into one score can hide damaging simplification ([Cripwell, Legrand and Gardent, 2024](https://aclanthology.org/2024.readi-1.1/)). A TACL human study also found that sentence-level judgements can miss meaning lost in the surrounding document; it used reading-comprehension questions to test what readers could still recover ([Agrawal and Carpuat, 2024](https://aclanthology.org/2024.tacl-1.24/)).

## How Hemingway should inform the eval

Hemingway is useful as a diagnostic source, not as the definition of success. Its official guidance says:

- highlights are guides and writers need not fix every warning;
- some long sentences work because they express a narrative or chain of logic;
- excessive concision can make prose choppy;
- Grade 9 is its general default, but it offers a higher target for technical and academic writing.

These points appear in Hemingway's [readability guidance](https://hemingwayapp.com/help/docs/readability) and [quick-start guide](https://hemingwayapp.com/help/docs/quick-start-guide). Its highlighted issues, including long sentences, passive voice, adverbs, qualifiers and complex alternatives, are useful candidate locations ([Hemingway, Highlighted issues](https://hemingwayapp.com/help/docs/highlighted-issues)). They are not proof that an edit is required.

Other official guidance supports this contextual treatment. Digital.gov notes that passive voice can be appropriate when there is no relevant actor ([Writing for understanding](https://digital.gov/guides/plain-language/writing)). UK Parliamentary Counsel says negative phrasing and passive voice both have valid uses, depending on the rule being expressed and whether the actor matters ([Drafting guidance, sections 1.2.2–1.2.7](https://www.gov.uk/government/publications/drafting-bills-for-parliament/2024-03-19-drafting-guidance)).

Therefore a checker may flag a location, but the model must name the actual clarity problem before editing. It may ignore every warning.

## Case construction

Each case should be short enough to understand directly and should isolate one editorial decision. Use source-inspired original examples rather than copying published prose.

Use three archetypes:

- **No-op:** the input is already fit for its audience. Any material rewrite is a regression.
- **Local repair:** one specific obstacle should be fixed with a small edit.
- **Preservation trap:** a plausible “simplification” would drop a qualifier, condition, technical term, rationale, limitation or document structure.

Every editable case needs one defensible reference answer, but the judge should accept other answers that satisfy the same contract. Every case also needs a short list of protected content suitable for deterministic checking. Avoid long annotations, constructed bad answers and duplicated metadata.

## Recommended twelve-case matrix

| # | Genre | Archetype | What the case tests |
|---|---|---|---|
| 1 | Phrase | No-op | Keep a precise technical phrase unchanged. |
| 2 | Phrase | Local repair | Replace a wordy nominalisation without changing intent. |
| 3 | Sentence | No-op | Keep a long but coherent chain of logic. |
| 4 | Sentence | Local repair | Make an ambiguous actor explicit. |
| 5 | Instruction | Preservation trap | Improve ordering while retaining the condition before the action. |
| 6 | Instruction | No-op | Keep appropriate passive voice when the actor is unknown or irrelevant. |
| 7 | Technical documentation | Local repair | Clarify a dense explanation while preserving API names and code formatting. |
| 8 | Technical documentation | Preservation trap | Retain numbers, uncertainty and an operational limitation. |
| 9 | PR description | Local repair | Replace a vague summary with what changed and why. |
| 10 | PR description | Preservation trap | Improve scanning without dropping trade-offs, testing or known shortcomings. |
| 11 | Research plan | Preservation trap | Clarify an aim while retaining hypothesis, method, expected outcome and contingency. |
| 12 | Structured Markdown page | Local repair | Repair one overloaded section while preserving headings, lists, links and the rest of the page. |

This genre coverage follows first-party advice. Google says a change description should explain what changed, why, context and shortcomings; brevity alone is insufficient ([Google Engineering Practices, Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)). NIH says a research plan must preserve Specific Aims, expected outcomes and the Significance, Innovation and Approach structure for reviewers with different levels of subject expertise ([NIH, Advice on Application Sections](https://www.grants.nih.gov/grants-process/write-application/advice-on-application-sections)). Google's technical-writing guidance covers strong verbs, audience, procedures, paragraphs, documents and Markdown, while warning that even a form of “be” can be the right choice ([Google, Clear sentences](https://developers.google.com/tech-writing/one/clear-sentences)).

## Lean JSON shape

Keep the data file easy to review:

```json
{
  "id": "pr-description-local-repair",
  "genre": "pr-description",
  "input": "...",
  "expected": "...",
  "preserve": ["..."],
  "source": "https://..."
}
```

For a no-op case, `expected` should equal `input`. `preserve` should contain only literals or relationships that a deterministic test can check. `source` records the public guidance that motivated the case, not the provenance of copied text.

## How to grade outputs

### Deterministic checks

Use these only for properties a script can establish reliably:

- required technical terms, names, numbers and modal words remain;
- Markdown headings, links, lists and code spans remain valid;
- no-op outputs stay within a very small edit distance from the input;
- output is non-empty and contains no commentary around the rewritten text.

Do not fail an output for its grade level, sentence length, passive voice, adverbs or qualifiers. The CDC says readability formulas mechanically count syllables and sentences but do not account for audience, purpose or most contributors to comprehension ([CDC, Readability formulas](https://www.cdc.gov/ccindex/tool/index-different.html)).

### LLM judge

Give a fresh model the input, candidate, reference and case contract. Require separate judgements for:

1. meaning preserved;
2. concrete clarity problem fixed, or valid no-op;
3. no oversimplification;
4. minimum necessary change;
5. genre and formatting preserved.

All five should pass. Do not average away a meaning failure. Calibrate the judge against trusted human labels and include both good and bad outputs. OpenAI recommends high-quality expert answers, ground-truth grades and adding edge cases as grader failures are discovered ([OpenAI, Graders](https://developers.openai.com/api/docs/guides/graders#how-to-write-grader-prompts)). Google Stax likewise recommends a task-specific rubric and calibration against human ratings rather than relying on a generic evaluator ([Google Stax, Evaluators](https://developers.google.com/stax/evaluators)).

## What this eval can and cannot establish

The eval can detect regressions on these twelve known editorial decisions. It can show whether a new prompt is more likely to leave clear prose alone, make small useful repairs and preserve protected meaning across representative genres.

It cannot prove that every future rewrite will be readable for every audience. Digital.gov recommends paraphrase and usability testing for real reader understanding, especially for longer documents ([Test for understanding](https://digital.gov/guides/plain-language/test)). Production failures should therefore become new regression cases, and important public-facing documents still need review by their intended readers.
