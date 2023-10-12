import * as Phaser from 'phaser';
import { GameState, Global } from './Global';
import { Module, Modules, ModuleType } from './Modules';
import { Bullets } from './Bullets';


export class Player extends Phaser.GameObjects.Container {
    speed = 300;
    modules: Modules;
    bullets: Bullets;
    private static singleton: Player;

    constructor(scene: Phaser.Scene, x: number, y: number, bullets: Bullets) {
        super(scene, x, y);
        this.bullets = bullets;
        Player.singleton = this;
        scene.add.existing(this);
        this.setSize(46, 30);
        scene.physics.world.enableBody(this);
        // this.body.setCollideWorldBounds(true);
        Global.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        this.add(this.newStructure(0, 0));

        this.add(this.newStructure(-1, 1));
        this.add(this.newStructure(0, 1));
        this.add(this.newStructure(1, 1));

        this.modules = this.scene.add.existing(new Modules(this.scene.physics.world, this.scene, { name: 'modulesContainer' }, this.bullets));
        this.add(this.modules.newModule(0, 0, ModuleType.Cannon));

        this.add(this.modules.newModule(-1, 1, ModuleType.Defense));
        this.add(this.modules.newModule(0, 1, ModuleType.Merchandise));
        this.add(this.modules.newModule(1, 1, ModuleType.Defense));

        Global.onGameStateChange((state: GameState) => { this.onGameStateChange(state); });
    }

    onGameStateChange(state: GameState) {
        if (state === GameState.GoToShop) {
            // Stop the ship
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.modules.onEndWave();
            // Go automatically to the shop position
            const tween = this.scene.tweens.add({
                targets: this,
                x: Global.PlayerPosInShop.x,
                y: Global.PlayerPosInShop.y,
                ease: 'Linear',
                duration: Math.sqrt(Math.pow(this.x - Global.PlayerPosInShop.x, 2) + Math.pow(this.y - Global.PlayerPosInShop.y, 2)) / this.speed * 1000,
                onComplete: () => {
                    Global.setGameState(GameState.Shop);
                },
            });
        }
        else if (state === GameState.Fight) {
            this.modules.onBeginWave();
        }
    }

    update(time, delta) {
        if (Global.getGameState() !== GameState.Fight) return;

        this.modules.update(time, delta);

        if (Global.cursorKeys.left.isDown) {
            this.body.velocity.x = -this.speed;
        }
        else if (Global.cursorKeys.right.isDown) {
            this.body.velocity.x = this.speed;
        }
        else {
            this.body.velocity.x = 0;
        }

        if (Global.cursorKeys.up.isDown) {
            this.body.velocity.y = -this.speed;
        }
        else if (Global.cursorKeys.down.isDown) {
            this.body.velocity.y = this.speed;
        }
        else {
            this.body.velocity.y = 0;
        }

        // this.hackUnitTest();
    }

    hackFirstCall = true;
    hackUnitTest() {                                    // HACK: unit test
        if (this.hackFirstCall) {
            this.hackFirstCall = false;
            for (let x = -2; x <= 2; x++) {             // Unit test : isStructure() and getModule()
                for (let y = 0; y <= 3; y++) {
                    console.log(`Structure [${x},${y}]=${this.isStructure(x, y)}`);
                    const module = this.modules.getModule(x, y);
                    console.log(`Modules [${x},${y}]=${(module === undefined) ? "undefined" : ModuleType[module.moduleType]}`);
                }
            }
        }
    }

    static NewStructure(x: number, y: number) {
        if (Player.singleton === undefined)
            return undefined;
        else
            return Player.singleton.add(Player.singleton.newStructure(x, y));
    }

    newStructure(x: number, y: number) {
        return this.scene.add.sprite(x * Modules.size.x, y * Modules.size.y, 'modules', 0);
    }

    static IsStructure(x: number, y: number): boolean {
        if (Player.singleton === undefined)
            return false;
        else
            return Player.singleton.isStructure(x, y);
    }

    isStructure(x: number, y: number): boolean {
        return this.getStructure(x,y) !== undefined;
    }

    getStructure(x: number, y: number): Phaser.GameObjects.Sprite | undefined {
        let structure = undefined;
        const xx = x * Modules.size.x;
        const yy = y * Modules.size.y;
        this.each((sprite: Phaser.GameObjects.Sprite) => {
            if (sprite.x == xx && sprite.y == yy && sprite.frame.name == '0') {
                structure = sprite;
            }
        }, this);
        return structure;
    }

    static NewModule(x: number, y: number, moduleType: ModuleType) {
        if (Player.singleton === undefined)
            return undefined;
        else
            return Player.singleton.add(Player.singleton.modules.newModule(x, y, moduleType));
    }

    static GetModule(x: number, y: number): Module | undefined {
        if (Player.singleton === undefined)
            return undefined;
        else
            return Player.singleton.modules.getModule(x, y);
    }

    static RemoveModule(x: number, y: number): boolean {
        if (Player.singleton !== undefined) {
            const module = Player.singleton.modules.getModule(x, y);
            if (module !== undefined) {
                Player.singleton.modules.remove(module, true, true);
                return true;
            }
        }
        return false;
    }

    static NbModule(): number {
        if (Player.singleton !== undefined) {
                return Player.singleton.modules.getLength();
        }
        return 0;
    }

    static RemoveStructure(x: number, y: number): boolean {
        if (Player.singleton !== undefined) {
            const structure = Player.singleton.getStructure(x, y);
            if (structure !== undefined) {
                Player.singleton.remove(structure, true);
                return true;
            }
        }
        return false;
    }
}