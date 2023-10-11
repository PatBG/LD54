import * as Phaser from 'phaser';
import { Global } from './Global';
import { Bullets } from './Bullets';

export enum ModuleType {
    Merchandise = 1,
    Cannon,
    Defense,
}

export class Module extends Phaser.Physics.Arcade.Sprite {
    moduleType: ModuleType;
    level = 1;
    life = 1;
    bullets: Bullets;
    keyFire: Phaser.Input.Keyboard.Key;
    timeNextFire = 0;
    angleCannon = 0;
    tweenLowLife: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, moduleType: ModuleType) {
        super(scene, x, y, key, moduleType);
        this.moduleType = moduleType;
    }

    onCreate(bullets: Bullets) {
        if (this.moduleType === ModuleType.Cannon) {
            this.bullets = bullets;
            this.keyFire = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        }
    }

    onStartWave() {
        if (this.moduleType === ModuleType.Defense) {
            this.life = 1 + this.level;
        } 
        else {
            this.life = 2;
        }
    }

    onHit() {
        this.life--;
        if (this.life == 1) {
            this.tweenLowLife = this.scene.tweens.add({
                targets: this,
                alpha: 0.3,
                ease: 'Linear',
                duration: 250,
                yoyo: true,
                repeat: -1,
            });
        }
        else if (this.life <= 0) {
            this.onDestroy();
        }
    }

    isAlive(): boolean {
        return this.life > 0;
    }

    onDestroy() {
        if (this.tweenLowLife != undefined) {
            this.tweenLowLife.remove();
        }
        this.destroy();
    }

    addAngleCannon(angleCannon: number) {
        if (this.moduleType === ModuleType.Cannon) {
            this.angleCannon += angleCannon;
            this.setRotation(this.angleCannon);
        }
    }

    setAngleCannon(angleCannon: number) {
        if (this.moduleType === ModuleType.Cannon) {
            this.angleCannon = angleCannon;
            this.setRotation(angleCannon);
        }
    }

    update(time, delta) {
        if (this.moduleType === ModuleType.Cannon) {
            if (this.keyFire.isDown && time >= this.timeNextFire) {
                this.timeNextFire = time + 1000 / Modules.cannonFireRate(this.level);
                const velocity = Modules.cannonBulletVelocity(this.level);
                const angle = this.angleCannon - Math.PI / 2;
                this.bullets.fire(this.x + this.parentContainer.x, this.y + this.parentContainer.y,
                    Math.cos(angle) * velocity, Math.sin(angle) * velocity);
            }
        }
    }
}

export class Modules extends Phaser.Physics.Arcade.Group {
    static readonly size = new Phaser.Math.Vector2(16, 16);
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

    newModule(x: number, y: number, moduleFrame: number): Module {
        return this.create(x * Modules.size.x, y * Modules.size.y, 'modules', moduleFrame)
    }

    update(time, delta) {
        this.children.iterate((module: Module) => { module.update(time, delta); return true; }, this);
    }

    onStartWave() {
        this.children.iterate((module: Module) => { module.onStartWave(); return true; }, this);
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
