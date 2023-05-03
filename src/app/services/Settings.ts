import { isMobile } from "./Utilities";

const SETTINGS_KEY = "settings";

interface ITextureInfo {
    UiName: string;
    TextureName: string;
}

export const PORTIONS_TEXTURES: ITextureInfo[] = [
    { UiName: "Glass ball", TextureName: "glass-ball-150.png" },
    { UiName: "Golf ball", TextureName: "golf-ball-150.png" },
    { UiName: "Bubble", TextureName: "bubble-150.png" },
    { UiName: "Football", TextureName: "football-150.png" },
    { UiName: "* Random", TextureName: "" },
];
export const DEFAULT_PORTIONS_TEXTURE: ITextureInfo = PORTIONS_TEXTURES[0];

export interface ISettings {
    MoveHelperEnabled: boolean;
    TubesLabelsShown: boolean;
    Texture: string;
}

const DEFAULT_DESKTOP_SETTINGS: ISettings = {
    MoveHelperEnabled: true,
    TubesLabelsShown: true,
    Texture: DEFAULT_PORTIONS_TEXTURE.UiName,
};

const DEFAULT_MOBILE_SETTINGS: ISettings = {
    MoveHelperEnabled: true,
    TubesLabelsShown: false,
    Texture: DEFAULT_PORTIONS_TEXTURE.UiName,
};

export function saveSettings(settings: ISettings): void {
    // console.log("Saving settings: ", settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): ISettings {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    if (rawSettings) {
        const parsedSettings = JSON.parse(rawSettings);
        // validate if loaded settings object has all the required properties for ISettings
        if (Object.keys(parsedSettings).every((key) => key in DEFAULT_DESKTOP_SETTINGS)) {
            return parsedSettings;
        } else {
            console.error(
                `Invalid settings object: \"${parsedSettings}\". Using defaults`,
            );
        }
    }
    return isMobile() ? DEFAULT_MOBILE_SETTINGS : DEFAULT_DESKTOP_SETTINGS;
}
