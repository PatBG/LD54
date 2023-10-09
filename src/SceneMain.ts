import * as Phaser from 'phaser';
import { GameState, Global } from './Global';
import { Player } from './Player';
import { Bullets, Bullet } from './Bullets';
import { Enemies, Enemy } from './Enemies';
import { Modules, Module } from './Modules';

export class SceneMain extends Phaser.Scene {
    player: Player;
    enemies: Enemies;

    constructor() {
        super({ key: 'SceneMain', active: true });
    }

    preload() {
        // this.load.image('structure', 'assets/structure.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.spritesheet('modules', 'assets/modules.png', { frameWidth: 16, frameHeight: 16 });

        this.load.image('enemy1', 'assets/enemy1.png');
        this.load.image('enemy2', 'assets/enemy2.png');
        this.load.image('enemyBullet', 'assets/enemyBullet.png');

        Global.initCanvasSize(this);
    }

    create() {
        Global.enemyBullets = this.add.existing(new Bullets(this.physics.world, this, { name: 'enemyBullets' }));
        Global.enemyBullets.createMultiple({ key: 'enemyBullet', quantity: 100 });
        this.enemies = this.add.existing(new Enemies(this.physics.world, this, { name: 'enemies' }, Global.enemyBullets));

        Global.bullets = this.add.existing(new Bullets(this.physics.world, this, { name: 'bullets' }));
        Global.bullets.createMultiple({ key: 'bullet', quantity: 100 });
        this.player = new Player(this, Global.PlayerPosInShop.x, Global.PlayerPosInShop.y);

        this.physics.world.on('worldbounds', (body) => { body.gameObject.onWorldBounds(); });

        Global.explosionEnemy = this.add.particles(0, 0, 'enemyBullet', {
            alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
            blendMode: Phaser.BlendModes.SCREEN,
            frequency: -1,
            lifespan: 500,
            radial: false,
            scale: { start: 1, end: 5, ease: 'Cubic.easeOut' }
        });

        Global.explosionPlayer = this.add.particles(0, 0, 'bullet', {
            alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
            blendMode: Phaser.BlendModes.SCREEN,
            frequency: -1,
            lifespan: 500,
            radial: false,
            scale: { start: 1, end: 3, ease: 'Cubic.easeOut' }
        });

        // Collision player/enemyBullet
        this.physics.add.overlap(this.player.modules, Global.enemyBullets, (module: Module, bullet: Bullet) => {
            module.onHit();
            bullet.disableBody(true, true);
            Global.explosionPlayer.emitParticleAt(this.player.x + module.x, this.player.y + module.y);
        });

        // Collision enemy/playerBullet
        this.physics.add.overlap(this.enemies, Global.bullets, (enemy: Enemy, bullet: Bullet) => {
            enemy.onHit();
            bullet.disableBody(true, true);
            Global.explosionEnemy.emitParticleAt(enemy.x, enemy.y);
        });

        // Collision player/enemy
        this.physics.add.overlap(this.player.modules, this.enemies, (module: Module, enemy: Enemy) => {
            module.onHit();
            enemy.onHit();
            Global.explosionPlayer.emitParticleAt(this.player.x + module.x, this.player.y + module.y);
            Global.explosionEnemy.emitParticleAt(enemy.x, enemy.y);
        });

        Global.setGameState(GameState.Shop);

        // HACK: stop the fight and go to SHOP
        this.input.keyboard.addKey('ESC').on('down', () => { this.hackGoToShop(); });
    }

    hackGoToShop() {
        if (Global.getGameState() === GameState.Fight) {
            // Remove all enemies
            this.enemies.children.each((enemy: Enemy) => { enemy.onDestroy(); return true; });
            this.enemies.clear(true, true);
            // Remove all enemies bullets
            Global.enemyBullets.children.each((bullet: Bullet) => { bullet.disableBody(true, true); return true; });
            // Go to SHOP
            Global.setGameState(GameState.GoToShop);
        }
    }

    update(time, delta) {
        this.player.update(time, delta);
    }
}

