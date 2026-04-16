# Mason’s Planet Boss Fighters — Dev Bible

## Overview

This document combines:
- Product Requirements (what to build)
- Implementation Plan (how to build it)
- Execution checklist (what’s done / next)

Goal: build a small, fun, playable boss-fight game quickly.

---

# PART 1 — PRODUCT REQUIREMENTS

## Core Concept

A 2D side-view boss arena game where the player fights creative bosses across planets inspired by Mason’s drawings.

Flow:
Title → Planet Select → Weapon Select → Battle → Result

---

## MVP Scope

### Planets
- Earth
- Mars

### Bosses
- Spider Prince
- Mars Prince

### Weapons
- Baby Trident (fast melee)
- Flying Star (ranged)
- Mace (heavy)

---

## Gameplay Pillars

- Readable action
- Short fights (1–3 minutes)
- Strong feedback (visual + audio)
- Imaginative kid-driven design

---

## Player

Actions:
- Move
- Jump
- Attack
- Special

Stats:
- 5 health
- brief invulnerability after hit

---

## Bosses

### Spider Prince
- fast
- web projectile
- jump movement

### Mars Prince
- slow/heavy
- tentacle slam
- projectile

---

## Arena

- flat
- side-view
- contained

---

## Success Criteria

- Mason can play without frustration
- fights feel fun
- game is replayable

---

# PART 2 — IMPLEMENTATION PLAN

## Milestone 0 — Setup

- [ ] Vite + TypeScript project
- [ ] Install Phaser
- [ ] Create Boot / Preload / Title scenes
- [ ] Confirm app runs

---

## Milestone 1 — Graybox Combat

- [ ] Player movement (left/right/jump)
- [ ] Player health
- [ ] Basic attack
- [ ] Dummy boss
- [ ] Boss health
- [ ] Damage system
- [ ] Win/lose loop

---

## Milestone 2 — Combat System

- [ ] WeaponConfig types
- [ ] 3 weapons implemented
- [ ] Cooldown system
- [ ] Projectile system
- [ ] Boss state machine base

---

## Milestone 3 — Game Flow

- [ ] Title screen
- [ ] Planet select
- [ ] Weapon select
- [ ] Result screen
- [ ] Shared run state

---

## Milestone 4 — Spider Prince

- [ ] Earth arena
- [ ] Spider Prince boss
- [ ] Web projectile
- [ ] Telegraphing
- [ ] Victory unlock Mars

---

## Milestone 5 — Mars Prince

- [ ] Mars arena
- [ ] Mars Prince boss
- [ ] Slam attack
- [ ] Projectile attack
- [ ] Balance tuning

---

## Milestone 6 — Art Pass

- [ ] Player sprite
- [ ] Boss sprites
- [ ] Backgrounds
- [ ] Weapon visuals

---

## Milestone 7 — Juice

- [ ] Hit flashes
- [ ] Camera shake
- [ ] Sound effects
- [ ] UI polish

---

## Milestone 8 — Playtest

- [ ] Mason test session
- [ ] Adjust difficulty
- [ ] Improve clarity
- [ ] Shorten fights if needed

---

# PART 3 — DEV CHECKLIST (LIVE TRACKING)

## Core Systems
- [ ] Player
- [ ] Boss system
- [ ] Combat system
- [ ] Projectiles
- [ ] Health system

## Scenes
- [ ] Title
- [ ] Planet Select
- [ ] Weapon Select
- [ ] Battle
- [ ] Result

## Content
- [ ] Earth
- [ ] Mars
- [ ] Spider Prince
- [ ] Mars Prince
- [ ] Weapons (3)

## Polish
- [ ] Sound
- [ ] Effects
- [ ] UI clarity
- [ ] Feedback tuning

---

# PART 4 — CLAUDE CODE WORKFLOW

## Rules

- Small prompts only
- One feature at a time
- Test after each step
- Avoid “build everything” prompts

---

## Example Prompt Flow

1. Setup project
2. Build BattleScene
3. Add weapons
4. Add menus
5. Add Spider Prince
6. Add Mars Prince
7. Polish

---

# PART 5 — BACKLOG

## Bosses
- Sun Butler
- Gun Beast
- Jupiter Beast

## Weapons
- Double Flame Thrower
- Toxic Light Spike Axe
- Telescopic Spiker

## Features
- Save progress
- Mason voice lines
- Controller support
- Boss gallery

---

# FINAL NOTE

The goal is NOT a perfect game.

The goal is:
👉 a small finished game Mason loves playing.
