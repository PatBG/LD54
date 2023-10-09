import * as Phaser from 'phaser';
import { Bullets } from './Bullets';
import { GameState, Global } from './Global';

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
            callback: () => {
                this.bullets.fire(this.x, this.y, 0, 300);
            }
        });
        this.tweenMoving = this.scene.tweens.add({
            targets: this.body.velocity,
            props: {
                x: { from: 150, to: -150, duration: 4000 },
                y: 100,
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
    }

    onDestroy() {
        // console.log(`Enemy.onDestroy(${this.name})`);
        this.timerFiring.remove();
        this.tweenMoving.remove();
        this.destroy();
    }
}

export class Enemies extends Phaser.Physics.Arcade.Group {
    timerSpawnEnemies: Phaser.Time.TimerEvent;
    bullets: Bullets;

    constructor(world: Phaser.Physics.Arcade.World, scene: Phaser.Scene, config, bullets: Bullets) {
        super(
            world,
            scene,
            { ...config, classType: Enemy, createCallback: Enemies.prototype.onCreate }
        );
        this.bullets = bullets;

        this.timerSpawnEnemies = new Phaser.Time.TimerEvent({
            delay: 1000,
            startAt: 1000,                  // Trigger the first call at start
            repeat: -1,
            callback: () => { this.callbackSpawnEnemies(); }
        });
        Global.onGameStateChange((state: GameState) => { this.onGameStateChange(state); });
    }

    callbackSpawnEnemies() {
        this.spawn(
            Phaser.Math.Between(50, Global.canvasSize.x - 50),
            Phaser.Math.Between(-100, -50),
            (Math.random() < 0.5) ? 'enemy1' : 'enemy2');
    }

    onGameStateChange(state: GameState) {
        if (Global.getGameState() === GameState.Fight) {
            this.scene.time.addEvent(this.timerSpawnEnemies);
        }
        else {
            this.scene.time.removeEvent(this.timerSpawnEnemies);
        }
    }

    spawn(x: number, y: number, image: string) {
        this.create(x, y, image);
    }

    onCreate(enemy: Enemy) {
        // console.log(`Enemies.onCreate(${enemy.texture.key} ${enemy.x} ${enemy.y})`);
        enemy.onCreate(this.bullets);
    }

    poolInfo() {
        return `${this.name} ${this.countActive(true)}/${this.getLength()}`;
    }
}