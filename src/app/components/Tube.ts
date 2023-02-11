import * as GAME from "../configs/GameConfig";
import { fixValue, checkIfFaulty } from "../services/Utilities";

// TODO: separate these enums to allow setting them in Level
enum Drains {
    Neck, // add and drain, FILO
    Both, // add and drain, FIFO, add to top, drain from bottom
    Bottom, // drain only
    None, // can't add or drain, just compare content
}

enum ColorRules {
    Classic, // any color, added color matches topmost (last)
    OneOnly, // accepts only one specific color, even in set content
    AnyColorFree, // any color, free order (no match color rule)
    ExcludeColor, // any color, except set one, color match last
}

export class Tube {
    public rule = ColorRules.Classic;
    public drains: Drains = Drains.None;
    private _volume = GAME.MIN_VOLUME;
    private _content: number[] = []; // element 0 is always at the bottom

    public initialize(
        vol: number,
        cont: number[],
        drains: Drains = Drains.Neck,
        rule: ColorRules = ColorRules.Classic,
    ): boolean {
        this.volume = vol;
        this.content = cont;
        if (this._content.length === cont.length) {
            for (let i = 0; i < this._content.length; i++) {
                if (this._content[i] !== cont[i]) {
                    console.error(`Invalid tube content: ${cont}`);
                    return false;
                }
            }
        }
        this.drains = drains;
        if (rule !== ColorRules.Classic) {
            console.warn("Only Classic color rule is currently implemented. Ignoring");
            this.rule = ColorRules.Classic;
        }
        this.rule = rule;
        return true;
    }

    public get volume(): number {
        return this._volume;
    }

    public set volume(newVolume) {
        newVolume = fixValue(newVolume, GAME.MIN_VOLUME, GAME.MAX_VOLUME);
        if (newVolume < this._content.length) {
            console.error(
                `Trying to set tube volume as ${newVolume}, while currently tube contains ${this._content.length} portions. Aborting`,
            );
        } else {
            this._volume = newVolume;
        }
    }

    public get content(): number[] {
        return this._content;
    }

    public set content(newContent) {
        if (newContent.length > GAME.MAX_VOLUME) {
            console.error(
                `Trying to fill tube with ${newContent.length} portions, while max allowed is ${GAME.MAX_VOLUME}. Aborting`,
            );
        }
        if (newContent.length > this._volume) {
            console.error(
                `Trying to fill tube with ${newContent.length} portions, while its volume (${this._volume}) is smaller. Aborting`,
            );
        }
        if (
            newContent.find((val) => checkIfFaulty(val, 0, GAME.MAX_COLORS - 1)) ===
            undefined
        ) {
            this._content = [...newContent];
        }
        // if (this._content.length > this.volume) {
        //     this._volume = this._content.length;
        // }
    }

    public tryToAdd(portion: number): boolean {
        if (checkIfFaulty(portion, 0, GAME.MAX_COLORS - 1)) {
            console.error(`Trying to add invalid color: ${portion}. Aborting`);
            return false;
        }
        if (!this.canAdd()) {
            console.error("This tube can't accept a portion");
            return false;
        }
        if (this._content.length !== 0 && this._content.at(-1) !== portion) {
            return false;
        }

        this._content.push(portion);
        return true;
    }

    public drain(): void {
        if (!this.canDrain()) {
            console.error("This tube can't return a portion");
            return;
        }
        if (this.drains === Drains.Neck) {
            this._content.pop();
        } else {
            this._content.shift();
        }
    }

    public canAdd(): boolean {
        if (this.drains === Drains.None || this.drains === Drains.Bottom) return false;
        if (this._volume <= this._content.length) return false;
        return true;
    }

    public canDrain(): boolean {
        if (this.drains === Drains.None) return false;
        if (this._content.length === 0) return false;
        return true;
    }

    public getDrainColor(): number {
        if (!this.canDrain()) {
            // console.error("This tube can't return a portion");
            return GAME.ErrorValues.InvalidColorIndex;
        }
        if (this.drains === Drains.Neck) {
            return this._content.at(-1) as number;
        } else {
            return this._content[0] as number;
        }
    }

    // the level is won if every tube is empty or have only one color
    // is used to determine the best option for helper move
    public isWon(): boolean {
        if (this._content.length === 0) return true;
        const firstColor = this._content[0];
        for (let i = 0; i < this._content.length; i++) {
            if (firstColor !== this._content[i]) return false;
        }
        return true;
    }

    public getTube(): object {
        return {
            volume: this.volume,
            content: this.content,
            drains: this.drains,
        };
    }
}
