import * as Phaser from 'phaser';
import { GameState, GameManager } from './GameManager';
import { Modules } from './Modules';
import { Module, ModuleType } from './Module';
import { Bullets } from './Bullets';
import { PlayerFightControls } from './PlayerFightControls';

export class Player extends Phaser.GameObjects.Container {
    private static instance: Player;
    public static getInstance(): Player {
        if (!Player.instance) {
            throw new Error('Player not initialized');
        }
        return Player.instance;
    }

    speed = 200;
    modules: Modules;
    bullets: Bullets;

    soundPlayerShield: Phaser.Sound.BaseSound;
    PlayerFire: Phaser.Sound.BaseSound;
    PlayerExplosion: Phaser.Sound.BaseSound;

    playerFightControls: PlayerFightControls;


    constructor(scene: Phaser.Scene, x: number, y: number, bullets: Bullets) {
        super(scene, x, y);
        this.bullets = bullets;
        Player.instance = this;
        scene.add.existing(this);

        this.modules = this.scene.add.existing(new Modules(this.scene.physics.world, this.scene, { name: 'modulesContainer' }, this.bullets));

        this.playerFightControls = new PlayerFightControls(this.scene);

        GameManager.getInstance().onGameStateChange((state: GameState) => { this.onGameStateChange(state); });

        this.scale = GameManager.getInstance().playerScale;
    }

    update(time, delta) {
        if (GameManager.getInstance().getGameState() !== GameState.Fight) return;

        if (this.modules.countActive() === 0) {
            GameManager.getInstance().setGameState(GameState.GameOver);
            return;
        }

        // Get the normalized player movement
        const [move, maxDist] = this.playerFightControls.getNormalizedMovementSwipe(new Phaser.Math.Vector2(this.x, this.y));

        // Convert normalized movement according to speed and delta time
        move.x *= this.speed * delta / 1000;
        move.y *= this.speed * delta / 1000;

        const dist = Phaser.Math.Distance.Between(0, 0, move.x, move.y);
        if (dist > maxDist) {
            move.x /= dist / maxDist;
            move.y /= dist / maxDist;
        }

        // Compute screen bounds, taking modules bounds in account
        const xLeft = GameManager.getInstance().rectCurrentGame.x;
        const xRight = xLeft + GameManager.getInstance().rectCurrentGame.width;
        const yTop = GameManager.getInstance().rectCurrentGame.y;
        const yBottom = yTop + GameManager.getInstance().rectCurrentGame.height;
        const [minModuleBound, maxModuleBound] = this.modules.getModulesBounds();
        // Update player position
        this.x = Phaser.Math.Clamp(this.x + move.x, xLeft - minModuleBound.x, xRight - maxModuleBound.x);
        this.y = Phaser.Math.Clamp(this.y + move.y, yTop - minModuleBound.y, yBottom - maxModuleBound.y);

        // Update modules
        this.modules.update(time, delta);
    }

    onGameStateChange(state: GameState) {
        if (state === GameState.EndWave) {
            this.modules.onEndWave();
            // Go automatically to the shop position
            const tween = this.scene.tweens.add({
                targets: this,
                x: GameManager.getInstance().playerPosInShop.x,
                y: GameManager.getInstance().playerPosInShop.y,
                ease: 'Linear',
                duration: Math.sqrt(Math.pow(this.x - GameManager.getInstance().playerPosInShop.x, 2)
                    + Math.pow(this.y - GameManager.getInstance().playerPosInShop.y, 2)) / this.speed * 1000,
                onComplete: () => {
                    GameManager.getInstance().setGameState(GameState.Shop);
                },
            });
        }
        else if (state === GameState.Fight) {
            this.modules.onBeginWave();
        }
        else if (state === GameState.GameStart) {
            // Initialisation of the player ship
            this.x = GameManager.getInstance().playerPosInShop.x;
            this.y = GameManager.getInstance().playerPosInShop.y;

            this.removeAllStructures();
            this.addNewStructure(0, 0);
            this.addNewStructure(-1, 1);
            this.addNewStructure(0, 1);
            this.addNewStructure(1, 1);

            this.addNewModule(0, 0, ModuleType.Cannon);
            this.addNewModule(-1, 1, ModuleType.Defense);
            this.addNewModule(0, 1, ModuleType.Merchandise);
            this.addNewModule(1, 1, ModuleType.Defense);
        }
    }

    addNewStructure(x: number, y: number) {
        return this.add(this.scene.add.sprite(x * GameManager.getInstance().moduleSize.x, y * GameManager.getInstance().moduleSize.y, 'modules', 0));
    }

    isStructure(x: number, y: number): boolean {
        return this.getStructure(x, y) !== undefined;
    }

    getStructure(x: number, y: number): Phaser.GameObjects.Sprite | undefined {
        let structure = undefined;
        const xx = x * GameManager.getInstance().moduleSize.x;
        const yy = y * GameManager.getInstance().moduleSize.y;
        this.each((sprite: Phaser.GameObjects.Sprite) => {
            if (sprite.x == xx && sprite.y == yy && sprite.frame.name == '0') {
                structure = sprite;
            }
        }, this);
        return structure;
    }

    removeStructure(x: number, y: number): boolean {
        const structure = this.getStructure(x, y);
        if (structure !== undefined) {
            this.remove(structure, true);
            return true;
        }
        return false;
    }

    buyPriceStructure() : number {
        return 50;
    }

    sellPriceStructure() : number {
        return 25;
    }

    removeAllStructures() {
        this.each((structure: Phaser.GameObjects.Sprite) => { this.remove(structure, true); }, this);
    }

    addNewModule(x: number, y: number, moduleType: ModuleType) {
        return this.add(this.modules.newModule(x, y, moduleType));
    }

    getModule(x: number, y: number): Module | undefined {
        return this.modules.getModule(x, y);
    }

    removeModule(x: number, y: number): boolean {
        const module = this.modules.getModule(x, y);
        if (module !== undefined) {
            this.modules.remove(module, true, true);
            return true;
        }
        return false;
    }

    nbModule(): number {
        return this.modules.getLength();
    }

    getPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.x, this.y);
    }
}