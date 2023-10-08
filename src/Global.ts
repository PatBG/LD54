import * as Phaser from 'phaser';
import { Bullets } from './Bullets';

export enum GameState {
    Intermission,
    GotoShop,
    Shop,
    Fight
}

export class Global {
    
    public static bullets: Bullets;
    public static enemyBullets: Bullets;
    public static explosionPlayer: Phaser.GameObjects.Particles.ParticleEmitter;
    public static explosionEnemy: Phaser.GameObjects.Particles.ParticleEmitter;
    public static canvasWidth: number;
    public static canvasHeight: number;
    public static cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    // Game state
    private static gameState: GameState = GameState.Intermission;
    private static gameStateEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
    public static onGameStateChange(callback: (state: GameState) => void): void {
        this.gameStateEmitter.on('change', callback);
    }
    public static setGameState(state: GameState): void {
        this.gameState = state;
        this.gameStateEmitter.emit('change', state);
    }
    public static getGameState(): GameState {
        return this.gameState;
    }
}
