export type PlanetId = 'earth' | 'mars'

export interface PlanetConfig {
  id: PlanetId
  name: string
  color: number
  description: string
}

export const PLANETS: Record<PlanetId, PlanetConfig> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    color: 0x4ecdc4,
    description: 'Fight the Spider Prince!',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    color: 0xff6b6b,
    description: 'Locked',
  },
}

// Stable index order for selection UI.
export const PLANET_ORDER: PlanetId[] = ['earth', 'mars']
