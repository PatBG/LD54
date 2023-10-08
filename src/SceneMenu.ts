import * as Phaser from 'phaser';
import { GameState, Global } from './Global';
import { Player } from './Player';
import { ModuleType, Modules } from './Modules';

export class SceneMenu extends Phaser.Scene {

    menuStructure: Phaser.GameObjects.Text;
    menuDefense: Phaser.GameObjects.Text;
    menuMerchandise: Phaser.GameObjects.Text;
    menuCannon: Phaser.GameObjects.Text;
    menuRotate: Phaser.GameObjects.Text;
    menuUpgrade: Phaser.GameObjects.Text;
    menuSell: Phaser.GameObjects.Text;
    menuGo: Phaser.GameObjects.Text;

    styleActiveColor = 'aqua';
    styleActive = { font: '16px monospace', color: this.styleActiveColor };
    styleGrayedColor = 'gray';
    styleGrayed = { font: '16px monospace', color: this.styleGrayedColor };

    cursorPosition = new Phaser.Math.Vector2(0, 0);
    cursor: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'SceneMenu', active: true });
    }

    preload() {
        this.load.image('cursor', 'assets/cursor.png');
    }

    create() {
        this.menuStructure = this.addMenuText('[T] buy sTructure : 50 $');
        this.menuDefense = this.addMenuText('[D] buy Defense shield : 50 $ (absorb 1 hit)');
        this.menuMerchandise = this.addMenuText('[M] buy Merchandise : 100 $ (can be sold 200 $ next stage)');
        this.menuCannon = this.addMenuText('[C] buy Cannon : 100 $ (1 bullet per second)');
        this.menuRotate = this.addMenuText('[R] Rotate cannon');
        this.menuUpgrade = this.addMenuText('[U] Upgrade');
        this.menuSell = this.addMenuText('[S] Sell');
        this.menuGo = this.addMenuText('[Q] Quit the shop and start the fight');
        this.menuGo.setStyle(this.styleActive);

        this.input.keyboard.addKey('T').on('down', () => { this.onBuyStructure(); });
        this.input.keyboard.addKey('D').on('down', () => { this.onBuyDefense(); });

        this.input.keyboard.addKey('Q').on('down', () => { this.onQuit(); });

        this.input.keyboard.addKey('LEFT').on('down', () => { this.onMoveCursor(-1, 0); });
        this.input.keyboard.addKey('RIGHT').on('down', () => { this.onMoveCursor(1, 0); });
        this.input.keyboard.addKey('UP').on('down', () => { this.onMoveCursor(0, -1); });
        this.input.keyboard.addKey('DOWN').on('down', () => { this.onMoveCursor(0, 1); });

        this.cursor = this.add.image(Global.canvasWidth / 2, Global.canvasHeight - 100, 'cursor');

        Global.onGameStateChange((state: GameState) => {
            if (state === GameState.Shop) {
                this.cursorPosition.set(0, 0);
                this.scene.resume();
                this.scene.setVisible(true);
            } else {
                this.scene.pause();
                this.scene.setVisible(false);
            }
        });
    }

    menuTextPos = new Phaser.Math.Vector2(100, 100);
    addMenuText(text: string): Phaser.GameObjects.Text {
        this.menuTextPos.y += 20;
        return this.add.text(this.menuTextPos.x, this.menuTextPos.y, text);
    }

    onBuyStructure() {
        if (this.menuStructure.style.color === this.styleActiveColor) {
            console.log('onBuyStructure');
        }
    }

    onBuyDefense() {
        if (this.menuDefense.style.color === this.styleActiveColor) {
            console.log('onBuyDefense');
        }
    }

    onMoveCursor(x: number, y: number) {
        this.cursorPosition.x += x;
        this.cursorPosition.y += y;
        this.cursor.setPosition(
            Global.canvasWidth / 2 + this.cursorPosition.x * Modules.width,
            Global.canvasHeight - 100 + this.cursorPosition.y * Modules.height);
        this.refreshMenu();
    }

    onQuit() {
        Global.setGameState(GameState.Fight);
    }

    // '[S] Structure : 50 $\r\n' +
    // '[D] Defense shield : 50 $ (absorb 1 hit)\r\n' +
    // '[M] Merchandise : 100 $ (can be sold 200 $ next stage)\r\n' +
    // '[C] Cannon : 100 $ (1 bullet per second)\r\n' +
    // '[R] Rotate\r\n' +
    // '[U] Upgrade Merchandise : 100 $ (can be sold 400 $ next stage)\r\n' +
    // '[S] Sell Cannon (1 bullet per second) : 50 $', { font: '16px monospace', color: 'aqua' }

    // '[S] Structure : 50 $\r\n' +
    // '[D] Defense shield : 50 $ (absorb 1 hit)\r\n' +
    // '[M] Merchandise : 100 $ (can be sold 200 $ next stage)\r\n' +
    // '[C] Cannon : 100 $ (1 bullet per second)\r\n' +
    // '[R] Rotate\r\n' +
    // '[U] Upgrade Merchandise : 100 $ (can be sold 400 $ next stage)\r\n' +
    // '[S] Sell Cannon (1 bullet per second) : 50 $', { font: '16px monospace', color: 'aqua' }


    refreshMenu() {
        const isStructure = Player.IsStructure(this.cursorPosition.x, this.cursorPosition.y);
        const module = Player.GetModule(this.cursorPosition.x, this.cursorPosition.y);

        // menuStructure
        if (isStructure) {
            this.menuStructure.setStyle(this.styleGrayed);
        } else {
            this.menuStructure.setStyle(this.styleActive);
        }

        // menuDefense
        if (isStructure && module === undefined) {
            this.menuDefense.setStyle(this.styleActive);
        } else {
            this.menuDefense.setStyle(this.styleGrayed);
        }

        // menuMerchandise
        if (isStructure && module === undefined) {
            this.menuMerchandise.setStyle(this.styleActive);
        } else {
            this.menuMerchandise.setStyle(this.styleGrayed);
        }

        // menuCannon
        if (isStructure && module === undefined) {
            this.menuCannon.setStyle(this.styleActive);
        } else {
            this.menuCannon.setStyle(this.styleGrayed);
        }

        // menuRotate
        if (module != undefined && module.moduleType === ModuleType.Cannon) {
            this.menuRotate.setStyle(this.styleActive);
        } else {
            this.menuRotate.setStyle(this.styleGrayed);
        }

        // menuUpgrade
        if (module != undefined) {
            this.menuUpgrade.setStyle(this.styleActive);
        } else {
            this.menuUpgrade.setStyle(this.styleGrayed);
        }

        // menuSell
        if (module != undefined) {
            this.menuSell.setStyle(this.styleActive);
        } else {
            this.menuSell.setStyle(this.styleGrayed);
        }
    }

    update() {
        this.refreshMenu();
    }
}