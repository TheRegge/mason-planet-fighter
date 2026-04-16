# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Current Status

### Phase

<!-- Example: Scaffold Review / Graybox Combat / First Boss / Progression -->

- Phase: Graybox Combat (Milestone 1 complete)

### Last Completed

<!-- Brief, factual description of what was just finished -->

- Graybox `BattleScene`: player move/jump, basic melee attack, dummy boss with contact damage, 5/10 HP, i-frames, WIN/LOSE endings. Title → Battle wired via SPACE.

### Current Focus

<!-- What is actively being worked on right now -->

- Awaiting playtest confirmation of graybox fun factor before proceeding.

### Next Step

<!-- Smallest correct next action (should match dev bible) -->

- Milestone 2 / Implementation Plan Prompt 3: refactor combat to config-driven weapons (Baby Trident, Flying Star, Mace) with typed `WeaponConfig`.

### Notes / Decisions

<!-- Optional: important decisions or constraints discovered -->

- Arcade gravity is global (`y: 1200`) in `gameConfig`.
- Do NOT call `setImmovable(true)` on dynamic bosses — it prevents separation against static ground colliders and the body falls through to world bounds. Use `overlap` (not `collider`) for player/boss contact damage if the boss shouldn't be pushed.
- Phaser 4 `GameObjects.Rectangle` physics: explicitly call `body.setSize(w, h)` after `physics.add.existing(...)` to guarantee body matches visual.

## Project identity

**Mason's Planet Boss Fighters** is a small 2D side-view boss-arena web game for a 6-year-old player.

Tech stack:

- **Phaser 4**
- **TypeScript**
- **Vite**

Primary project documents live in `docs/workfiles/`:

- `mason-planet-boss-fighters-dev-bible.md` — product requirements, milestone checklist, live dev tracking
- `mason-planet-boss-fighters-implementation-plan.md` — milestone plan, implementation order, prompt sequence, data model guidance

Additional documentation will be created and maintained in `docs/` as the code evolves.  
Code and architecture decisions should be documented there when they become stable or important.

## Source of truth

Before making meaningful code changes, read the documents in:

- `docs/workfiles/`
- `docs/` (when relevant)

The **dev bible** is the primary source of truth for:

- current milestone
- what has already been completed
- what should happen next

Do not invent a new roadmap if the existing documents already define one.

## Project goal

Build a **small, finished, fun game** that Mason enjoys playing.

Prioritize:

- fast iteration
- readability
- kid-friendly gameplay clarity
- short playable loops
- vertical slices over large architecture work

Do **not** optimize for theoretical extensibility at the expense of current momentum.

## Current development philosophy

This project must be built in **vertical slices**:

1. scaffold
2. graybox combat
3. first real boss
4. progression
5. second boss
6. polish
7. playtesting and tuning

Do not jump ahead to later milestones unless explicitly asked.

## Current phase rule

Always determine the current phase from the dev bible before implementing anything significant.

If the current phase is scaffold review, do not begin combat.
If the current phase is graybox combat, do not begin full progression systems.
If the current phase is first-boss implementation, do not start broad polish work.

When uncertain, prefer the **smallest correct next step**.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

Current notes:

- No test runner is configured
- No linter or formatter is configured
- TypeScript is strict
- There is currently no dedicated `tsc` script unless one is added later

## Bootstrap architecture

Current startup flow:

1. `index.html` mounts a single `<div id="game">`
2. `src/main.ts` instantiates `new Phaser.Game(gameConfig)`
3. `src/game/config/gameConfig.ts` defines the Phaser config
4. Scenes transition by key in this intended sequence:

```
Boot -> Preload -> Title -> PlanetSelect -> WeaponSelect -> Battle -> Result
```

Only the early scaffold scenes may exist at first. Do not assume all later scenes already exist.

## Project structure

Use this target structure as features are added:

```
src/game/
  config/
  scenes/
  entities/
  systems/
  ui/
  state/
  types/
```

Only create folders/files when they are needed by the current milestone.

Do not create empty architecture layers just to match the final structure early.

## Asset conventions

Runtime assets live in `public/assets/`:

- `images/`
- `audio/`
- `data/`

Vite serves `public/` from the root URL.

Use placeholder assets early. Do not block gameplay work on final art.

## Design and coding conventions

### Graybox first

Gameplay comes before polished visuals.

### Config-driven content

Use config objects when helpful, but do not over-abstract early.

### Scenes orchestrate

Scenes coordinate. Logic lives elsewhere as complexity grows.

### Readability over cleverness

Prefer simple, direct, flat code.

### Child-first design

Favor clarity, feedback, and short loops.

## Boss design rule

```
idle -> telegraph -> attack -> recovery -> hurt -> defeated
```

Telegraphs must be visually readable.

## MVP progression rule

- In-memory only (no persistence yet)
- Earth unlocked by default
- Mars unlocks after Spider Prince

## Phaser version guidance

This project uses **Phaser 4**.

Use Phaser skills when needed. Avoid Phaser 3 assumptions.

Reference repo: `tools/phaser-repo/` (read-only, gitignored).

## Working style for Claude

### Implementation cadence

1. Implement one focused change
2. Explain what changed
3. Stop

Do not build multiple future milestones at once.

### Allowed scope

Only implement what is requested + minimal supporting code.

Do not:

- add future systems
- over-refactor
- introduce unused abstractions

### Review behavior

- focus on real issues
- avoid nitpicks
- prefer minimal fixes

## Progress tracking rules

Update progress documentation at meaningful checkpoints only.

### Update when:

- a milestone is completed
- a clear sub-step is finished
- next step changes

### Do not update when:

- small edits
- incomplete work
- experiments

### When updating:

- keep concise
- update only relevant sections
- preserve structure

## End-of-step discipline

After completing meaningful work, state:

- what was completed
- current phase
- next logical step

Update the dev bible if appropriate.

## Documentation rule

When a system, pattern, or decision becomes stable or important:

- add or update documentation in `docs/`
- keep documentation concise and practical
- reflect actual implementation, not hypothetical design

Do not over-document early experiments.

## Good outcomes

- small runnable increments
- fun early gameplay
- simple structure
- finished MVP

## Bad outcomes

- overengineering
- premature polish
- jumping ahead of milestones
- unfinished large scope
