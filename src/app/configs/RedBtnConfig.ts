import { INinePatchConfig } from "@koreez/phaser3-ninepatch";
import { ButtonStateNames } from "../enums/ButtonStateNames";
import { getColoredBtnPatchesConfig } from "./NinePatchConfig";
import { getRedBtnTextConfig } from "./TextConfig";

export const getRedBtnNinePatchConfig = (state: string, key = "red"): INinePatchConfig => {
    return {
        x: 0,
        y: 0,
        width: 100,
        height: 72,
        ...getColoredBtnPatchesConfig(key, state),
    };
};

export function getRedButtonConfig(): ButtonConfig {
    const text = getRedBtnTextConfig();
    return {
        states: {
            up: {
                bkg: getRedBtnNinePatchConfig(ButtonStateNames.Up),
                text,
            },
            down: {
                bkg: getRedBtnNinePatchConfig(ButtonStateNames.Down),
                text,
            },
            over: {
                bkg: getRedBtnNinePatchConfig(ButtonStateNames.Over),
                text,
            },
            disabled: {
                bkg: getRedBtnNinePatchConfig(ButtonStateNames.Disabled, "blue"),
                text,
            },
        },
    };
}

export function getRandomButtonConfig(): ButtonConfig {
    const text = getRedBtnTextConfig();
    return {
        states: {
            up: {
                bkg: { x: 0, y: 0, texture: "buttons", frame: "bkg.png" },
                text,
            },
            down: {
                bkg: { x: 0, y: 0, texture: "buttons", frame: "bkg.png" },
                text,
            },
            over: {
                bkg: { x: 0, y: 0, texture: "buttons", frame: "bkg.png" },
                text,
            },
        },
    };
}
