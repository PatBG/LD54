import * as Phaser from 'phaser';
import { Global } from './Global';

export class SceneMenu extends Phaser.Scene {

    constructor() {
        super({ key: 'SceneMenu', active: true });
    }

    preload() {
    }

    create() {
        this.add.text(100, 100,
            '[R] Structure : 50 $\r\n' +
            '[C] Cannon : 100 $ (1 bullet per second)\r\n' +
            '[S] Shield : 50 $ (absorb 1 hit)\r\n' +
            '[M] Merchandise : 100 $ (can be sold 200 $ next stage)\r\n' +
            '[U] Upgrade Merchandise : 100 $ (can be sold 400 $ next stage)\r\n' +
            '[S] Sell Cannon (1 bullet per second) : 50 $', { font: '16px monospace', color: 'aqua' }
        );
    }

    update() {
    }
}