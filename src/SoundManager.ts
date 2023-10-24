import * as Phaser from 'phaser';

export class SoundManager {

    private static instance: SoundManager;
    protected constructor() {}
    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public EnemyExplosion: Phaser.Sound.BaseSound;
    public EnemyFire: Phaser.Sound.BaseSound;
    public PlayerFire: Phaser.Sound.BaseSound;
    public PlayerExplosion: Phaser.Sound.BaseSound;
    public PlayerShield: Phaser.Sound.BaseSound;

    public preload(scene: Phaser.Scene) {
        scene.load.audio('EnemyExplosion', 'assets/audio/EnemyExplosion.wav');
        scene.load.audio('EnemyFire', 'assets/audio/EnemyFire.wav');
        scene.load.audio('EnemyFlyingSaucer', 'assets/audio/EnemyFlyingSaucer.wav');        
        scene.load.audio('PlayerFire', 'assets/audio/PlayerFire.wav');
        scene.load.audio('PlayerExplosion', 'assets/audio/PlayerExplosion.wav');
        scene.load.audio('PlayerShield', 'assets/audio/PlayerShield.wav');
    }


    public create (scene: Phaser.Scene) {

        this.EnemyExplosion = scene.sound.add('EnemyExplosion');
        this.EnemyFire = scene.sound.add('EnemyFire');
        this.PlayerFire = scene.sound.add('PlayerFire');
        this.PlayerExplosion = scene.sound.add('PlayerExplosion');
        this.PlayerShield = scene.sound.add('PlayerShield');
    }
}