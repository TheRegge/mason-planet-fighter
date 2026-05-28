# Held Weapons — Design

**Date:** 2026-05-28
**Scope:** `src/game/scenes/BattleScene.ts` only.
**Phase:** Milestone 3 polish (does not change progression or weapon stats).

## Problem

Currently, melee/heavy weapons (Baby Trident, Mace) are invisible between attacks: `performMeleeSwing()` spawns an image at the strike position, flashes it for 120 ms, then destroys it. The player rectangle holds nothing visible in between, which makes the weapon choice feel disconnected from the character.

## Goal

Held weapons should be visible on the character at all times. On attack, the held weapon thrusts forward (and back), instead of teleporting into existence at the strike position.

Projectile weapons (Flying Star) are explicitly out of scope — they are thrown, not held, and continue to use `spawnProjectile()` unchanged.

## Design

### 1. Persistent held-weapon sprite

In `BattleScene.create()`, after `activeWeapon` is assigned and the player exists:

- If `activeWeapon.type === 'projectile'`, do nothing (no held sprite).
- Otherwise, create a single `heldWeapon: Phaser.GameObjects.Image` using `this.activeWeapon.id` as the texture key. Display size ~36×36 (smaller than the strike-frame flash, since it's the "carried" pose, not the impact).
- Default origin `0.2, 0.7` so the weapon rotates around the player's hand rather than its center (cleaner thrust pivot).
- Default angle: -20° when facing right (tip angled up). The follow code below flips both X and angle when facing left.

### 2. Follow the player each frame

Add a new method `updateHeldWeaponPose()`, called from `update()` (only when `heldWeapon` exists and `isAttacking` is false):

- `x = playerRect.x + (facingRight ? 10 : -10)`
- `y = playerRect.y + 4`
- `setFlipX(!facingRight)`
- `angle = facingRight ? -20 : 20`

This runs every frame so the weapon tracks player movement and facing flips immediately on direction change. Suppressed during a thrust so the tween isn't fought.

### 3. Thrust on attack

Replace the body of `performMeleeSwing()`:

- Compute strike X: `playerX + facingRight ? range : -range` (same as today).
- Start a tween on `heldWeapon`:
  - `x` → strike X over ~80 ms (`Phaser.Math.Easing.Quadratic.Out`)
  - `angle` → 0 (level out for the strike) over the same duration
- Tween `yoyo: true` to return to the held pose automatically over another ~80 ms.
- On the tween's start (or immediately, before tween.play): do the existing rectangle-vs-boss hitbox check at strike X. **Damage timing stays identical to today** — we are not making damage frame-perfect to the thrust apex; the cooldown gates re-attacks.
- Set `isAttacking = true` before the tween, clear it in `onComplete`.

Total animation duration: ~160 ms, comfortably inside the shorter cooldown (babyTrident: 280 ms; mace: 850 ms).

Drop the old `this.add.image(...)` + `delayedCall(... destroy)` pair — the persistent sprite is the visual now.

### 4. Per-run reset

`create()` runs on every `scene.start('Battle')` (Phaser reuses the instance — already noted in CLAUDE.md). The held sprite is created fresh each `create()`, so no extra reset is required. Just make sure `isAttacking = false` is part of the existing per-run reset block.

## Out of scope

- Idle bob / breathing animation on the held weapon.
- Off-hand or two-handed visuals.
- Particles or trails on the thrust.
- Changes to weapon stats, cooldowns, or balance.
- Anything in `WeaponSelectScene` (the preview tiles already show the icon).

## Files touched

- `src/game/scenes/BattleScene.ts` — add `heldWeapon`, `isAttacking` fields; new `updateHeldWeaponPose()`; rewrite `performMeleeSwing()`; call pose update from `update()`; reset `isAttacking` in `create()`.

No new files, no config changes, no asset additions (textures already exist).

## Risks / things to watch

- Tween + manual `setPosition` can fight if `isAttacking` isn't honored — easy to miss if `updateHeldWeaponPose()` is called unconditionally.
- The strike-frame hitbox is now decoupled from a visible "impact" image. Acceptable for graybox; the thrust apex is close enough in time to read as "the hit."
- If the player changes facing mid-thrust, the tween will still play in the original direction. Acceptable — attacks are short (~160 ms).
