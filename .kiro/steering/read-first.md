---
inclusion: always
---

# Read AGENTS.md and the skills first

Workflow and custom-agent sessions may start without this repository's skills in their list. On 2026-10-05 a workflow
step session received this kind of steering file and no skills.

Working in a git worktree under `.worktrees/`, read every file named below from inside that worktree. The main
checkout's copies can differ.

Before starting any work here:

1. Read `AGENTS.md` at the root of the checkout you are working in, unless it is already in your context. Its rules
   hold in every session.
2. Read the skills that apply from `.kiro/skills/<name>/SKILL.md`, whether or not your session lists them:
   - `project-docs` for `docs/design.md`, `docs/delivery-plan.md` or anything in `docs/decisions/`
   - `review` for `/review`, before anything substantial ships, or to replay a season in the browser
   - `writing-code` for any code
   - `codebase-conventions` for any code under `src/`
   - `f1-rules` for points, standings, tiebreaks, classification, sprints, the calendar or Jolpica data
3. Say which ones you read.
