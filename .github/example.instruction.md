# Prompt Output Format - Instructions for AI Sessions

> This file defines the exact format, structure, tone, and rules that must be followed
> when generating Copilot/AI prompts for this project owner.
> Always read this file at the start of a session before writing any prompt.

---

## 1. What These Prompts Are For

These prompts are task briefs for AI coding assistants working on a Svelte project. They are written to be pasted directly into GitHub Copilot Chat (or similar tools) and executed without additional clarification. The owner expects strict scope control, explicit implementation constraints, and concrete output verification steps. Prompt text is operational, not conversational: it tells the AI exactly what to do, what not to do, where to work, and how to report completion. The examples show a repeatable structure that minimizes ambiguity and prevents out-of-scope changes.

---

## 2. Prompt Opening Formula

### Required Rule (seen in 5/5 examples)

- Line 1: assign senior role + task type + project tech/context.
- Line 2: explicit scope limiter with `NOT` / `DO NOT`.
- Line 3: explicit scope focus with `ONLY` / exact deliverable.

Reusable opening template:

```text
You are a senior [discipline] engineer performing a [TASK TYPE] on a [tech stack] project.
Your task is NOT to [out-of-scope actions].
Your task is ONLY to [in-scope objective].
```

Extracted opening examples:

1. `You are a senior frontend engineer performing a codebase refactor.`
2. `Your task is NOT to redesign the UI or change any visual appearance.`
3. `Your task is ONLY to replace raw HTML elements with existing reusable common components - while keeping the UI 100% identical.`

---

## 3. Section Structure & Formatting Rules

### Required Rules (seen in 3+ examples)

- Main sections use uppercase titles wrapped by separator lines:

```text
=====================
SECTION TITLE
=====================
```

- Prompts are segmented into discrete instruction blocks (`OBJECTIVE`, `RULES`, `SCOPE`, `OUTPUT EXPECTATION`).
- Numbered lists are used for procedural or mandatory rules.
- `DO NOT` appears in uppercase for hard constraints.
- File paths and component names are written as exact literals (for example `src/lib/components/common/`).
- `OUTPUT EXPECTATION` is presented as the final structured section.

### Common Patterns (seen in 1-2 examples)

- Heavy subsection dividers with box-drawing lines are used for sub-features in long prompts:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBSECTION TITLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Code blocks are used when precision is required: file trees, CSS token examples, HTML/layout scaffolds.
- Bullets are used for short lists of targets or forbidden items; numbered lists are used when order/completeness matters.

Formatting details observed:

- One blank line typically separates sections and section headers.
- Indentation is literal and aligned in tree/snippet examples (2 spaces for nested list items in several examples).
- Angle-bracket element examples (`<input>`, `<button>`) are shown inline when mapping replacements.

---

## 4. Standard Sections & When to Include Them

Legend:

- `REQUIRED`: observed in 3+ examples
- `COMMON`: observed in 1-2 examples

| Section Name | Refactor | Bug Fix | New Feature | UI/Styling | Doc Generation |
|-------------------------------|----------|---------|-------------|------------|----------------|
| OBJECTIVE | REQUIRED | COMMON | REQUIRED | COMMON | COMMON |
| PROJECT STRUCTURE | COMMON | ❌ | ❌ | ❌ | ❌ |
| REFACTOR RULES / CRITICAL RULES | REQUIRED | ❌ | COMMON (`GENERAL RULES`) | ❌ | ❌ |
| FEATURE N SECTIONING | ❌ | ❌ | REQUIRED | ❌ | ❌ |
| CURRENT PROBLEM | ❌ | REQUIRED | ❌ | ❌ | ❌ |
| EXPECTED BEHAVIOR AFTER FIX | ❌ | REQUIRED | ❌ | ❌ | ❌ |
| HOW TO FIX | ❌ | REQUIRED | ❌ | ❌ | ❌ |
| SCOPE | COMMON | REQUIRED | COMMON (`Do NOT change outside`) | ❌ | COMMON (`SCAN TARGETS`) |
| STRICTLY FORBIDDEN | COMMON | ❌ | ❌ | REQUIRED | ❌ |
| TOKEN FILE | ❌ | ❌ | ❌ | REQUIRED | ❌ |
| COMPONENT-BY-COMPONENT CHANGES | ❌ | ❌ | ❌ | REQUIRED | ❌ |
| SCAN TARGETS | COMMON | ❌ | COMMON (location-specific) | ❌ | COMMON |
| OUTPUT EXPECTATION | REQUIRED | REQUIRED | REQUIRED | REQUIRED | COMMON |

Note: No standalone documentation-generation prompt was included in the five reference examples, so `Doc Generation` entries are marked as common only where structurally implied by scan/output patterns.

---

## 5. OUTPUT EXPECTATION Rules

### Required Rules (seen in 5/5 examples)

- Must be the last formal section before any final one-line instruction.
- Must use a numbered list (`1.`, `2.`, `3.`), not bullets.
- Each item must be a verifiable deliverable or confirmation.
- Keep concise and concrete (typically 3-4 items in examples).

### Common Pattern (seen in 1 example)

- Use checkmark confirmations for bug-resolution outcomes (`✅ ...`).

Template:

```text
=====================
OUTPUT EXPECTATION
=====================
1. [Concrete output artifact]
2. [Concrete per-file/per-feature confirmation]
3. [Constraint compliance confirmation]
4. [Final validation statement]
```

Extracted examples:

1. `List every file modified.`
2. `Confirm all 3 bugs resolved: ✅ Chat list 100vh ✅ No page scroll ✅ Column 3 scrolls independently.`

---

## 6. Scope Limiter Rules (What NOT to Change)

### Required Rules (seen in 5/5 examples)

- Scope limits are declared at the top before main sections.
- Negative constraints use strong command verbs: `Do NOT`, `DO NOT`, `must NOT`.
- Scope limits are specific to risk type, not generic.

### Required Rule by prompt type

- Refactor prompts: prohibit feature creation/redesign and preserve behavior.
- Bug-fix prompts: prohibit new features and visual/logic changes outside layout bug scope.
- Feature prompts: prohibit unrelated refactor and out-of-scope file changes.
- Styling prompts: prohibit logic/routing/store/layout changes.

### Common Pattern (seen in 2/5 examples)

- Add a dedicated `STRICTLY FORBIDDEN` block when visual scope-drift risk is high.

---

## 7. Tone & Language Rules

### Required Rules (seen in 5/5 examples)

- Use imperative, execution-focused language (`Scan`, `Implement`, `Create`, `Fix`, `Confirm`).
- Avoid polite softeners and hedging.
- Use explicit technical nouns: exact paths, exact component names, exact element names.
- Express constraints as binary rules, not suggestions.
- Keep task statements concrete (`Min 40s, Max 480s, Step 10s`) instead of abstract quality adjectives.

### Common Patterns (seen in 1-2 examples)

- Include quick rationales in parenthetical notes when needed (`(same level as pages)`).
- Include before/after replacement examples when standardizing components.
- Close with an operator-style mindset sentence when appropriate (`Act like a careful refactoring engineer, not a generator.`).

---

## 8. Prompt Type Templates

### Refactor Prompt Template

```text
You are a senior frontend engineer performing a [REFACTOR TYPE] on a [TECH] project.
Your task is NOT to [out-of-scope changes].
Your task is ONLY to [refactor scope].

=====================
OBJECTIVE
=====================
[scan target + refactor objective]

=====================
REFACTOR RULES
=====================
1. ...
2. ...
3. ...

=====================
SCAN TARGETS
=====================
[folders/files to scan + excludes]

=====================
OUTPUT EXPECTATION
=====================
1. ...
2. ...
3. ...
```

### Bug Fix Prompt Template

```text
You are a senior frontend engineer fixing a [BUG TYPE] in a [TECH] page/module.
Do NOT add new features. Do NOT change [non-target areas].
Fix ONLY [bug scope].

=====================
CURRENT PROBLEM
=====================
BUG 1 - ...
BUG 2 - ...

=====================
EXPECTED BEHAVIOR AFTER FIX
=====================
1. ...
2. ...
3. ...

=====================
HOW TO FIX
=====================
[required layout/code structure]

=====================
SCOPE
=====================
[files likely touched + forbidden areas]

=====================
OUTPUT EXPECTATION
=====================
1. ...
2. ...
3. ...
```

### New Feature Prompt Template

```text
You are a senior frontend engineer implementing [N] new UI features in a [TECH] project.
Do NOT refactor unrelated code.
Implement ONLY what is described below.

=====================
FEATURE 1 - [NAME]
=====================
LOCATION: ...
TASK: ...
IMPLEMENTATION REQUIREMENTS:
1. ...
2. ...

=====================
FEATURE 2 - [NAME]
=====================
LOCATION: ...
TASK: ...
IMPLEMENTATION REQUIREMENTS:
1. ...
2. ...

=====================
GENERAL RULES (APPLY TO BOTH FEATURES)
=====================
- ...

=====================
OUTPUT EXPECTATION
=====================
1. ...
2. ...
3. ...
```

### UI / Styling Prompt Template

```text
You are a senior UI engineer performing a [STYLING UPGRADE] on a [TECH] application.
Your task is ONLY to upgrade the visual layer.
You must NOT touch logic/routing/stores/layout structure.

=====================
TOKEN FILE
=====================
[create token file + import location + variable examples]

=====================
COMPONENT-BY-COMPONENT CHANGES
=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [AREA]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[exact visual changes]

=====================
STRICTLY FORBIDDEN
=====================
- ...
- ...

=====================
OUTPUT EXPECTATION
=====================
1. ...
2. ...
3. ...
4. ...
```

### Documentation Generation Prompt Template

```text
You are a senior technical writer and prompt engineer.
Your task is NOT to invent or assume missing details.
Your task is ONLY to analyze provided source examples and generate a reusable instruction file.

=====================
OBJECTIVE
=====================
[what the instruction file must teach]

=====================
SCAN TARGETS
=====================
[which examples/sources to analyze]

=====================
GENERATION RULES
=====================
1. ...
2. ...
3. ...

=====================
OUTPUT EXPECTATION
=====================
1. [target file overwritten]
2. [format compliance confirmation]
3. [summary confirmation]
```

---

## 9. Rules Summary (Quick Reference for AI)

- [ ] Start with role assignment + scope limiter + only-scope line.
- [ ] Use `=====================` blocks for main sections.
- [ ] Use `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` subsection dividers only for large sub-areas.
- [ ] Keep constraints explicit with `DO NOT` wording.
- [ ] Use numbered rules for mandatory steps; use bullets for short non-sequential lists.
- [ ] Include exact file paths and exact component/element names.
- [ ] Keep each feature/bug area isolated in its own section.
- [ ] End with `OUTPUT EXPECTATION` as the final formal section.
- [ ] Write `OUTPUT EXPECTATION` as numbered, verifiable deliverables.
- [ ] Add `STRICTLY FORBIDDEN` for high-risk scope drift (especially styling prompts).
- [ ] Include concrete parameters (sizes, min/max, defaults, steps) instead of vague wording.
- [ ] Use code blocks for trees, token samples, or structural fix blueprints.
- [ ] Add a final mindset line when useful (for example `Act like a careful refactoring engineer, not a generator.`).

---

*Last updated: 2026-04-04*
*This file is auto-maintained - update it when the user approves a new prompt format.*

---
