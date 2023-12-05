import * as Phaser from 'phaser';
import { GameState, GameManager } from './GameManager';

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
        GameManager.getInstance().updateCamera();   // Hack because camera of inactives scenes is not updated

        this.textPos = new Phaser.Math.Vector2(GameManager.getInstance().canvasCenter.x, GameManager.getInstance().rectMinGame.y + 50);

        this.add.text(this.textPos.x, this.textPos.y, "Shoot'n Trade",
            { fontFamily: 'Arial Black', fontSize: 48, color: 'yellow' }).setOrigin(0.5);
        this.textPos.y += 50;
        this.textColor = 'yellow';
        this.addText('Made by PatBG for LUDUM DARE #54 (October 2023)');
        this.addText('Theme: "Limited Space"');
        this.addText('Post JAM version (December 4, 2023)');
        this.addText('');
        this.addText('Phaser 3, TypeScript, Visual Studio Code,');
        this.addText('with the help of Phaser 3 tutorials and GitHub Copilot');
        this.addText('');
        this.addText('');
        this.textColor = 'aqua';
        this.addText('Use the limited space of your ship to embark cannons,');
        this.addText('shields or merchandises. Resell your merchandises');
        this.addText('farther to buy more space, shield, cannons...');
        this.addText('');
        this.addText('[WASD, ZQSD, Arrow Keys, Mouse or Swipe] to move ship');
        this.addText('[P] to pause or resume the game');
        this.addText('');
        this.addText('[Press any key] to start');

        this.input.keyboard.on('keydown', () => { this.onStart(); });
        this.input.on('pointerdown', () => { this.onStart(); });
        this.adminKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F8);
    }

    addText(text: string): Phaser.GameObjects.Text {
        this.textPos.y += 20;
        return this.add.text(this.textPos.x, this.textPos.y, text,
            { fontFamily: 'Arial Black', fontSize: 14, color: this.textColor }).setOrigin(0.5);
    }

    update() {
    }

    onStart() {
        GameManager.getInstance().adminMode = GameManager.getInstance().adminMode || this.adminKey.isDown;
        GameManager.getInstance().adminModeAllowed = GameManager.getInstance().adminMode;
        GameManager.getInstance().setGameState(GameState.Fight);
        this.scene.stop();
    }
}