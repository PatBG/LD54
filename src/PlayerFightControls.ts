import * as Phaser from 'phaser';
import { GameManager } from './GameManager';

export class PlayerFightControls {

    scene: Phaser.Scene;

    keyLeft: Phaser.Input.Keyboard.Key;
    keyLeft2: Phaser.Input.Keyboard.Key;
    keyRight: Phaser.Input.Keyboard.Key;
    keyUp: Phaser.Input.Keyboard.Key;
    keyUp2: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    inputIsKey = true;

    inputPrecPointer = new Phaser.Math.Vector2(0, 0);
    inputPrecPlayerPos = new Phaser.Math.Vector2(0, 0);

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        this.keyLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyLeft2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyRight = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyUp2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    public getNormalizedMovement(playerPos: Phaser.Math.Vector2): [Phaser.Math.Vector2, number] {
        // get the pointer position relative to the camera
        const pointer = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;

        if (this.cursorKeys.left.isDown || this.keyLeft.isDown || this.keyLeft2.isDown
            || this.cursorKeys.right.isDown
            || this.cursorKeys.up.isDown || this.keyUp.isDown || this.keyUp2.isDown
            || this.cursorKeys.down.isDown
            || !this.scene.input.isOver) {
            this.inputIsKey = true;
        }
        else if (this.inputPrecPointer.x != pointer.x
            || this.inputPrecPointer.y != pointer.y) {
            this.inputPrecPointer.x = pointer.x;
            this.inputPrecPointer.y = pointer.y;
            this.inputIsKey = false;
        }

        let move: Phaser.Math.Vector2;
        if (this.inputIsKey) {
            move = this.keyboardMove();
        }
        else {
            const moduleSize = GameManager.getInstance().moduleSize;
            const playerRect = new Phaser.Geom.Rectangle(playerPos.x - moduleSize.x / 2, playerPos.y - moduleSize.y / 2, moduleSize.x, moduleSize.y);
            // if the mouse pointer is not over the center of the player ship, move the ship
            if (!playerRect.contains(pointer.x, pointer.y)) {
                const angle = Phaser.Math.Angle.Between(playerPos.x, playerPos.y, pointer.x, pointer.y);
                move = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
            }
            else {
                move = new Phaser.Math.Vector2(0, 0);
            }
        }

        return [move, Infinity];
    }

    inputIsSwipe = false;
    public getNormalizedMovementSwipe(playerPos: Phaser.Math.Vector2): [Phaser.Math.Vector2, number] {

        if (this.cursorKeys.left.isDown || this.keyLeft.isDown || this.keyLeft2.isDown
            || this.cursorKeys.right.isDown
            || this.cursorKeys.up.isDown || this.keyUp.isDown || this.keyUp2.isDown
            || this.cursorKeys.down.isDown
            || !this.scene.input.isOver) {
            this.inputIsKey = true;
            this.inputIsSwipe = false;
        }
        else {
            if (this.scene.input.activePointer.isDown) {
                this.inputIsKey = false;
                if (!this.inputIsSwipe) {
                    // Start a swipe movement
                    this.inputIsSwipe = true;
                    this.inputPrecPointer.x = this.scene.input.activePointer.x;
                    this.inputPrecPointer.y = this.scene.input.activePointer.y;
                    this.inputPrecPlayerPos.x = playerPos.x;
                    this.inputPrecPlayerPos.y = playerPos.y;
                }
            }
            else {
                this.inputIsSwipe = false;
            }
        }

        let move: Phaser.Math.Vector2;
        let maxDist: number;
        if (this.inputIsKey) {
            move = this.keyboardMove();
            // With keyboard move, the max distance is not relevant
            maxDist = Infinity;
        }
        else if (this.scene.input.activePointer.isDown) {
            const virtualPointerPos = new Phaser.Math.Vector2(
                this.inputPrecPlayerPos.x + (this.scene.input.activePointer.x - this.inputPrecPointer.x) / this.scene.cameras.main.zoom,
                this.inputPrecPlayerPos.y + (this.scene.input.activePointer.y - this.inputPrecPointer.y) / this.scene.cameras.main.zoom);

            const angle = Phaser.Math.Angle.Between(playerPos.x, playerPos.y, virtualPointerPos.x, virtualPointerPos.y);
            move = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
            // With pointer move, the max distance is the distance between the player and the pointer
            maxDist = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, virtualPointerPos.x, virtualPointerPos.y);
        }
        else {
            move = new Phaser.Math.Vector2(0, 0);
            maxDist = 0;
        }

        return [move, maxDist];
    }

    keyboardMove(): Phaser.Math.Vector2 {
        const move = new Phaser.Math.Vector2(0, 0);
        if (this.keyLeft.isDown || this.keyLeft2.isDown || this.cursorKeys.left.isDown) {
            move.x = -1;
        }
        else if (this.keyRight.isDown || this.cursorKeys.right.isDown) {
            move.x = 1;
        }

        if (this.keyUp.isDown || this.keyUp2.isDown || this.cursorKeys.up.isDown) {
            move.y = -1;
        }
        else if (this.keyDown.isDown || this.cursorKeys.down.isDown) {
            move.y = 1;
        }

        // Diagonal movement : normalize speed
        if (move.x !== 0 && move.y !== 0) {
            move.x *= 0.7071;
            move.y *= 0.7071;
        }

        return move;
    }
}