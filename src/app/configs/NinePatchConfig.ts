import { AssetPatchesConfig } from "../interfaces/AssetPatchConfig";

export const ButtonCallback = {
    // ButtonCallback must correspond to the Area. Circle -> ButtonCallback.Circle
    Rectangle: Phaser.Geom.Rectangle.Contains,
    Circle: Phaser.Geom.Circle.Contains,
    Ellipse: Phaser.Geom.Ellipse.Contains,
    Triangle: Phaser.Geom.Triangle.Contains,
    Polygon: Phaser.Geom.Polygon.Contains,
};

export const getSellBtnPatchesConfig = (state: string): AssetPatchesConfig => {
    return {
        key: "buttons",
        frame: `sell/${state}.png`,
        patchesConfig: {
            top: 69,
            bottom: 69,
            left: 69,
            right: 69,
        },
    };
};

export const getColoredBtnPatchesConfig = (color: string, state: string): AssetPatchesConfig => {
    return {
        key: "buttons",
        frame: `${color}/${state}.png`,
        patchesConfig: {
            top: 24,
            bottom: 24,
            left: 15,
            right: 15,
        },
    };
};
