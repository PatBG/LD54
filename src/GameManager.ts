import * as Phaser from 'phaser';

// GameStart -> Fight -> EndWave -> Shop -> Fight -> EndWave -> Shop -> Fight -> GameOver -> GameStart
export enum GameState {
    GameStart,
    Fight,
    EndWave,
    Shop,
    GameOver,
}

export class GameManager {

    private static instance: GameManager;
    protected constructor() {}
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public canvasSize: Phaser.Math.Vector2;
    public canvasCenter: Phaser.Math.Vector2;
    public playerPosInShop: Phaser.Math.Vector2;

    public initCanvasSize(scene: Phaser.Scene) {
        this.canvasSize = new Phaser.Math.Vector2(scene.sys.game.canvas.width, scene.sys.game.canvas.height);
        this.canvasCenter = new Phaser.Math.Vector2(this.canvasSize.x / 2, this.canvasSize.y / 2);
        this.playerPosInShop = new Phaser.Math.Vector2(this.canvasSize.x / 2, this.canvasSize.y - 150);
    }

    public wave = 0;

    public money = 0;
    public moneyBonus = 0;

    public adminMode = false;

    public moduleSize = new Phaser.Math.Vector2(16, 16);
    public playerScale = 2;

    // Game state
    private gameState: GameState = GameState.GameStart;
    private gameStateEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
    public onGameStateChange(callback: (state: GameState) => void): void {
        this.gameStateEmitter.on('change', callback);
    }
    public setGameState(state: GameState): void {
        this.gameState = state;
        this.gameStateEmitter.emit('change', state);
    }
    public getGameState(): GameState {
        return this.gameState;
    }
}
