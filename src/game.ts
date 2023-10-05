import * as Phaser from 'phaser';
import { Starfield } from './Starfield';
import { MainScene } from './MainScene';


const config: Phaser.Types.Core.GameConfig =
{
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    backgroundColor: 0x000000,
    scene: [ Starfield, MainScene ],
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
