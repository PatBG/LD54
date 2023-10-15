import * as Phaser from 'phaser';
import { GameState, Global } from './Global';
import { Vector } from 'matter';

export class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGameOver' });
    }

    preload() {
    }

    create() {
        const startPos = new Phaser.Math.Vector2(Global.canvasCenter.x, Global.canvasCenter.y - 48);
        let text = this.add.text(startPos.x, startPos.y, 'GAME OVER',
            { font: '48px monospace', color: 'white' }).setOrigin(0.5);

        let factor = new Phaser.Math.Vector2(0, 0);
        this.tweens.add({
            targets: factor,
            props: {
                x: { from : 0, to: -0.5, duration: 400 },
                y: { from : 0, to: -0.5, duration: 400 },
            },
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 2,
            onUpdate: () => {
                text.scaleX = 1 + factor.x;
                text.scaleY = 1 + factor.y;
            },
            onComplete: () => {
                this.add.text(Global.canvasCenter.x, Global.canvasCenter.y, '[any key] to continue',
                    { font: '16px monospace', color: 'white' }).setOrigin(0.5);
                this.input.keyboard.on('keydown', () => { this.onStart(); });
                this.input.on('pointerdown', () => { this.onStart(); });
            }
        });
    }

    update() {
    }

    onStart() {
        Global.setGameState(GameState.GameStart);
        this.scene.stop();
    }
}