import * as Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload(): void {
    // Assets will be loaded here in later milestones.
  }

  create(): void {
    this.scene.start('Title')
  }
}
