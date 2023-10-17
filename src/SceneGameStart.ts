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
        this.textPos = new Phaser.Math.Vector2(Global.canvasCenter.x, Global.canvasCenter.y - 150);

        this.add.text(this.textPos.x, this.textPos.y - 50, "Shoot'n Trade",
            { font: '48px monospace', color: 'yellow' }).setOrigin(0.5);

        this.textColor = 'yellow';
        this.addText('Made by PatBG for LUDUM DARE #54 (October 2023)');
        this.addText('Theme: "Limited Space"');
        this.addText('');
        this.addText('Phaser 3, TypeScript, Visual Studio Code,');
        this.addText('with the help of Phaser 3 tutorials and GitHub Copilot');
        this.addText('');
        this.addText('');
        this.textColor = 'aqua';
        this.addText('Use the limited space of your ship to embark cannons, shields or merchandises.');
        this.addText('Resell your merchandise farther to make profit and buy more space.');
        this.addText('');
        this.addText('[WASD, ZQSD, Arrow Keys or Mouse] to move ship');
        this.addText('[Space, Left Shift or Mouse Button] to fire');
        this.addText('[P] to pause or resume the game');
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