import * as Phaser from 'phaser';
import { Bullets } from './Bullets';
import { GameManager } from './GameManager';
import { SoundManager } from './SoundManager';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Image {
    bullets: Bullets;
    bulletVelocity = 300;
    timerFiring: Phaser.Time.TimerEvent;
    tweenMoving: Phaser.Tweens.Tween;
    shipVelocity = 200;

    onCreate(bullets: Bullets) {
        this.name = `${this.texture.key} ${this.x} ${this.y})`;
        this.bullets = bullets;
        this.timerFiring = this.scene.time.addEvent({
            delay: 750,
            loop: true,
            callback: () => { this.onFire(); },
        });

        if (this.texture.key === 'enemy1') {
            this.tweenMoving = this.scene.tweens.add({
                targets: this.body.velocity,
                props: {
                    x: { from: 150, to: -150, duration: 4000 },
                    y: this.shipVelocity,
                },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => { this.onCheckOffscreenLimits() }
            });
        }
        else if (this.texture.key === 'enemy2') {
            this.tweenMoving = this.scene.tweens.add({
                targets: this,
                rotation: { from: -0.5, to: +0.5, duration: 1500 },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    this.body.velocity.x = this.shipVelocity * Math.cos(this.rotation + 0.5 * Math.PI);
                    this.body.velocity.y = this.shipVelocity * Math.sin(this.rotation + 0.5 * Math.PI);
                    this.onCheckOffscreenLimits()
                }
            });
        }
        else {  // enemy3
            let vx = this.shipVelocity;
            if (this.x > GameManager.getInstance().canvasCenter.x) {
                this.rotation = Math.PI;    // Face the center of the screen
                vx = -this.shipVelocity;
            }
            this.tweenMoving = this.scene.tweens.add({
                targets: this.body.velocity,
                props: {
                    x: { from: vx, to: vx, duration: 1000 },
                    y: { from: -50, to: 50, duration: 1000 },
                },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                onUpdate: () => { this.onCheckOffscreenLimits() }
            });
            this.soundLoop = this.scene.sound.add('EnemyFlyingSaucer');
            this.soundLoop.play({ loop: true });
        }
    }
    soundLoop: Phaser.Sound.BaseSound;

    onCheckOffscreenLimits(): void {
        const marginY = 50;
        const marginX = 200;
        // Remove this enemy when it is offscreen on the side or bottom
        if (this.x < 0 - marginX ||
            this.x > GameManager.getInstance().sizeMaxGame.width + marginX ||
            this.y > GameManager.getInstance().sizeMaxGame.height + marginY) {
            this.onDestroy();
        }
    }

    onHit() {
        this.onDestroy();
        // Bonus when an enemy is destroyed
        GameManager.getInstance().moneyBonus += 5;
        SoundManager.getInstance().EnemyExplosion.play();
    }

    onFire() {
        const v = new Phaser.Math.Vector2();
        if (this.texture.key === 'enemy3') {
            // Enemy fire at the player
            const rotation = Phaser.Math.Angle.BetweenPoints(this, Player.getInstance().getPosition());
            v.x = Math.cos(rotation) * this.bulletVelocity;
            v.y = Math.sin(rotation) * this.bulletVelocity;
        }
        else {
            // Enemy fire forward, according to its rotation
            v.x = Math.cos(this.rotation + 0.5 * Math.PI) * this.bulletVelocity;
            v.y = Math.sin(this.rotation + 0.5 * Math.PI) * this.bulletVelocity;
        }
        this.bullets.fire(this.x, this.y, v.x, v.y);
        //SoundManager.getInstance().EnemyFire.play();      // Too much noise
    }

    onDestroy() {
        this.timerFiring.remove();
        this.tweenMoving.remove();
        this.destroy();
        if (this.soundLoop != undefined) {
            this.soundLoop.stop();
        }
    }
}
