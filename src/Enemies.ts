import * as Phaser from 'phaser';
import { Bullet, Bullets } from './Bullets';
import { GameState, Global } from './Global';
import { Sounds } from './Sounds';

export class Enemy extends Phaser.Physics.Arcade.Image {
    bullets: Bullets;
    timerFiring: Phaser.Time.TimerEvent;
    tweenMoving: Phaser.Tweens.Tween;
    maxY: number;

    onCreate(bullets: Bullets) {
        this.name = `${this.texture.key} ${this.x} ${this.y})`;
        this.bullets = bullets;
        this.maxY = Global.canvasSize.y + 50;
        this.timerFiring = this.scene.time.addEvent({
            delay: 750,
            loop: true,
            callback: () => { this.onFire(); },
        });
        this.tweenMoving = this.scene.tweens.add({
            targets: this.body.velocity,
            props: {
                x: { from: 150, to: -150, duration: 4000 },
                y: 200,
            },
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (this.y > this.maxY) {
                    this.onDestroy();       // Remove this enemy when it is offscreen on the bottom
                }
            }
        });
    }

    onHit() {
        this.onDestroy();
        // Bonus when an enemy is destroyed
        Global.moneyBonus += 10;
        Sounds.EnemyExplosion.play();
    }

    onFire() {
        this.bullets.fire(this.x, this.y, 0, 300);
        //Sounds.EnemyFire.play();
    }

    onDestroy() {
        this.timerFiring.remove();
        this.tweenMoving.remove();
        this.destroy();
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

        Global.onGameStateChange((state: GameState) => { this.onGameStateChange(state); });
    }

    callbackSpawnEnemies() {
        if (this.waveEnemiesSpawned < this.waveTotalEnemies) {
            this.spawn(
                this.rnd.between(50, Global.canvasSize.x - 50),
                this.rnd.between(-100, -50),
                (this.rnd.normal() > 0) ? 'enemy1' : 'enemy2');
            this.waveEnemiesSpawned++;

            // Recall this function until all enemies are spawned
            this.scene.time.delayedCall((1000 / this.rnd.between(1, 1 + Global.wave)) + this.rnd.between(0, 500),
                () => { this.callbackSpawnEnemies(); });
        }
    }

    onGameStateChange(state: GameState) {
        if (Global.getGameState() === GameState.Fight) {
            // Start a new wave
            this.rnd = new Phaser.Math.RandomDataGenerator("SeedWave" + Global.wave);
            this.waveTotalEnemies = 10 + Global.wave * 2;
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
        this.create(x, y, image);
    }

    onCreate(enemy: Enemy) {
        enemy.onCreate(this.bullets);
    }

    update(time, delta) {
        if (Global.getGameState() !== GameState.Fight) return;

        if (this.waveEnemiesSpawned >= this.waveTotalEnemies && this.countActive() === 0 && this.bullets.countActive() === 0) {
            Global.setGameState(GameState.EndWave);
        }
    }
}