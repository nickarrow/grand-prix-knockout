---
inclusion: always
---

# Read AGENTS.md and the skills first

Workflow and custom-agent sessions may start without this repository's skills in their list. On 2026-10-05 a workflow
step session received this kind of steering file and no skills. So before starting any work here:

1. Read `AGENTS.md` at the repository root, unless it is already in your context. Its rules hold in every session.
2. Read the skills that apply from `.kiro/skills/<name>/SKILL.md`, whether or not your session lists them:
   - `project-docs` for `docs/design.md`, `docs/delivery-plan.md` or anything in `docs/decisions/`
   - `review` for `/review`, or before anything substantial ships
   - `writing-code` for any code
   - `codebase-conventions` for any code under `src/`
   - `f1-rules` for points, standings, tiebreaks, classification, sprints, the calendar or Jolpica data
3. Say which ones you read.

Working in a git worktree under `.worktrees/`, read the copies inside that worktree. They can differ from the ones in
the main checkout.
