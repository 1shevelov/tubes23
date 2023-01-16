// import { IocContext } from "power-di";
// import { PopupService } from "../services/PopupService";
import * as COLORS from "../configs/Colors";

export class GameView extends Phaser.GameObjects.Container {
    private readonly MAX_TUBES = 40;
    // max number of tubes for each row
    private readonly HOR_ROWS = [5, 16, 24, this.MAX_TUBES];
    private readonly PORT_ROWS = [4, 10, 18, 28, this.MAX_TUBES];
    private tubeRows: Array<number>; // contains HOR or PORT

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

        this.drawTubes(13, 4);
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
            rows = i + 1;
            i--;
        }
        const unevenTubes = num % rows;
        const tubesInRows = Array(rows).fill((num - unevenTubes) / rows);
        for (let i = 1; i <= unevenTubes; i++) {
            tubesInRows[i - 1]++;
        }
        // console.log(tubesInRows);
        const rowGap = this.he / (rows + 1);
        this.portionSquareSize = rowGap / (volume + 1.6);

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
        tubeOutline.setName("container");
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
        let portion: Phaser.GameObjects.Sprite;
        let randomColor: number;
        let portionNumber = volume - 1;
        for (let i = volume - 1; i >= 0; i--) {
            randomColor =
                COLORS.AoccPalette[Math.floor(Math.random() * COLORS.AoccPalette.length)];
            // this.drawPortionRoundedRect(portion, tubeX, tubeY, i);
            // this.drawPortionCircle(portion, tubeX, tubeY, i, randomColor);
            portion = this.drawPortionGolfBall(tubeX, tubeY, i, randomColor);
            tube.add(portion);
            portionNumber--;
            if (portionNumber === 0) {
                // portion.setName("top");
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
            x + this.portionSquareSize * 0.5,
            y + this.portionSquareSize * (num + 0.5),
        );
        const scale = (this.portionSquareSize * this.portionSizeCoeff) / golfBall.width;
        golfBall.setScale(scale);
        golfBall.setTint(color, color, color, 0xffffff);
        golfBall.setName(num.toString());
        // console.log(`${num}: ${golfBall.y}`);
        return golfBall;
    }

    private drawPortionCircle(
        portionContainer: Phaser.GameObjects.Container,
        x: number,
        y: number,
        num: number,
        color: number,
    ): void {
        const filling = new Phaser.GameObjects.Graphics(this.scene);
        filling.setDefaultStyles(COLORS.PortionsStyle);
        filling.fillStyle(color, 1);
        filling.fillCircle(
            x + this.portionSquareSize * 0.5,
            y + this.portionSquareSize * (num + 0.5),
            (this.portionSquareSize * this.portionSizeCoeff) / 2,
        );
        portionContainer.add(filling);

        const stroking = new Phaser.GameObjects.Graphics(this.scene);
        stroking.setDefaultStyles(COLORS.PortionsStyle);
        stroking.strokeCircle(
            x + this.portionSquareSize * 0.5,
            y + this.portionSquareSize * (num + 0.5),
            (this.portionSquareSize * this.portionSizeCoeff) / 2,
        );
        portionContainer.add(stroking);
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

    private findTopPortion(
        tube: Phaser.GameObjects.Container,
    ): Phaser.GameObjects.Sprite {
        // const allObj = tube.getAll();
        // allObj.forEach((obj) => console.log(obj.name));
        return tube.getByName("1") as Phaser.GameObjects.Sprite;
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
        const topPortion = this.findTopPortion(tube);
        if (topPortion === null) {
            console.error("topPortion is not found");
            return;
        }
        const container = tube.getByName("container") as Phaser.GameObjects.Graphics;
        // console.log(topPortion.y, " / ", container.y);
        let moveDistance = Math.abs(topPortion.y - container.y);
        moveDistance += (this.portionSquareSize * this.portionSizeCoeff) / 1.5;
        console.log(moveDistance);
        let strDistance: string;
        let moveUp = true;
        strDistance = "-=" + moveDistance.toString();
        if (this.activatedTube == tube.name) {
            moveUp = false;
            // moveDistance = Math.abs(topPortion.y);
            strDistance = "+=" + moveDistance.toString();
        }
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
        if (moveUp) this.activatedTube = tube.name;
        else this.activatedTube = "";
        // console.log(tube.name);
    }
}
