import { TubeView } from "./TubeView";
import * as GAME from "../configs/GameConfig";
// import { fixValue } from "../services/Utilities";
import { PortionView } from "./PortionView";
import { CurrentPalette } from "../configs/Colors";

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
    private tubeCache: TubeView[] = [];
    private portionCache: PortionView[] = [];

    private gameEvents: Phaser.Events.EventEmitter;

    private readonly NO_TUBE = -1;
    private sourceTube: number;
    private recipientTube: number;

    public constructor(scene: Phaser.Scene, MSEventEmitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.gameEvents = MSEventEmitter;
        this.reset();
        this.init();
    }

    public reset(): void {
        this.sourceTube = this.NO_TUBE;
        this.recipientTube = this.NO_TUBE;

        if (this.tubes.length !== 0) {
            for (let i = 0; i < this.tubes.length; i++) {
                this.portionCache.push(...this.tubes[i].empty());
                this.tubes[i].destroy();
            }
        }
        this.tubes = [];
    }

    public createClassicGame(tubes: object[]): void {
        // check data
        const tubeNum = tubes.length;
        let maxVolume = tubes[0]["volume"];
        for (let i = 1; i < tubeNum; i++)
            if (tubes[i]["volume"] > maxVolume) maxVolume = tubes[i]["volume"];
        const portionNum = (tubes.length - 2) * maxVolume;
        this.createResources(tubeNum, portionNum);

        this.setAndPlaceTubes(tubes);
        this.fillTubes(tubes);
    }

    private setAndPlaceTubes(tubes: object[]): void {
        // deciding how many rows are needed
        let rows = this.tubeRows.length;
        let i = this.tubeRows.length - 2;
        while (tubes.length < this.tubeRows[i]) {
            rows = i + 1;
            i--;
        }
        const unevenTubes = tubes.length % rows;
        const tubesInRows = Array(rows).fill((tubes.length - unevenTubes) / rows);
        for (let i = 1; i <= unevenTubes; i++) {
            tubesInRows[i - 1]++;
        }
        // console.log(tubesInRows);
        const tubeSizeY = this.he / (rows + 1) / 1.5;
        // console.log(`he: ${this.he}: tubeSizeY: ${tubeSizeY}`);

        let tubeGap = 0;
        let tubeCounter = 0;
        let aTube: TubeView | undefined;
        tubesInRows.forEach((tubesInThisRow, row) => {
            tubeGap = this.wi / (tubesInThisRow + 1);
            for (let i = 1; i <= tubesInThisRow; i++) {
                // this.drawTube(i * tubeGap, (row + 1) * rowGap + rowLower, volume);
                aTube = this.tubeCache.pop();
                if (aTube !== undefined) {
                    aTube.setVolumeAndSize(tubes[tubeCounter]["volume"], tubeSizeY);
                    aTube.place(
                        i * tubeGap,
                        ((1.15 * row + 1) * this.he) / (rows + 1) + this.he * 0.02,
                    );
                    this.add(aTube);
                    this.tubes.push(aTube);
                }
                tubeCounter++;
            }
        });
        this.addProps();
    }

    private fillTubes(tubes: object[]): void {
        tubes.forEach((tube, tubeIndex) => {
            const portions: PortionView[] = [];
            for (let i = 0; i < tube["volume"]; i++) {
                const aPortion = this.portionCache.pop();
                if (aPortion !== undefined) {
                    aPortion.changeColor(CurrentPalette[tube["content"][i]]);
                    portions.push(aPortion);
                }
            }
            this.tubes[tubeIndex].fillPortions(portions);
        });
    }

    private createResources(tubeNum: number, portionNum: number): void {
        let tubeView: TubeView;
        const cachedTubesNum = this.tubeCache.length;
        if (tubeNum > cachedTubesNum) {
            for (let i = 0; i < tubeNum - cachedTubesNum; i++) {
                tubeView = new TubeView(this.scene);
                this.tubeCache.push(tubeView);
            }
        }
        let portionView: PortionView;
        const cachedPortionsNum = this.portionCache.length;
        if (portionNum > cachedPortionsNum) {
            for (let i = 0; i < portionNum - cachedPortionsNum; i++) {
                portionView = new PortionView(this.scene);
                this.portionCache.push(portionView);
            }
        }
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
        // console.log(`Clicked ${tubeNum}`);
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
        const portion = this.tubes[this.sourceTube].removeTopPortion();
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
