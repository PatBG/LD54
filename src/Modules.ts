import * as Phaser from 'phaser';
import { GameManager } from './GameManager';
import { Bullets } from './Bullets';
import { Module } from './Module';


export enum ModuleType {
    Merchandise = 1,
    Cannon,
    Defense,
}

export class Modules extends Phaser.Physics.Arcade.Group {
    bullets: Bullets;

    constructor(world: Phaser.Physics.Arcade.World, scene: Phaser.Scene, config, bullets: Bullets) {
        super(
            world,
            scene,
            { ...config, classType: Module, createCallback: Modules.prototype.onCreate }
        );
        this.bullets = bullets;
    }

    onCreate(module: Module) {
        module.onCreate(this.bullets);
    }

    newModule(x: number, y: number, moduleFrame: number): Module {
        return this.create(x * GameManager.getInstance().moduleSize.x, y * GameManager.getInstance().moduleSize.y, 'modules', moduleFrame)
    }

    update(time, delta) {
        this.children.iterate((module: Module) => { module.update(time, delta); return true; }, this);
    }

    onBeginWave() {
        this.children.iterate((module: Module) => { module.onBeginWave(); return true; }, this);
    }

    onEndWave() {
        this.children.iterate((module: Module) => { module.onEndWave(); return true; }, this);
    }


    getModule(x: number, y: number): Module | undefined {
        let isFound = false;
        let moduleFound = undefined;

        this.children.iterate((module: Module) => {
            const xx = module.x / GameManager.getInstance().moduleSize.x;
            const yy = module.y / GameManager.getInstance().moduleSize.y;
            if (x == xx && y == yy) {
                // console.log(`getStructure(${x},${y}) ${xx} ${yy} TRUE`);
                moduleFound = module;
                isFound = true;
            }
            return true;
        }, this);
        return moduleFound;
    }

    getModulesBounds(): [Phaser.Math.Vector2, Phaser.Math.Vector2] {
        let minV = new Phaser.Math.Vector2(Infinity, Infinity);
        let maxV = new Phaser.Math.Vector2(-Infinity, -Infinity);
        this.children.iterate((module: Module) => {
            minV.x = Math.min(minV.x, module.x - GameManager.getInstance().moduleSize.x / 2);
            minV.y = Math.min(minV.y, module.y - GameManager.getInstance().moduleSize.y / 2);
            maxV.x = Math.max(maxV.x, module.x + GameManager.getInstance().moduleSize.x / 2);
            maxV.y = Math.max(maxV.y, module.y + GameManager.getInstance().moduleSize.y / 2);
            return true;
        }, this);
        return [minV, maxV];
    }
}
