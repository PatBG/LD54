import * as Phaser from 'phaser';
import { Bullets } from "./Bullets";
import { PlayerManager } from "./PlayerManager";
import { SoundManager } from "./SoundManager";
import { ModuleType } from "./Modules";
import { GameManager } from "./GameManager";

export class Module extends Phaser.Physics.Arcade.Sprite {
    moduleType: ModuleType;
    level = 1;
    life = 1;
    bullets: Bullets;
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
            if (time >= this.timeNextFire) {
                this.timeNextFire = time + 1000 / PlayerManager.getInstance().cannonFireRate(this.level);
                this.onFire();
            }
        }
    }

    onFire() {
        const velocity = PlayerManager.getInstance().cannonBulletVelocity(this.level);
        const angle = this.angleCannon - Math.PI / 2;
        this.bullets.fire(
            this.parentContainer.x + this.x * GameManager.getInstance().playerScale,
            this.parentContainer.y + this.y * GameManager.getInstance().playerScale,
            Math.cos(angle) * velocity, Math.sin(angle) * velocity);
        SoundManager.getInstance().PlayerFire.play({ volume: 0.5 });
    }
}
