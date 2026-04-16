# Mason’s Planet Boss Fighters — Implementation Plan

## Project summary

Build a small web-based 2D side-view boss arena game inspired by Mason’s drawings.

### Core direction
- Engine: Phaser 4
- Language: TypeScript
- Tooling: Vite
- Platform: Web browser
- Primary audience: Mason, age 6
- Scope: Small, fast, fun, easy to iterate

### MVP content
- 2 planets: Earth, Mars
- 2 bosses: Spider Prince, Mars Prince
- 3 weapons: Baby Trident, Flying Star, Mace
- 1 playable hero
- 1 battle arena per planet
- Title screen, planet select, weapon select, battle, result screen

## Delivery strategy

Build this in **vertical slices**, not by large subsystems all at once.

That means each milestone should produce something playable:
- first a graybox fight
- then a real first boss fight
- then progression
- then polish

This keeps Claude Code focused and reduces rework.

---

## Milestone 0 — Project setup

### Goal
Create a clean Phaser + TypeScript + Vite project structure with clear folders and basic scenes.

### Deliverables
- Working project booting in browser
- Base Phaser config
- Scene registration
- Asset folders
- Type definitions and config files
- ESLint / Prettier optional if desired

### Tasks
1. Initialize Vite + TypeScript project
2. Install Phaser
3. Create `src/main.ts`
4. Create Phaser game bootstrap
5. Add initial scenes:
   - `BootScene`
   - `PreloadScene`
   - `TitleScene`
6. Create folder structure
7. Add placeholder background color and title screen button
8. Verify hot reload works

### Suggested folder structure

```text
src/
  main.ts
  game/
    config/
      gameConfig.ts
      planets.ts
      weapons.ts
      bosses.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      TitleScene.ts
      PlanetSelectScene.ts
      WeaponSelectScene.ts
      BattleScene.ts
      ResultScene.ts
    entities/
      Player.ts
      Boss.ts
      Projectile.ts
    systems/
      CombatSystem.ts
      HealthSystem.ts
      InputSystem.ts
      ProgressionSystem.ts
    ui/
      HealthBar.ts
      MenuButton.ts
      WeaponCard.ts
    state/
      runState.ts
    types/
      game.ts
assets/
  images/
  audio/
  data/
```

### Definition of done
- App launches without errors
- Title screen appears
- Clicking Start can navigate to a placeholder next scene

---

## Milestone 1 — Graybox battle prototype

### Goal
Prove the core game is fun before making real art.

### Deliverables
- Battle scene with placeholder rectangles/shapes
- Player movement and jump
- One basic attack
- One dummy boss with simple health
- Win / lose loop

### Tasks
1. Implement arena floor and world bounds
2. Implement player:
   - move left/right
   - jump
   - face direction
3. Implement player health
4. Implement basic attack hitbox
5. Implement dummy boss entity
6. Implement boss health
7. Implement collision / damage system
8. Add temporary invulnerability after hit
9. Add simple UI:
   - player hearts or pips
   - boss health bar
10. Add win / lose detection
11. Transition to result screen

### Graybox mechanics
- Flat arena only
- No platforms yet
- Placeholder shapes only
- No art dependency

### Definition of done
- Player can move, jump, hit dummy boss
- Dummy boss can damage player
- Either side can be defeated
- Fight can restart cleanly

---

## Milestone 2 — Core combat architecture

### Goal
Make combat reusable so bosses and weapons can be added through configuration.

### Deliverables
- Config-driven weapon system
- Shared damage / cooldown rules
- Shared boss state model
- Reusable projectile support

### Tasks
1. Create TypeScript types for:
   - `WeaponConfig`
   - `BossConfig`
   - `BossAttackConfig`
   - `PlanetConfig`
2. Create weapon config file for:
   - Baby Trident
   - Flying Star
   - Mace
3. Create shared attack flow:
   - input
   - cooldown check
   - attack spawn/hitbox
   - damage apply
4. Create projectile base behavior
5. Create boss state machine base:
   - idle
   - telegraph
   - attack
   - recovery
   - hurt
   - defeated
6. Separate content data from scene logic

### Recommended initial weapon rules

#### Baby Trident
- Type: melee
- Fast cooldown
- Short range
- Low damage

#### Flying Star
- Type: projectile
- Medium cooldown
- Safe from distance
- Moderate damage

#### Mace
- Type: heavy melee
- Slow cooldown
- Higher damage
- Strong hit feedback

### Definition of done
- Battle scene can load weapon behavior from config
- Boss behavior system can support multiple bosses without rewriting BattleScene

---

## Milestone 3 — Menu flow and run state

### Goal
Build the non-battle flow needed for a real playable game.

### Deliverables
- Title screen
- Planet select screen
- Weapon select screen
- Shared run state between scenes
- Result screen with retry/continue

### Tasks
1. Create run state store:
   - selected planet
   - selected weapon
   - unlocked planets
   - last battle result
2. Implement TitleScene
3. Implement PlanetSelectScene
4. Implement WeaponSelectScene
5. Implement ResultScene
6. Support scene-to-scene transitions
7. Add simple locked/unlocked state for planets

### Initial progression rule
- Earth unlocked at start
- Mars unlocks after defeating Spider Prince

### Definition of done
- Player can go from title → planet select → weapon select → battle → result → back to menu

---

## Milestone 4 — First real boss: Spider Prince

### Goal
Replace dummy boss with first real boss encounter.

### Deliverables
- Earth arena
- Spider Prince boss logic
- First pass of Mason-inspired art or clean placeholders
- Battle intro text

### Spider Prince design

#### Theme
Fast, creepy, web-based enemy with readable movement.

#### Core attacks
1. **Web Shot**
   - Telegraph pause
   - Fires web projectile horizontally
2. **Leap / Skitter**
   - Quick reposition
   - Can threaten close range

#### Behavior style
- Moves more than Mars Prince
- Short telegraphs
- Lower health than Mars Prince

### Tasks
1. Create Earth planet config
2. Create Spider Prince config
3. Implement web projectile
4. Implement attack telegraph visuals
5. Add first boss intro overlay
6. Add defeat state and Earth win flow

### Definition of done
- Spider Prince is a distinct playable boss fight
- Defeating Spider Prince unlocks Mars

---

## Milestone 5 — Second real boss: Mars Prince

### Goal
Add second boss and second arena using the reusable systems.

### Deliverables
- Mars arena
- Mars Prince boss
- Distinct attack pattern
- Planet progression complete for MVP

### Mars Prince design

#### Theme
Heavy alien prince with tentacle-like attacks and stronger presence.

#### Core attacks
1. **Tentacle Slam**
   - Clear windup
   - Short-range strong strike
2. **Red Energy Blob**
   - Slower projectile than web shot
   - Easier to dodge but stronger impact

#### Behavior style
- Slower than Spider Prince
- More threatening hit power
- Higher health

### Tasks
1. Create Mars planet config
2. Create Mars Prince config
3. Implement slam attack
4. Implement projectile variant
5. Tune balance relative to player weapons
6. Add victory result for MVP completion

### Definition of done
- Mars Prince fight is clearly different from Spider Prince
- Player can complete a 2-boss game loop

---

## Milestone 6 — Art pass 1

### Goal
Replace graybox placeholders with charming readable art based on Mason’s drawings.

### Deliverables
- Player sprite or simple sprite sheet
- Spider Prince art
- Mars Prince art
- Earth background
- Mars background
- Weapon visuals
- Simple hit effects

### Art strategy
Do not chase polished commercial art.
Aim for:
- thick outlines
- bright colors
- simple silhouettes
- obvious attack shapes
- playful weirdness preserved from Mason’s ideas

### Tasks
1. Create concept cleanup sketches from Mason’s drawings
2. Reduce each character to readable game silhouette
3. Export PNGs or sprite sheets
4. Replace placeholders gradually
5. Keep animation scope tiny:
   - idle
   - attack
   - hurt
   - defeat

### Definition of done
- The game visually feels like Mason’s world instead of a prototype

---

## Milestone 7 — Audio and juice

### Goal
Make the game feel fun and punchy.

### Deliverables
- Sound effects
- Hit flashes
- Screen shake or impact feedback
- Better transitions
- Simple victory feel

### Minimum audio list
- menu click
- jump
- melee swing
- thrown projectile
- player hit
- boss hit
- boss attack
- victory
- defeat

### Juice tasks
1. Add hit flash on damage
2. Add short camera shake on heavy hits
3. Add brief boss defeat effect
4. Add UI feedback on weapon select
5. Add simple transition between scenes

### Definition of done
- Mason immediately notices the game feels exciting and responsive

---

## Milestone 8 — Playtest and tuning

### Goal
Tune the game for a 6-year-old player.

### Deliverables
- Adjusted difficulty
- Shorter dead time
- Clearer telegraphs
- Better retry flow

### What to observe during testing
- Does Mason understand where to go?
- Can he attack consistently?
- Does he get frustrated by timing?
- Does he understand boss danger moments?
- Which weapon does he enjoy most?
- Is the fight too long?

### Likely tuning changes
- increase player i-frames
- reduce boss damage
- make projectiles slower
- increase hitbox size
- shorten boss health
- add more visible telegraphing

### Definition of done
- Mason can enjoy at least one full fight with limited help

---

## Recommended implementation order inside VS Code

Use Claude Code for **small focused requests**.

### Good pattern
1. Ask for one file or one slice
2. Review code
3. Run it
4. Fix issues
5. Move to next slice

### Bad pattern
- “Build the whole game from this PRD.”

---

## Suggested Claude Code prompt sequence

### Prompt 1 — project scaffold
```text
Set up a Phaser 4 + TypeScript + Vite project for a 2D side-view boss arena game.
Create the following scenes: BootScene, PreloadScene, TitleScene.
Add a basic Phaser config and wire scene startup through main.ts.
Use a clean folder structure for config, scenes, entities, ui, systems, and types.
Do not add unnecessary abstractions yet.
```

### Prompt 2 — graybox battle
```text
Implement a graybox BattleScene for a 2D side-view boss arena game.
Requirements:
- flat arena floor
- player can move left/right and jump
- player has 5 health
- dummy boss has health bar
- player can perform a basic melee attack
- boss can damage player on contact or simple timed attack
- win and lose states trigger scene transition hooks
Use placeholder shapes only.
Keep code simple and readable.
```

### Prompt 3 — reusable combat config
```text
Refactor the current graybox combat so weapons are driven by typed config objects.
Implement three weapons:
- Baby Trident: fast melee, low damage
- Flying Star: ranged projectile, medium damage
- Mace: slow heavy melee, higher damage
Create TypeScript types and a weapons config file.
Do not change the visible game flow yet beyond supporting these weapons.
```

### Prompt 4 — menu flow
```text
Implement TitleScene, PlanetSelectScene, WeaponSelectScene, and ResultScene.
Create a simple shared run state for selected planet, selected weapon, unlocked planets, and last result.
Flow should be:
Title -> Planet Select -> Weapon Select -> Battle -> Result.
Earth should be unlocked initially. Mars should be locked for now.
```

### Prompt 5 — Spider Prince
```text
Implement the first real boss, Spider Prince, using a reusable boss state model.
Spider Prince should have:
- web projectile attack
- quick reposition or leap attack
- readable telegraph before each attack
Add an Earth arena config and wire BattleScene to load this boss from config.
```

### Prompt 6 — progression unlock
```text
After defeating Spider Prince, unlock Mars in progression state.
Update PlanetSelectScene to show Earth unlocked and Mars unlocked only after victory.
Keep persistence in memory only for now.
```

### Prompt 7 — Mars Prince
```text
Implement Mars Prince as the second boss.
Mars Prince should feel heavier and slower than Spider Prince.
Give it:
- tentacle slam attack with clear windup
- slower red projectile attack
Add Mars arena config and wire it into planet selection and battle loading.
```

### Prompt 8 — visual pass support
```text
Refactor asset loading so placeholder art can be easily replaced with real PNGs later.
Use named texture keys and centralize them in config where appropriate.
Keep current gameplay intact.
```

### Prompt 9 — polish
```text
Add simple game juice:
- hit flash on damage
- camera shake for heavy hits
- simple sound hooks
- nicer result overlays
Keep implementation lightweight and easy to tune.
```

---

## Data model recommendations

### `PlanetConfig`
```ts
export type PlanetId = 'earth' | 'mars'

export type PlanetConfig = {
  id: PlanetId
  name: string
  bossId: string
  backgroundKey: string
  arenaTheme: 'earth' | 'mars'
  unlockedByDefault?: boolean
}
```

### `WeaponConfig`
```ts
export type WeaponType = 'melee' | 'projectile' | 'heavy'

export type WeaponConfig = {
  id: string
  name: string
  type: WeaponType
  damage: number
  cooldownMs: number
  range?: number
  projectileSpeed?: number
  iconKey?: string
}
```

### `BossAttackConfig`
```ts
export type BossAttackConfig = {
  id: string
  name: string
  telegraphMs: number
  recoveryMs: number
  cooldownMs: number
  damage: number
  projectileSpeed?: number
}
```

### `BossConfig`
```ts
export type BossConfig = {
  id: string
  name: string
  maxHealth: number
  moveSpeed: number
  behaviorStyle: 'agile' | 'heavy'
  attacks: BossAttackConfig[]
}
```

---

## Coding standards for this project

### Keep it simple
- Prefer readable code over clever abstractions
- Avoid premature inheritance trees
- Favor composition and config

### Build for replacement
- Placeholder art should be easy to swap
- Bosses should be easy to add via config + one behavior file

### Keep scenes lean
- Scene code should orchestrate
- Entity/system code should contain logic

### Keep AI prompts scoped
- One milestone at a time
- One boss at a time
- One refactor at a time

---

## Suggested backlog after MVP

### Content expansion
- Moon planet
- Jupiter planet
- Sun Butler boss
- Gun Beast boss
- Jupiter Beast the First boss

### New weapons
- Double Flame Thrower
- Toxic Light Spike Axe
- Telescopic Spiker
- Steel Ichucks
- Double Spike Shooter

### Nice extras
- Mason voice intros
- simple save progress in localStorage
- easy/hard mode
- boss gallery with Mason’s original drawings
- simple controller support

---

## Builder notes

### Important production rule
Do not wait for final art before building gameplay.

The fastest path is:
1. graybox the battle
2. prove it is fun
3. add real bosses
4. then improve visuals and sound

### Best definition of success
A very small game that Mason actually smiles at and asks to play again is better than a half-finished ambitious game.
