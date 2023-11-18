import * as Phaser from 'phaser';
import { GameManager } from './GameManager';

export class PlayerFightControls {
    keyLeft: Phaser.Input.Keyboard.Key;
    keyLeft2: Phaser.Input.Keyboard.Key;
    keyRight: Phaser.Input.Keyboard.Key;
    keyUp: Phaser.Input.Keyboard.Key;
    keyUp2: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    scene: Phaser.Scene;

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

    inputIsKey = true;
    inputPrecPointer = new Phaser.Math.Vector2(0, 0);
    public getNormalizedMovement(playerPos:Phaser.Math.Vector2): Phaser.Math.Vector2 {
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

        let move = new Phaser.Math.Vector2(0, 0);
        if (!this.inputIsKey) {
            const moduleSize = GameManager.getInstance().moduleSize;
            const playerRect = new Phaser.Geom.Rectangle(playerPos.x - moduleSize.x / 2, playerPos.y - moduleSize.y / 2, moduleSize.x, moduleSize.y);
            // if the mouse pointer is not over the center of the player ship, move the ship
            if (!playerRect.contains(pointer.x, pointer.y)) {
                const angle = Phaser.Math.Angle.Between(playerPos.x, playerPos.y, pointer.x, pointer.y);
                move.x = Math.cos(angle);
                move.y = Math.sin(angle);
            }
        }
        else {
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
        }

        return move;
    }
}