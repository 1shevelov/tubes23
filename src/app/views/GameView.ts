import { TubeView } from "./TubeView";
import * as GAME from "../configs/GameConfig";
import { PortionView } from "./PortionView";
import { CurrentPalette } from "../configs/UiConfig";
import { checkIfFaulty } from "../services/Utilities";
import { GameEvents, ViewEvents } from "../configs/Events";

export class GameView extends Phaser.GameObjects.Container {
    // TODO check if it needs to be public
    public isFogOfWar = false;

    // max number of tubes for each row
    private readonly HOR_ROWS = [8, 16, 24, GAME.MAX_TUBES];
    private readonly PORT_ROWS = [5, 10, 18, 28, GAME.MAX_TUBES];
    private tubeRows: number[]; // contains HOR or PORT

    private wi: number;
    private he: number;

    // private portionSquareSize: number;

    // all tubes in the scene
    private tubes: TubeView[] = [];
    private tubeCache: TubeView[] = [];
    private portionCache: PortionView[] = [];

    private readonly gameEvents: Phaser.Events.EventEmitter;

    private sourceTube: number;
    private recipientTube: number;

    public constructor(scene: Phaser.Scene, MSEventEmitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.gameEvents = MSEventEmitter;
        this.reset();
        this.init();
    }

    public reset(): void {
        this.sourceTube = GAME.ErrorValues.InvalidTubeIndex;
        this.recipientTube = GAME.ErrorValues.InvalidTubeIndex;

        if (this.tubes.length !== 0) {
            for (let i = this.tubes.length - 1; i >= 0; i--) {
                this.portionCache.push(...this.tubes[i].reset());
                this.tubeCache.push(this.tubes[i]);
            }
        }
        this.tubes = [];
    }

    public createClassicGame(tubes: object[]): void {
        // check data
        // console.log(JSON.stringify(tubes));
        const tubeNum = tubes.length;
        let maxVolume = tubes[0]["volume"];
        for (let i = 1; i < tubeNum; i++)
            if (tubes[i]["volume"] > maxVolume) maxVolume = tubes[i]["volume"];
        const portionNum = (tubes.length - 2) * maxVolume;
        this.createResources(tubeNum, portionNum);
        this.setAndPlaceTubes(tubes);
        this.fillTubes(tubes);
    }

    public switchTubesLabels(show: boolean): void {
        if (show) this.tubes.forEach((tube) => tube.showLabel());
        else this.tubes.forEach((tube) => tube.hideLabel());
    }

    public areFoggedPortionsPresent(): boolean {
        if (!this.isFogOfWar) return false;
        for (let i = 0; i < this.tubes.length; i++) {
            if (this.tubes[i].isAnyFogged()) return true;
        }
        return false;
    }

    public clearFogOnUnoColor(winPortions: number[][]): void {
        winPortions.forEach((portion) => {
            this.tubes[portion[0]].removeFogFromPortion(portion[1]);
        });
    }

    public undoMove(tubePair: number[]): void {
        // console.log("GameView move to undo: ", tubePair);
        this.recipientTube = tubePair[0];
        this.sourceTube = tubePair[1];
        this.move();
    }

    public handleClick(tubeNum: number): void {
        // console.log(`Clicked ${tubeNum}`);
        if (tubeNum + 1 > this.tubes.length) {
            console.warn(`No tube #${tubeNum + 1}`);
            return;
        }
        if (
            this.sourceTube === GAME.ErrorValues.InvalidTubeIndex &&
            !this.tubes[tubeNum].isEmpty()
        ) {
            this.sourceTube = tubeNum;
            this.tubes[this.sourceTube].activate();
            this.gameEvents.emit(GameEvents.SourceTubeChoosen, this.sourceTube);
            return;
        }
        if (this.sourceTube === tubeNum) {
            // tube clicked again - deactivate
            this.resetSource();
            return;
        }
        if (
            this.sourceTube !== GAME.ErrorValues.InvalidTubeIndex &&
            this.tubes[tubeNum].isFull()
        ) {
            // source is full - reset activated tube
            this.resetSource();
            return;
        }
        if (
            this.sourceTube !== GAME.ErrorValues.InvalidTubeIndex &&
            !this.tubes[tubeNum].isFull()
        ) {
            // try to move
            this.recipientTube = tubeNum;
            this.gameEvents.emit(
                GameEvents.TwoTubesChoosen,
                this.sourceTube,
                this.recipientTube,
            );
        }
    }

    public helperMove(recipient: number): void {
        if (this.sourceTube === GAME.ErrorValues.InvalidTubeIndex) {
            console.error(`Source tube for helper move is unknown`);
            return;
        }
        if (checkIfFaulty(recipient, 0, this.tubes.length - 1)) {
            console.error(`Recipient tube for helper move is wrong: ${recipient}`);
            return;
        }
        if (this.tubes[recipient].isFull()) {
            console.error(`Recipient tube for helper move is full`);
            return;
        }
        this.recipientTube = recipient;
        this.tubes[this.sourceTube].activate();
        setTimeout(() => {
            this.transferPortion();
        }, GAME.PORTION_READY_ANIMATION_SPEED);
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
        const tubeSizeY = this.he / (rows + 1) / 1.3;
        // console.log(`he: ${this.he}: tubeSizeY: ${tubeSizeY}`);

        let tubeXGap = 0;
        let tubeCounter = 0;
        let aTube: TubeView | undefined;
        tubesInRows.forEach((tubesInThisRow, row) => {
            tubeXGap = this.wi / (tubesInThisRow + 1);
            for (let i = 1; i <= tubesInThisRow; i++) {
                // this.drawTube(i * tubeGap, (row + 1) * rowGap + rowLower, volume);
                aTube = this.tubeCache.pop();
                if (aTube !== undefined) {
                    aTube.setNumber(tubeCounter);
                    aTube.setVolumeAndSize(tubes[tubeCounter]["volume"], tubeSizeY);
                    aTube.place(
                        i * tubeXGap,
                        ((1.12 * row + 1) * this.he) / (rows + 1) - 10, // + this.he * 0.02,
                    );
                    this.add(aTube);
                    this.tubes.push(aTube);
                }
                tubeCounter++;
            }
        });
    }

    private fillTubes(tubes: object[]): void {
        for (let i = 0; i < tubes.length; i++) {
            const portions: PortionView[] = [];
            for (let j = 0; j < tubes[i]["content"].length; j++) {
                const aPortion = this.portionCache.pop();
                if (aPortion !== undefined) {
                    aPortion.changeColor(CurrentPalette[tubes[i]["content"][j]]);
                    portions.push(aPortion);
                }
            }
            this.tubes[i].fillPortions(portions);
            if (this.isFogOfWar) {
                for (let p = 0; p < portions.length - 1; p++) portions[p].setFog();
            }
        }
    }

    private createResources(tubeNum: number, portionNum: number): void {
        let tubeView: TubeView;
        const cachedTubesNum = this.tubeCache.length;
        if (tubeNum > cachedTubesNum) {
            for (let i = 0; i < tubeNum - cachedTubesNum; i++) {
                tubeView = new TubeView(this.scene, this.gameEvents);
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

    // private addProps(): void {
    //     this.tubes.forEach((tube, index) => {
    //         tube.setName(index.toString());
    //         tube.addInteractivity();
    //     });
    //     this.scene.input.on(
    //         "gameobjectup",
    //         (
    //             _pointer: Phaser.Input.Pointer,
    //             gameObject: Phaser.GameObjects.Container,
    //             _event: any,
    //         ) => {
    //             // (gameObject as TubeView).activate();
    //             this.handleClick(parseInt(gameObject.name));
    //         },
    //     );
    // }

    private init(): void {
        this.updateWindowSize();
        this.tubeRows = this.wi > this.he ? this.HOR_ROWS : this.PORT_ROWS;

        this.scene.scale.on("resize", this.updateWindowSize, this);

        this.gameEvents.on(ViewEvents.TubeClicked, this.handleClick, this);
        this.gameEvents.on(
            ViewEvents.PortionAnimationFinished,
            (portion: PortionView) => {
                this.finishTransferPortion(portion);
            },
        );
        this.gameEvents.on(GameEvents.MoveFailed, this.resetSource, this);
        this.gameEvents.on(GameEvents.MoveSucceeded, this.move, this);
    }

    private resetSource(): void {
        this.tubes[this.sourceTube].deactivate();
        this.sourceTube = GAME.ErrorValues.InvalidTubeIndex;
    }

    private move(): void {
        if (
            this.sourceTube === GAME.ErrorValues.InvalidTubeIndex ||
            this.recipientTube === GAME.ErrorValues.InvalidTubeIndex
        ) {
            console.error(`Source or recipient tube for the move is unknown`);
            return;
        }
        this.transferPortion();
    }

    private transferPortion(): void {
        const portion = this.tubes[this.sourceTube].removeTopPortion();
        if (!portion) {
            console.error(`Was not able to draw a portion from tube#${this.sourceTube}`);
            return;
        }
        const { x, y } = this.tubes[this.recipientTube].getTopPosition();
        this.gameEvents.emit(
            ViewEvents.MoveAnimationStarted,
            GAME.PORTION_MOVE_ANIMATION_SPEED + GAME.PORTION_READY_ANIMATION_SPEED,
        );
        portion.pathAnimateTo(x, y, GAME.PORTION_MOVE_ANIMATION_SPEED, this.gameEvents);

        // wait for PortionAnimationFinished signal
    }

    private finishTransferPortion(portion: PortionView): void {
        this.tubes[this.recipientTube].addToTop(portion);
        if (this.isFogOfWar) this.tubes[this.sourceTube].removeFogFromTopPortion();
        this.resetSource();
        this.recipientTube = GAME.ErrorValues.InvalidTubeIndex;
    }

    private updateWindowSize(): void {
        const { width, height } = this.scene.scale.gameSize;
        // const halfShiftX = (width - this.wi) / 2;
        // const halfShiftY = (height - this.he) / 2;
        this.wi = width;
        this.he = height;
    }
}
