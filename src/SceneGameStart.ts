import * as Phaser from 'phaser';
import { GameState, Global } from './Global';

export class SceneGameStart extends Phaser.Scene {
    textPos: Phaser.Math.Vector2;
    textColor: string;
    adminKey: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'SceneGameStart' });
    }

    preload() {
    }

    create() {
        this.textPos = new Phaser.Math.Vector2(Global.canvasCenter.x, Global.canvasCenter.y - 100);

        this.add.text(this.textPos.x, this.textPos.y - 100, "Shoot'n Trade",
            { font: '48px monospace', color: 'yellow' }).setOrigin(0.5);

        this.textColor = 'yellow';
        this.addText('Made by PatBG for LUDUM DARE #54 (October 2023)');
        this.addText('');
        this.addText('Phaser 3, TypeScript, Visual Studio Code,');
        this.addText('with the help of officials Phaser 3 tutorials and Copilot');
        this.addText('');
        this.addText('');
        this.textColor = 'aqua';
        this.addText('[Use arrow keys or mouse] to move ship');
        this.addText('[Use left shift or mouse button] to fire');
        this.addText('Take the merchandise to the shop to sell it');
        this.addText('');
        this.addText('[Press any key] to start');

        this.input.keyboard.on('keydown', () => { this.onStart(); });
        this.input.on('pointerdown', () => { this.onStart(); });
        this.adminKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F9);
    }

    addText(text: string): Phaser.GameObjects.Text {
        this.textPos.y += 20;
        return this.add.text(this.textPos.x, this.textPos.y, text,
            { font: '16px monospace', color: this.textColor }).setOrigin(0.5);
    }

    update() {
    }

    onStart() {
        Global.adminMode = this.adminKey.isDown;
        Global.setGameState(GameState.Fight);
        this.scene.stop();
    }
}