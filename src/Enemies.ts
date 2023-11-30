import * as Phaser from 'phaser';
import { Bullet, Bullets } from './Bullets';
import { GameState, GameManager } from './GameManager';
import { Enemy } from './Enemy';

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
                    this.rnd.pick([-100, GameManager.getInstance().sizeMaxGame.width + 100]),
                    GameManager.getInstance().canvasCenter.y + this.rnd.between(-50, 50),
                    'enemy3');
                this.waveEnemiesSpawned++;
            }
            else {
                let enemyKey: string;
                if (GameManager.getInstance().wave == 1) {
                    enemyKey = 'enemy1';
                }
                else if (GameManager.getInstance().wave == 2) {
                    enemyKey = 'enemy2';
                }
                else {
                    enemyKey = this.rnd.pick([
                        'enemy1',
                        'enemy2'
                    ]);
                }
                const firstEnemy = this.spawn(
                    this.rnd.between(
                        GameManager.getInstance().rectMinGame.x,
                        GameManager.getInstance().rectMinGame.x + GameManager.getInstance().rectMinGame.width),
                    -50,
                    enemyKey
                );
                this.waveEnemiesSpawned++;
                // Spawn a second enemy with increasing probability as the wave number increases
                if (GameManager.getInstance().wave > 2 && this.waveEnemiesSpawned < this.waveTotalEnemies
                    && this.rnd.between(0, 100 + GameManager.getInstance().wave) < GameManager.getInstance().wave) {
                    this.spawn(firstEnemy.x + 50, firstEnemy.y, firstEnemy.texture.key);
                    this.waveEnemiesSpawned++;
                }

                // Spawn a third enemy with increasing probability as the wave number increases
                if (GameManager.getInstance().wave > 3 && this.waveEnemiesSpawned < this.waveTotalEnemies
                    && this.rnd.between(0, 100 + GameManager.getInstance().wave) < GameManager.getInstance().wave) {
                    this.spawn(firstEnemy.x - 50, firstEnemy.y, firstEnemy.texture.key);
                    this.waveEnemiesSpawned++;
                }
            }

            // Recall this function until all enemies are spawned
            this.scene.time.delayedCall(((1000 * 50) / (50 + GameManager.getInstance().wave)) + this.rnd.between(0, 1000),
                this.callbackSpawnEnemies, [], this);
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
        if (GameManager.getInstance().getGameState() === GameState.Fight) {
            if (this.waveEnemiesSpawned >= this.waveTotalEnemies && this.countActive() === 0 && this.bullets.countActive() === 0) {
                GameManager.getInstance().setGameState(GameState.EndWave);
            }
        }
    }
}