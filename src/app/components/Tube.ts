import * as GAME from "../configs/GameConfig";
import { fixValue, checkIfFaulty } from "../services/Utilities";

enum Drains {
    Neck, // FILO
    Bottom, // only out
    Both, //top in, bottom out
}

export class Tube {
    public drains: Drains;
    private _volume = GAME.MIN_VOLUME;
    private _content: Array<number> = [];

    public get volume(): number {
        return this._volume;
    }

    public set volume(newVolume) {
        newVolume = fixValue(newVolume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
        if (newVolume < this._content.length) {
            console.error(
                `Trying to set tube volume as ${newVolume}, while currently tube contains ${this._content.length} portions. Aborting.`,
            );
        } else {
            this._volume = newVolume;
        }
    }

    public get content(): Array<number> {
        return this._content;
    }

    public set content(newContent) {
        if (newContent.length > GAME.MAX_VOLUME) {
            console.error(
                `Trying to fill tube with ${newContent.length} portions, while max allowed is ${GAME.MAX_VOLUME}. Aborting.`,
            );
        }
        if (
            newContent.find((val) => checkIfFaulty(val, 0, GAME.MAX_COLORS - 1)) ===
            undefined
        ) {
            this._content = [...newContent];
        }
        if (this._content.length > this.volume) {
            this._volume = this._content.length;
        }
    }
}
