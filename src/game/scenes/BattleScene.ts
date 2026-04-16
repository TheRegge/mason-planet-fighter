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

    // Dummy boss.
    this.bossRect = this.add.rectangle(
      width * 0.75,
      height - groundHeight - 60,
      60,
      80,
      0xff6b6b,
    )
    this.physics.add.existing(this.bossRect)
    this.bossBody = this.bossRect.body as Phaser.Physics.Arcade.Body
    this.bossBody.setSize(60, 80)
    this.bossBody.setCollideWorldBounds(true)

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

  private endBattle(won: boolean): void {
    this.battleOver = true
    this.playerBody.setVelocity(0, 0)
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
