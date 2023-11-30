import * as Phaser from 'phaser';
import { GameManager } from './GameManager';

export class Button extends Phaser.GameObjects.Container {

    button: Phaser.GameObjects.NineSlice;
    background: Phaser.GameObjects.NineSlice;
    x0: number;
    y0: number;
    fn: Function;
    title: Phaser.GameObjects.Text;

    _isEnabled: boolean = true;
    get isEnabled(): boolean { return this._isEnabled; }
    set isEnabled(value: boolean) {
        if (this._isEnabled != value) {
            this._isEnabled = value;
            this.button.setFrame(this._isEnabled ? 1 : 2);
        }
    }

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, fn: Function) {
        x += 7 - width / 2;
        y += 7 - height / 2;
        super(scene, x, y);
        this.x0 = x;
        this.y0 = y;
        this.fn = fn;
        scene.add.existing(this);

        this.background = new Phaser.GameObjects.NineSlice(scene, x + 2, y + 2, 'buttons', 3, width, height, 7, 7, 7, 7).
            setOrigin(0, 0).setSize(width, height).setDepth(-1);
        scene.add.existing(this.background);

        this.button = new Phaser.GameObjects.NineSlice(scene, 0, 0, 'buttons', 1, width, height, 7, 7, 7, 7).
            setOrigin(0, 0).setSize(width, height);
        this.add(this.button);

        this.button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonPreActiveState())
            .on('pointerup', () => this.enterButtonActiveState());
    }

    enterButtonHoverState() {
        if (this._isEnabled) {
            this.setPosition(this.x0 + 2, this.y0 + 2);
        }
        else {
            this.setPosition(this.x0, this.y0);
        }
        this.button.setFrame(this._isEnabled ? 1 : 2);
    }

    enterButtonRestState() {
        this.setPosition(this.x0, this.y0);
        this.button.setFrame(this._isEnabled ? 1 : 2);
    }

    enterButtonPreActiveState() {
        this.button.setFrame(this._isEnabled ? 0 : 2);
    }

    enterButtonActiveState() {
        this.button.setFrame(this._isEnabled ? 1 : 2);
        if (this._isEnabled) {
            this.fn();
        }
    }
}