// import { IocContext } from "power-di";
// import { PopupService } from "../services/PopupService";
import * as COLORS from "../configs/Colors";

export class GameView extends Phaser.GameObjects.Container {
    // max number of tubes for each row
    private readonly MAX_TUBES = 40;
    private readonly HOR_ROWS = [5, 16, 24, this.MAX_TUBES];
    private readonly PORT_ROWS = [4, 10, 18, 28, this.MAX_TUBES];
    private tubeRows: Array<number>;

    private readonly portionSizeCoeff = 0.8;

    // private popupService = IocContext.DefaultInstance.get(PopupService);
    private wi: number;
    private he: number;

    private portionSquareSize: number;

    // all tubes in the scene
    private tubes: Array<Phaser.GameObjects.Graphics> = [];

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();

        this.drawTubes(10, 5);
    }

    private init(): void {
        this.resize();
        this.tubeRows = this.wi > this.he ? this.HOR_ROWS : this.PORT_ROWS;

        this.scene.scale.on("resize", this.resize, this);
    }

    private drawTubes(num: number, volume: number): void {
        if (num > this.MAX_TUBES) {
            console.warn("Tubes num is bigger then max allowed. Setting it to max");
            num = this.MAX_TUBES;
        }

        // deciding how many rows are needed
        let rows = this.tubeRows.length;
        let i = this.tubeRows.length - 2;
        while (num < this.tubeRows[i]) {
            rows = i;
            i--;
        }
        const unevenTubes = num % rows;
        const tubesInRows = Array(rows).fill((num - unevenTubes) / rows);
        for (let i = 1; i <= unevenTubes; i++) {
            tubesInRows[i - 1]++;
        }
        // console.log(tubesInRows);
        const rowGap = this.he / (rows + 1);
        this.portionSquareSize = rowGap / (volume + 1.5);

        let tubeGap = 0;
        tubesInRows.forEach((tubesInThisRow, row) => {
            tubeGap = this.wi / (tubesInThisRow + 1);
            for (let i = 1; i <= tubesInThisRow; i++) {
                this.drawTube(i * tubeGap, (row + 1) * rowGap, volume);
            }
        });
    }

    private drawTube(centerX: number, centerY: number, volume: number): void {
        // const portionSquareSize = this.wi > this.he ? Math.round(this.he / 20) : Math.round(this.he / 20);

        const tube = this.scene.add.graphics();
        tube.setDefaultStyles(COLORS.TubesStyle);
        const tubeWi = this.portionSquareSize;
        const tubeHe = this.portionSquareSize * volume;
        tube.strokeRoundedRect(0, 0, tubeWi, tubeHe, this.portionSquareSize / 5);
        tube.setPosition(centerX - tubeWi / 2, centerY - tubeHe / 2);
        this.fillTube(tube, volume);

        this.tubes.push(tube);
    }

    private fillTube(tube: Phaser.GameObjects.Graphics, volume: number): void {
        let portion: Phaser.GameObjects.Graphics;
        let randomColor: number;
        for (let i = 0; i < volume; i++) {
            portion = this.scene.add.graphics();
            portion.setDefaultStyles(COLORS.PortionsStyle);
            randomColor = COLORS.AoccPalette[Math.floor(Math.random() * COLORS.AoccPalette.length)];
            portion.fillStyle(randomColor, 1);
            // this.drawPortionRoundedRect(portion, tube.x, tube.y, i);
            this.drawPortionCircle(portion, tube.x, tube.y, i);
        }
    }

    private drawPortionRoundedRect(figure: Phaser.GameObjects.Graphics, x: number, y: number, num: number): void {
        figure.fillRoundedRect(
            x + this.portionSquareSize * 0.1,
            y + this.portionSquareSize * 0.1 + this.portionSquareSize * num,
            this.portionSquareSize * this.portionSizeCoeff,
            this.portionSquareSize * this.portionSizeCoeff,
            this.portionSquareSize / 6,
        );
    }

    private drawPortionCircle(figure: Phaser.GameObjects.Graphics, x: number, y: number, num: number): void {
        figure.fillCircle(
            x + this.portionSquareSize * 0.5,
            y + this.portionSquareSize * (num + 0.5),
            (this.portionSquareSize * this.portionSizeCoeff) / 2,
        );
    }

    private resize(): void {
        // const prevWi = this.wi;
        // const prevHe = this.he;
        const { width, height } = this.scene.scale.gameSize;
        const halfShiftX = (width - this.wi) / 2;
        const halfShiftY = (height - this.he) / 2;
        this.wi = width;
        this.he = height;

        this.tubes.forEach((tube) => {
            tube.setX(tube.x + halfShiftX);
            tube.setY(tube.y + halfShiftY);
        });
    }

    // private handleBkgClick(): void {
    //     this.bkg.disableInteractive();
    //     this.popupService.showCounterPopup();
    //     setTimeout(() => {
    //         this.bkg.setInteractive();
    //     }, 2000);
    // }
}
