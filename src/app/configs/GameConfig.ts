import { CurrentPalette } from "./Colors";

export const MIN_TUBES = 2;
export const MAX_TUBES = 40;
export const MIN_VOLUME = 1;
export const MAX_VOLUME = 16;

export const MAX_COLORS = CurrentPalette.length;

export enum ErrorValues {
    InvalidColor = -1,
}

export const EventTubesClicked = "TubesClicked"; // GV -> Level, 2 numbers: source and recepient tube nums
export const EventMoveFailed = "MoveFailed"; // Level -> GV
export const EventMoveSucceeded = "MoveSucceeded"; // Level -> GV & MS
