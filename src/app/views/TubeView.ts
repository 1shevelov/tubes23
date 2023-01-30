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
import * as COLORS from "../configs/Colors";
import { fixValue } from "../services/Utilities";
import { PortionView } from "./PortionView";

export class TubeView extends Phaser.GameObjects.Container {
    private volume: number;

    private posX: number;
    private posY: number;
    private portionSize: number;

    private activated = false;

    private positions: number[][] = [];
    private portions: PortionView[] = [];

    public constructor(
        public scene: Phaser.Scene,
        volume: number,
        centerX: number,
        centerY: number,
        sizeY: number,
    ) {
        super(scene);
        this.init(volume, centerX, centerY, sizeY);
        this.draw(centerX, centerY);
    }

    public fillContent(tubeContent: number[]): void {
        // console.log(tubeContent);
        if (tubeContent.length === 0) return;
        let portion: PortionView;
        for (let i = 0; i < tubeContent.length; i++) {
            // console.log(`${i} - ${this.positions[i]}`);
            portion = new PortionView(
                this.scene,
                this.positions[i][0],
                this.positions[i][1],
                this.portionSize,
                COLORS.CurrentPalette[tubeContent[i]],
            );
            this.portions.push(portion);
            this.add(portion);
        }
    }

    public isEmpty(): boolean {
        if (this.portions.length === 0) return true;
        return false;
    }

    private handleClick(): void {
        if (this.isEmpty()) console.log("Empty!");
        const topPortion = this.getTopPortion();
        if (!this.activated) {
            this.activated = true;
            // topPortion.changeYPos(this.positions[this.volume][1]);
            topPortion.animateTo(
                this.positions[this.volume][0],
                this.positions[this.volume][1],
                100,
            );
        } else {
            this.activated = false;
            // topPortion.changeYPos(this.positions[this.portions.length - 1][1]);
            topPortion.animateTo(
                this.positions[this.portions.length - 1][0],
                this.positions[this.portions.length - 1][1],
                100,
            );
        }
    }

    private getTopPortion(): PortionView {
        return this.portions[this.portions.length - 1];
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

        // tubeOutline.setName("container");
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
        this.on("pointerup", this.handleClick, this);
    }

    // private randomFill(fillVolume: number): void {
    //     fillVolume = fixValue(fillVolume, 0, this.volume);

    //     let portion: Phaser.GameObjects.Sprite;
    //     let randomColor: number;
    //     for (let i = this.volume - 1; i >= this.volume - fillVolume; i--) {
    //         randomColor =
    //             CurrentPalette[Math.floor(Math.random() * CurrentPalette.length)];
    //         // this.drawPortionRoundedRect(portion, tubeX, tubeY, i);
    //         // this.drawPortionCircle(portion, tubeX, tubeY, i, randomColor);
    //         portion = this.drawPortionGolfBall(this.posX, this.posY, i, randomColor);
    //         this.add(portion);
    //     }
    // }

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

    private init(volume: number, centerX: number, centerY: number, sizeY: number): void {
        this.volume = fixValue(volume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
        this.portionSize = sizeY / (this.volume + 1); // for active portion
        this.setPortionsPositions(centerX, centerY);
    }

    private setPortionsPositions(centerX: number, centerY: number): void {
        const zeroPortionCenterY = centerY + ((this.volume - 1) * this.portionSize) / 2;
        for (let i = 0; i < this.volume + 1; i++) {
            this.positions.push([
                centerX,
                zeroPortionCenterY - (2 * i * this.portionSize) / 2,
            ]);
        }
        // console.log(this.positions);
    }
}
