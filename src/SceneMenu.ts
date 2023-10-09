import * as Phaser from 'phaser';
import { GameState, Global } from './Global';
import { Player } from './Player';
import { Module, ModuleType, Modules } from './Modules';

export class SceneMenu extends Phaser.Scene {

    menuMoney: Phaser.GameObjects.Text;
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

    cursorModule = new Phaser.Math.Vector2(0, 0);
    cursorImage: Phaser.GameObjects.Image;

    money = 10000;

    constructor() {
        super({ key: 'SceneMenu', active: true });
    }

    preload() {
        this.load.image('cursor', 'assets/cursor.png');
    }

    create() {
        this.menuMoney = this.addMenuText(`Money : ${this.money} $`);
        this.addMenuText('');
        this.menuMoney.setStyle(this.styleActive);
        this.menuStructure = this.addMenuText(`[T] buy structure : ${Modules.buyPriceStructure} $`);
        this.menuDefense = this.addMenuText(`[D] buy Defense shield : ${Modules.buyPrice(ModuleType.Defense, 1)} $` +
            ` (${this.actionDescription(ModuleType.Defense, 1)})`);
        this.menuMerchandise = this.addMenuText(`[M] buy Merchandise : ${Modules.buyPrice(ModuleType.Merchandise, 1)} $` +
            ` (${this.actionDescription(ModuleType.Merchandise, 1)})`);
        this.menuCannon = this.addMenuText(`[C] buy Cannon : ${Modules.buyPrice(ModuleType.Cannon, 1)} $` +
            ` (${this.actionDescription(ModuleType.Cannon, 1)})`);
        this.menuRotate = this.addMenuText(`[R] Rotate cannon (only if level 1, [SHIFT] + [R] turn the other way)`);
        this.menuUpgrade = this.addMenuText(`[U] Upgrade`);
        this.menuSell = this.addMenuText(`[S] Sell`);
        this.addMenuText('');
        this.menuGo = this.addMenuText(`[ESC] quit the shop and start the next wave`);
        this.menuGo.setStyle(this.styleActive);

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

        this.cursorImage = this.add.image(Global.PlayerPosInShop.x, Global.PlayerPosInShop.y, 'cursor');
        this.tweens.add({
            targets: this.cursorImage,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 350
        });

        Global.onGameStateChange((state: GameState) => { this.onGameStateChange(state); });
    }

    onGameStateChange(state: GameState) {
        if (state === GameState.Shop) {
            this.cursorModule.set(0, 0);
            this.refreshCursor();
            this.scene.resume();
            this.scene.setVisible(true);
        } else {
            this.scene.pause();
            this.scene.setVisible(false);
        }
    }

    menuTextPos = new Phaser.Math.Vector2(100, 100);
    addMenuText(text: string): Phaser.GameObjects.Text {
        this.menuTextPos.y += 20;
        return this.add.text(this.menuTextPos.x, this.menuTextPos.y, text);
    }

    onBuyStructure() {
        if (this.menuStructure.style.color === this.styleActiveColor) {
            Player.NewStructure(this.cursorModule.x, this.cursorModule.y);
            this.money -= Modules.buyPriceStructure;
            this.refreshMenu();
        }
    }

    onBuyModule(text: Phaser.GameObjects.Text, moduleType: ModuleType) {
        if (text.style.color === this.styleActiveColor) {
            Player.NewModule(this.cursorModule.x, this.cursorModule.y, moduleType);
            this.money -= Modules.buyPrice(moduleType, 1);
            this.refreshMenu();
        }
    }

    onRotateCannon() {
        if (this.menuRotate.style.color === this.styleActiveColor) {
            const module = Player.GetModule(this.cursorModule.x, this.cursorModule.y);
            if (module !== undefined && module.moduleType === ModuleType.Cannon) {
                module.addAngleCannon(Global.cursorKeys.shift.isDown ? -Math.PI / 8 : Math.PI / 8);
            }
        }
    }

    onUpgrade() {
        if (this.menuUpgrade.style.color === this.styleActiveColor) {
            const module = Player.GetModule(this.cursorModule.x, this.cursorModule.y);
            this.money -= Modules.priceUpgrade(module.moduleType, module.level);
            module.level++;
            this.refreshMenu();
        }
    }

    onSell() {
        if (this.menuSell.style.color === this.styleActiveColor) {
            const module = Player.GetModule(this.cursorModule.x, this.cursorModule.y);
            if (module !== undefined) {
                this.money += Modules.sellPrice(module.moduleType, module.level);
                Player.RemoveModule(this.cursorModule.x, this.cursorModule.y);
            }
            else if (Player.IsStructure(this.cursorModule.x, this.cursorModule.y)) {
                this.money += Modules.SellPriceStructure;
                Player.RemoveStructure(this.cursorModule.x, this.cursorModule.y);
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
            Global.PlayerPosInShop.x + this.cursorModule.x * Modules.size.x,
            Global.PlayerPosInShop.y + this.cursorModule.y * Modules.size.y);
    }

    onQuit() {
        Global.setGameState(GameState.Fight);
    }

    refreshMenu() {
        this.menuMoney.text = `Money : ${this.money} $`;

        const isStructure = Player.IsStructure(this.cursorModule.x, this.cursorModule.y);
        const module = Player.GetModule(this.cursorModule.x, this.cursorModule.y);

        // menuStructure
        let style = this.styleGrayed;
        if (!isStructure) {
            if (this.money >= Modules.buyPriceStructure) {
                for (let x = -1; x <= 1; x += 2) {
                    if (Player.IsStructure(this.cursorModule.x + x, this.cursorModule.y)) {
                        style = this.styleActive;
                    }
                }
                for (let y = -1; y <= 2; y += 2) {
                    if (Player.IsStructure(this.cursorModule.x, this.cursorModule.y + y)) {
                        style = this.styleActive;
                    }
                }
            }
        }
        this.menuStructure.setStyle(style);

        // menuDefense
        style = this.styleGrayed;
        if (isStructure && module === undefined) {
            if (this.money >= Modules.buyPrice(ModuleType.Defense, 1)) {
                style = this.styleActive;
            }
        }
        this.menuDefense.setStyle(style);

        // menuMerchandise
        style = this.styleGrayed;
        if (isStructure && module === undefined) {
            if (this.money >= Modules.buyPrice(ModuleType.Merchandise, 1)) {
                style = this.styleActive;
            }
        }
        this.menuMerchandise.setStyle(style);

        // menuCannon
        style = this.styleGrayed;
        if (isStructure && module === undefined) {
            if (this.money >= Modules.buyPrice(ModuleType.Cannon, 1)) {
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
        if (module != undefined && this.money >= Modules.priceUpgrade(module.moduleType, module.level)) {
            style = this.styleActive;
            text += ` to level ${module.level + 1} : ${Modules.priceUpgrade(module.moduleType, module.level)} $`
                + ` (${this.actionDescription(module.moduleType, module.level + 1)}) :`;
        }
        this.menuUpgrade.setStyle(style);
        this.menuUpgrade.text = text;

        // menuSell
        style = this.styleGrayed;
        text = '[S] Sell';
        if (module != undefined) {
            if (Player.NbModule() <= 1) {
                text += ` (you can't sell the last module)`;
            }
            else {
                style = this.styleActive;
                text += ` ${ModuleType[module.moduleType]} level ${module.level} :`
                    + ` ${Modules.sellPrice(module.moduleType, module.level)} $`
                    + ` (${this.actionDescription(module.moduleType, module.level)})`;
            }
        }
        else if (Player.IsStructure(this.cursorModule.x, this.cursorModule.y)) {
            style = this.styleActive;
            text += ` structure : ${Modules.SellPriceStructure} $`;
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
                text = `can be sold ${Modules.buyPrice(ModuleType.Merchandise, level + 1)} $ next stage`;
                break;
            case ModuleType.Cannon:
                text = `${Modules.cannonFireRate(level)} bullets/sec`
                    + ` at ${Modules.cannonBulletVelocity(level)} m/sec`;
                break;
        }
        return text;
    }

    update() {
        this.refreshMenu();
    }
}