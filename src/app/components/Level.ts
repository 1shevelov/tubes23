import { Tube } from "./Tube";
import * as GAME from "../configs/GameConfig";
import { fixValue } from "../services/Utilities";
import { GameEvents } from "../configs/Events";

enum WinConditions {
    CollectAll, // Classic rules: collect all colors
    CollectOne, // Collect only one color
    CollectCopy, // Collect a copy of a sealed tube
}

export class Level {
    private winCondition: WinConditions = WinConditions.CollectAll;

    private tubes: Tube[] = [];

    private startingTubesContent: number[][] = [];

    private gameEvents: Phaser.Events.EventEmitter;

    private moves: number[][] = [];

    public constructor(MSEventEmitter: Phaser.Events.EventEmitter) {
        this.gameEvents = MSEventEmitter;
        this.init();
    }

    public getTubes(): object[] {
        const tubes: object[] = [];
        this.tubes.forEach((tube) => {
            tubes.push(tube.getTube());
        });
        return tubes;
    }

    public addEmptyTube(): boolean {
        if (this.tubes.length >= GAME.MAX_TUBES) {
            console.error("Max number of tubes reached. Cannot add more");
            return false;
        }
        const aTube = new Tube();
        if (!aTube.initialize(this.tubes[0].volume, [], this.tubes[0].drains))
            return false;
        this.tubes.push(aTube);
        return true;
    }

    public removeEmptyTube(): boolean {
        if (this.tubes.length <= GAME.MIN_TUBES) {
            console.error("Min number of tubes reached. Cannot remove more");
            return false;
        }
        // search for empty tubes from the end of this.tubes
        // remove the first found
        // or return false if not found
        return true;
    }

    public setClassicTubes(tubes: number[][], tubeVol: number, drains: number): boolean {
        if (tubes.length < GAME.MIN_TUBES || tubes.length > GAME.MAX_TUBES) {
            console.error("Invalid number of tubes: ", tubes.length);
            return false;
        }
        let aTube: Tube;
        for (let i = 0; i < tubes.length; i++) {
            aTube = new Tube();
            if (!aTube.initialize(tubeVol, tubes[i], drains)) return false;
            this.tubes.push(aTube);
        }
        this.tubes.forEach((tube) => this.startingTubesContent.push([...tube.content]));
        // console.log(JSON.stringify(this.startingTubesContent));
        return true;
    }

    // fully fills tubeNum-2 tubes randomly with tubeNum-2 colors
    public setRandomClassicLevel(
        tubeNum: number,
        tubeVol: number,
        drains: number, // TODO: exchange for enum Drains
        rng: () => number, // preseeded RNG
    ): void {
        tubeNum = fixValue(tubeNum, GAME.MIN_TUBES, GAME.MAX_TUBES);
        tubeNum = fixValue(tubeNum, GAME.MIN_TUBES, GAME.MAX_COLORS + 2);
        tubeVol = fixValue(tubeVol, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
        // TODO: checkIfFaulty(drains) in enum Drains
        const colors = tubeNum - 2;
        const fillSize = tubeVol; // can be lower

        const allColors: number[] = [];
        for (let i = 0; i < GAME.MAX_COLORS; i++) allColors.push(i);
        const colors2Place: {
            color: number;
            number: number;
        }[] = [];

        let randColorIndex: number;
        for (let i = 0; i < colors; i++) {
            randColorIndex = Math.floor(rng() * allColors.length);
            colors2Place.push({ color: allColors[randColorIndex], number: fillSize });
            allColors.splice(randColorIndex, 1);
        }
        // console.log(JSON.stringify(colors2Place));
        const randTubes: number[][] = [];
        let randTube: number[];
        let portionColorIndex: number;
        for (let i = 0; i < colors; i++) {
            randTube = [];
            for (let j = 0; j < fillSize; j++) {
                portionColorIndex = Math.floor(rng() * colors2Place.length);
                colors2Place[portionColorIndex].number--;
                randTube.push(colors2Place[portionColorIndex].color);
                if (colors2Place[portionColorIndex].number === 0)
                    colors2Place.splice(portionColorIndex, 1);
            }
            randTubes.push(randTube);
        }
        for (let i = 0; i < tubeNum - colors; i++) {
            randTubes.push([]);
        }
        // console.log(JSON.stringify(randTubes));
        this.setClassicTubes(randTubes, tubeVol, drains);
    }

    // true if
    // each tube contains portions of one color
    // and no two tubes contain the same color, e.g. each color is in it's own container
    public isWonClassic(): boolean {
        const colors: number[] = [];
        for (let i = 0; i < this.tubes.length; i++) {
            if (!this.tubes[i].isWon()) return false;
            colors.push(this.tubes[i].getDrainColor());
        }
        colors.sort();
        // console.log(colors);
        for (let i = 0; i < colors.length; i++) {
            if (
                colors[i] === colors[i + 1] &&
                colors[i] !== GAME.ErrorValues.InvalidColorIndex
            )
                return false;
        }
        return true;
    }

    // true if
    // all winColor portions are in one container
    // and no other colors is in this container
    public isWonOneColor(winColor: number): boolean {
        let tubeWithWinColor: number = GAME.ErrorValues.InvalidTubeIndex;
        let tubeContent: number[];
        for (let i = 0; i < this.tubes.length; i++) {
            tubeContent = this.tubes[i].content;
            for (let j = 0; j < tubeContent.length; j++) {
                if (tubeContent[j] === winColor) {
                    if (tubeWithWinColor === GAME.ErrorValues.InvalidTubeIndex)
                        tubeWithWinColor = i;
                    else if (tubeWithWinColor !== i) return false;
                }
            }
        }
        tubeContent = this.tubes[tubeWithWinColor].content;
        for (let i = 0; i < tubeContent.length; i++) {
            if (tubeContent[i] !== winColor) return false;
        }
        return true;
    }

    // should find only one target tube for the portion
    // or return -1
    public tryToHelperMove(sourceTubeIndex: number): number {
        // TODO: check number
        if (!this.tubes[sourceTubeIndex].canDrain()) {
            console.error("Can't drain from tube #", sourceTubeIndex);
            this.gameEvents.emit(GameEvents.MoveFailed);
            return GAME.ErrorValues.InvalidTubeIndex;
        }
        // sort through all the tubes and make an array of all that can add this color
        const targetTubesIndices: number[] = [];
        let targetColor: number;
        for (let i = 0; i < this.tubes.length; i++) {
            if (i === sourceTubeIndex) continue;
            if (this.tubes[i].canAdd()) {
                targetColor = this.tubes[i].getDrainColor();
                if (
                    targetColor === GAME.ErrorValues.InvalidColorIndex ||
                    targetColor === this.tubes[sourceTubeIndex].getDrainColor()
                )
                    targetTubesIndices.push(i);
            }
        }
        // console.log(targetTubesIndices);
        if (targetTubesIndices.length === 0) return GAME.ErrorValues.InvalidTubeIndex;
        // if array.length = 1 send this number
        let recipientTubeIndex = GAME.ErrorValues.InvalidTubeIndex;
        if (targetTubesIndices.length === 1) recipientTubeIndex = targetTubesIndices[0];
        // if array.length > 1
        else {
            // if there is a recepient tube with only source color then return it
            for (let i = 0; i < targetTubesIndices.length; i++) {
                if (
                    this.tubes[targetTubesIndices[i]].getDrainColor() ===
                        this.tubes[sourceTubeIndex].getDrainColor() &&
                    this.tubes[targetTubesIndices[i]].isWon()
                )
                    recipientTubeIndex = targetTubesIndices[i];
            }
            // if all tubes are empty then send number of the first one
            if (recipientTubeIndex === GAME.ErrorValues.InvalidTubeIndex) {
                for (let i = 0; i < targetTubesIndices.length; i++) {
                    if (
                        this.tubes[targetTubesIndices[i]].getDrainColor() !==
                        GAME.ErrorValues.InvalidColorIndex
                    )
                        return GAME.ErrorValues.InvalidTubeIndex;
                }
                recipientTubeIndex = targetTubesIndices[0];
            }
            // TODO: rename all "recepeints"
        }
        const isAddingSuccessful = this.tubes[recipientTubeIndex].tryToAdd(
            this.tubes[sourceTubeIndex].getDrainColor(),
        );
        if (isAddingSuccessful) {
            this.tubes[sourceTubeIndex].drain();
            this.moves.push([sourceTubeIndex, recipientTubeIndex]);
            // console.log(`Moved from ${sourceTubeIndex} to ${recipientTubeIndex}`);
            return recipientTubeIndex;
        } else return GAME.ErrorValues.InvalidTubeIndex;
    }

    public tryToMove(sourceTubeIndex: number, recipientTubeIndex: number): boolean {
        if (!this.tubes[sourceTubeIndex].canDrain()) {
            console.error("Can't drain from tube #", sourceTubeIndex);
            this.gameEvents.emit(GameEvents.MoveFailed);
            return false;
        }
        if (!this.tubes[recipientTubeIndex].canAdd()) {
            console.error("Can't add to tube #", recipientTubeIndex);
            this.gameEvents.emit(GameEvents.MoveFailed);
            return false;
        }
        const isSuccess = this.tubes[recipientTubeIndex].tryToAdd(
            this.tubes[sourceTubeIndex].getDrainColor(),
        );
        if (isSuccess) {
            this.tubes[sourceTubeIndex].drain();
            this.moves.push([sourceTubeIndex, recipientTubeIndex]);
            this.gameEvents.emit(GameEvents.MoveSucceeded);
            // console.log(`Moved from ${source} to ${recipient}`);
            return true;
        } else {
            this.gameEvents.emit(GameEvents.MoveFailed);
            return false;
        }
    }

    // restore starting state
    public reset(): void {
        // this.tubes = [];
        // console.log("tubes BEFORE:" + JSON.stringify(this.tubes));
        this.startingTubesContent.forEach((startingContent, i) => {
            this.tubes[i].content = [...startingContent];
        });
        this.moves = [];
        // console.log("tubes AFTER:" + JSON.stringify(this.tubes));
    }

    public undoMove(): number[] {
        if (this.moves.length === 0) {
            console.error("No moves to undo");
            return [];
        }
        const lastMove = this.moves.pop();
        if (lastMove === undefined) return []; // TS "lastMove is possibly undefined" linter error handling

        // TODO: if Drains === 1 (faucet) I need to get top color -> getLastAddedColor()
        // AND not drain(), but removeLastAddedColor()
        const portionColor = this.tubes[lastMove[1]].getDrainColor();
        // console.log("Source tube before undo: ", this.tubes[lastMove[0]].content);
        this.tubes[lastMove[0]].content.push(portionColor);
        // console.log("Source tube after undo: ", this.tubes[lastMove[0]].content);
        this.tubes[lastMove[1]].drain();
        return lastMove;
    }

    private init(): void {
        // this.gameEvents.on(GAME.EventTubesClicked, this.tryToMove, this);
    }
}
