import * as Phaser from 'phaser';
import { GameManager } from './GameManager';
import { Bullets } from './Bullets';
import { SoundManager } from './SoundManager';
import { PlayerManager } from './PlayerManager';

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
    keyFire1: Phaser.Input.Keyboard.Key;
    keyFire2: Phaser.Input.Keyboard.Key;
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
            this.keyFire1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
            this.keyFire2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }
    }

    onBeginWave() {
        // Initialize life
        if (this.moduleType === ModuleType.Defense) {
            this.life = 1 + this.level;
        }
        else {
            this.life = 2;
        }
    }

    onEndWave() {
        // Upgrade alive merchandises at the end of every wave 
        if (this.moduleType === ModuleType.Merchandise) {
            this.level++;
        }
        // Remove low life effect if set
        if (this.tweenLowLife != undefined) {
            this.tweenLowLife.remove();
            this.alpha = 1;                             // Reset alpha to 1
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
            SoundManager.getInstance().PlayerShield.play();
        }
        else if (this.life <= 0) {
            this.onDestroy();
            SoundManager.getInstance().PlayerExplosion.play();
        }
    }

    isAlive(): boolean {
        return this.life > 0;
    }

    onDestroy() {
        if (this.tweenLowLife != undefined) {
            this.tweenLowLife.remove();
            this.tweenLowLife.destroy();
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
            const keyFire = this.keyFire1.isDown || this.keyFire2.isDown || this.scene.input.activePointer.isDown;
            if (keyFire && time >= this.timeNextFire) {
                this.timeNextFire = time + 1000 / PlayerManager.getInstance().cannonFireRate(this.level);
                this.onFire();
            }
        }
    }

    onFire() {
        const velocity = PlayerManager.getInstance().cannonBulletVelocity(this.level);
        const angle = this.angleCannon - Math.PI / 2;
        this.bullets.fire(this.x + this.parentContainer.x, this.y + this.parentContainer.y,
            Math.cos(angle) * velocity, Math.sin(angle) * velocity);
        SoundManager.getInstance().PlayerFire.play({ volume: 0.5 });
    }
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
}
