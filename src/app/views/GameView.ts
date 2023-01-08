// import { IocContext } from "power-di";
// import { PopupService } from "../services/PopupService";

export class GameView extends Phaser.GameObjects.Container {
    // max number of tubes for each row
    private readonly ROWS = [5, 14, 21, 36];
    private readonly MAX_TUBES = this.ROWS[this.ROWS.length - 1];

    // private popupService = IocContext.DefaultInstance.get(PopupService);
    private wi: number;
    private he: number;

    private portionSquareSize: number;

    // all tubes in the scene
    private tubes: Array<Phaser.GameObjects.Graphics> = [];

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();

        this.drawTubes(33, 3);
    }

    private init(): void {
        this.resize();

        this.scene.scale.on("resize", this.resize, this);
    }

    private drawTubes(num: number, volume: number): void {
        if (num > this.MAX_TUBES) {
            console.warn("Tubes num is bigger then max allowed. Setting it to max");
            num = this.MAX_TUBES;
        }
        let rows = this.ROWS.length;
        let i = this.ROWS.length - 2;
        while (num < this.ROWS[i]) {
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
        tube.setDefaultStyles({
            lineStyle: {
                width: 1,
                color: 0xffffff,
                alpha: 1,
            },
            fillStyle: {
                color: 0xffffff,
                alpha: 1,
            },
        });
        const tubeWi = this.portionSquareSize;
        const tubeHe = this.portionSquareSize * volume;
        tube.strokeRoundedRect(centerX - tubeWi / 2, centerY - tubeHe / 2, tubeWi, tubeHe, this.portionSquareSize / 5);

        this.tubes.push(tube);
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
