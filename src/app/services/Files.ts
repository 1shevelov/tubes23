export enum SaveFile {
    Tubes = "tubes",
    Volume = "volume",
    Seed = "seed",
    Mode = "mode",
    Fog = "fog",
    // Best = "best", // least amount of moves to save
}

export enum GameModes {
    ClassicRandom = "classic-random",
    UnoClassicRandom = "uno-classic-random",
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
