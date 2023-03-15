// posX, posY - where should be drawn
// color - which color
// size - which size

// private draw(x, y, size, color) - on create
// public changeSize(x) - on window resize, square
// public changeColor(0xXXX) - if color scheme is changed
// public changeXPos(x), changeYPos(y) - on window resize
// public animateTo(x, y, trajectory) - trajectory: "straight" | "curve"

import PathFollower from "phaser3-rex-plugins/plugins/pathfollower.js";
import { PortionFogStyle, uiWinMessageStyle } from "../configs/UiConfig";
import { ViewEvents } from "../configs/Events";

export class PortionView extends Phaser.GameObjects.Container {
    private portionSprite: Phaser.GameObjects.Sprite;
    private fog: Phaser.GameObjects.Container;
    private readonly portionSizeCoeff = 0.8;

    public constructor(
        scene: Phaser.Scene,
        // centerX: number,
        // centerY: number,
        // squareSize: number,
        // color: number,
    ) {
        super(scene);
        // this.portionSprite = this.draw(centerX, centerY, squareSize, color);
        this.portionSprite = this.create();
        this.add(this.portionSprite);
    }

    public setFog(): void {
        this.fog = this.makeFog(
            this.portionSprite.x,
            this.portionSprite.y,
            this.portionSprite.width > this.portionSprite.height
                ? (this.portionSprite.width * this.portionSprite.scaleX) / 2
                : (this.portionSprite.height * this.portionSprite.scaleY) / 2,
        );
        this.add(this.fog);
        this.fog.setVisible(true);
    }

    public removeFog(): void {
        if (this.fog) {
            this.fog.setVisible(false);
            this.fog.destroy();
        }
    }

    public hide(): void {
        if (this.portionSprite !== undefined) this.portionSprite.setVisible(false);
        if (this.fog) this.fog.setVisible(false);
    }

    public show(): void {
        if (this.portionSprite !== undefined) this.portionSprite.setVisible(true);
    }

    public changeSize(squareSize: number): void {
        this.portionSprite.setScale(squareSize / this.portionSprite.width);
    }

    public changeColor(color: number): void {
        this.portionSprite.setTint(color, 0xffffff, color, color);
    }

    public changeXPos(x: number): void {
        this.portionSprite.setX(x);
    }

    public changeYPos(y: number): void {
        this.portionSprite.setY(y);
    }

    // DEBUG only
    // public getPos(): { x: number; y: number } {
    //     return { x: this.portionSprite.x, y: this.portionSprite.y };
    // }

    public animateTo(x: number, y: number, duration: number): void {
        // console.log(`${this.portionSprite.x}/${this.portionSprite.y} to ${x}/${y}`);
        const distanceX = "+=" + (this.portionSprite.x - x).toString();
        const distanceY = "-=" + (this.portionSprite.y - y).toString();
        this.scene.tweens.add({
            targets: this.portionSprite,
            x: distanceX,
            y: distanceY,
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
        });
    }

    public pathAnimateTo(
        x: number,
        y: number,
        moveDuration: number,
        evEmitter: Phaser.Events.EventEmitter,
    ): void {
        // console.log(`${this.portionSprite.x}/${this.portionSprite.y} to ${x}/${y}`);
        // console.log(
        //     `${Math.abs((x + this.portionSprite.x) / 2)}, ${Math.abs(
        //         (y + this.portionSprite.y) / 2,
        //     )}`,
        // );
        const path = new Phaser.Curves.Path(this.portionSprite.x, this.portionSprite.y);
        let radX =
            Math.sqrt(
                Math.pow(x - this.portionSprite.x, 2) +
                    Math.pow(y - this.portionSprite.y, 2),
            ) / 2;
        const angle =
            (Math.atan((y - this.portionSprite.y) / (x - this.portionSprite.x)) * 180) /
            Math.PI;
        let clockWise = false;
        if (x < this.portionSprite.x) {
            radX = -radX;
            clockWise = true;
        }
        path.ellipseTo(radX, radX * 0.25, 180, 0, clockWise, angle);

        const portionPathFollower = new PathFollower(this.portionSprite, {
            path: path,
            t: 0,
        });
        //     rotateToPath: true

        this.scene.tweens.add({
            targets: portionPathFollower,
            t: 1,
            ease: "Linear", // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: moveDuration,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                evEmitter.emit(ViewEvents.PortionAnimationFinished, this);
            },
        });

        // VISUAL PATH DEBUG
        // const endPoint = this.scene.add.graphics();
        // endPoint.lineStyle(1, 0xaaffaa, 1);
        // endPoint.fillCircle(x, y, 10);
        // const pathVisual = this.scene.add.graphics();
        // pathVisual.lineStyle(1, 0x55ff55, 1);
        // path.draw(pathVisual, 128);
    }

    // private init(x: number, y: number, size: number, color: number): void {
    //     this.draw(x, y, size, color);
    // }

    private create(): Phaser.GameObjects.Sprite {
        return this.createGolfBall();
    }

    private createGolfBall(): Phaser.GameObjects.Sprite {
        const golfBall = new Phaser.GameObjects.Sprite(
            this.scene,
            0,
            0,
            "game-ui",
            // "ball-golf-150.png",
            "bubble-150.png",
            // "foot-ball2-150.png",
        );
        golfBall.setOrigin(0.5, 0.5);
        golfBall.setVisible(false);
        return golfBall;
    }

    // private draw(
    //     x: number,
    //     y: number,
    //     size: number,
    //     color: number,
    // ): Phaser.GameObjects.Sprite {
    //     return this.drawGolfBall(x, y, size, color);
    // }

    // private drawRoundedRect(
    //     figure: Phaser.GameObjects.Graphics,
    //     x: number,
    //     y: number,
    //     num: number,
    // ): void {
    //     figure.fillRoundedRect(
    //         x + this.portionSquareSize * 0.1,
    //         y + this.portionSquareSize * 0.1 + this.portionSquareSize * num,
    //         this.portionSquareSize * this.portionSizeCoeff,
    //         this.portionSquareSize * this.portionSizeCoeff,
    //         this.portionSquareSize / 6,
    //     );
    // }

    // private drawGolfBall(
    //     x: number,
    //     y: number,
    //     size: number,
    //     color: number,
    // ): Phaser.GameObjects.Sprite {
    //     const golfBall = new Phaser.GameObjects.Sprite(
    //         this.scene,
    //         0,
    //         0,
    //         "game-ui",
    //         "ball-golf-150.png",
    //     );
    //     golfBall.setOrigin(0.5, 0.5);
    //     golfBall.setPosition(x, y);
    //     golfBall.setScale((size / golfBall.width) * this.portionSizeCoeff);
    //     golfBall.setTint(color, 0xffffff, color, color);
    //     return golfBall;
    // }

    // Fog of War mode
    private makeFog(x: number, y: number, radius: number): Phaser.GameObjects.Container {
        const fog = new Phaser.GameObjects.Container(this.scene);
        const circle = new Phaser.GameObjects.Graphics(this.scene);
        circle.setDefaultStyles(PortionFogStyle);
        // filling.fillStyle(color, 1);
        circle.fillCircle(x, y, radius);
        // circle.setVisible(false);
        fog.add(circle);

        const stroking = new Phaser.GameObjects.Graphics(this.scene);
        stroking.setDefaultStyles(PortionFogStyle);
        stroking.strokeCircle(x, y, radius + 1);
        fog.add(stroking);

        const label = new Phaser.GameObjects.Text(
            this.scene,
            x,
            y,
            "?",
            uiWinMessageStyle,
        );
        label.setOrigin(0.5, 0.5);
        label.setColor("0xaa5555");
        fog.add(label);

        return fog;
    }
}
