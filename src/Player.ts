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

    newStructure(x: number, y: number) {
        return this.scene.add.image(x * 10, y * 12, 'structure')
    }

    getStructure(x: number, y: number) {
        
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
    }
}