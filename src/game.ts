import * as Phaser from 'phaser';
import { SceneStarfield } from './SceneStarfield';
import { SceneMain } from './SceneMain';


const config: Phaser.Types.Core.GameConfig =
{
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: 0x000000,
    scene: [ SceneStarfield, SceneMain ],
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
