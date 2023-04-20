export const LightBackground = "#839496"; // Solarized Base0
export const DarkBackground = "#002b36"; // Solarized Base03

export enum FORMS {
    START = "start",
    END = "end",
    MENU = "menu",
    SETTINGS = "settings",
}

export enum MENU {
    NEWGAME,
    RESET,
    EXPORT,
    SETTINGS,
}

export const TubeLabelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "20px",
    fontStyle: "bold",
    align: "center",
    color: "#999999",
};
export const uiCounterStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "34px",
    fontStyle: "bold",
    align: "center",
};
export const uiWinMessageStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "30px",
    fontStyle: "bold",
    align: "center",
};
export const uiButtonLabelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "20px",
    // fontStyle: "bold",
    align: "center",
};
export const uiGoalMessageStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "20px",
    // fontStyle: "bold",
    align: "center",
    stroke: "#ffffff",
    strokeThickness: 1,
};

// export const TubeStyle = {
//     lineStyle: {
//         width: 1,
//         color: 0xffffff,
//         alpha: 1,
//     },
//     fillStyle: {
//         color: 0xffffff,
//         alpha: 1,
//     },
// }

// in Fog of War mode
export const PortionFogStyle = {
    lineStyle: {
        width: 2,
        color: 0xaaaaaa,
        alpha: 0.3,
    },
    fillStyle: {
        color: 0xffffff,
        alpha: 1,
    },
};

/* eslint-disable prettier/prettier */
export const AoccPalette = [
    0xfad201 /* traffic yellow */,
    0xff7514 /* pastel orange */,
    0xcc0605 /* traffic red */,
    0xf6f6f6 /* traffic white */,
    0x1e1e1e /* traffic black */,
    0x84c3be /* light green */,
    0x82898f /* telegrey 2 */,
    0x57a639 /* yellow green */,
    0x3b83bd /* light blue */,
    0x6c4675 /* blue lilac */,
    0xea899a /* light pink */,
]
export const CurrentPalette = AoccPalette;
