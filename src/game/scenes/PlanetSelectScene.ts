import * as Phaser from 'phaser'
import { PLANETS, PLANET_ORDER } from '../config/planets'
import type { PlanetId } from '../config/planets'
import { isPlanetUnlocked, setPlanet } from '../state/runState'

const TILE_WIDTH = 180
const TILE_HEIGHT = 240
const TILE_GAP = 24
const LOCKED_COLOR = 0x555566
const LOCKED_TEXT = '#888888'

interface PlanetTile {
  bg: Phaser.GameObjects.Rectangle
  nameText: Phaser.GameObjects.Text
  descText: Phaser.GameObjects.Text
  lockedText?: Phaser.GameObjects.Text
}

export class PlanetSelectScene extends Phaser.Scene {
  private selectedIndex = 0
  private tiles: PlanetTile[] = []
  private lockedFlash?: Phaser.GameObjects.Text

  constructor() {
    super('PlanetSelect')
  }

  create(): void {
    this.selectedIndex = Math.max(0, PLANET_ORDER.indexOf(this.getInitialPlanetId()))
    this.tiles = []

    const { width, height } = this.scale

    this.add
      .text(width / 2, 60, 'Choose a Planet', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const totalWidth = PLANET_ORDER.length * TILE_WIDTH + (PLANET_ORDER.length - 1) * TILE_GAP
    const startX = width / 2 - totalWidth / 2 + TILE_WIDTH / 2
    const tileY = height / 2 + 10

    PLANET_ORDER.forEach((id, index) => {
      const tileX = startX + index * (TILE_WIDTH + TILE_GAP)
      this.tiles.push(this.createTile(id, tileX, tileY, index))
    })

    this.add
      .text(width / 2, height - 40, 'Arrows to choose   SPACE to confirm', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#cccccc',
      })
      .setOrigin(0.5)

    this.input.keyboard?.on('keydown-LEFT', () => this.moveSelection(-1))
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveSelection(1))
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection())

    this.redrawSelection()
  }

  private getInitialPlanetId(): PlanetId {
    // Default to 'earth' the first time; otherwise remember the last choice.
    return 'earth'
  }

  private createTile(id: PlanetId, x: number, y: number, index: number): PlanetTile {
    const planet = PLANETS[id]
    const unlocked = isPlanetUnlocked(id)
    const bgColor = unlocked ? planet.color : LOCKED_COLOR

    const bg = this.add
      .rectangle(x, y, TILE_WIDTH, TILE_HEIGHT, bgColor)
      .setInteractive({ useHandCursor: true })

    bg.on('pointerdown', () => {
      this.selectedIndex = index
      this.redrawSelection()
      this.confirmSelection()
    })

    const nameColor = unlocked ? '#ffffff' : LOCKED_TEXT
    const nameText = this.add
      .text(x, y - 30, planet.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '32px',
        color: nameColor,
      })
      .setOrigin(0.5)

    const descText = this.add
      .text(x, y + 10, planet.description, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: unlocked ? '#eeeeee' : LOCKED_TEXT,
        wordWrap: { width: TILE_WIDTH - 20 },
        align: 'center',
      })
      .setOrigin(0.5)

    let lockedText: Phaser.GameObjects.Text | undefined
    if (!unlocked) {
      lockedText = this.add
        .text(x, y + 70, 'LOCKED', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '22px',
          color: '#ffcc33',
        })
        .setOrigin(0.5)
    }

    return { bg, nameText, descText, lockedText }
  }

  private moveSelection(delta: number): void {
    const next = Phaser.Math.Clamp(
      this.selectedIndex + delta,
      0,
      PLANET_ORDER.length - 1,
    )
    if (next === this.selectedIndex) return
    this.selectedIndex = next
    this.redrawSelection()
  }

  private redrawSelection(): void {
    this.tiles.forEach((tile, index) => {
      if (index === this.selectedIndex) {
        tile.bg.setStrokeStyle(4, 0xffffff)
      } else {
        tile.bg.setStrokeStyle(0)
      }
    })
  }

  private confirmSelection(): void {
    const id = PLANET_ORDER[this.selectedIndex]
    if (!isPlanetUnlocked(id)) {
      this.showLockedFlash()
      return
    }
    setPlanet(id)
    this.scene.start('WeaponSelect')
  }

  private showLockedFlash(): void {
    if (this.lockedFlash) {
      this.lockedFlash.destroy()
    }
    const { width, height } = this.scale
    this.lockedFlash = this.add
      .text(width / 2, height - 80, 'Locked!', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#ffcc33',
      })
      .setOrigin(0.5)
    this.time.delayedCall(600, () => {
      this.lockedFlash?.destroy()
      this.lockedFlash = undefined
    })
  }
}
