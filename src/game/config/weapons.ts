import type { WeaponConfig, WeaponId } from '../types/weapon'

export const WEAPONS: Record<WeaponId, WeaponConfig> = {
  babyTrident: {
    id: 'babyTrident',
    name: 'Baby Trident',
    type: 'melee',
    damage: 1,
    cooldownMs: 280,
    range: 46,
    color: 0xffeb3b,
  },
  flyingStar: {
    id: 'flyingStar',
    name: 'Flying Star',
    type: 'projectile',
    damage: 2,
    cooldownMs: 550,
    range: 16,
    projectileSpeed: 520,
    color: 0x9be7ff,
  },
  mace: {
    id: 'mace',
    name: 'Mace',
    type: 'heavy',
    damage: 3,
    cooldownMs: 850,
    range: 62,
    color: 0xff9f43,
  },
}

export const DEFAULT_WEAPON_ID: WeaponId = 'babyTrident'
