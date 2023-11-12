import * as Phaser from 'phaser';
import { SceneStarfield } from './SceneStarfield';
import { SceneMain } from './SceneMain';
import { SceneShop } from './SceneShop';
import { SceneGameOver } from './SceneGameOver';
import { SceneGameStart } from './SceneGameStart';
import { ScenePause } from './ScenePause';
import { SceneGuide } from './SceneGuide';

const config: Phaser.Types.Core.GameConfig =
{
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 1080,
    },
    backgroundColor: 0x000000,
    scene: [
        SceneStarfield,
        SceneMain,
        SceneGameStart,
        SceneShop,
        SceneGameOver,
        ScenePause,
        SceneGuide, // Debug scene with resolutions guides
    ],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            // debug: true,
            // debugShowVelocity: true,
        }
    }
};

const game = new Phaser.Game(config);
