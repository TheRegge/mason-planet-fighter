import * as Phaser from 'phaser'
import { WEAPONS } from '../config/weapons'
import type { WeaponId } from '../types/weapon'
import { runState, setWeapon } from '../state/runState'

const WEAPON_ORDER: WeaponId[] = ['babyTrident', 'flyingStar', 'mace']

const TILE_WIDTH = 200
const TILE_HEIGHT = 220
const TILE_GAP = 36

interface WeaponTile {
  bg: Phaser.GameObjects.Rectangle
}

export class WeaponSelectScene extends Phaser.Scene {
  private selectedIndex = 0
  private tiles: WeaponTile[] = []

  constructor() {
    super('WeaponSelect')
  }

  create(): void {
    this.selectedIndex = Math.max(0, WEAPON_ORDER.indexOf(runState.weaponId))
    this.tiles = []

    const { width, height } = this.scale

    this.add
      .text(width / 2, 60, 'Choose a Weapon', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const totalWidth = WEAPON_ORDER.length * TILE_WIDTH + (WEAPON_ORDER.length - 1) * TILE_GAP
    const startX = width / 2 - totalWidth / 2 + TILE_WIDTH / 2
    const tileY = height / 2 + 10

    WEAPON_ORDER.forEach((id, index) => {
      const tileX = startX + index * (TILE_WIDTH + TILE_GAP)
      this.tiles.push(this.createTile(id, tileX, tileY, index))
    })

    this.add
      .text(width / 2, height - 40, 'Arrows to choose   SPACE to fight', {
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

  private createTile(id: WeaponId, x: number, y: number, index: number): WeaponTile {
    const weapon = WEAPONS[id]

    const bg = this.add
      .rectangle(x, y, TILE_WIDTH, TILE_HEIGHT, weapon.color)
      .setInteractive({ useHandCursor: true })

    bg.on('pointerdown', () => {
      this.selectedIndex = index
      this.redrawSelection()
      this.confirmSelection()
    })

    this.add
      .text(x, y - 40, weapon.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '26px',
        color: '#111111',
        align: 'center',
        wordWrap: { width: TILE_WIDTH - 16 },
      })
      .setOrigin(0.5)

    this.add
      .text(x, y + 20, weapon.type.toUpperCase(), {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#222222',
      })
      .setOrigin(0.5)

    this.add
      .text(
        x,
        y + 54,
        `Damage: ${weapon.damage}\nCooldown: ${weapon.cooldownMs}ms`,
        {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          color: '#333333',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    return { bg }
  }

  private moveSelection(delta: number): void {
    const next = Phaser.Math.Clamp(
      this.selectedIndex + delta,
      0,
      WEAPON_ORDER.length - 1,
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
    setWeapon(WEAPON_ORDER[this.selectedIndex])
    this.scene.start('Battle')
  }
}
