import { Tube } from "./Tube";
import * as GAME from "../configs/GameConfig";

enum WinConditions {
    CollectAll, // Classic rules: collect all colors
    CollectOne, // Collect only one color
    CollectCopy, // Collect a copy of a sealed tube
}

export class Level {
    private winCondition: WinConditions = WinConditions.CollectAll;

    private tubes: Array<Tube>;

    public setTubes(tubes: number[][]): boolean {
        if (tubes.length < GAME.MIN_TUBES || tubes.length > GAME.MAX_TUBES) {
            console.error("Invalid number of tubes: ", tubes.length);
            return false;
        }
        let aTube: Tube;
        for (let i = 0; i < tubes.length; i++) {
            aTube = new Tube();
            if (!aTube.initialize(tubes[i].length, tubes[i])) return false;
            this.tubes.push(aTube);
        }
        return true;
    }

    public setRandomTubes(tubeNum: number): void {
        const colors = tubeNum - 2;
        const fill = colors; // full tube filling
        console.log(fill);

        // generate tubes and fill all except 2
        // with portions equal in number for each color
        // use this.setTubes()
    }

    public isWin(): boolean {
        for (let i = 0; i < this.tubes.length; i++) {
            if (!this.tubes[i].isWin()) return false;
        }
        return true;
    }
}
