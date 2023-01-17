import { TubeView } from "./TubeView";
import * as GAME from "../configs/GameConfig";
import { fixValue } from "../services/Utilities";

export class GameView extends Phaser.GameObjects.Container {
    // max number of tubes for each row
    private readonly HOR_ROWS = [5, 16, 24, GAME.MAX_TUBES];
    private readonly PORT_ROWS = [4, 10, 18, 28, GAME.MAX_TUBES];
    private tubeRows: Array<number>; // contains HOR or PORT

    private wi: number;
    private he: number;

    private portionSquareSize: number;

    // all tubes in the scene
    private tubes: Array<TubeView> = [];
    private activatedTube = "";

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
        num = fixValue(num, GAME.MIN_TUBES, GAME.MAX_TUBES);
        volume = fixValue(volume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);

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
        let tube: TubeView;
        tubesInRows.forEach((tubesInThisRow, row) => {
            tubeGap = this.wi / (tubesInThisRow + 1);
            for (let i = 1; i <= tubesInThisRow; i++) {
                // this.drawTube(i * tubeGap, (row + 1) * rowGap + rowLower, volume);
                tube = new TubeView(this.scene, volume);
                tube.draw(
                    i * tubeGap,
                    (row + 1) * rowGap + rowLower,
                    this.portionSquareSize,
                );
                tube.randomFill(volume - 1);
                this.add(tube);
                // this.scene.add.existing(tube);
                this.tubes.push(tube);
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
                // this.handleTubeClick(gameObject);
                (gameObject as TubeView).handleClick();
            },
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
}
