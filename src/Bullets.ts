import * as Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Image {
    fire(x: number, y: number, vx: number, vy: number) {
        this.enableBody(true, x, y, true, true);
        this.setVelocity(vx, vy);
    }

    onCreate() {
        this.disableBody(true, true);
        this.setCollideWorldBounds(true, 1, 1, true);
    }

    onWorldBounds() {
        this.disableBody(true, true);
    }
}

export class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(world: Phaser.Physics.Arcade.World, scene: Phaser.Scene, config) {
        super(
            world,
            scene,
            { ...config, classType: Bullet, createCallback: Bullets.prototype.onCreate }
        );
    }

    fire(x: number, y: number, vx: number, vy: number) {
        const bullet = this.getFirstDead(false);
        if (bullet) {
            bullet.fire(x, y, vx, vy);
        }
    }

    onCreate(bullet: Bullet) {
        bullet.onCreate();
    }

    poolInfo() {
        return `${this.name} ${this.countActive(true)}/${this.getLength()}`;
    }
}
