import * as Phaser from 'phaser'
import { PLANETS } from '../config/planets'
import { WEAPONS } from '../config/weapons'
import { runState } from '../state/runState'

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result')
  }

  create(): void {
    const { width, height } = this.scale
    const won = runState.lastResult === 'win'
    const message = won ? 'WIN!' : 'LOSE'
    const color = won ? '#4ecdc4' : '#ff6b6b'

    this.add
      .text(width / 2, height / 2 - 60, message, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '80px',
        color,
      })
      .setOrigin(0.5)

    const planet = PLANETS[runState.planetId]
    const weapon = WEAPONS[runState.weaponId]
    this.add
      .text(width / 2, height / 2 + 10, `${planet.name} — ${weapon.name}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#dddddd',
      })
      .setOrigin(0.5)

    const retryText = this.add
      .text(width / 2, height / 2 + 70, 'SPACE — Retry', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '26px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const backText = this.add
      .text(width / 2, height / 2 + 110, 'ESC — Pick a Planet', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '26px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    retryText.on('pointerdown', () => this.retry())
    backText.on('pointerdown', () => this.backToPlanetSelect())

    this.input.keyboard?.on('keydown-SPACE', () => this.retry())
    this.input.keyboard?.on('keydown-ESC', () => this.backToPlanetSelect())
  }

  private retry(): void {
    this.scene.start('Battle')
  }

  private backToPlanetSelect(): void {
    this.scene.start('PlanetSelect')
  }
}
