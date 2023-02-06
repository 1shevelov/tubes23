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
// import * as COLORS from "../configs/Colors";
// import { fixValue } from "../services/Utilities";
import { PortionView } from "./PortionView";

export class TubeView extends Phaser.GameObjects.Container {
    private tubeSprite: Phaser.GameObjects.Rectangle;

    private volume: number;
    private readonly portionSizeCoeff = 0.8;

    private positions: number[][] = [];
    private portions: PortionView[] = [];

    // is top (last) position occupied, e.g. portion is ready for move
    private isActivated = false;

    public constructor(scene: Phaser.Scene) {
        super(scene);
        this.create();
    }

    public fillPortions(portions: PortionView[]): void {
        if (portions.length === 0) return;
        for (let i = 0; i < portions.length; i++) {
            // console.log(`${i} - ${this.positions[i]}`);
            portions[i].changeXPos(this.positions[i][0]);
            portions[i].changeYPos(this.positions[i][1]);
            portions[i].changeSize(
                ((this.tubeSprite.height * this.tubeSprite.scaleY) / this.volume) *
                    this.portionSizeCoeff,
            );
            portions[i].show();
            this.portions.push(portions[i]);
            this.add(portions[i]);
        }
    }

    public setVolumeAndSize(vol: number, tubeSizeY: number): void {
        this.volume = vol;
        const portionSize = tubeSizeY / vol;
        this.tubeSprite.setScale(
            portionSize / this.tubeSprite.width,
            tubeSizeY / this.tubeSprite.height,
        );
    }

    public place(x: number, y: number): void {
        this.tubeSprite.setPosition(x, y);
        this.setPortionsPositions(x, y);
        this.tubeSprite.setVisible(true);
    }

    public isEmpty(): boolean {
        return this.portions.length === 0;
    }

    public isFull(): boolean {
        return this.volume === this.portions.length;
    }

    public activate(): void {
        if (this.isActivated) return;
        const topPortion = this.getTopPortion();
        if (topPortion === undefined) return;
        // topPortion.changeYPos(this.positions[this.volume][1]);
        topPortion.animateTo(
            this.positions[this.volume][0],
            this.positions[this.volume][1],
            100,
        );
        this.isActivated = true;
    }

    public deactivate(): void {
        if (!this.isActivated) return;
        const topPortion = this.getTopPortion();
        if (topPortion === undefined) return;
        // topPortion.changeYPos(this.positions[this.portions.length - 1][1]);
        topPortion.animateTo(
            this.positions[this.portions.length - 1][0],
            this.positions[this.portions.length - 1][1],
            100,
        );
        this.isActivated = false;
    }

    public addToTop(newPortion: PortionView): void {
        if (this.isFull()) return;
        this.portions.push(newPortion);
        newPortion.animateTo(
            this.positions[this.portions.length - 1][0],
            this.positions[this.portions.length - 1][1],
            100,
        );
    }

    // on game end or level reset
    public empty(): PortionView[] {
        for (let i = 0; i < this.portions.length; i++) {
            this.portions[i].hide();
        }
        const portionsCopy = [...this.portions];
        this.portions = [];
        return portionsCopy;
    }

    public removeTopPortion(): PortionView | undefined {
        if (this.isEmpty()) return undefined;
        return this.portions.pop();
    }

    public getTopPosition(): { x: number; y: number } {
        return { x: this.positions[this.volume][0], y: this.positions[this.volume][1] };
    }

    // to activate/deactivate
    private getTopPortion(): PortionView | undefined {
        if (this.isEmpty()) return undefined;
        return this.portions[this.portions.length - 1];
    }

    private create(): void {
        const INIT_PORTION_SIZE = 100;
        this.tubeSprite = new Phaser.GameObjects.Rectangle(
            this.scene,
            0,
            0,
            INIT_PORTION_SIZE,
            INIT_PORTION_SIZE * GAME.MIN_VOLUME,
            0x00000,
            0.0,
        );
        this.tubeSprite.setStrokeStyle(1.4, 0xffffff, 1.0);
        this.tubeSprite.setVisible(false);
        this.add(this.tubeSprite);
    }

    // private draw(x: number, y: number): void {
    //     const tubeOutline = new Phaser.GameObjects.Graphics(this.scene);
    //     tubeOutline.setDefaultStyles(COLORS.TubesStyle);
    //     const tubeOutlineWi = this.portionSize;
    //     const tubeOutlineHe = this.portionSize * this.volume;
    //     tubeOutline.strokeRoundedRect(
    //         0,
    //         0,
    //         tubeOutlineWi,
    //         tubeOutlineHe,
    //         this.portionSize / 5,
    //     );
    //     tubeOutline.setPosition(x - tubeOutlineWi / 2, y - tubeOutlineHe / 2);
    //
    //     tubeOutline.setName("TubeGraphics");
    //     this.add(tubeOutline);
    //     this.posX = tubeOutline.x;
    //     this.posY = tubeOutline.y;
    //
    //     this.setInteractive(
    //         new Phaser.Geom.Rectangle(
    //             x - tubeOutlineWi / 2,
    //             y - tubeOutlineHe / 2,
    //             tubeOutlineWi,
    //             tubeOutlineHe,
    //         ),
    //         Phaser.Geom.Rectangle.Contains,
    //     );
    //     // this.on("pointerup", this.handleClick, this);
    // }

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

    // private init(volume: number, centerX: number, centerY: number, sizeY: number): void {
    //     this.volume = fixValue(volume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
    //     this.portionSize = sizeY / (this.volume + 1); // for active portion
    //     this.setPortionsPositions(centerX, centerY);
    // }

    private setPortionsPositions(centerX: number, centerY: number): void {
        const portionSize =
            (this.tubeSprite.height * this.tubeSprite.scaleY) / this.volume;
        const zeroPortionCenterY = centerY + ((this.volume - 1) * portionSize) / 2;
        for (let i = 0; i < this.volume + 1; i++) {
            this.positions.push([
                centerX,
                zeroPortionCenterY - (2 * i * portionSize) / 2,
            ]);
        }
        // console.log(this.positions);
    }
}
