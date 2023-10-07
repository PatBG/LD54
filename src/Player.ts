import * as Phaser from 'phaser';
import { Global } from './Global';
import { Modules, ModuleType } from './Modules';


export class Player extends Phaser.GameObjects.Container {
    speed = 300;
    modules: Modules;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setSize(46, 30);
        scene.physics.world.enableBody(this);
        // this.body.setCollideWorldBounds(true);
        Global.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        this.add(this.newStructure(0, 0));

        this.add(this.newStructure(-1, 1));
        this.add(this.newStructure(0, 1));
        this.add(this.newStructure(1, 1));

        this.add(this.newStructure(-2, 2));
        this.add(this.newStructure(-1, 2));
        this.add(this.newStructure(0, 2));
        this.add(this.newStructure(1, 2));
        this.add(this.newStructure(2, 2));

        this.modules = this.scene.add.existing(new Modules(this.scene.physics.world, this.scene, { name: 'modulesContainer' }));
        this.add(this.modules.newModule(0, 0, ModuleType.Cannon));

        this.add(this.modules.newModule(-1, 1, ModuleType.Shield));
        this.add(this.modules.newModule(0, 1, ModuleType.Merchandise));
        this.add(this.modules.newModule(1, 1, ModuleType.Shield));

        this.add(this.modules.newModule(-2, 2, ModuleType.Cannon));
        this.add(this.modules.newModule(-1, 2, ModuleType.Merchandise));
        this.add(this.modules.newModule(0, 2, ModuleType.Merchandise));
        this.add(this.modules.newModule(1, 2, ModuleType.Merchandise));
        this.add(this.modules.newModule(2, 2, ModuleType.Cannon));
    }

    update(time, delta) {
        this.modules.update();

        const container = this.scene.add.container(400, 300);
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

    newStructure(x: number, y: number) {
        return this.scene.add.image(x * 10, y * 12, 'structure')
    }

    isStructure(x: number, y: number) {
        let isFound = false;
        this.each(
            (image: Phaser.GameObjects.Image) => {
                const xx = image.x / 10;
                const yy = image.y / 12;
                if (x == xx && y == yy) {
                    if (image.texture.key === 'structure') {
                        // console.log(`getStructure(${x},${y}) ${xx} ${yy} ${image.texture.key} TRUE`);
                        isFound = true;
                    }
                }
            },
            this);
        return isFound;
    }
}