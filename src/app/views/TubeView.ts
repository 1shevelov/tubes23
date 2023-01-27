// posX, posY - center
// volume
// sizeY in px
// positions : array of coordinates of all available positions and PortionViews that occupy them
// portionSize - calculated

// private init (posX, posY, volume, sizeY)
// private drawClassic(posX, posY, size) - on create, classic tube (Drains.Neck)
// public fill(number[])
// public changeSizeY(y) - on window resize
// public changeVolume ???
// public changeXPos(x), changeYPos(y) - on window resize
// public activateSource() - ready portion on click
// public acivateRecipient() - flash on receive
// public addPortion() - classic on topmost free position
// public removePortion() - classic from topmost position

import * as COLORS from "../configs/Colors";
import * as GAME from "../configs/GameConfig";
import { fixValue } from "../services/Utilities";

export class TubeView extends Phaser.GameObjects.Container {
    private readonly portionSizeCoeff = 0.8;
    private volume: number;

    private posX: number;
    private posY: number;
    private squareSize: number;

    private activated = false;

    public constructor(public scene: Phaser.Scene, volume: number) {
        super(scene);
        this.init(volume);
    }

    public draw(centerX: number, centerY: number, squareSize: number): void {
        this.squareSize = squareSize;
        const tubeOutline = new Phaser.GameObjects.Graphics(this.scene);
        tubeOutline.setDefaultStyles(COLORS.TubesStyle);
        const tubeOutlineWi = squareSize;
        const tubeOutlineHe = squareSize * this.volume;
        tubeOutline.strokeRoundedRect(0, 0, tubeOutlineWi, tubeOutlineHe, squareSize / 5);
        tubeOutline.setPosition(centerX - tubeOutlineWi / 2, centerY - tubeOutlineHe / 2);

        tubeOutline.setName("container");
        this.add(tubeOutline);
        this.posX = tubeOutline.x;
        this.posY = tubeOutline.y;

        this.setInteractive(
            new Phaser.Geom.Rectangle(
                centerX - tubeOutlineWi / 2,
                centerY - tubeOutlineHe / 2,
                tubeOutlineWi,
                tubeOutlineHe,
            ),
            Phaser.Geom.Rectangle.Contains,
        );
        // tube.on("clicked", this.handleTubeClick, this);
    }

    public randomFill(fillVolume: number): void {
        fillVolume = fixValue(fillVolume, 0, this.volume);

        let portion: Phaser.GameObjects.Sprite;
        let randomColor: number;
        for (let i = this.volume - 1; i >= this.volume - fillVolume; i--) {
            randomColor =
                COLORS.AoccPalette[Math.floor(Math.random() * COLORS.AoccPalette.length)];
            // this.drawPortionRoundedRect(portion, tubeX, tubeY, i);
            // this.drawPortionCircle(portion, tubeX, tubeY, i, randomColor);
            portion = this.drawPortionGolfBall(this.posX, this.posY, i, randomColor);
            this.add(portion);
        }
    }

    public fillContent(tubeContent: number[]): void {
        // check data?
        let portion: Phaser.GameObjects.Sprite;
        let j = 0;
        for (let i = this.volume - 1; i >= 0; i--) {
            // this.drawPortionRoundedRect(portion, tubeX, tubeY, i);
            // this.drawPortionCircle(portion, tubeX, tubeY, i, randomColor);
            if (tubeContent[j] !== undefined) {
                portion = this.drawPortionGolfBall(
                    this.posX,
                    this.posY,
                    i,
                    COLORS.AoccPalette[tubeContent[j]],
                );
                this.add(portion);
                j++;
            }
        }
    }

    public handleClick(): void {
        const topPortion = this.findTopPortion();
        if (topPortion === null) return; //{
        //     console.error("topPortion is not found");
        //     return;
        // }
        // const container = this.getByName("container") as Phaser.GameObjects.Graphics;
        // console.log(topPortion.y, " / ", container.y);
        if (!this.activated) this.activated = true;
        let moveDistance = Math.abs(topPortion.y - this.posY);
        moveDistance += (this.squareSize * this.portionSizeCoeff) / 1.5;
        console.log(moveDistance);
        // let strDistance: string;
        // let moveUp = true;
        const strDistance = "-=" + moveDistance.toString();
        // if (this.activatedTube == tube.name) {
        //     moveUp = false;
        //     // moveDistance = Math.abs(topPortion.y);
        //     strDistance = "+=" + moveDistance.toString();
        // }
        console.log(strDistance);
        this.scene.tweens.add({
            targets: topPortion,
            //y: moveUp ? tube.y - this.portionSquareSize : tube.y,
            y: strDistance,
            ease: "Linear",
            duration: 120,
            repeat: 0,
            yoyo: false,
        });
        // if (moveUp) this.activatedTube = tube.name;
        // else this.activatedTube = "";
        // console.log(tube.name);
    }

    private init(volume: number): void {
        this.volume = fixValue(volume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
    }

    // private drawPortionRoundedRect(
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

    private drawPortionGolfBall(
        x: number,
        y: number,
        num: number,
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
        golfBall.setPosition(
            x + this.squareSize * 0.5,
            y + this.squareSize * (num + 0.5),
        );
        const scale = (this.squareSize * this.portionSizeCoeff) / golfBall.width;
        golfBall.setScale(scale);
        golfBall.setTint(color, 0xffffff, color, color);
        golfBall.setName(num.toString());
        // console.log(`${num}: ${color}`);
        // console.log(`${num}: ${golfBall.y}`);
        return golfBall;
    }

    // private drawPortionCircle(
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

    private findTopPortion(): Phaser.GameObjects.Sprite | null {
        let obj: Phaser.GameObjects.Sprite;
        for (let i = 0; i < GAME.MAX_VOLUME; i++) {
            obj = this.getByName(i.toString()) as Phaser.GameObjects.Sprite;
            if (obj !== null) {
                return obj;
            }
        }
        return null;
    }
}
