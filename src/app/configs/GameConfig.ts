import { CurrentPalette } from "./UiConfig";

export const MIN_TUBES = 2;
export const MAX_TUBES = 40;
export const MIN_VOLUME = 1;
export const MAX_VOLUME = 16;

export const MAX_COLORS = CurrentPalette.length;

export enum ErrorValues {
    InvalidTubeIndex = -1,
    InvalidTubeVolume = -1,
    InvalidColorIndex = -1,
}

// move helper enabled
export const HELPER_ENABLED = true;

// show tube labels for hotkeys
export const SHOW_TUBE_HOTKEY = true;

// save randomly generated classic level without actual tube content
export const SAVE_WITH_RANDOM_SEED = true;

export const PORTION_MOVE_ANIMATION_SPEED = 250; // between tubes
export const PORTION_READY_ANIMATION_SPEED = 80; // to&from top position in tube

export const BUILD_VER = "0.0401.14";
