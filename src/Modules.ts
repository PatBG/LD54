import * as Phaser from 'phaser';
import { Global } from './Global';

export enum ModuleType {
    Merchandise,
    Cannon,
    Defense,
}

export class Module extends Phaser.Physics.Arcade.Sprite {
    moduleType: ModuleType;
    level = 1;
    fireDuration = 0;           // Internal timer for fire rate management

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, moduleType: ModuleType) {
        super(scene, x, y, key, moduleType);
        this.moduleType = moduleType;
    }

    onCreate() {
    }

    onHit() {
        if (this.moduleType == ModuleType.Defense && this.level > 1) {
            this.level--;
        }
        else {
            this.onDestroy();
        }
    }
    onDestroy() {
        this.destroy();
    }

    update() {
        if (this.moduleType == ModuleType.Cannon) {
            // Fire bullets
            if (Global.cursorKeys.shift.isDown) {
                if (this.fireDuration <= Global.cursorKeys.shift.getDuration()) {
                    Global.bullets.fire(this.x + this.parentContainer.x, this.y + this.parentContainer.y, 0,
                        - Modules.cannonBulletVelocity(this.level));
                    this.fireDuration = Global.cursorKeys.shift.getDuration()
                        + (1000 / Modules.cannonFireRate(this.level));
                }
            } else if (Global.cursorKeys.shift.isUp) {
                this.fireDuration = 0;
            }
        }
    }
}

export class Modules extends Phaser.Physics.Arcade.Group {
    static readonly size = new Phaser.Math.Vector2(12, 12);

    static readonly buyPriceStructure = 50;
    static readonly SellPriceStructure = 25;
    static buyPrice(moduleType: ModuleType, level: number): number {
        switch (moduleType) {
            case ModuleType.Cannon: return 100 + 100 * (level - 1) + 100 * Math.floor(level / 5);
            case ModuleType.Defense: return 50 + 100 * (level - 1);
            case ModuleType.Merchandise: return 50 * Math.pow(2, level - 1);
            default: return 0;
        }
    }

    static sellPrice(moduleType: ModuleType, level: number): number {
        let price = Modules.buyPrice(moduleType, level);
        if (moduleType != ModuleType.Merchandise) {
            price *= 0.5;
        }
        return price;
    }

    static priceUpgrade(moduleType: ModuleType, level: number): number {
        let price = Modules.buyPrice(moduleType, level + 1) - Modules.buyPrice(moduleType, level);
        if (moduleType == ModuleType.Merchandise) {
            price *= 1.5;
        }
        return price;
    }

    static cannonFireRate(level: number): number {
        return 1 + level;
    }

    static cannonBulletVelocity(level: number): number {
        return 500 + 250 * Math.floor(level / 5);
    }

    constructor(world: Phaser.Physics.Arcade.World, scene: Phaser.Scene, config) {
        super(
            world,
            scene,
            { ...config, classType: Module, createCallback: Module.prototype.onCreate }
        );
    }

    newModule(x: number, y: number, moduleFrame: number): Module {
        return this.create(x * Modules.size.x, y * Modules.size.y, 'modules', moduleFrame)
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
            const xx = module.x / Modules.size.x;
            const yy = module.y / Modules.size.y;
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
