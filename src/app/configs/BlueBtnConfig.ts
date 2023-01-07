import { INinePatchConfig } from "@koreez/phaser3-ninepatch";
import { getColoredBtnPatchesConfig } from "./NinePatchConfig";
import { getBlueBtnTextConfig } from "./TextConfig";

export const getBlueBtnNinePatchConfig = (state: string): INinePatchConfig => {
    return {
        x: 0,
        y: 0,
        width: 400,
        height: 205,
        ...getColoredBtnPatchesConfig("blue", state),
    };
};

export function getBlueButtonConfig(): ButtonConfig {
    const enabledText = getBlueBtnTextConfig(true);
    const disabledText = getBlueBtnTextConfig(false);
    return {
        states: {
            up: {
                bkg: getBlueBtnNinePatchConfig("up"),
                text: enabledText,
            },
            over: {
                bkg: getBlueBtnNinePatchConfig("over"),
                text: enabledText,
            },
            down: {
                bkg: getBlueBtnNinePatchConfig("down"),
                text: enabledText,
            },
            disabled: {
                bkg: getBlueBtnNinePatchConfig("disabled"),
                text: disabledText,
            },
        },
    };
}
