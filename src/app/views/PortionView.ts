// posX, posY - where should be drawn
// color - which color
// size - which size

// private draw(x, y, size, color) - on create
// public changeSize(x) - on window resize, square
// public changeColor(0xXXX) - if color scheme is changed
// public changeXPos(x), changeYPos(y) - on window resize
// public animateTo(x, y, trajectory) - trajectory: "straight" | "curve"

export class PortionView extends Phaser.GameObjects.Container {
    private portionSprite: Phaser.GameObjects.Sprite;
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

    public hide(): void {
        if (this.portionSprite !== undefined) this.portionSprite.setVisible(false);
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

    public curveAnimateTo(x: number, y: number, _duration: number): void {
        // console.log(`${this.portionSprite.x}/${this.portionSprite.y} to ${x}/${y}`);
        const path = new Phaser.Curves.Path(this.portionSprite.x, this.portionSprite.y);
        path.ellipseTo(
            (x - this.portionSprite.x) / 2,
            (y - this.portionSprite.y) / 2,
            100,
            250,
            false,
            0,
        );
        const endPoint = this.scene.add.graphics();
        endPoint.lineStyle(1, 0x55ff55, 1);
        endPoint.fillCircle(x, y, 10);
        const pathVisual = this.scene.add.graphics();
        pathVisual.lineStyle(1, 0xffffff, 1);
        path.draw(pathVisual, 128);
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

    // private drawCircle(
    //     portionContainer: Phaser.GameObjects.Container,
    //     x: number,
    //     y: number,
    //     num: number,
    //     color: number,
    // ): void {
    //     const filling = new Phaser.GameObjects.Graphics(this.scene);
    //     filling.setDefaultStyles(COLORS.PortionsStyle);
    //     filling.fillStyle(color, 1);
    //     filling.fillCircle(
    //         x + this.portionSquareSize * 0.5,
    //         y + this.portionSquareSize * (num + 0.5),
    //         (this.portionSquareSize * this.portionSizeCoeff) / 2,
    //     );
    //     portionContainer.add(filling);

    //     const stroking = new Phaser.GameObjects.Graphics(this.scene);
    //     stroking.setDefaultStyles(COLORS.PortionsStyle);
    //     stroking.strokeCircle(
    //         x + this.portionSquareSize * 0.5,
    //         y + this.portionSquareSize * (num + 0.5),
    //         (this.portionSquareSize * this.portionSizeCoeff) / 2,
    //     );
    //     portionContainer.add(stroking);
    // }
}
