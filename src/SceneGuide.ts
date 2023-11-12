import * as Phaser from 'phaser';

// Debug scene with resolutions guides 
export class SceneGuide extends Phaser.Scene {
    guide_640x720: Phaser.GameObjects.Image;
    guide_512x1080: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'SceneGuide', active: true });
    }

    preload() {
        this.load.image('guide_640x720', 'assets/guide_640x720.png');
        this.load.image('guide_512x1080', 'assets/guide_512x1080.png');
    }

    create() {
        this.guide_640x720 = this.add.image(320, 540, 'guide_640x720').setDepth(1);
        this.guide_512x1080 = this.add.image(320, 540, 'guide_512x1080').setDepth(1);
        this.input.keyboard.addKey('x').on('down', () => { this.hackShowGuide(); });
    }

    update() {
    }

    hackShowGuide() {
        this.guide_640x720.visible = !this.guide_640x720.visible;
        this.guide_512x1080.visible = !this.guide_512x1080.visible;
    }
}
