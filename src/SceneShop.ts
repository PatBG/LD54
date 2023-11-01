import * as Phaser from 'phaser';
import { GameState, GameManager } from './GameManager';
import { Player } from './Player';
import { ModuleType } from './Modules';
import { PlayerManager } from './PlayerManager';

export class SceneShop extends Phaser.Scene {

    menuMoney: Phaser.GameObjects.Text;
    menuStructure: Phaser.GameObjects.Text;
    menuDefense: Phaser.GameObjects.Text;
    menuMerchandise: Phaser.GameObjects.Text;
    menuCannon: Phaser.GameObjects.Text;
    menuRotate: Phaser.GameObjects.Text;
    menuUpgrade: Phaser.GameObjects.Text;
    menuSell: Phaser.GameObjects.Text;
    menuQuit: Phaser.GameObjects.Text;
    menuTextPos: Phaser.Math.Vector2;

    readonly styleActiveColor = 'aqua';
    readonly styleActive = { font: '16px monospace', color: this.styleActiveColor };
    readonly styleGrayedColor = 'gray';
    readonly styleGrayed = { font: '16px monospace', color: this.styleGrayedColor };

    cursorModule:Phaser.Math.Vector2; 
    cursorImage: Phaser.GameObjects.Image;

    modifierKey: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'SceneShop' });
    }

    preload() {
        this.load.image('cursor', 'assets/cursor.png');
    }

    create() {
        this.menuTextPos = new Phaser.Math.Vector2(100, 100);
        this.cursorModule = new Phaser.Math.Vector2(0, 0);

        this.add.text(GameManager.getInstance().canvasCenter.x, 70, 'SHOP',
            { font: '48px monospace', color: 'aqua' }).setOrigin(0.5);

        this.menuMoney = this.addMenuText(`Money : ${GameManager.getInstance().money} $`);
        this.addMenuText('');
        this.menuMoney.setStyle(this.styleActive);
        this.menuStructure = this.addMenuText(`[T] buy structure : ${PlayerManager.getInstance().buyPriceStructure} $`);
        this.menuDefense = this.addMenuText(`[D] buy Defense shield : ${PlayerManager.getInstance().buyPrice(ModuleType.Defense, 1)} $` +
            ` (${this.actionDescription(ModuleType.Defense, 1)})`);
        this.menuMerchandise = this.addMenuText(`[M] buy Merchandise : ${PlayerManager.getInstance().buyPrice(ModuleType.Merchandise, 1)} $` +
            ` (${this.actionDescription(ModuleType.Merchandise, 1)})`);
        this.menuCannon = this.addMenuText(`[C] buy Cannon : ${PlayerManager.getInstance().buyPrice(ModuleType.Cannon, 1)} $` +
            ` (${this.actionDescription(ModuleType.Cannon, 1)})`);
        this.menuRotate = this.addMenuText(`[R] Rotate cannon (only if level 1, [SHIFT] + [R] turn the other way)`);
        this.menuUpgrade = this.addMenuText(`[U] Upgrade`);
        this.menuSell = this.addMenuText(`[S] Sell`);
        this.addMenuText('');
        this.addMenuText(`[Arrow Keys] to move the cursor around the modules`);
        this.menuQuit = this.addMenuText(`[ESC] quit the shop and start the next wave`);
        this.menuQuit.setStyle(this.styleActive);

        this.input.keyboard.addKey('T').on('down', () => { this.onBuyStructure(); });
        this.input.keyboard.addKey('D').on('down', () => { this.onBuyModule(this.menuDefense, ModuleType.Defense); });
        this.input.keyboard.addKey('M').on('down', () => { this.onBuyModule(this.menuMerchandise, ModuleType.Merchandise); });
        this.input.keyboard.addKey('C').on('down', () => { this.onBuyModule(this.menuCannon, ModuleType.Cannon); });
        this.input.keyboard.addKey('R').on('down', () => { this.onRotateCannon(); });
        this.input.keyboard.addKey('U').on('down', () => { this.onUpgrade(); });
        this.input.keyboard.addKey('S').on('down', () => { this.onSell(); });

        this.input.keyboard.addKey('ESC').on('down', () => { this.onQuit(); });

        this.input.keyboard.addKey('LEFT').on('down', () => { this.onMoveCursor(-1, 0); });
        this.input.keyboard.addKey('RIGHT').on('down', () => { this.onMoveCursor(1, 0); });
        this.input.keyboard.addKey('UP').on('down', () => { this.onMoveCursor(0, -1); });
        this.input.keyboard.addKey('DOWN').on('down', () => { this.onMoveCursor(0, 1); });

        this.modifierKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.cursorImage = this.add.image(GameManager.getInstance().playerPosInShop.x, GameManager.getInstance().playerPosInShop.y, 'cursor');
        this.cursorImage.scale = GameManager.getInstance().playerScale;
        this.tweens.add({
            targets: this.cursorImage,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 350
        });

        this.cursorModule.set(0, 0);
        this.refreshCursor();
        this.refreshMenu();
    }

    addMenuText(text: string): Phaser.GameObjects.Text {
        this.menuTextPos.y += 20;
        return this.add.text(this.menuTextPos.x, this.menuTextPos.y, text);
    }

    onBuyStructure() {
        if (this.menuStructure.style.color === this.styleActiveColor) {
            Player.getInstance().addNewStructure(this.cursorModule.x, this.cursorModule.y);
            GameManager.getInstance().money -= PlayerManager.getInstance().buyPriceStructure();
            this.refreshMenu();
        }
    }

    onBuyModule(text: Phaser.GameObjects.Text, moduleType: ModuleType) {
        if (text.style.color === this.styleActiveColor) {
            Player.getInstance().addNewModule(this.cursorModule.x, this.cursorModule.y, moduleType);
            GameManager.getInstance().money -= PlayerManager.getInstance().buyPrice(moduleType, 1);
            this.refreshMenu();
        }
    }

    onRotateCannon() {
        if (this.menuRotate.style.color === this.styleActiveColor) {
            const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);
            if (module !== undefined && module.moduleType === ModuleType.Cannon) {
                module.addAngleCannon(this.modifierKey.isDown ? -Math.PI / 8 : Math.PI / 8);
            }
        }
    }

    onUpgrade() {
        if (this.menuUpgrade.style.color === this.styleActiveColor) {
            const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);
            GameManager.getInstance().money -= PlayerManager.getInstance().priceUpgrade(module.moduleType, module.level);
            module.level++;
            this.refreshMenu();
        }
    }

    onSell() {
        if (this.menuSell.style.color === this.styleActiveColor) {
            const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);
            if (module !== undefined) {
                GameManager.getInstance().money += PlayerManager.getInstance().sellPrice(module.moduleType, module.level);
                Player.getInstance().removeModule(this.cursorModule.x, this.cursorModule.y);
            }
            else if (Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y)) {
                GameManager.getInstance().money += PlayerManager.getInstance().sellPriceStructure();
                Player.getInstance().removeStructure(this.cursorModule.x, this.cursorModule.y);
            }
            this.refreshMenu();
        }
    }

    onMoveCursor(x: number, y: number) {
        this.cursorModule.x += x;
        this.cursorModule.y += y;
        this.refreshCursor();
        this.refreshMenu();
    }

    refreshCursor() {
        this.cursorImage.setPosition(
            GameManager.getInstance().playerPosInShop.x + this.cursorModule.x * GameManager.getInstance().moduleSize.x * GameManager.getInstance().playerScale,
            GameManager.getInstance().playerPosInShop.y + this.cursorModule.y * GameManager.getInstance().moduleSize.y * GameManager.getInstance().playerScale);
    }

    onQuit() {
        GameManager.getInstance().setGameState(GameState.Fight);
        this.scene.stop();
    }

    refreshMenu() {
        this.menuMoney.text = `Money : ${GameManager.getInstance().money} $`;

        const isStructure = Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y);
        const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);

        // menuStructure
        let style = this.styleGrayed;
        if (!isStructure) {
            if (GameManager.getInstance().money >= PlayerManager.getInstance().buyPriceStructure()) {
                for (let x = -1; x <= 1; x += 2) {
                    if (Player.getInstance().isStructure(this.cursorModule.x + x, this.cursorModule.y)) {
                        style = this.styleActive;
                    }
                }
                for (let y = -1; y <= 2; y += 2) {
                    if (Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y + y)) {
                        style = this.styleActive;
                    }
                }
            }
        }
        this.menuStructure.setStyle(style);

        // menuDefense
        style = this.styleGrayed;
        if (isStructure && module === undefined) {
            if (GameManager.getInstance().money >= PlayerManager.getInstance().buyPrice(ModuleType.Defense, 1)) {
                style = this.styleActive;
            }
        }
        this.menuDefense.setStyle(style);

        // menuMerchandise
        style = this.styleGrayed;
        if (isStructure && module === undefined) {
            if (GameManager.getInstance().money >= PlayerManager.getInstance().buyPrice(ModuleType.Merchandise, 1)) {
                style = this.styleActive;
            }
        }
        this.menuMerchandise.setStyle(style);

        // menuCannon
        style = this.styleGrayed;
        if (isStructure && module === undefined) {
            if (GameManager.getInstance().money >= PlayerManager.getInstance().buyPrice(ModuleType.Cannon, 1)) {
                style = this.styleActive;
            }
        }
        this.menuCannon.setStyle(style);

        // menuRotate (only rotate cannon of level 1)
        style = this.styleGrayed;
        if (module != undefined && module.moduleType === ModuleType.Cannon) {
            if (module.level === 1) {
                style = this.styleActive;
            }
        }
        this.menuRotate.setStyle(style);

        // menuUpgrade
        style = this.styleGrayed;
        let text = '[U] Upgrade';
        if (module != undefined) {
            text += ` to level ${module.level + 1} : ${PlayerManager.getInstance().priceUpgrade(module.moduleType, module.level)} $`
                + ` (${this.actionDescription(module.moduleType, module.level + 1)}) :`;
            if (GameManager.getInstance().money >= PlayerManager.getInstance().priceUpgrade(module.moduleType, module.level)) {
                style = this.styleActive;
            }
        }
        this.menuUpgrade.setStyle(style);
        this.menuUpgrade.text = text;

        // menuSell
        style = this.styleGrayed;
        text = '[S] Sell';
        if (module != undefined) {
            if (Player.getInstance().nbModule() <= 1) {
                text += ` (you can't sell the last module)`;
            }
            else {
                style = this.styleActive;
                text += ` ${ModuleType[module.moduleType]} level ${module.level} :`
                    + ` ${PlayerManager.getInstance().sellPrice(module.moduleType, module.level)} $`
                    + ` (${this.actionDescription(module.moduleType, module.level)})`;
            }
        }
        else if (Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y)) {
            style = this.styleActive;
            text += ` structure : ${PlayerManager.getInstance().sellPriceStructure()} $`;
        }
        this.menuSell.setStyle(style);
        this.menuSell.text = text;
    }

    actionDescription(moduleType: ModuleType, level: number): string {
        let text = '';
        switch (moduleType) {
            case ModuleType.Defense:
                text = `absorb ${level} hits`;
                break;
            case ModuleType.Merchandise:
                text = `can be sold ${PlayerManager.getInstance().buyPrice(ModuleType.Merchandise, level + 1)} $ next stage`;
                break;
            case ModuleType.Cannon:
                text = `${PlayerManager.getInstance().cannonFireRate(level)} bullets/sec`
                    + ` at ${PlayerManager.getInstance().cannonBulletVelocity(level)} m/sec`;
                break;
        }
        return text;
    }

    update() {
        //this.refreshMenu();
    }
}