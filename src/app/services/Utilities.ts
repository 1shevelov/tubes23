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

export function checkUploadedGameFile(file: File): boolean {
    const MAX_GAME_SAVE_FILE_SIZE = 1024 * 10; // in Bytes

    if (file.name === "") {
        return false;
    }
    if (file.type === "text/plain" || file.type === "application/json") {
        if (file.size > MAX_GAME_SAVE_FILE_SIZE) {
            console.error(`The file is too big: ${file.size}B`);
            return false;
        }
        return true;
    } else {
        console.error(
            `Invalid file type: "${file.type}". Only ".TXT" or ".JSON" allowed`,
        );
        return false;
    }
}

// export function processGameSave(file: File): object {
//     const fReader = new FileReader();
//     fReader.readAsText(file);
//     fReader.onload = (event) => {
//         const str = (event.target ?? {}).result;
//         let json: object;
//         try {
//             json = JSON.parse(str as string);
//             console.log("inside JSON: ", JSON.stringify(json));
//         } catch (error) {
//             console.error(error);
//             // throw new Error('Error occured: ', e);
//             return {};
//         }
//         return json;
//     };
//     fReader.onerror = (error) => {
//         console.error(error);
//         return {};
//     };
// }

export function getRandomSeed(): string {
    return Math.floor(Date.now() * Math.random()).toString();
}

export function getRandomPositiveInt(
    min: number,
    max: number,
    rng: () => number,
): number {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        console.error(`Invalid value: \"${min}\" or \"${max}\". Aborting`);
        return -1;
    }
    if (min < 0) min = 0;
    if (max < 0) max = 0;
    min = Math.round(min);
    max = Math.round(max);
    return Math.floor(rng() * (max - min + 1)) + min;
}

// can't make it work
// export function changeColorLuminance(hexColor: string, luminosityFactor: number): string {
//     // validate hex string
//     hexColor = String(hexColor).replace(/[^0-9a-f]/gi, "");
//     if (hexColor.length < 6) {
//         hexColor =
//             hexColor[0] +
//             hexColor[0] +
//             hexColor[1] +
//             hexColor[1] +
//             hexColor[2] +
//             hexColor[2];
//     }

//     // convert to decimal and change luminosity
//     let rgb = "#";
//     let color: number;
//     let colorStr: string;
//     for (let i = 0; i < 3; i++) {
//         color = parseInt(hexColor.substr(i * 2, 2), 16);
//         colorStr = Math.round(
//             Math.min(Math.max(0, color + color * luminosityFactor), 255),
//         ).toString(16);
//         rgb += ("00" + color).substr(colorStr.length);
//     }
//     return rgb;
// }
