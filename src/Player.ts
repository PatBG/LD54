import * as Phaser from 'phaser';
import { Global } from './Global';
import { Modules } from './Modules';

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

        this.add(this.scene.add.image(0, 0, 'player'));

        this.modules = this.scene.add.existing(new Modules(this.scene.physics.world, this.scene, { name: 'modulesContainer' }));
        this.add(this.modules.newModule(0, -12, 1));

        this.add(this.modules.newModule(-10, 0, 2));
        this.add(this.modules.newModule(0, 0, 0));
        this.add(this.modules.newModule(10, 0, 2));

        this.add(this.modules.newModule(-20, 12, 1));
        this.add(this.modules.newModule(-10, 12, 0));
        this.add(this.modules.newModule(0, 12, 0));
        this.add(this.modules.newModule(10, 12, 0));
        this.add(this.modules.newModule(20, 12, 1));
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