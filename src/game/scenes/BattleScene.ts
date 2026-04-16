import * as Phaser from 'phaser'
import { DEFAULT_WEAPON_ID, WEAPONS } from '../config/weapons'
import type { WeaponConfig, WeaponId } from '../types/weapon'

// To test a different weapon, change this to 'babyTrident' | 'flyingStar' | 'mace'.
const ACTIVE_WEAPON_ID: WeaponId = 'flyingStar'//DEFAULT_WEAPON_ID

// Graybox tuning for non-weapon behavior.
const PLAYER_MAX_HEALTH = 5
const BOSS_MAX_HEALTH = 10
const PLAYER_SPEED = 240
const JUMP_VELOCITY = -520
const CONTACT_DAMAGE = 1
const INVULN_MS = 800
const ATTACK_FLASH_MS = 120
const MELEE_HITBOX_HEIGHT = 30
const PROJECTILE_LIFETIME_MS = 1500

// Spider Prince (first real boss, graybox).
const BOSS_COLOR = 0x6b2fbb
const TELEGRAPH_COLOR = 0xffe066
const BOSS_WIDTH = 56
const BOSS_HEIGHT = 64
const BOSS_IDLE_MS = 800
const BOSS_TELEGRAPH_MS = 450
const BOSS_RECOVERY_MS = 500
const BOSS_LEAP_VX = 260
const BOSS_LEAP_VY = -520
const BOSS_LEAP_MAX_MS = 900
const WEB_SPEED = 260
const WEB_DAMAGE = 1
const WEB_LIFETIME_MS = 2200
const WEB_SIZE = 18
const WEB_COLOR = 0xeeeeff

type BossState = 'idle' | 'telegraph' | 'attack' | 'recovery'
type BossAttack = 'web' | 'leap'

export class BattleScene extends Phaser.Scene {
  private playerRect!: Phaser.GameObjects.Rectangle
  private playerBody!: Phaser.Physics.Arcade.Body
  private bossRect!: Phaser.GameObjects.Rectangle
  private bossBody!: Phaser.Physics.Arcade.Body
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  private playerHealth = PLAYER_MAX_HEALTH
  private bossHealth = BOSS_MAX_HEALTH

  private playerHealthText!: Phaser.GameObjects.Text
  private bossHealthText!: Phaser.GameObjects.Text

  private lastAttackTime = 0
  private invulnerableUntil = 0
  private facingRight = true
  private battleOver = false

  private activeWeapon!: WeaponConfig
  private projectiles!: Phaser.Physics.Arcade.Group

  // Spider Prince state machine.
  private bossState: BossState = 'idle'
  private bossStateUntil = 0
  private bossAttackStart = 0
  private currentAttack: BossAttack = 'web'
  private nextAttack: BossAttack = 'web'
  private bossProjectiles!: Phaser.Physics.Arcade.Group

  constructor () {
    super('Battle')
  }

  create(): void {
    const { width, height } = this.scale

    this.activeWeapon = WEAPONS[ACTIVE_WEAPON_ID]

    this.physics.world.setBounds(0, 0, width, height)

    // Ground (static).
    const groundHeight = 40
    const ground = this.add.rectangle(
      width / 2,
      height - groundHeight / 2,
      width,
      groundHeight,
      0x3a3a55,
    )
    this.physics.add.existing(ground, true)

    // Player.
    this.playerRect = this.add.rectangle(
      width * 0.25,
      height - groundHeight - 50,
      30,
      50,
      0x4ecdc4,
    )
    this.physics.add.existing(this.playerRect)
    this.playerBody = this.playerRect.body as Phaser.Physics.Arcade.Body
    this.playerBody.setSize(30, 50)
    this.playerBody.setCollideWorldBounds(true)

    // Spider Prince (first real boss, graybox rectangle).
    this.bossRect = this.add.rectangle(
      width * 0.75,
      height - groundHeight - BOSS_HEIGHT / 2 - 10,
      BOSS_WIDTH,
      BOSS_HEIGHT,
      BOSS_COLOR,
    )
    this.physics.add.existing(this.bossRect)
    this.bossBody = this.bossRect.body as Phaser.Physics.Arcade.Body
    this.bossBody.setSize(BOSS_WIDTH, BOSS_HEIGHT)
    this.bossBody.setCollideWorldBounds(true)
    this.enterBossState('idle')

    // Physics relations.
    this.physics.add.collider(this.playerRect, ground)
    this.physics.add.collider(this.bossRect, ground)
    this.physics.add.overlap(this.playerRect, this.bossRect, () => this.onContact())

    // Projectiles (used by ranged weapons).
    // Note: Phaser's overlap callback is invoked as (sprite, groupMember) regardless
    // of argument order to add.overlap, so the projectile is the SECOND argument.
    this.projectiles = this.physics.add.group({ allowGravity: false })
    this.physics.add.overlap(this.projectiles, this.bossRect, (_boss, projObj) => {
      (projObj as Phaser.GameObjects.GameObject).destroy()
      this.damageBoss(this.activeWeapon.damage)
    })

    // Spider Prince web projectiles.
    this.bossProjectiles = this.physics.add.group({ allowGravity: false })
    this.physics.add.overlap(this.playerRect, this.bossProjectiles, (_player, web) => {
      (web as Phaser.GameObjects.GameObject).destroy()
      if (!this.battleOver && this.time.now >= this.invulnerableUntil) {
        this.damagePlayer(WEB_DAMAGE)
      }
    })

    // Input.
    this.cursors = this.input.keyboard!.createCursorKeys()

    // UI text.
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    }
    this.playerHealthText = this.add.text(16, 12, '', textStyle)
    this.bossHealthText = this.add.text(width - 16, 12, '', textStyle).setOrigin(1, 0)
    this.add
      .text(width - 16, 38, 'Boss: Spider Prince', {
        ...textStyle,
        fontSize: '14px',
        color: '#c9b6ff',
      })
      .setOrigin(1, 0)
    this.add
      .text(
        width / 2,
        12,
        `Arrows: move  |  Up: jump  |  Space: attack  |  Weapon: ${this.activeWeapon.name}`,
        textStyle,
      )
      .setOrigin(0.5, 0)
    this.updateHealthText()
  }

  update(): void {
    if (this.battleOver) return

    this.updateBoss()

    // Horizontal movement.
    if (this.cursors.left?.isDown) {
      this.playerBody.setVelocityX(-PLAYER_SPEED)
      this.facingRight = false
    } else if (this.cursors.right?.isDown) {
      this.playerBody.setVelocityX(PLAYER_SPEED)
      this.facingRight = true
    } else {
      this.playerBody.setVelocityX(0)
    }

    // Jump (only when grounded).
    if (this.cursors.up?.isDown && this.playerBody.blocked.down) {
      this.playerBody.setVelocityY(JUMP_VELOCITY)
    }

    // Attack.
    if (
      this.cursors.space &&
      Phaser.Input.Keyboard.JustDown(this.cursors.space) &&
      this.time.now - this.lastAttackTime >= this.activeWeapon.cooldownMs
    ) {
      this.performAttack()
      this.lastAttackTime = this.time.now
    }
  }

  private performAttack(): void {
    if (this.activeWeapon.type === 'projectile') {
      this.spawnProjectile()
    } else {
      this.performMeleeSwing()
    }
  }

  private performMeleeSwing(): void {
    const w = this.activeWeapon
    const x = this.playerRect.x + (this.facingRight ? w.range : -w.range)
    const y = this.playerRect.y
    const hitbox = this.add.rectangle(x, y, w.range, MELEE_HITBOX_HEIGHT, w.color, 0.7)

    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        hitbox.getBounds(),
        this.bossRect.getBounds(),
      )
    ) {
      this.damageBoss(w.damage)
    }

    this.time.delayedCall(ATTACK_FLASH_MS, () => hitbox.destroy())
  }

  private spawnProjectile(): void {
    const w = this.activeWeapon
    const speed = w.projectileSpeed ?? 0
    const offsetX = this.facingRight ? w.range : -w.range
    const proj = this.add.rectangle(
      this.playerRect.x + offsetX,
      this.playerRect.y,
      w.range,
      w.range,
      w.color,
    )
    this.physics.add.existing(proj)
    // Add to the group BEFORE setting velocity — Phaser's Arcade Group applies
    // its `defaults` (including velocityX/Y = 0) to the body on add, which would
    // otherwise clobber any velocity set first.
    this.projectiles.add(proj)
    const body = proj.body as Phaser.Physics.Arcade.Body
    body.setSize(w.range, w.range)
    body.setVelocityX(this.facingRight ? speed : -speed)

    this.time.delayedCall(PROJECTILE_LIFETIME_MS, () => {
      if (proj.active) proj.destroy()
    })
  }

  private onContact(): void {
    if (this.battleOver) return
    if (this.time.now < this.invulnerableUntil) return
    this.damagePlayer(CONTACT_DAMAGE)
  }

  private damagePlayer(amount: number): void {
    this.playerHealth = Math.max(0, this.playerHealth - amount)
    this.invulnerableUntil = this.time.now + INVULN_MS
    this.updateHealthText()
    if (this.playerHealth <= 0) this.endBattle(false)
  }

  private damageBoss(amount: number): void {
    this.bossHealth = Math.max(0, this.bossHealth - amount)
    this.updateHealthText()
    if (this.bossHealth <= 0) this.endBattle(true)
  }

  private updateHealthText(): void {
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}/${PLAYER_MAX_HEALTH}`)
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}/${BOSS_MAX_HEALTH}`)
  }

  // --- Spider Prince AI -----------------------------------------------

  private updateBoss(): void {
    const now = this.time.now

    switch (this.bossState) {
      case 'idle': {
        // Stand still, wait, then telegraph.
        this.bossBody.setVelocityX(0)
        if (now >= this.bossStateUntil) {
          this.currentAttack = this.nextAttack
          this.nextAttack = this.nextAttack === 'web' ? 'leap' : 'web'
          this.enterBossState('telegraph')
        }
        break
      }

      case 'telegraph': {
        // Pause and flash color. No movement.
        this.bossBody.setVelocityX(0)
        if (now >= this.bossStateUntil) {
          this.executeBossAttack()
        }
        break
      }

      case 'attack': {
        if (this.currentAttack === 'web') {
          // Web is fire-and-forget; move straight into recovery.
          this.enterBossState('recovery')
        } else {
          // Leap: wait until grounded (after going up) or safety timeout.
          const airborneLongEnough = now - this.bossAttackStart > 120
          const landed = airborneLongEnough && this.bossBody.blocked.down
          const timedOut = now - this.bossAttackStart > BOSS_LEAP_MAX_MS
          if (landed || timedOut) {
            this.bossBody.setVelocityX(0)
            this.enterBossState('recovery')
          }
        }
        break
      }

      case 'recovery': {
        this.bossBody.setVelocityX(0)
        if (now >= this.bossStateUntil) {
          this.enterBossState('idle')
        }
        break
      }
    }
  }

  private enterBossState(state: BossState): void {
    this.bossState = state
    const now = this.time.now
    switch (state) {
      case 'idle':
        this.bossRect.setFillStyle(BOSS_COLOR)
        this.bossStateUntil = now + BOSS_IDLE_MS
        break
      case 'telegraph':
        this.bossRect.setFillStyle(TELEGRAPH_COLOR)
        this.bossStateUntil = now + BOSS_TELEGRAPH_MS
        break
      case 'attack':
        this.bossRect.setFillStyle(BOSS_COLOR)
        this.bossAttackStart = now
        break
      case 'recovery':
        this.bossRect.setFillStyle(BOSS_COLOR)
        this.bossStateUntil = now + BOSS_RECOVERY_MS
        break
    }
  }

  private executeBossAttack(): void {
    if (this.currentAttack === 'web') {
      this.spawnWeb()
    } else {
      this.doLeap()
    }
    this.enterBossState('attack')
  }

  private spawnWeb(): void {
    const dir = this.playerRect.x < this.bossRect.x ? -1 : 1
    const spawnX = this.bossRect.x + dir * (BOSS_WIDTH / 2 + WEB_SIZE / 2 + 2)
    const web = this.add.rectangle(spawnX, this.bossRect.y, WEB_SIZE, WEB_SIZE, WEB_COLOR)
    this.physics.add.existing(web)
    // Add to group BEFORE setting velocity (group defaults would clobber it).
    this.bossProjectiles.add(web)
    const body = web.body as Phaser.Physics.Arcade.Body
    body.setSize(WEB_SIZE, WEB_SIZE)
    body.setVelocityX(dir * WEB_SPEED)

    this.time.delayedCall(WEB_LIFETIME_MS, () => {
      if (web.active) web.destroy()
    })
  }

  private doLeap(): void {
    const dir = this.playerRect.x < this.bossRect.x ? -1 : 1
    this.bossBody.setVelocity(dir * BOSS_LEAP_VX, BOSS_LEAP_VY)
  }

  private endBattle(won: boolean): void {
    this.battleOver = true
    this.playerBody.setVelocity(0, 0)
    this.bossBody.setVelocity(0, 0)
    this.bossState = 'recovery'
    this.bossProjectiles.getChildren().forEach((child) => child.destroy())
    const message = won ? 'WIN' : 'LOSE'
    console.log(message)

    const { width, height } = this.scale
    this.add
      .text(width / 2, height / 2, message, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '72px',
        color: won ? '#4ecdc4' : '#ff6b6b',
      })
      .setOrigin(0.5)
  }
}
