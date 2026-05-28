import type { WeaponId } from '../types/weapon'
import { DEFAULT_WEAPON_ID } from '../config/weapons'
import type { PlanetId } from '../config/planets'

// In-memory run state shared across scenes.
// No persistence, no event bus — scenes read/write directly via this singleton.

export type BattleResult = 'win' | 'lose' | null

export interface RunState {
  planetId: PlanetId
  weaponId: WeaponId
  unlockedPlanets: PlanetId[]
  lastResult: BattleResult
}

export const runState: RunState = {
  planetId: 'earth',
  weaponId: DEFAULT_WEAPON_ID,
  unlockedPlanets: ['earth'],
  lastResult: null,
}

export function setPlanet(id: PlanetId): void {
  runState.planetId = id
}

export function setWeapon(id: WeaponId): void {
  runState.weaponId = id
}

export function setLastResult(result: BattleResult): void {
  runState.lastResult = result
}

export function isPlanetUnlocked(id: PlanetId): boolean {
  return runState.unlockedPlanets.includes(id)
}
