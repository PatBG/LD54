import * as Phaser from 'phaser';
import { Bullet, Bullets } from './Bullets';
import { GameState, GameManager } from './GameManager';
import { SoundManager } from './SoundManager';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Image {
    bullets: Bullets;
    bulletVelocity = 300;
    timerFiring: Phaser.Time.TimerEvent;
    tweenMoving: Phaser.Tweens.Tween;
    shipVelocity = 200;

    onCreate(bullets: Bullets) {
        this.name = `${this.texture.key} ${this.x} ${this.y})`;
        this.bullets = bullets;
        this.timerFiring = this.scene.time.addEvent({
            delay: 750,
            loop: true,
            callback: () => { this.onFire(); },
        });

        if (this.texture.key === 'enemy1') {
            this.tweenMoving = this.scene.tweens.add({
                targets: this.body.velocity,
                props: {
                    x: { from: 150, to: -150, duration: 4000 },
                    y: this.shipVelocity,
                },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => { this.onCheckOffscreenLimits() }
            });
        }
        else if (this.texture.key === 'enemy2') {
            this.tweenMoving = this.scene.tweens.add({
                targets: this,
                rotation: { from: -0.5, to: +0.5, duration: 1500 },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    this.body.velocity.x = this.shipVelocity * Math.cos(this.rotation + 0.5 * Math.PI);
                    this.body.velocity.y = this.shipVelocity * Math.sin(this.rotation + 0.5 * Math.PI);
                    this.onCheckOffscreenLimits()
                }
            });
        }
        else {  // enemy3
            let vx = this.shipVelocity;
            if (this.x > GameManager.getInstance().canvasCenter.x) {
                this.rotation = Math.PI;    // Face the center of the screen
                vx = -this.shipVelocity;
            }
            this.tweenMoving = this.scene.tweens.add({
                targets: this.body.velocity,
                props: {
                    x: { from: vx, to: vx, duration: 1000 },
                    y: { from: -50, to: 50, duration: 1000 },
                },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => { this.onCheckOffscreenLimits() }
            });
            this.soundLoop = this.scene.sound.add('EnemyFlyingSaucer');
            this.soundLoop.play({ loop: true });
        }
    }
    soundLoop: Phaser.Sound.BaseSound;

    onCheckOffscreenLimits(): void {
        const marginY = 50;
        const marginX = 200;
        // Remove this enemy when it is offscreen on the side or bottom
        if (this.x < 0 - marginX || this.x > GameManager.getInstance().canvasSize.x + marginX || this.y > GameManager.getInstance().canvasSize.y + marginY) {
            this.onDestroy();
        }
    }

    onHit() {
        this.onDestroy();
        // Bonus when an enemy is destroyed
        GameManager.getInstance().moneyBonus += 5;
        SoundManager.getInstance().EnemyExplosion.play();
    }

    onFire() {
        const v = new Phaser.Math.Vector2();
        if (this.texture.key === 'enemy3') {
            // Enemy fire at the player
            const rotation = Phaser.Math.Angle.BetweenPoints(this, Player.getInstance().getPosition());
            v.x = Math.cos(rotation) * this.bulletVelocity;
            v.y = Math.sin(rotation) * this.bulletVelocity;
        }
        else {
            // Enemy fire forward, according to its rotation
            v.x = Math.cos(this.rotation + 0.5 * Math.PI) * this.bulletVelocity;
            v.y = Math.sin(this.rotation + 0.5 * Math.PI) * this.bulletVelocity;
        }
        this.bullets.fire(this.x, this.y, v.x, v.y);
        //SoundManager.getInstance().EnemyFire.play();      // Too much noise
    }

    onDestroy() {
        this.timerFiring.remove();
        this.tweenMoving.remove();
        this.destroy();
        if (this.soundLoop != undefined) {
            this.soundLoop.stop();
        }
    }
}

export class Enemies extends Phaser.Physics.Arcade.Group {
    bullets: Bullets;
    rnd: Phaser.Math.RandomDataGenerator;
    waveTotalEnemies: number;
    waveEnemiesSpawned: number;

    constructor(world: Phaser.Physics.Arcade.World, scene: Phaser.Scene, config, bullets: Bullets) {
        super(
            world,
            scene,
            { ...config, classType: Enemy, createCallback: Enemies.prototype.onCreate }
        );
        this.bullets = bullets;

        GameManager.getInstance().onGameStateChange((state: GameState) => { this.onGameStateChange(state); });
    }

    callbackSpawnEnemies() {
        if (this.waveEnemiesSpawned < this.waveTotalEnemies) {
            if (GameManager.getInstance().wave > 3 && this.rnd.between(0, 100 + GameManager.getInstance().wave) < GameManager.getInstance().wave) {
                this.spawn(
                    this.rnd.pick([-100, GameManager.getInstance().canvasSize.x + 100]),
                    GameManager.getInstance().canvasCenter.y + this.rnd.between(-50, 50),
                    'enemy3');
                this.waveEnemiesSpawned++;
            }
            else {
                const firstEnemy = this.spawn(
                    this.rnd.between(50, GameManager.getInstance().canvasSize.x - 50),
                    this.rnd.between(-100, -50),
                    this.rnd.pick([
                        'enemy1',
                        'enemy2'
                    ]));
                this.waveEnemiesSpawned++;
                // Spawn a second enemy with increasing probability as the wave number increases
                if (GameManager.getInstance().wave > 1 && this.waveEnemiesSpawned < this.waveTotalEnemies
                    && this.rnd.between(0, 100 + GameManager.getInstance().wave) < GameManager.getInstance().wave) {
                    this.spawn(firstEnemy.x + 50, firstEnemy.y, firstEnemy.texture.key);
                    this.waveEnemiesSpawned++;
                }

                // Spawn a third enemy with increasing probability as the wave number increases
                if (GameManager.getInstance().wave > 2 && this.waveEnemiesSpawned < this.waveTotalEnemies
                    && this.rnd.between(0, 100 + GameManager.getInstance().wave) < GameManager.getInstance().wave) {
                    this.spawn(firstEnemy.x - 50, firstEnemy.y, firstEnemy.texture.key);
                    this.waveEnemiesSpawned++;
                }
            }

            // Recall this function until all enemies are spawned
            this.scene.time.delayedCall(((50 * 750) / (50 + GameManager.getInstance().wave)) + this.rnd.between(0, 100),
                () => { this.callbackSpawnEnemies(); });
        }
    }

    onGameStateChange(state: GameState) {
        if (GameManager.getInstance().getGameState() === GameState.Fight) {
            // Start a new wave 
            this.rnd = new Phaser.Math.RandomDataGenerator([`${GameManager.getInstance().wave}`]);
            this.waveTotalEnemies = 30 + GameManager.getInstance().wave * 3;
            this.waveEnemiesSpawned = 0;
            this.callbackSpawnEnemies();
        }
        else {
        }
    }

    killAll() {
        // Remove all remaining enemies
        this.children.each((enemy: Enemy) => { enemy.onDestroy(); return true; });
        this.clear(true, true);
        // Remove all remaining enemies bullets
        this.bullets.children.each((bullet: Bullet) => { bullet.disableBody(true, true); return true; });
    }

    spawn(x: number, y: number, image: string) {
        return this.create(x, y, image);
    }

    onCreate(enemy: Enemy) {
        enemy.onCreate(this.bullets);
    }

    update(time, delta) {
        if (GameManager.getInstance().getGameState() !== GameState.Fight) return;

        if (this.waveEnemiesSpawned >= this.waveTotalEnemies && this.countActive() === 0 && this.bullets.countActive() === 0) {
            GameManager.getInstance().setGameState(GameState.EndWave);
        }
    }
}