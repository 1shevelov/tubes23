import { TextConfig } from "../interfaces/TextConfig";

export const getSellBtnTextConfig = (enabled: boolean): TextConfig => {
    return {
        text: enabled ? "Start!" : "Please Wait",
        style: {
            fontFamily: "Grobold",
            fontSize: "82px",
            color: enabled ? "#6644aa" : "#cccccc",
            stroke: enabled ? "#944D24" : "#282828",
            strokeThickness: 2,
            padding: {
                x: 10,
                y: 10,
            },
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: enabled ? "#944D24" : "#282828",
                fill: true,
                blur: 0,
            },
        },
        x: 10,
        y: 2,
    };
};

export const getBlueBtnTextConfig = (enabled: boolean): TextConfig => {
    return {
        text: enabled ? "Random Button" : "Disabled",
        style: {
            fontFamily: "Grobold",
            fontSize: "32px",
            color: enabled ? "#ffffff" : "#BFBFBF",
            stroke: enabled ? "#944D24" : "#282828",
            strokeThickness: 4,
            padding: {
                x: 10,
                y: 10,
            },
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: enabled ? "#944D24" : "#282828",
                fill: true,
                blur: 0,
            },
        },
        x: 0,
        y: 2,
    };
};

export const getRedBtnTextConfig = (): TextConfig => {
    return {
        text: "OK",
        style: {
            fontFamily: "Grobold",
            fontSize: "32px",
            color: "#ffffff",
            stroke: "#99aacc",
            strokeThickness: 3,
            padding: {
                x: 10,
                y: 10,
            },
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: "#1565bf",
                fill: true,
                blur: 0,
            },
        },
        x: 0,
        y: 2,
    };
};
