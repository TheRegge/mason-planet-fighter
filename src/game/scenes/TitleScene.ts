import * as Phaser from 'phaser'

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title')
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2 - 30, "Mason's Planet Fighters", {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '48px',
        color: '#ffffff',
        resolution: window.devicePixelRatio || 2,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 40, 'Press SPACE to fight', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#cccccc',
      })
      .setOrigin(0.5)

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('Battle'))
  }
}
