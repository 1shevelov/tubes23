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
        centerX: number,
        centerY: number,
        squareSize: number,
        color: number,
    ) {
        super(scene);
        this.portionSprite = this.draw(centerX, centerY, squareSize, color);
        this.add(this.portionSprite);
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

    // TODO: make curve trajectory
    public animateTo(x: number, y: number, duration: number): void {
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

    // private init(x: number, y: number, size: number, color: number): void {
    //     this.draw(x, y, size, color);
    // }

    private draw(
        x: number,
        y: number,
        size: number,
        color: number,
    ): Phaser.GameObjects.Sprite {
        return this.drawGolfBall(x, y, size, color);
    }

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

    private drawGolfBall(
        x: number,
        y: number,
        size: number,
        color: number,
    ): Phaser.GameObjects.Sprite {
        const golfBall = new Phaser.GameObjects.Sprite(
            this.scene,
            0,
            0,
            "game-ui",
            "ball-golf-150.png",
        );
        golfBall.setOrigin(0.5, 0.5);
        golfBall.setPosition(x, y);
        golfBall.setScale((size / golfBall.width) * this.portionSizeCoeff);
        golfBall.setTint(color, 0xffffff, color, color);
        return golfBall;
    }

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
