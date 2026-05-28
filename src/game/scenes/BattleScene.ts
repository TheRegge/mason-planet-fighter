import * as Phaser from 'phaser'
import { DEFAULT_WEAPON_ID, WEAPONS } from '../config/weapons'
import type { WeaponConfig } from '../types/weapon'
import { runState, setLastResult } from '../state/runState'
import { PLANETS } from '../config/planets'

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

// Spider Prince (first real boss).
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
  private bossSprite!: Phaser.GameObjects.Sprite
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
  private heldWeapon?: Phaser.GameObjects.Image
  private isAttacking = false

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

    // Per-run reset: Phaser reuses the scene instance on scene.start(),
    // so class-field initializers only run once. Reset mutable state here
    // so Retry and repeated runs start clean.
    this.playerHealth = PLAYER_MAX_HEALTH
    this.bossHealth = BOSS_MAX_HEALTH
    this.battleOver = false
    this.lastAttackTime = 0
    this.invulnerableUntil = 0
    this.facingRight = true
    this.isAttacking = false
    this.heldWeapon = undefined
    this.bossState = 'idle'
    this.bossStateUntil = 0
    this.bossAttackStart = 0
    this.currentAttack = 'web'
    this.nextAttack = 'web'

    this.activeWeapon = WEAPONS[runState.weaponId ?? DEFAULT_WEAPON_ID]

    this.physics.world.setBounds(0, 0, width, height)

    // Planet background (purely visual, behind everything).
    const planet = PLANETS[runState.planetId]
    this.add
      .image(width / 2, height / 2, planet.backgroundKey)
      .setDisplaySize(width, height)
      .setDepth(-10)

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

    // Spider Prince (first real boss).
    this.bossSprite = this.add.sprite(
      width * 0.75,
      height - groundHeight - BOSS_HEIGHT / 2 - 10,
      'spiderPrince',
    )
    this.bossSprite.setDisplaySize(BOSS_WIDTH, BOSS_HEIGHT)
    this.physics.add.existing(this.bossSprite)
    this.bossBody = this.bossSprite.body as Phaser.Physics.Arcade.Body
    this.bossBody.setSize(BOSS_WIDTH, BOSS_HEIGHT)
    this.bossBody.setCollideWorldBounds(true)
    this.enterBossState('idle')

    // Physics relations.
    this.physics.add.collider(this.playerRect, ground)
    this.physics.add.collider(this.bossSprite, ground)
    this.physics.add.overlap(this.playerRect, this.bossSprite, () => this.onContact())

    // Held weapon (visible for melee/heavy; projectile weapons are thrown, not held).
    if (this.activeWeapon.type !== 'projectile') {
      this.heldWeapon = this.add.image(0, 0, this.activeWeapon.id)
      this.heldWeapon.setDisplaySize(36, 36)
      this.heldWeapon.setOrigin(0.2, 0.7)
      this.updateHeldWeaponPose()
    }

    // Projectiles (used by ranged weapons).
    // Note: Phaser's overlap callback is invoked as (sprite, groupMember) regardless
    // of argument order to add.overlap, so the projectile is the SECOND argument.
    this.projectiles = this.physics.add.group({ allowGravity: false })
    this.physics.add.overlap(this.projectiles, this.bossSprite, (_boss, projObj) => {
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

    if (this.heldWeapon && !this.isAttacking) {
      this.updateHeldWeaponPose()
    }
  }

  private updateHeldWeaponPose(): void {
    if (!this.heldWeapon) return
    const offsetX = this.facingRight ? 10 : -10
    this.heldWeapon.setPosition(this.playerRect.x + offsetX, this.playerRect.y + 4)
    this.heldWeapon.setFlipX(!this.facingRight)
    this.heldWeapon.setAngle(this.facingRight ? -20 : 20)
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

    const hitbox = new Phaser.Geom.Rectangle(
      x - w.range / 2,
      y - MELEE_HITBOX_HEIGHT / 2,
      w.range,
      MELEE_HITBOX_HEIGHT,
    )
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        hitbox,
        this.bossSprite.getBounds(),
      )
    ) {
      this.damageBoss(w.damage)
    }

    if (!this.heldWeapon) return

    this.isAttacking = true
    const restX = this.playerRect.x + (this.facingRight ? 10 : -10)
    const restAngle = this.facingRight ? -20 : 20
    this.tweens.add({
      targets: this.heldWeapon,
      x: { from: restX, to: x },
      angle: { from: restAngle, to: 0 },
      duration: ATTACK_FLASH_MS,
      ease: Phaser.Math.Easing.Quadratic.Out,
      yoyo: true,
      onComplete: () => {
        this.isAttacking = false
        this.updateHeldWeaponPose()
      },
    })
  }

  private spawnProjectile(): void {
    const w = this.activeWeapon
    const speed = w.projectileSpeed ?? 0
    const offsetX = this.facingRight ? w.range : -w.range
    const proj = this.add.image(
      this.playerRect.x + offsetX,
      this.playerRect.y,
      w.id,
    )
    proj.setDisplaySize(32, 32)
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
        this.bossSprite.clearTint()
        this.bossStateUntil = now + BOSS_IDLE_MS
        break
      case 'telegraph':
        this.bossSprite.setTint(TELEGRAPH_COLOR)
        this.bossStateUntil = now + BOSS_TELEGRAPH_MS
        break
      case 'attack':
        this.bossSprite.clearTint()
        this.bossAttackStart = now
        break
      case 'recovery':
        this.bossSprite.clearTint()
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
    const dir = this.playerRect.x < this.bossSprite.x ? -1 : 1
    const spawnX = this.bossSprite.x + dir * (BOSS_WIDTH / 2 + WEB_SIZE / 2 + 2)
    const web = this.add.rectangle(spawnX, this.bossSprite.y, WEB_SIZE, WEB_SIZE, WEB_COLOR)
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
    const dir = this.playerRect.x < this.bossSprite.x ? -1 : 1
    this.bossBody.setVelocity(dir * BOSS_LEAP_VX, BOSS_LEAP_VY)
  }

  private endBattle(won: boolean): void {
    this.battleOver = true
    this.playerBody.setVelocity(0, 0)
    this.bossBody.setVelocity(0, 0)
    this.bossState = 'recovery'
    this.bossProjectiles.getChildren().forEach((child) => child.destroy())
    const message = won ? 'WIN' : 'LOSE'

    const { width, height } = this.scale
    this.add
      .text(width / 2, height / 2, message, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '72px',
        color: won ? '#4ecdc4' : '#ff6b6b',
      })
      .setOrigin(0.5)

    setLastResult(won ? 'win' : 'lose')
    this.time.delayedCall(900, () => this.scene.start('Result'))
  }
}
