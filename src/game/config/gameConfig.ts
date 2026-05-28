import * as Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { TitleScene } from '../scenes/TitleScene'
import { PlanetSelectScene } from '../scenes/PlanetSelectScene'
import { WeaponSelectScene } from '../scenes/WeaponSelectScene'
import { BattleScene } from '../scenes/BattleScene'
import { ResultScene } from '../scenes/ResultScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game',
    width: 960,
    height: 540,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    PlanetSelectScene,
    WeaponSelectScene,
    BattleScene,
    ResultScene,
  ],
}
