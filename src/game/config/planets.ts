export type PlanetId = 'earth' | 'moon' | 'mars' | 'jupiter'

export interface PlanetConfig {
  id: PlanetId
  name: string
  color: number
  description: string
  backgroundKey: string
}

export const PLANETS: Record<PlanetId, PlanetConfig> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    color: 0x4ecdc4,
    description: 'Home turf. Clear skies, hard rocks.',
    backgroundKey: 'bg-earth',
  },
  moon: {
    id: 'moon',
    name: 'The Moon',
    color: 0xcccccc,
    description: 'Low gravity. No air. Watch your step.',
    backgroundKey: 'bg-moon',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    color: 0xff6b6b,
    description: 'Red dust. Twin moons. Watch your footing.',
    backgroundKey: 'bg-mars',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    color: 0xd9a066,
    description: 'No ground. Just storms.',
    backgroundKey: 'bg-jupiter',
  },
}

// Stable index order for selection UI.
export const PLANET_ORDER: PlanetId[] = ['earth', 'moon', 'mars', 'jupiter']
