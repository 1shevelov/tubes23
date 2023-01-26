import { AoccPalette } from "./Colors";

export const MIN_TUBES = 2;
export const MAX_TUBES = 40;
export const MIN_VOLUME = 1;
export const MAX_VOLUME = 16;

export const MAX_COLORS = AoccPalette.length;

export enum ErrorValues {
    InvalidColor = -1,
}

export const EventTubeClicked = "TubeClicked";
