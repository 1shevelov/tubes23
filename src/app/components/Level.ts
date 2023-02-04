import { Tube } from "./Tube";
import * as GAME from "../configs/GameConfig";
import { fixValue } from "../services/Utilities";

enum WinConditions {
    CollectAll, // Classic rules: collect all colors
    CollectOne, // Collect only one color
    CollectCopy, // Collect a copy of a sealed tube
}

export class Level {
    private winCondition: WinConditions = WinConditions.CollectAll;

    private tubes: Tube[] = [];

    private startingTubes: Tube[] = [];

    private gameEvents: Phaser.Events.EventEmitter;

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

    public setClassicTubes(tubes: number[][], tubeVol: number): boolean {
        if (tubes.length < GAME.MIN_TUBES || tubes.length > GAME.MAX_TUBES) {
            console.error("Invalid number of tubes: ", tubes.length);
            return false;
        }
        let aTube: Tube;
        for (let i = 0; i < tubes.length; i++) {
            aTube = new Tube();
            if (!aTube.initialize(tubeVol, tubes[i])) return false;
            this.tubes.push(aTube);
        }
        this.tubes.forEach((tube) => this.startingTubes.push(tube));
        return true;
    }

    // fills tubeNum-2 tubes randomly with tubeNum-2 colors
    public setRandomClassicLevel(tubeNum: number, tubeVol: number): void {
        tubeNum = fixValue(tubeNum, GAME.MIN_TUBES, GAME.MAX_TUBES);
        tubeNum = fixValue(tubeNum, GAME.MIN_TUBES, GAME.MAX_COLORS + 2);
        tubeVol = fixValue(tubeVol, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
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
            randColorIndex = Math.floor(Math.random() * allColors.length);
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
                portionColorIndex = Math.floor(Math.random() * colors2Place.length);
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
        this.setClassicTubes(randTubes, tubeVol);
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
                colors[i] !== GAME.ErrorValues.InvalidColor
            )
                return false;
        }
        return true;
    }

    public tryToMove(source: number, recipient: number): boolean {
        if (!this.tubes[source].canDrain()) {
            console.error("Can't drain from tube #", source);
            this.gameEvents.emit(GAME.EventMoveFailed);
            return false;
        }
        if (!this.tubes[recipient].canAdd()) {
            console.error("Can't add to tube #", recipient);
            this.gameEvents.emit(GAME.EventMoveFailed);
            return false;
        }
        const isSuccess = this.tubes[recipient].tryToAdd(
            this.tubes[source].getDrainColor(),
        );
        if (isSuccess) {
            this.tubes[source].drain();
            this.gameEvents.emit(GAME.EventMoveSucceeded);
            console.log(`Moved from ${source} to ${recipient}`);
            return true;
        } else {
            this.gameEvents.emit(GAME.EventMoveFailed);
            return false;
        }
    }

    // restore starting state
    public reset(): void {
        this.tubes = [];
        this.startingTubes.forEach((tube) => this.tubes.push(tube));
    }

    private init(): void {
        // this.gameEvents.on(GAME.EventTubesClicked, this.tryToMove, this);
    }
}
