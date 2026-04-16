export type WeaponType = 'melee' | 'projectile' | 'heavy'

export type WeaponId = 'babyTrident' | 'flyingStar' | 'mace'

export type WeaponConfig = {
  id: WeaponId
  name: string
  type: WeaponType
  damage: number
  cooldownMs: number
  // Melee / heavy: forward hitbox width. Projectile: square size.
  range: number
  // Projectile only.
  projectileSpeed?: number
  // Graybox rect color.
  color: number
}
