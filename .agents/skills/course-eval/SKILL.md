---
name: course-eval
description: Evaluate this checkout course repository against REQUIREMENTS.md and PLAN.md and report evidence without fixing the project.
---

Evaluate, do not repair. No edits to source, config, requirements, fixtures, or
docs. No installs, no deletions. Build/test caches are fine. If something can't
be inspected, say so — never guess.

## Procedure

1. Read `REQUIREMENTS.md` and `PLAN.md`. Derive the acceptance checks from them,
   including any Requirements Update; obsolete rules must not still be active.
2. Independent review. If the Task tool is available, launch a subagent
   `course-reviewer` with a self-contained prompt: the repo path, the derived
   acceptance checks restated in full, and the instruction to verify file evidence
   only — no commands, no edits, file path required in every finding.
   The subagent inherits no context; anything it needs must be in the prompt.
   If the Task tool is NOT available, do not simulate a reviewer. Score the
   independent review area 0 and record the reason as
   "no subagent capability in this runtime".
3. Run `npm run build` and `npm run test:ci` yourself — the reviewer cannot.
4. Additionally verify: every application file traces to a file named in
   `PLAN.md` or the Requirements Update; no file diverges from `PLAN.md` without
   documented human approval; no real personal data or credentials anywhere.

## Scoring

Score five areas — planning and controls, application and validation,
persistence and data workflow, independent review, final verification.
1 point verified, 0.5 partial, 0 missing/failed/unverifiable with reason.
Completeness = earned/available, whole number. Failed build or test is blocking.

## Output

`# COURSE EVALUATION`, overall completeness, READY/NOT READY, blocking count,
then a five-row table (area, status, points, evidence, action) followed by
verification commands, verified artifacts, risks, and exact next actions.
Reviewer wording is not evidence; cited files and command output are.
