/// <reference path="../../node_modules/phaser/types/SpineGameObject.d.ts" />
/// <reference path="../../node_modules/phaser/types/SpinePlugin.d.ts" />

declare interface Window {
    SpinePlugin: SpinePlugin;
}

type AssetNameAndPath = {
    name: string;
    path: string;
};

type SpineFiles = {
    key: string;
    jsonURL: string;
    atlasURL: string;
    preMultipliedAlpha?: boolean;
};

type SpriteConfig = {
    x: number;
    y: number;
    texture: string | Phaser.Textures.Texture;
    frame?: string | number | undefined;
    scaleX?: number;
    scaleY?: number;
};

type StateConfig = {
    bkg: INinePatchConfig | SpriteConfig;
    tint?: number;
    text?: TextConfig;
    icon?: SpriteConfig;
};

type ButtonStates = {
    up: StateConfig;
    over?: StateConfig;
    down?: StateConfig;
    disabled?: StateConfig;
};

type ButtonConfig = {
    states: ButtonStates;
    hitArea?: ButtonHitAreaConfig;
};

type ButtonHitAreaConfig = {
    area: any;
    callback: any;
};
