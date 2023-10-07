import * as Phaser from 'phaser';
import { Global } from './Global';

export enum ModuleType {
    Merchandise,
    Cannon,
    Shield,
}

export class Module extends Phaser.Physics.Arcade.Sprite {
    moduleType: ModuleType;
    level = 1;
    fireRate = 5;              // Number of fire per seconds 
    fireDuration = 0;           // Internal timer for fire rate management
    bulletVelocity = 500;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, moduleType: ModuleType) {
        super(scene, x, y, key, moduleType);
        this.moduleType = moduleType;
    }

    onCreate() {
    }

    onHit() {
        // console.log(`module(${this.moduleType}) hit at (${this.x},${this.y})`);
        this.destroy();
    }

    update() {
        if (this.moduleType == ModuleType.Cannon) {
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

    newModule(x: number, y: number, moduleFrame: number): Module {
        return this.create(x * 10, y * 12, 'modules', moduleFrame)
    }

    onCreate(module: Module) {
        module.onCreate();
    }

    update() {
        this.children.iterate((module: Module) => { module.update(); return true; }, this);
    }

    getModule(x: number, y: number): Module | undefined {
        let isFound = false;
        let moduleFound = undefined;

        this.children.iterate((module: Module) => {
            const xx = module.x / 10;
            const yy = module.y / 12;
            if (x == xx && y == yy) {
                // console.log(`getStructure(${x},${y}) ${xx} ${yy} TRUE`);
                moduleFound = module;
                isFound = true;
            }
            return true;
        }, this);
        return moduleFound;
    }
}
