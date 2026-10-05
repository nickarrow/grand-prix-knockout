---
name: project-docs
description: Use when writing or updating a design document, a delivery plan, or a decision record. Also use when asked to write down a plan, the order of work, a sequence of increments, requirements, or what has been decided so far. Covers the three documents this practice keeps, what each is for, the shape of a delivery plan entry, and when a decision deserves its own record. In this repository they live in docs/design.md, docs/delivery-plan.md and docs/decisions/.
---

# The three documents

A project keeps three kinds of document. Three, not six. The commonest failure is a fourth document that overlaps two of
these and then goes stale quietly.

| Document         | Where                                | Job                                               | Lifecycle                                 |
| ---------------- | ------------------------------------ | ------------------------------------------------- | ----------------------------------------- |
| Design document  | `docs/design.md`                     | What is being built, why, and what has to be true | Stable. Revised deliberately, argued with |
| Delivery plan    | `docs/delivery-plan.md`              | In what order, and what is done so far            | Living. Updated as work lands             |
| Decision records | `docs/decisions/NNNN-short-title.md` | A choice made along the way, and why              | Append-only. Superseded, never edited     |

## The design document

One document, `docs/design.md`. It covers what the thing is, who it is for, what counts as working, what it will not do,
and what has to be true for it to work at all. It holds the requirements rather than putting them in a separate file.

Leave the how to the reader and to the agent. The design document says a game has to be drivable from across a room with
no mouse. It does not say which key handler to use.

Do not split it to make it shorter. The file-length target in the `writing-code` skill is about code. A design document
is one argument, and cutting it into four files is how the argument stops being followable. If it is genuinely covering
two products, that is two design documents, and the giveaway is that neither half refers to the other.

Mark anything inferred rather than confirmed. A document that reads as uniformly confident is worse than one that shows
where to be careful, because somebody will act on the wrong half of it.

Sequencing stays out. That is the delivery plan's job, and keeping them apart is what stops a stale assumption hiding
inside a task list.

## The delivery plan

An ordered list of increments in `docs/delivery-plan.md`. An increment is a chunk of work that leaves the thing running
and better than before.

On the word. This is what Scrum would call a sprint's worth of work, what Kiro's own specs put in `tasks.md`, and what
the AI-DLC method calls a Bolt. It is scoped by what ships rather than by how long it takes, which is why it is not
called a sprint: there is no fixed length and asking how long one is has no answer.

The plan is also the progress tracker. It is the one place to look to find out where the work is. Do not keep a second
status document.

Give each increment a checkbox in a list at the top, so the state is visible without reading the file, and mark it when
the increment lands.

Then one section per increment, in this shape:

**Delivers.** What exists at the end that did not exist before. Concrete.

**Deliberately not.** What a reader might expect in this increment and will not get. This is the field that stops scope
creeping, and it is the one most often left out.

**Why this shape.** Why this work, in this order. If the answer is only "it comes next", the increment is probably two
increments or none.

**How you know it worked.** An observable. Something a person can look at and see. Not "tests pass" unless you name
which test and what it asserts.

**Needs from you.** Anything the human has to supply: a credential, a decision, permission to install something. Put it
here before starting rather than discovering it halfway.

**Done, [date].** Appended when it lands. What was observed, what was deviated from, what is still unverified.

The first increment should be thin and touch every layer, so it proves the pipeline before anything depends on it.

Two things belong once at the top rather than repeated in every increment. Prerequisites, checked rather than assumed,
with the state of each. And standing constraints, meaning the rules that hold across all of them.

If an increment changes the design, update the design document in the same breath. A plan that has moved on from the
design above it is the most common way these two documents start lying.

## Decision records

One small numbered file per decision, in `docs/decisions/`, named with a four-digit number and a short title, for
example `docs/decisions/0001-official-points-no-pole-point.md`. The form is Michael Nygard's architecture decision
record, from November 2011: a title, the context, the decision, a status, and the consequences. Add the date, which his
version does not ask for and which matters more when a session can produce several in an afternoon.

Write one when either of these is true:

- The decision changes something already written down in the design document or the delivery plan.
- You rejected an alternative that was genuinely plausible, and somebody later will wonder why.

Everything else is a line in the delivery plan entry. Without that trigger you get either no decision records at all or
twenty-five of them, and both are useless.

Never edit a decision record to make the past look tidier. Write a new one and set the old one's status to superseded,
naming the record that replaced it. The direction of a change is evidence.

## What this is not

This is deliberately not Kiro's spec workflow, which splits `requirements.md`, `design.md` and `tasks.md` and walks
three phases with an approval gate at each, or skips the gates entirely if you ask for a quick spec. Use that instead if
you want it, and it has real advantages: the task list gets a live execution view and Kiro will run independent tasks
concurrently. The difference here is that requirements stay inside the design document, because for a small project run
by one person the split produced three files that had to agree with each other and gave nothing back.

It is also not the full AI-DLC method, which is built for a cross-functional team elaborating in one room and says so.
If you have that team, read AI-DLC rather than this.
