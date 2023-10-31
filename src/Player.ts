import * as Phaser from 'phaser';
import { GameState, GameManager } from './GameManager';
import { Module, Modules, ModuleType } from './Modules';
import { Bullets } from './Bullets';
import { Bounds } from 'matter';


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

    keyLeft: Phaser.Input.Keyboard.Key;
    keyLeft2: Phaser.Input.Keyboard.Key;
    keyRight: Phaser.Input.Keyboard.Key;
    keyUp: Phaser.Input.Keyboard.Key;
    keyUp2: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number, bullets: Bullets) {
        super(scene, x, y);
        this.bullets = bullets;
        Player.instance = this;
        scene.add.existing(this);
        this.setSize(46, 30);
        scene.physics.world.enableBody(this);
        // this.body.setCollideWorldBounds(true);
        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        this.keyLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyLeft2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyRight = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyUp2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.modules = this.scene.add.existing(new Modules(this.scene.physics.world, this.scene, { name: 'modulesContainer' }, this.bullets));

        GameManager.getInstance().onGameStateChange((state: GameState) => { this.onGameStateChange(state); });

        this.scale = GameManager.getInstance().playerScale = 1;
    }

    onGameStateChange(state: GameState) {
        if (state === GameState.EndWave) {
            // Stop the ship
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
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
        else if (state === GameState.GameOver) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }
    }

    inputIsKey = true;
    inputPrecPointer = new Phaser.Math.Vector2(0, 0);
    update(time, delta) {
        if (GameManager.getInstance().getGameState() !== GameState.Fight) return;

        if (this.modules.countActive() === 0) {
            GameManager.getInstance().setGameState(GameState.GameOver);
            return;
        }

        // Update modules
        this.modules.update(time, delta);

        if (this.cursorKeys.left.isDown || this.keyLeft.isDown || this.keyLeft2.isDown
            || this.cursorKeys.right.isDown
            || this.cursorKeys.up.isDown || this.keyUp.isDown || this.keyUp2.isDown
            || this.cursorKeys.down.isDown
            || !this.scene.input.isOver) {
            this.inputIsKey = true;
        }
        else if (this.inputPrecPointer.x != this.scene.input.activePointer.x
            || this.inputPrecPointer.y != this.scene.input.activePointer.y) {
            this.inputPrecPointer.x = this.scene.input.activePointer.x;
            this.inputPrecPointer.y = this.scene.input.activePointer.y;
            this.inputIsKey = false;
        }

        let v = new Phaser.Math.Vector2(0, 0);
        if (!this.inputIsKey) {
            const mouse = this.scene.input.activePointer;
            const playerRect = new Phaser.Geom.Rectangle(this.x - 8, this.y - 8, 16, 16);
            // if the mouse pointer is on the scene and not over the center ship, move the ship
            if (!playerRect.contains(mouse.x, mouse.y)) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.input.activePointer.x, this.scene.input.activePointer.y);
                v.x = Math.cos(angle) * this.speed;
                v.y = Math.sin(angle) * this.speed;
            }
        }
        else {
            if (this.keyLeft.isDown || this.keyLeft2.isDown || this.cursorKeys.left.isDown) {
                v.x = -this.speed;
            }
            else if (this.keyRight.isDown || this.cursorKeys.right.isDown) {
                v.x = this.speed;
            }

            if (this.keyUp.isDown || this.keyUp2.isDown || this.cursorKeys.up.isDown) {
                v.y = -this.speed;
            }
            else if (this.keyDown.isDown || this.cursorKeys.down.isDown) {
                v.y = this.speed;
            }

            // Diagonal movement : normalize speed
            if (v.x !== 0 && v.y !== 0) {
                v.x *= 0.7071;
                v.y *= 0.7071;
            }
        }

        // Check screen bounds
        if ((this.x < 0 && v.x < 0) || (this.x > GameManager.getInstance().canvasSize.x && v.x > 0)) {
            v.x = 0;
        }
        if ((this.y < 0 && v.y < 0) || (this.y > GameManager.getInstance().canvasSize.y && v.y > 0)) {
            v.y = 0;
        }
        this.body.velocity.x = v.x;
        this.body.velocity.y = v.y;
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

    removeStructure(x: number, y: number): boolean {
        const structure = this.getStructure(x, y);
        if (structure !== undefined) {
            this.remove(structure, true);
            return true;
        }
        return false;
    }

    removeAllStructures() {
        this.each((structure: Phaser.GameObjects.Sprite) => { this.remove(structure, true); }, this);
    }

    getPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.x, this.y);
    }
}