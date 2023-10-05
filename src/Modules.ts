import * as Phaser from 'phaser';
import { Global } from './Global';

export class Module extends Phaser.Physics.Arcade.Sprite {
    moduleFrame: number;
    fireRate = 5;              // Number of fire per seconds 
    fireDuration = 0;           // Internal timer for fire rate management
    bulletVelocity = 500;

    constructor(scene, x, y, key, moduleFrame) {
        super(scene, x, y, key, moduleFrame);
        this.moduleFrame = moduleFrame;
        console.log(`module.constructor(${this.moduleFrame}) at (${this.x},${this.y})`);
    }

    onCreate() {
    }

    onHit() {
        console.log(`module(${this.moduleFrame}) hit at (${this.x},${this.y})`);
        this.destroy();
    }

    update() {
        // console.log(`module.update(${this.moduleFrame}) at (${this.x},${this.y})`);
        if (this.moduleFrame == 1) {
            console.log(`module(${this.moduleFrame}) Fire at (${this.x},${this.y})`);

            // Fire bullets
            if (Global.cursorKeys.shift.isDown) {
                if (this.fireDuration <= Global.cursorKeys.shift.getDuration()) {
                    Global.bullets.fire(this.x + this.parentContainer.x, this.y + this.parentContainer.y, 0, -this.bulletVelocity);
                    this.fireDuration = Global.cursorKeys.shift.getDuration() + (1000 / this.fireRate);
                }
            } else if (Global.cursorKeys.shift.isUp) {
                this.fireDuration = 0;
            }
        }
    }
}

export class Modules extends Phaser.Physics.Arcade.Group {

    constructor(world: Phaser.Physics.Arcade.World, scene: Phaser.Scene, config) {
        super(
            world,
            scene,
            { ...config, classType: Module, createCallback: Module.prototype.onCreate }
        );
    }

    newModule(x: number, y: number, moduleFrame: number) {
        return this.create(x, y, 'modules', moduleFrame)
    }

    onCreate(module: Module) {
        module.onCreate();
    }

    update() {
        this.children.each((module: Module) => { module.update(); return true; }, this);
    }
}
