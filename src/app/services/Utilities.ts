export function fixValue(val: number, MIN: number, MAX: number): number {
    if (!Number.isFinite(val) || val < MIN) {
        console.warn(`Invalid value: \"${val}\". Setting to MIN: ${MIN}`);
        val = MIN;
    } else if (val > MAX) {
        console.warn(`Invalid value: \"${val}\". Setting to MAX: ${MAX}`);
        val = MAX;
    }
    return val;
}

export function checkIfFaulty(val: number, MIN: number, MAX: number): boolean {
    if (!Number.isFinite(val)) {
        console.error(`Invalid value: \"${val}\". Aborting`);
        return true;
    } else if (val < MIN) {
        console.error(`Invalid value: \"${val}\". It is less then \"${MIN}\". Aborting`);
        return true;
    } else if (val > MAX) {
        console.error(
            `Invalid value: \"${val}\". It is bigger then \"${MAX}\". Aborting`,
        );
        return true;
    }
    return false;
}

// download(object, "file_name");
export function download(content: object, fileName: string): void {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(content, null, 0)], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = fileName + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
}

export function changeColorLuminance(hexColor: string, luminosityFactor: number): string {
    // validate hex string
    hexColor = String(hexColor).replace(/[^0-9a-f]/gi, "");
    if (hexColor.length < 6) {
        hexColor =
            hexColor[0] +
            hexColor[0] +
            hexColor[1] +
            hexColor[1] +
            hexColor[2] +
            hexColor[2];
    }

    // convert to decimal and change luminosity
    let rgb = "#";
    let color: number;
    let colorStr: string;
    for (let i = 0; i < 3; i++) {
        color = parseInt(hexColor.substr(i * 2, 2), 16);
        colorStr = Math.round(
            Math.min(Math.max(0, color + color * luminosityFactor), 255),
        ).toString(16);
        rgb += ("00" + color).substr(colorStr.length);
    }

    return rgb;
}
