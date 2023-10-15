import * as Phaser from 'phaser';
import { GameState, Global } from './Global';
import { Player } from './Player';
import { Bullets, Bullet } from './Bullets';
import { Enemies, Enemy } from './Enemies';
import { Sounds } from './Sounds';
import { Modules, Module, ModuleType } from './Modules';

export class SceneMain extends Phaser.Scene {
    player: Player;
    enemies: Enemies;
    bullets: Bullets;
    enemyBullets: Bullets;
    explosionModuleDestroyed: Phaser.GameObjects.Particles.ParticleEmitter;
    explosionEnemy: Phaser.GameObjects.Particles.ParticleEmitter;
    explosionModuleHit: Phaser.GameObjects.Particles.ParticleEmitter;
    infoText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'SceneMain', active: true });
    }

    preload() {
        // this.load.image('structure', 'assets/structure.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.spritesheet('modules', 'assets/modules.png', { frameWidth: 16, frameHeight: 16 });

        this.load.image('enemy1', 'assets/enemy1.png');
        this.load.image('enemy2', 'assets/enemy2.png');
        this.load.image('enemy3', 'assets/enemy3.png');
        this.load.image('enemyBullet', 'assets/enemyBullet.png');

        Global.initCanvasSize(this);
        Sounds.preload(this);
    }

    create() {
        Sounds.create(this);

        this.infoText = this.add.text(5, 5, '', { font: '16px monospace', color: 'white' });

        this.enemyBullets = this.add.existing(new Bullets(this.physics.world, this, { name: 'enemyBullets' }));
        this.enemyBullets.createMultiple({ key: 'enemyBullet', quantity: 100 });
        this.enemies = this.add.existing(new Enemies(this.physics.world, this, { name: 'enemies' }, this.enemyBullets));

        this.bullets = this.add.existing(new Bullets(this.physics.world, this, { name: 'bullets' }));
        this.bullets.createMultiple({ key: 'bullet', quantity: 100 });
        this.player = new Player(this, Global.PlayerPosInShop.x, Global.PlayerPosInShop.y, this.bullets);

        this.physics.world.on('worldbounds', (body) => { body.gameObject.onWorldBounds(); });

        this.explosionEnemy = this.add.particles(0, 0, 'enemyBullet', {
            alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
            blendMode: Phaser.BlendModes.SCREEN,
            frequency: -1,
            lifespan: 500,
            radial: false,
            scale: { start: 1, end: 5, ease: 'Cubic.easeOut' }
        });

        this.explosionModuleDestroyed = this.add.particles(0, 0, 'bullet', {
            alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
            blendMode: Phaser.BlendModes.SCREEN,
            frequency: -1,
            lifespan: 500,
            radial: false,
            scale: { start: 1, end: 3, ease: 'Cubic.easeOut' }
        });

        this.explosionModuleHit = this.add.particles(0, 0, 'modules', {
            alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
            blendMode: Phaser.BlendModes.SCREEN,
            frequency: -1,
            lifespan: 500,
            radial: false,
            scale: { start: 1, end: 3, ease: 'Cubic.easeOut' }
        });

        // Collision player/enemyBullet
        this.physics.add.overlap(this.player.modules, this.enemyBullets, (module: Module, bullet: Bullet) => {
            module.onHit();
            bullet.disableBody(true, true);
            if (module.isAlive()) {
                this.explosionModuleHit.setEmitterFrame([module.moduleType]);
                this.explosionModuleHit.emitParticleAt(this.player.x + module.x, this.player.y + module.y);
            }
            else {
                this.explosionModuleDestroyed.emitParticleAt(this.player.x + module.x, this.player.y + module.y);
            }
        });

        // Collision enemy/playerBullet
        this.physics.add.overlap(this.enemies, this.bullets, (enemy: Enemy, bullet: Bullet) => {
            enemy.onHit();
            bullet.disableBody(true, true);
            this.explosionEnemy.emitParticleAt(enemy.x, enemy.y);
        });

        // Collision player/enemy
        this.physics.add.overlap(this.player.modules, this.enemies, (module: Module, enemy: Enemy) => {
            enemy.onHit();
            this.explosionEnemy.emitParticleAt(enemy.x, enemy.y);
            module.onHit();
            if (module.isAlive()) {
                this.explosionModuleHit.setEmitterFrame([module.moduleType]);
                this.explosionModuleHit.emitParticleAt(this.player.x + module.x, this.player.y + module.y);
            }
            else {
                this.explosionModuleDestroyed.emitParticleAt(this.player.x + module.x, this.player.y + module.y);
            }
        });

        Global.onGameStateChange((state: GameState) => { this.onGameStateChange(state); });
        Global.setGameState(GameState.GameStart);

        // HACK: End the current wave with a key for testing
        this.input.keyboard.addKey('ESC').on('down', () => { this.hackEndWave(); });
    }


    onGameStateChange(state: GameState) {
        if (state === GameState.Fight) {
            Global.wave++;
        }
        else if (state === GameState.GameOver) {
            // Stop the spawning of enemies
            this.enemies.waveTotalEnemies = this.enemies.waveEnemiesSpawned;
            this.scene.launch('SceneGameOver');
        }
        else if (state === GameState.GameStart) {
            // Remove any remaining enemies
            this.enemies.killAll();
            Global.wave = 0;
            Global.money = 0;
            Global.moneyBonus = 0;
            this.scene.launch('SceneGameStart');
        }
        else if (state === GameState.Shop) {
            Global.money += Global.moneyBonus;
            Global.moneyBonus = 0;
            this.scene.launch('SceneShop');
        }
    }

    hackEndWave() {
        if (Global.adminMode && Global.getGameState() === GameState.Fight) {
            // Force the end of the wave by stopping the spawning of enemies
            this.enemies.waveTotalEnemies = this.enemies.waveEnemiesSpawned;
            this.enemies.killAll();
        }
    }

    textInfoNextTime = 0;
    update(time, delta) {
        this.player.update(time, delta);
        this.enemies.update(time, delta);

        if (time > this.textInfoNextTime) {
            this.textInfoNextTime = time + 500;

            let text = '';
            if (Global.wave > 0) {
                text = `Wave: ${Global.wave}`
                if (Global.getGameState() == GameState.Fight) {
                    if (this.enemies.waveTotalEnemies !== undefined) {
                        text += `  ${(100 * (this.enemies.waveEnemiesSpawned - this.enemies.countActive()) / this.enemies.waveTotalEnemies).toFixed(0)} %`;
                        if (Global.adminMode) {
                            text += `  (${this.enemies.waveEnemiesSpawned}/${this.enemies.waveTotalEnemies})`
                        }
                    }
                    text += `  Bonus: ${Global.moneyBonus} $`;
                }
            }
            this.infoText.setText(text);
        }
    }
}

