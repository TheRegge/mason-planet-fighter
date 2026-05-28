import * as Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload(): void {
    this.load.image('spiderPrince', 'assets/bosses/spider-prince_256.png')
    this.load.image('marsPrince', 'assets/bosses/mars-prince_256.png')
    this.load.image('babyTrident', 'assets/weapons/baby-trident_256.png')
    this.load.image('flyingStar', 'assets/weapons/fling-star_256.png')
    this.load.image('mace', 'assets/weapons/mace_256.png')
  }

  create(): void {
    this.scene.start('Title')
  }
}
