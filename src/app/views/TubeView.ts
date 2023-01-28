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

import * as GAME from "../configs/GameConfig";
import { CurrentPalette } from "../configs/Colors";
import { fixValue } from "../services/Utilities";

export class TubeView extends Phaser.GameObjects.Container {
    private readonly portionSizeCoeff = 0.8;
    private volume: number;

    private posX: number;
    private posY: number;
    private portionSize: number;

    private activated = false;

    public constructor(
        public scene: Phaser.Scene,
        volume: number,
        centerX: number,
        centerY: number,
        sizeY: number,
    ) {
        super(scene);
        this.init(volume, sizeY);
        this.draw(centerX, centerY);
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
                    CurrentPalette[tubeContent[j]],
                );
                this.add(portion);
                j++;
            }
        }
    }

    private draw(x: number, y: number): void {
        const tubeOutline = new Phaser.GameObjects.Graphics(this.scene);
        tubeOutline.setDefaultStyles(COLORS.TubesStyle);
        const tubeOutlineWi = this.portionSize;
        const tubeOutlineHe = this.portionSize * this.volume;
        tubeOutline.strokeRoundedRect(
            0,
            0,
            tubeOutlineWi,
            tubeOutlineHe,
            this.portionSize / 5,
        );
        tubeOutline.setPosition(x - tubeOutlineWi / 2, y - tubeOutlineHe / 2);

        tubeOutline.setName("container");
        this.add(tubeOutline);
        this.posX = tubeOutline.x;
        this.posY = tubeOutline.y;

        this.setInteractive(
            new Phaser.Geom.Rectangle(
                x - tubeOutlineWi / 2,
                y - tubeOutlineHe / 2,
                tubeOutlineWi,
                tubeOutlineHe,
            ),
            Phaser.Geom.Rectangle.Contains,
        );
        // tube.on("clicked", this.handleTubeClick, this);
    }

    private randomFill(fillVolume: number): void {
        fillVolume = fixValue(fillVolume, 0, this.volume);

        let portion: Phaser.GameObjects.Sprite;
        let randomColor: number;
        for (let i = this.volume - 1; i >= this.volume - fillVolume; i--) {
            randomColor =
                CurrentPalette[Math.floor(Math.random() * CurrentPalette.length)];
            // this.drawPortionRoundedRect(portion, tubeX, tubeY, i);
            // this.drawPortionCircle(portion, tubeX, tubeY, i, randomColor);
            portion = this.drawPortionGolfBall(this.posX, this.posY, i, randomColor);
            this.add(portion);
        }
    }

    // private handleClick(): void {
    //     const topPortion = this.findTopPortion();
    //     if (topPortion === null) return; //{
    //     //     console.error("topPortion is not found");
    //     //     return;
    //     // }
    //     // const container = this.getByName("container") as Phaser.GameObjects.Graphics;
    //     // console.log(topPortion.y, " / ", container.y);
    //     if (!this.activated) this.activated = true;
    //     let moveDistance = Math.abs(topPortion.y - this.posY);
    //     moveDistance += (this.squareSize * this.portionSizeCoeff) / 1.5;
    //     console.log(moveDistance);
    //     // let strDistance: string;
    //     // let moveUp = true;
    //     const strDistance = "-=" + moveDistance.toString();
    //     // if (this.activatedTube == tube.name) {
    //     //     moveUp = false;
    //     //     // moveDistance = Math.abs(topPortion.y);
    //     //     strDistance = "+=" + moveDistance.toString();
    //     // }
    //     console.log(strDistance);
    //     this.scene.tweens.add({
    //         targets: topPortion,
    //         //y: moveUp ? tube.y - this.portionSquareSize : tube.y,
    //         y: strDistance,
    //         ease: "Linear",
    //         duration: 120,
    //         repeat: 0,
    //         yoyo: false,
    //     });
    //     // if (moveUp) this.activatedTube = tube.name;
    //     // else this.activatedTube = "";
    //     // console.log(tube.name);
    // }

    private init(volume: number, sizeY: number): void {
        this.volume = fixValue(volume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
        this.portionSize = sizeY / (this.volume + 1);  // for active portion
    }

    // private findTopPortion(): Phaser.GameObjects.Sprite | null {
    //     let obj: Phaser.GameObjects.Sprite;
    //     for (let i = 0; i < GAME.MAX_VOLUME; i++) {
    //         obj = this.getByName(i.toString()) as Phaser.GameObjects.Sprite;
    //         if (obj !== null) {
    //             return obj;
    //         }
    //     }
    //     return null;
    // }
}
