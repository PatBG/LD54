import * as Phaser from 'phaser';
import { GameState, GameManager } from './GameManager';

export class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGameOver' });
    }

    preload() {
    }

    create() {
        GameManager.getInstance().updateCamera();   // Hack because camera of inactives scenes is not updated

        const startPos = new Phaser.Math.Vector2(GameManager.getInstance().canvasCenter.x, GameManager.getInstance().canvasCenter.y - 48);
        let text = this.add.text(startPos.x, startPos.y, 'GAME OVER',
            { fontFamily: 'Arial Black', fontSize: 48, color: 'white' }).setOrigin(0.5);

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
                this.add.text(GameManager.getInstance().canvasCenter.x, GameManager.getInstance().canvasCenter.y, '[any key] to continue',
                    { fontFamily: 'Arial Black', fontSize: 16, color: 'white' }).setOrigin(0.5);
                this.input.keyboard.on('keydown', () => { this.onStart(); });
                this.input.on('pointerdown', () => { this.onStart(); });
            }
        });
    }

    update() {
    }

    onStart() {
        GameManager.getInstance().setGameState(GameState.GameStart);
        this.scene.stop();
    }
}