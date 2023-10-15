import * as Phaser from 'phaser';

export class Sounds {

    public static EnemyExplosion: Phaser.Sound.BaseSound;
    public static PlayerFire: Phaser.Sound.BaseSound;
    public static PlayerExplosion: Phaser.Sound.BaseSound;
    public static PlayerShield: Phaser.Sound.BaseSound;
    public static EnemyFire: Phaser.Sound.BaseSound;

    public static preload(scene: Phaser.Scene) {
        scene.load.audio('EnemyExplosion', 'assets/audio/EnemyExplosion.wav');
        scene.load.audio('EnemyFire', 'assets/audio/EnemyFire.wav');
        scene.load.audio('PlayerFire', 'assets/audio/PlayerFire.wav');
        scene.load.audio('PlayerExplosion', 'assets/audio/PlayerExplosion.wav');
        scene.load.audio('PlayerShield', 'assets/audio/PlayerShield.wav');
    }


    public static create (scene: Phaser.Scene) {

        Sounds.EnemyExplosion = scene.sound.add('EnemyExplosion');
        Sounds.EnemyFire = scene.sound.add('EnemyFire');
        Sounds.PlayerFire = scene.sound.add('PlayerFire');
        Sounds.PlayerExplosion = scene.sound.add('PlayerExplosion');
        Sounds.PlayerShield = scene.sound.add('PlayerShield');
    }
}