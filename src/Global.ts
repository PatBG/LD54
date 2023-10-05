import * as Phaser from 'phaser';
import { Bullets } from './Bullets';

export class Global { // abstract
    public static bullets: Bullets;
    public static enemyBullets: Bullets;
    public static explosionPlayer: Phaser.GameObjects.Particles.ParticleEmitter;
    public static explosionEnemy: Phaser.GameObjects.Particles.ParticleEmitter;
    public static canvasWidth: number;
    public static canvasHeight: number;
    public static cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
}