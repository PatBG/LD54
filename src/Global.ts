import * as Phaser from 'phaser';

// GameStart -> Fight -> EndWave -> Shop -> Fight -> EndWave -> Shop -> Fight -> GameOver -> GameStart
export enum GameState {
    GameStart,
    Fight,
    EndWave,
    Shop,
    GameOver,
}

export class Global {

    public static canvasSize: Phaser.Math.Vector2;
    public static canvasCenter: Phaser.Math.Vector2;
    public static PlayerPosInShop: Phaser.Math.Vector2;

    public static initCanvasSize(scene: Phaser.Scene) {
        Global.canvasSize = new Phaser.Math.Vector2(scene.sys.game.canvas.width, scene.sys.game.canvas.height);
        Global.canvasCenter = new Phaser.Math.Vector2(Global.canvasSize.x / 2, Global.canvasSize.y / 2);
        Global.PlayerPosInShop = new Phaser.Math.Vector2(Global.canvasSize.x / 2, Global.canvasSize.y - 100);
    }

    public static cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    public static wave = 0;

    public static money = 0;
    public static moneyBonus = 0;

    public static adminMode = false;

    // Game state
    private static gameState: GameState = GameState.GameStart;
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
