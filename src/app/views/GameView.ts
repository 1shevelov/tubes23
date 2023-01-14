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
    private tubes: Array<Phaser.GameObjects.Container> = [];
    private activatedTube = "";

    // to prevent a dozen of the same event
    private readonly justClickedTubeDelay = 100;

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();

        this.drawTubes(19, 5);
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
        this.portionSquareSize = rowGap / (volume + 1.7);

        let tubeGap = 0;
        const rowLower = this.he * 0.05; // shift rows a bit lower
        tubesInRows.forEach((tubesInThisRow, row) => {
            tubeGap = this.wi / (tubesInThisRow + 1);
            for (let i = 1; i <= tubesInThisRow; i++) {
                this.drawTube(i * tubeGap, (row + 1) * rowGap + rowLower, volume);
            }
        });
        this.tubes.forEach((tube, index) => {
            tube.setName(index.toString());
        });
        this.scene.input.on(
            "gameobjectup",
            (
                _pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Container,
                _event,
            ) => {
                this.handleTubeClick(gameObject);
            },
        );
    }

    private drawTube(centerX: number, centerY: number, volume: number): void {
        const tubeOutline = new Phaser.GameObjects.Graphics(this.scene);
        tubeOutline.setDefaultStyles(COLORS.TubesStyle);
        const tubeOutlineWi = this.portionSquareSize;
        const tubeOutlineHe = this.portionSquareSize * volume;
        tubeOutline.strokeRoundedRect(
            0,
            0,
            tubeOutlineWi,
            tubeOutlineHe,
            this.portionSquareSize / 5,
        );
        tubeOutline.setPosition(centerX - tubeOutlineWi / 2, centerY - tubeOutlineHe / 2);

        const tube = new Phaser.GameObjects.Container(this.scene);
        tube.add(tubeOutline);
        this.fillTube(tubeOutline.x, tubeOutline.y, volume, tube);

        tube.setInteractive(
            new Phaser.Geom.Rectangle(
                centerX - tubeOutlineWi / 2,
                centerY - tubeOutlineHe / 2,
                tubeOutlineWi,
                tubeOutlineHe,
            ),
            Phaser.Geom.Rectangle.Contains,
        );
        // tube.on("clicked", this.handleTubeClick, this);
        this.scene.add.existing(tube);
        this.tubes.push(tube);
    }

    private fillTube(
        tubeX: number,
        tubeY: number,
        volume: number,
        tube: Phaser.GameObjects.Container,
    ): void {
        let portion: Phaser.GameObjects.Graphics;
        let randomColor: number;
        // for (let i = 0; i < volume - 1; i++) {
        let portionNumber = volume - 1;
        for (let i = volume - 1; i >= 0; i--) {
            portion = new Phaser.GameObjects.Graphics(this.scene);
            portion.setDefaultStyles(COLORS.PortionsStyle);
            randomColor =
                COLORS.AoccPalette[Math.floor(Math.random() * COLORS.AoccPalette.length)];
            portion.fillStyle(randomColor, 1);
            // this.drawPortionRoundedRect(portion, tubeX, tubeY, i);
            this.drawPortionCircle(portion, tubeX, tubeY, i);
            tube.add(portion);
            portionNumber--;
            if (portionNumber === 0) {
                portion.setName("top");
                break;
            }
        }
    }

    private drawPortionRoundedRect(
        figure: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        num: number,
    ): void {
        figure.fillRoundedRect(
            x + this.portionSquareSize * 0.1,
            y + this.portionSquareSize * 0.1 + this.portionSquareSize * num,
            this.portionSquareSize * this.portionSizeCoeff,
            this.portionSquareSize * this.portionSizeCoeff,
            this.portionSquareSize / 6,
        );
    }

    private drawPortionCircle(
        figure: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        num: number,
    ): void {
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

    private handleTubeClick(tube: Phaser.GameObjects.Container): void {
        // this.tubes.forEach((tube, index) => {
        //     if (tube === gameObject) {
        //         tube.disableInteractive();
        //         console.log(index);
        //         setTimeout(() => {
        //             tube.setInteractive();
        //         }, this.justClickedTubeDelay);
        //     }
        // });
        const topPortion = tube.getByName("top") as Phaser.GameObjects.Graphics;
        let moveUp = true;
        if (this.activatedTube == tube.name) {
            moveUp = false;
        }
        this.scene.tweens.add({
            targets: topPortion,
            y: moveUp ? tube.y - this.portionSquareSize * 2 : tube.y,
            ease: "Linear",
            duration: 500,
            repeat: 0,
            yoyo: false,
        });
        if (moveUp) this.activatedTube = tube.name;
        else this.activatedTube = "";
        // console.log(tube.name);
    }
}
