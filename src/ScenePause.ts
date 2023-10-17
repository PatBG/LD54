import * as Phaser from 'phaser';

export class ScenePause extends Phaser.Scene {

    constructor() {
        super({ key: 'ScenePause', active: true });
    }

    create() {
        this.input.keyboard.addKey('P').on('down', () => {
            this.scene.pause();
            this.scene.resume('SceneStarfield');
            this.scene.resume('SceneMain');
        }, this);
        this.scene.pause();
    }
}
