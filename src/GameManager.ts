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

    private sceneMain: Phaser.Scene;

    scaleParent: Phaser.Structs.Size;
    scaleSizer: Phaser.Structs.Size;
    scaleSizerPortrait: Phaser.Structs.Size;
    scaleSizerLandscape: Phaser.Structs.Size;

    sizeMaxGame = new Phaser.Structs.Size(640, 1080);
    rectMinGame = new Phaser.Geom.Rectangle(64, 180, 512, 720);
    sizePortraitGame = new Phaser.Structs.Size(512, 1080);
    sizeLandscapeGame = new Phaser.Structs.Size(640, 720);
    rectCurrentGame: Phaser.Geom.Rectangle;

    public canvasCenter = new Phaser.Math.Vector2(this.sizeMaxGame.width / 2, this.sizeMaxGame.height / 2);
    public playerPosInShop = new Phaser.Math.Vector2(
        this.rectMinGame.x + this.rectMinGame.width / 2,
        this.rectMinGame.y + this.rectMinGame.height - 150);

    // Waves data
    public wave = 0;
    waveBonus(level: number): number {
        return 100 + (level - 1) * 10;
    }

    public money = 0;
    public moneyBonus = 0;

    public adminMode = window.location.href.indexOf("localhost") >= 0;      // Admin mode is on by default on localhost
    public adminModeAllowed = this.adminMode;                               // Admin mode is allowed if set at start (toggleable in game)

    public moduleSize = new Phaser.Math.Vector2(32, 32);
    public playerScale = 0.75;

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
        this.sceneMain = scene;
        this.scaleParent = new Phaser.Structs.Size(scene.scale.gameSize.width, scene.scale.gameSize.height);
        this.scaleSizerPortrait = new Phaser.Structs.Size(this.sizePortraitGame.width, this.sizePortraitGame.height, Phaser.Structs.Size.FIT, this.scaleParent);
        this.scaleSizerLandscape = new Phaser.Structs.Size(this.sizeLandscapeGame.width, this.sizeLandscapeGame.height, Phaser.Structs.Size.FIT, this.scaleParent);
        this.resize(scene.scale.gameSize);

        scene.scale.on('resize', this.resize, this);
    }

    private resize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;

        const ratioParent = width / height;
        const ratioPortrait = this.sizePortraitGame.width / this.sizePortraitGame.height;
        const ratioLandscape = this.sizeLandscapeGame.width / this.sizeLandscapeGame.height;
        let debugText = "";
        let sizeCurrentGame: Phaser.Structs.Size;
        if (Math.abs(ratioParent - ratioPortrait) < Math.abs(ratioParent - ratioLandscape)) {
            debugText += "(Portrait) ";
            sizeCurrentGame = this.sizePortraitGame;
            this.scaleSizer = this.scaleSizerPortrait;
        }
        else {
            debugText += " (Landscape) ";
            sizeCurrentGame = this.sizeLandscapeGame;
            this.scaleSizer = this.scaleSizerLandscape;
        }
        this.rectCurrentGame = new Phaser.Geom.Rectangle(
            (this.sizeMaxGame.width - sizeCurrentGame.width) / 2, 
            (this.sizeMaxGame.height - sizeCurrentGame.height) / 2, 
            sizeCurrentGame.width, 
            sizeCurrentGame.height);

        this.scaleParent.setSize(width, height);
        this.scaleSizer.setSize(width, height);

        this.cameraScaleX = this.scaleSizer.width / this.rectCurrentGame.width;
        this.cameraScaleY = this.scaleSizer.height / this.rectCurrentGame.height;
        console.log(
            `resize() :  ` +
            `scaleParent=${this.scaleParent.width}x${this.scaleParent.height} ` +
            `scaleSizer=${Math.round(this.scaleSizer.width)}x${Math.round(this.scaleSizer.height)} ` +
            `rectCurrentGame=${this.rectCurrentGame.width}x${this.rectCurrentGame.height} ` +
            `cameraScale=${Phaser.Math.RoundTo(this.cameraScaleX, -2)}x${Phaser.Math.RoundTo(this.cameraScaleY, -2)} ` +
            debugText);

        this.updateCamera();
        this.resizeEmitter.emit('change', this.rectCurrentGame);
    }

    // Resize event and notification
    private resizeEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
    public onResize(callback: (rectCurrentGame: Phaser.Geom.Rectangle) => void): void {
        this.resizeEmitter.on('change', callback);
    }

    cameraScaleX: number;
    cameraScaleY: number;

    public updateCamera() {

        let debugText = "";
        let iScene = 0;
        this.sceneMain.game.scene.scenes.forEach((scene) => {
            const camera = scene.cameras.main;
            if (camera != undefined) {
                camera.setViewport(
                    (this.scaleParent.width - this.scaleSizer.width) /2,
                    (this.scaleParent.height - this.scaleSizer.height) /2,
                    this.scaleSizer.width, 
                    this.scaleSizer.height);
                camera.setZoom(Math.max(this.cameraScaleX, this.cameraScaleY));
                camera.centerOn(this.sizeMaxGame.width / 2, this.sizeMaxGame.height / 2);
            }
            else {
                debugText += `scene[${iScene}] `;
            }
            iScene++;
        })

        // if (debugText != "") {
        //     console.log("updateCamera() missing " + debugText);
        // }
    }
}
