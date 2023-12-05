import * as Phaser from 'phaser';
import { GameState, GameManager } from './GameManager';
import { Player } from './Player';
import { Module, ModuleType } from './Module';
import { Button } from './Button';

export class SceneShop extends Phaser.Scene {

    menuMoney: Phaser.GameObjects.Text;

    buttonBuyStructure: Button;
    buttonBuyDefense: Button;
    buttonBuyMerchandise: Button;
    buttonBuyCannon: Button;
    buttonRotate: Button;
    buttonRotate2: Button;
    buttonUpgrade: Button;
    buttonSell: Button;
    buttonQuit: Button;

    cursorModule: Phaser.Math.Vector2;
    cursorMin = new Phaser.Math.Vector2(-9, -4);
    cursorMax = new Phaser.Math.Vector2(9, 5);
    cursorImage: Phaser.GameObjects.Image;

    modifierKey: Phaser.Input.Keyboard.Key;
    styleText: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Arial Black', fontSize: 14, color: 'white' };

    constructor() {
        super({ key: 'SceneShop' });
    }

    preload() {
        this.load.image('cursor', 'assets/cursor.png');
        this.load.spritesheet('buttons', 'assets/buttons.png', { frameWidth: 30, frameHeight: 30 });
    }

    create() {
        GameManager.getInstance().updateCamera();   // Hack because camera of inactives scenes is not updated

        this.cursorModule = new Phaser.Math.Vector2(0, 0);

        this.add.text(GameManager.getInstance().canvasCenter.x, GameManager.getInstance().rectMinGame.y + 50,
            'SHOP', this.styleText).setFontSize(48).setOrigin(0.5);

        this.menuMoney = this.add.text(GameManager.getInstance().canvasCenter.x, GameManager.getInstance().rectMinGame.y + 100,
            `Money : ${GameManager.getInstance().money} $`, this.styleText).setOrigin(0.5);

        this.buttonBuyStructure = this.addButtons(0, 0, `[T] buy structure ${Player.getInstance().buyPriceStructure()} $`,
            'T', () => { this.onBuyStructure(); });
        this.buttonBuyDefense = this.addButtons(1, 0, `[D] buy Defense shield ${Module.buyPrice(ModuleType.Defense, 1)} $\r\n` +
            `${this.actionDescription(ModuleType.Defense, 1)}`,
            'D', () => { this.onBuyModule(this.buttonBuyDefense.isEnabled, ModuleType.Defense); });
        this.buttonBuyMerchandise = this.addButtons(0, 1, `[M] buy Merchandise ${Module.buyPrice(ModuleType.Merchandise, 1)} $\r\n` +
            `${this.actionDescription(ModuleType.Merchandise, 1)}`,
            'M', () => { this.onBuyModule(this.buttonBuyMerchandise.isEnabled, ModuleType.Merchandise); });
        this.buttonBuyCannon = this.addButtons(1, 1, `[C] buy Cannon ${Module.buyPrice(ModuleType.Cannon, 1)} $\r\n` +
            `${this.actionDescription(ModuleType.Cannon, 1)}`,
            'C', () => { this.onBuyModule(this.buttonBuyCannon.isEnabled, ModuleType.Cannon); });
        this.buttonRotate2 = this.addButtons(0, 2, `[Shift+R] Rotate cannon ${Module.priceRotate()} $\r\nCounterclockwise`,
            '', () => { this.onRotateCannon(false); });
        this.buttonRotate = this.addButtons(1, 2, `[R] Rotate cannon ${Module.priceRotate()} $\r\nClockwise`,
            '', () => { this.onRotateCannon(true); });
        this.input.keyboard.addKey('R').on('down', () => { this.onRotateCannon(!this.modifierKey.isDown); });

        this.buttonUpgrade = this.addButtons(0, 3, `[U] Upgrade`,
            'U', () => { this.onUpgrade(); });
        this.buttonSell = this.addButtons(1, 3, `[S] Sell`,
            'S', () => { this.onSell(); });

        this.add.text(GameManager.getInstance().canvasCenter.x, GameManager.getInstance().rectMinGame.y + 430,
            `[Arrow Keys] to move the cursor around the modules`, this.styleText).setOrigin(0.5);

        this.buttonQuit = this.addButtons(0, 4, `[Q] quit the shop\r\nStart the next wave`,
            'Q', () => { this.onQuit(); });

        this.input.keyboard.addKey('LEFT').on('down', () => { this.onMoveCursor(-1, 0); });
        this.input.keyboard.addKey('RIGHT').on('down', () => { this.onMoveCursor(1, 0); });
        this.input.keyboard.addKey('UP').on('down', () => { this.onMoveCursor(0, -1); });
        this.input.keyboard.addKey('DOWN').on('down', () => { this.onMoveCursor(0, 1); });
        this.input.on('pointerdown', (pointer) => { this.onPointerDown(pointer); });

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

    addButtons(x: number, y: number, text: string, key: Phaser.Input.Keyboard.Key | string | number, fn: Function): Button {
        this.input.keyboard.addKey(key).on('down', fn);
        const button = new Button(this,
            GameManager.getInstance().rectMinGame.x
            + GameManager.getInstance().rectMinGame.width / 4
            + GameManager.getInstance().rectMinGame.width / 2 * x,
            GameManager.getInstance().rectMinGame.y
            + 140 + 60 * y,
            GameManager.getInstance().rectMinGame.width / 2 - 10,
            50,
            fn);
        this.add.existing(button);
        button.title = new Phaser.GameObjects.Text(this, 6, 6, text, this.styleText);
        button.add(button.title);
        return button;
    }

    // Move modules cursor with mouse
    onPointerDown(unscaledPointer: Phaser.Input.Pointer) {
        const pointer = unscaledPointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
        const size = GameManager.getInstance().moduleSize;
        const scale = GameManager.getInstance().playerScale;
        const pos0 = GameManager.getInstance().playerPosInShop;
        pointer.x += size.x * scale / 2;
        pointer.y += size.y * scale / 2;
        const x = Math.floor((pointer.x - pos0.x) / (size.x * scale));
        const y = Math.floor((pointer.y - pos0.y) / (size.y * scale));
        this.cursorMin.x, this.cursorMax.x
        if (x >= this.cursorMin.x && x <= this.cursorMax.x && y >= this.cursorMin.y && y <= this.cursorMax.y) {
            this.cursorModule.set(x, y);
            this.refreshCursor();
            this.refreshMenu();
        }
    }

    onBuyStructure() {
        if (this.buttonBuyStructure.isEnabled) {
            Player.getInstance().addNewStructure(this.cursorModule.x, this.cursorModule.y);
            GameManager.getInstance().money -= Player.getInstance().buyPriceStructure();
            this.refreshMenu();
        }
    }

    onBuyModule(isEnabled: boolean, moduleType: ModuleType) {
        if (isEnabled) {
            Player.getInstance().addNewModule(this.cursorModule.x, this.cursorModule.y, moduleType);
            GameManager.getInstance().money -= Module.buyPrice(moduleType, 1);
            this.refreshMenu();
        }
    }

    onRotateCannon(isClockwise: boolean) {
        if (this.buttonRotate.isEnabled) {
            const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);
            if (module !== undefined && module.moduleType === ModuleType.Cannon) {
                GameManager.getInstance().money -= Module.priceRotate();
                this.refreshMenu();
                module.addAngleCannon(isClockwise ? Math.PI / 8 : -Math.PI / 8);
            }
        }
    }

    onUpgrade() {
        if (this.buttonUpgrade.isEnabled) {
            const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);
            GameManager.getInstance().money -= Module.priceUpgrade(module.moduleType, module.level);
            module.level++;
            this.refreshMenu();
        }
    }

    onSell() {
        if (this.buttonSell.isEnabled) {
            const module = Player.getInstance().getModule(this.cursorModule.x, this.cursorModule.y);
            if (module !== undefined) {
                GameManager.getInstance().money += Module.sellPrice(module.moduleType, module.level);
                Player.getInstance().removeModule(this.cursorModule.x, this.cursorModule.y);
            }
            else if (Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y)) {
                GameManager.getInstance().money += Player.getInstance().sellPriceStructure();
                Player.getInstance().removeStructure(this.cursorModule.x, this.cursorModule.y);
            }
            this.refreshMenu();
        }
    }

    onMoveCursor(x: number, y: number) {
        this.cursorModule.x = Phaser.Math.Clamp(this.cursorModule.x + x, this.cursorMin.x, this.cursorMax.x);
        this.cursorModule.y = Phaser.Math.Clamp(this.cursorModule.y + y, this.cursorMin.y, this.cursorMax.y);
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
        let isEnabled = false;
        if (!isStructure) {
            if (GameManager.getInstance().money >= Player.getInstance().buyPriceStructure()) {
                for (let x = -1; x <= 1; x += 2) {
                    if (Player.getInstance().isStructure(this.cursorModule.x + x, this.cursorModule.y)) {
                        isEnabled = true;
                    }
                }
                for (let y = -1; y <= 2; y += 2) {
                    if (Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y + y)) {
                        isEnabled = true;
                    }
                }
            }
        }
        this.buttonBuyStructure.isEnabled = isEnabled;

        // menuDefense
        isEnabled = false;
        if (isStructure && module === undefined) {
            if (GameManager.getInstance().money >= Module.buyPrice(ModuleType.Defense, 1)) {
                isEnabled = true;
            }
        }
        this.buttonBuyDefense.isEnabled = isEnabled;

        // menuMerchandise
        isEnabled = false;
        if (isStructure && module === undefined) {
            if (GameManager.getInstance().money >= Module.buyPrice(ModuleType.Merchandise, 1)) {
                isEnabled = true;
            }
        }
        this.buttonBuyMerchandise.isEnabled = isEnabled;

        // menuCannon
        isEnabled = false;
        if (isStructure && module === undefined) {
            if (GameManager.getInstance().money >= Module.buyPrice(ModuleType.Cannon, 1)) {
                isEnabled = true;
            }
        }
        this.buttonBuyCannon.isEnabled = isEnabled;

        // menuRotate (only rotate cannon of level 1)
        isEnabled = false;
        if (module != undefined && module.moduleType === ModuleType.Cannon) {
            if (GameManager.getInstance().money >= Module.priceRotate()) {
                isEnabled = true;
            }
        }
        this.buttonRotate.isEnabled = isEnabled;
        this.buttonRotate2.isEnabled = isEnabled;

        // menuUpgrade
        isEnabled = false;
        let text = '[U] Upgrade';
        if (module != undefined) {
            text += ` to level ${module.level + 1} : ${Module.priceUpgrade(module.moduleType, module.level)} $\r\n`
                + `${this.actionDescription(module.moduleType, module.level + 1)}`;
            if (GameManager.getInstance().money >= Module.priceUpgrade(module.moduleType, module.level)) {
                isEnabled = true;
            }
        }
        this.buttonUpgrade.isEnabled = isEnabled;
        this.buttonUpgrade.title.text = text;

        // menuSell
        isEnabled = false;
        text = '[S] Sell';
        if (module != undefined) {
            if (Player.getInstance().nbModule() <= 1) {
                text += `\r\nCan't sell last module`;
            }
            else {
                isEnabled = true;
                text += ` ${ModuleType[module.moduleType]} level ${module.level} :`
                    + ` ${Module.sellPrice(module.moduleType, module.level)} $\r\n`
                    + `${this.actionDescription(module.moduleType, module.level)}`;
            }
        }
        else if (Player.getInstance().isStructure(this.cursorModule.x, this.cursorModule.y)) {
            isEnabled = true;
            text += ` structure : ${Player.getInstance().sellPriceStructure()} $`;
        }
        this.buttonSell.isEnabled = isEnabled;
        this.buttonSell.title.text = text;
    }

    actionDescription(moduleType: ModuleType, level: number): string {
        let text = '';
        switch (moduleType) {
            case ModuleType.Defense:
                text = `Absorb ${level} hits`;
                break;
            case ModuleType.Merchandise:
                text = `Can be sold ${Module.buyPrice(ModuleType.Merchandise, level + 1)} $ next stage`;
                break;
            case ModuleType.Cannon:
                text = `${Module.cannonFireRate(level)} bullets/sec`
                    + ` at ${Module.cannonBulletVelocity(level)} m/sec`;
                break;
        }
        return text;
    }

    update() {
    }
}