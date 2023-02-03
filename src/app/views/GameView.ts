import { TubeView } from "./TubeView";
import * as GAME from "../configs/GameConfig";
// import { fixValue } from "../services/Utilities";
// import { PortionView } from "./PortionView";

export class GameView extends Phaser.GameObjects.Container {
    // max number of tubes for each row
    private readonly HOR_ROWS = [5, 16, 24, GAME.MAX_TUBES];
    private readonly PORT_ROWS = [4, 10, 18, 28, GAME.MAX_TUBES];
    private tubeRows: number[]; // contains HOR or PORT

    private wi: number;
    private he: number;

    // private portionSquareSize: number;

    // all tubes in the scene
    private tubes: TubeView[] = [];

    private gameEvents: Phaser.Events.EventEmitter;

    private readonly NO_TUBE = -1;
    private sourceTube = this.NO_TUBE;
    private recipientTube = this.NO_TUBE;

    public constructor(scene: Phaser.Scene, MSEventEmitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.gameEvents = MSEventEmitter;
        this.init();
        // this.drawTubes(13, 5);
    }

    // public drawRandomGenTubes(num: number, volume: number): void {
    //     num = fixValue(num, GAME.MIN_TUBES, GAME.MAX_TUBES);
    //     volume = fixValue(volume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);

    //     // deciding how many rows are needed
    //     let rows = this.tubeRows.length;
    //     let i = this.tubeRows.length - 2;
    //     while (num < this.tubeRows[i]) {
    //         rows = i + 1;
    //         i--;
    //     }
    //     const unevenTubes = num % rows;
    //     const tubesInRows = Array(rows).fill((num - unevenTubes) / rows);
    //     for (let i = 1; i <= unevenTubes; i++) {
    //         tubesInRows[i - 1]++;
    //     }
    //     // console.log(tubesInRows);
    //     const rowGap = this.he / (rows + 1);
    //     this.portionSquareSize = rowGap / (volume + 1.6);

    //     let tubeGap = 0;
    //     const rowLower = this.he * 0.05; // shift rows a bit lower
    //     let tube: TubeView;
    //     tubesInRows.forEach((tubesInThisRow, row) => {
    //         tubeGap = this.wi / (tubesInThisRow + 1);
    //         for (let i = 1; i <= tubesInThisRow; i++) {
    //             // this.drawTube(i * tubeGap, (row + 1) * rowGap + rowLower, volume);
    //             tube = new TubeView(this.scene, volume);
    //             tube.draw(
    //                 i * tubeGap,
    //                 (row + 1) * rowGap + rowLower,
    //                 this.portionSquareSize,
    //             );
    //             Math.random() < 0.5
    //                 ? tube.randomFill(volume - 1)
    //                 : tube.randomFill(volume - 2);
    //             this.add(tube);
    //             // this.scene.add.existing(tube);
    //             this.tubes.push(tube);
    //         }
    //     });
    //     this.addProps();
    // }

    public drawClassicTubes(tubes: object[]): void {
        // check data
        const tubeNum = tubes.length;
        let maxVolume = tubes[0]["volume"];
        for (let i = 1; i < tubeNum; i++)
            if (tubes[i]["volume"] > maxVolume) maxVolume = tubes[i]["volume"];

        // deciding how many rows are needed
        let rows = this.tubeRows.length;
        let i = this.tubeRows.length - 2;
        while (tubeNum < this.tubeRows[i]) {
            rows = i + 1;
            i--;
        }
        const unevenTubes = tubeNum % rows;
        const tubesInRows = Array(rows).fill((tubes.length - unevenTubes) / rows);
        for (let i = 1; i <= unevenTubes; i++) {
            tubesInRows[i - 1]++;
        }
        // console.log(tubesInRows);
        const tubeSizeY = this.he / (rows + 1);
        // this.portionSquareSize = rowGap / (maxVolume + 1.6);

        let tubeGap = 0;
        let tubeView: TubeView;
        let tubeCounter = 0;
        tubesInRows.forEach((tubesInThisRow, row) => {
            tubeGap = this.wi / (tubesInThisRow + 1);
            for (let i = 1; i <= tubesInThisRow; i++) {
                // this.drawTube(i * tubeGap, (row + 1) * rowGap + rowLower, volume);
                tubeView = new TubeView(
                    this.scene,
                    tubes[tubeCounter]["volume"],
                    i * tubeGap,
                    ((1.15 * row + 1) * this.he) / (rows + 1) + this.he * 0.02,
                    tubeSizeY,
                );
                // console.log(
                //     `${this.he} / ${rows} / ${((row + 1) * this.he) / (rows + 1)}`,
                // );
                // tubeView.draw(
                //     i * tubeGap,
                //     (row + 1) * rowGap + rowLower,
                //     this.portionSquareSize,
                // );
                tubeView.fillContent(tubes[tubeCounter]["content"]);
                this.add(tubeView);
                this.tubes.push(tubeView);
                tubeCounter++;
            }
        });
        this.addProps();
    }

    private addProps(): void {
        this.tubes.forEach((tube, index) => {
            tube.setName(index.toString());
        });
        this.scene.input.on(
            "gameobjectup",
            (
                _pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Container,
                _event: any,
            ) => {
                // (gameObject as TubeView).activate();
                this.handleClick(parseInt(gameObject.name));
            },
        );
    }

    private handleClick(tubeNum: number): void {
        console.log(`Clicked ${tubeNum}`);
        if (this.sourceTube === this.NO_TUBE && !this.tubes[tubeNum].isEmpty()) {
            this.sourceTube = tubeNum;
            this.tubes[this.sourceTube].activate();
            return;
        }
        if (this.sourceTube === tubeNum) {
            // tube clicked again - deactivate
            this.resetSource();
            return;
        }
        if (this.sourceTube !== this.NO_TUBE && this.tubes[tubeNum].isFull()) {
            // source is full - reset activated tube
            this.resetSource();
            return;
        }
        if (this.sourceTube !== this.NO_TUBE && !this.tubes[tubeNum].isFull()) {
            // try to move
            this.recipientTube = tubeNum;
            this.gameEvents.emit(
                GAME.EventTubesClicked,
                this.sourceTube,
                this.recipientTube,
            );
        }
    }

    private init(): void {
        this.resize();
        this.tubeRows = this.wi > this.he ? this.HOR_ROWS : this.PORT_ROWS;

        this.scene.scale.on("resize", this.resize, this);
        this.gameEvents.on(GAME.EventMoveFailed, this.resetSource, this);
        this.gameEvents.on(GAME.EventMoveSucceeded, this.move, this);
    }

    private resetSource(): void {
        this.tubes[this.sourceTube].deactivate();
        this.sourceTube = this.NO_TUBE;
    }

    private move(): void {
        if (this.sourceTube === this.NO_TUBE || this.recipientTube === this.NO_TUBE) {
            console.error(`Source or recipient tube is unknown`);
            return;
        }
        const portion = this.tubes[this.sourceTube].drawTop();
        if (!portion) {
            console.error(`Was not able to draw a portion from tube#${this.sourceTube}`);
            return;
        }
        const { x, y } = this.tubes[this.recipientTube].getTopPosition();
        // portion.animateTo(x, y, 200);
        portion.changeXPos(x);
        portion.changeYPos(y);
        this.tubes[this.recipientTube].addToTop(portion);
        this.resetSource();
        this.recipientTube = this.NO_TUBE;
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
}
