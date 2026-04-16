import * as Phaser from 'phaser'

// Reserved for device/orientation detection and early ScaleManager config.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create(): void {
    this.scene.start('Preload')
  }
}
