import * as Phaser from 'phaser';
import { SceneStarfield } from './SceneStarfield';
import { SceneMain } from './SceneMain';
import { SceneShop } from './SceneShop';
import { SceneGameOver } from './SceneGameOver';
import { SceneGameStart } from './SceneGameStart';
import { ScenePause } from './ScenePause';

const config: Phaser.Types.Core.GameConfig =
{
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
    },
    backgroundColor: 0x000000,
    scene: [
        SceneStarfield,
        SceneMain,
        SceneGameStart,
        SceneShop,
        SceneGameOver,
        ScenePause,
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
