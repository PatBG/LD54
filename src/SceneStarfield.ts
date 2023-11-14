import * as Phaser from 'phaser';
import { GameManager, GameState } from './GameManager';

export class SceneStarfield extends Phaser.Scene {

    stars: Phaser.GameObjects.Blitter;
    distance_min = 300;
    distance_max = 1600;
    speed_x = 0;
    speed_y = -250;
    max_x: number;
    max_y: number;

    nb_stars = 200;
    zz = [];

    constructor() {
        super({ key: 'SceneStarfield', active: true });
    }

    preload() {
        this.load.image('star', 'assets/pixel-white.png');
    }

    create() {
        //  Do this, otherwise this Scene will steal all keyboard input
        this.input.keyboard.enabled = false;

        this.stars = this.add.blitter(0, 0, 'star');

        this.max_x = GameManager.getInstance().sizeMaxGame.width;
        this.max_y = GameManager.getInstance().sizeMaxGame.height;
        for (let i = 0; i < this.nb_stars; i++) {
            this.zz[i] = Phaser.Math.Between(this.distance_min, this.distance_max);
            this.stars.create(Phaser.Math.Between(0, this.max_x), Phaser.Math.Between(0, this.max_y));
        }
    }

    update(time, delta) {
        if (GameManager.getInstance().getGameState() === GameState.Fight) {
            for (let i = 0; i < this.nb_stars; i++) {
                const perspective = this.distance_min / (this.distance_min - this.zz[i]);
                const bob = this.stars.children.list[i];
                bob.y += this.speed_y * (delta / 1000) * perspective;
                if (bob.y > this.max_y) {
                    bob.y -= this.max_y;
                } else if (bob.y < 0) {
                    bob.y += this.max_y;
                }
                bob.x += this.speed_x * (delta / 1000) * perspective;
                if (bob.x > this.max_x) {
                    bob.x -= this.max_x;
                } else if (bob.x < 0) {
                    bob.x += this.max_x;
                }
            }
        }
    }
}

