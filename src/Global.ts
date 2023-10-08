import * as Phaser from 'phaser';
import { Bullets } from './Bullets';

export enum GameState {
    Intermission,
    GoToShop,
    Shop,
    Fight
}

export class Global {
    
    public static bullets: Bullets;
    public static enemyBullets: Bullets;
    public static explosionPlayer: Phaser.GameObjects.Particles.ParticleEmitter;
    public static explosionEnemy: Phaser.GameObjects.Particles.ParticleEmitter;

    public static canvasSize: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    public static PlayerPosInShop: Phaser.Math.Vector2  = new Phaser.Math.Vector2();

    public static initCanvasSize(scene: Phaser.Scene) {
        Global.canvasSize.x = scene.sys.game.canvas.width;
        Global.canvasSize.y = scene.sys.game.canvas.height;
        Global.PlayerPosInShop.x = Global.canvasSize.x / 2;
        Global.PlayerPosInShop.y = Global.canvasSize.y - 100;
    }

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
