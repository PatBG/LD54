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
    protected constructor() { }
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public scene: Phaser.Scene;

    public canvasSize: Phaser.Math.Vector2;
    public canvasCenter: Phaser.Math.Vector2;
    public playerPosInShop: Phaser.Math.Vector2;

    scaleParent: Phaser.Structs.Size;
    scaleSizer: Phaser.Structs.Size;

    sizeMaxGame = new Phaser.Structs.Size(640, 1080);
    sizePortraitGame = new Phaser.Structs.Size(512, 1080);
    sizeLandscapeFullGame = new Phaser.Structs.Size(640, 720);
    rectMinGame = new Phaser.Geom.Rectangle(54, 180, 512, 720);

    public updateCanvasSize(width: number, height: number) {
        this.canvasSize = new Phaser.Math.Vector2(width, height);
        this.canvasCenter = new Phaser.Math.Vector2(width / 2, height / 2);
        this.playerPosInShop = new Phaser.Math.Vector2(
            this.rectMinGame.x + this.rectMinGame.width / 2,
            this.rectMinGame.y + this.rectMinGame.height - 150);    }

    public wave = 0;

    public money = 0;
    public moneyBonus = 0;

    public adminMode = false;

    public moduleSize = new Phaser.Math.Vector2(32, 32);
    public playerScale = 1;

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

    public initScaleSizer(scene: Phaser.Scene) {
        this.scene = scene;
        this.scaleParent = new Phaser.Structs.Size(scene.scale.gameSize.width, scene.scale.gameSize.height);
        this.scaleSizer = new Phaser.Structs.Size(this.sizeMaxGame.width, this.sizeMaxGame.height, Phaser.Structs.Size.FIT, this.scaleParent);
        this.resize(scene.scale.gameSize);

        scene.scale.on('resize', this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.scaleParent.setSize(width, height);
        this.scaleSizer.setSize(width, height);

        console.log(`resize() :  gameSize=${width}x${height} sizer=${Math.round(this.scaleSizer.width)}x${Math.round(this.scaleSizer.height)}`);

        this.updateCamera();
        this.updateCanvasSize(this.sizeMaxGame.width, this.sizeMaxGame.height);
    }

    updateCamera() {
        const scaleX = this.scaleSizer.width / this.sizeMaxGame.width;
        const scaleY = this.scaleSizer.height / this.sizeMaxGame.height;

        const x = Math.ceil((this.scaleParent.width - this.scaleSizer.width) * 0.5);
        const y = Math.ceil((this.scaleParent.height - this.scaleSizer.height) * 0.5);

        let debugText = `updateCamera() :  nb scenes=${this.scene.game.scene.scenes.length} `;
        this.scene.game.scene.scenes.forEach((scene) => {
            const camera = scene.cameras.main;
            if (camera != undefined) {
                debugText += " +";
                camera.setViewport(x, y, this.scaleSizer.width, this.scaleSizer.height);
                camera.setZoom(Math.max(scaleX, scaleY));
                camera.centerOn(this.sizeMaxGame.width / 2, this.sizeMaxGame.height / 2);
            }
            else {
                debugText += " -";
            }
        })
        console.log(debugText);
    }
}
