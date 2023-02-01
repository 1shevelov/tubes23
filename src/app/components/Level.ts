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
        return true;
    }

    // fills tubeNum-2 tubes randomly with tubeNum-2 colors
    public setRandomTubes(tubeNum: number, tubeVol: number): void {
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

    public isWin(): boolean {
        for (let i = 0; i < this.tubes.length; i++) {
            if (!this.tubes[i].isWin()) return false;
        }
        return true;
    }

    private init(): void {
        this.gameEvents.on(GAME.EventTubesClicked, this.tryToMove, this);
    }

    private tryToMove(source: number, recepient: number): void {
        if (!this.tubes[source].canDrain()) {
            console.error("Can't drain from tube #", source);
            this.gameEvents.emit(GAME.EventMoveFailed);
            return;
        }
        if (!this.tubes[recepient].canAdd()) {
            console.error("Can't add to tube #", recepient);
            this.gameEvents.emit(GAME.EventMoveFailed);
            return;
        }
        const isSuccess = this.tubes[recepient].tryToAdd(
            this.tubes[source].getDrainColor(),
        );
        if (isSuccess) {
            this.tubes[source].drain();
            this.gameEvents.emit(GAME.EventMoveSucceeded);
            console.log(`Moved from ${source} to ${recepient}`);
        } else this.gameEvents.emit(GAME.EventMoveFailed);
    }
}
