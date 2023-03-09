// to make the script work in Windows
// replace all "/" with "\\"

const texturePacker = require("free-tex-packer-core");
const fs = require("fs").promises;
const { join } = require("path");
const { exec } = require("child_process");
const { rejects } = require("assert");

const srcPath = join(__dirname, "../src");
const assetsPath = join(srcPath, "assets");

const paths = {
    images: {
        path: join(assetsPath, "images"),
        name: "images",
    },
    audio: {
        path: join(assetsPath, "audio"),
        name: "audio",
    },
    spines: {
        path: join(assetsPath, "spines"),
        name: "spines",
    },
    uncompressed: {
        path: join(assetsPath, "uncompressed"),
        name: "uncompressed",
    },
    spriteSheets: {
        path: join(assetsPath, "spriteSheets"),
        name: "spriteSheets",
    },
    shaders: {
        path: join(assetsPath, "shaders"),
        name: "shaders",
    },
    videos: {
        path: join(assetsPath, "video"),
        name: "videos",
    },
};

let options = {
    textureName: "",
    width: 4096,
    height: 4096,
    quality: 80,
    scale: 1,
    fixedSize: false,
    powerOfTwo: false,
    padding: 2,
    extrude: 1,
    allowRotation: false,
    detectIdentical: true,
    allowTrim: true,
    trimMode: "trim",
    alphaThreshold: 1,
    removeFileExtension: false,
    prependFolderName: true,
    textureFormat: "png",
    base64Export: false,
    tinify: false,
    packer: "MaxRectsPacker",
    packerMethod: "Smart",
    exporter: "Phaser3",
    filter: "none",
};

// function getFileNameFromPath(path) {
//     return path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
// }

function getFileNameWithExtension(path) {
    return path.slice(path.lastIndexOf("/") + 1, path.length);
}

function getFileExtensionFromPath(path) {
    return path.slice(path.lastIndexOf(".") + 1, path.length);
}

function isImage(filePath) {
    return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(filePath);
}

function isVideo(filePath) {
    return /\.(webm|mpe?g|mp2|mpe|mpv|m4p|m4v|wmv|qt|flv|swf|avchd|ogg|mp4|avi|mov)$/i.test(
        filePath,
    );
}

function findFileWithExtension(files, extension) {
    for (const f of files) {
        if (getFileExtensionFromPath(f) === extension) return f;
    }
    return null;
}

async function generateSpriteSheet(data, name) {
    const assets = await Promise.all(
        data.map(async (key) => {
            const contents = await fs.readFile(join(paths.images.path, name, key));
            return { path: key, contents };
        }),
    );
    options.textureName = name;
    texturePacker(assets, options, async (files, error) => {
        if (error) throw error;
        for (const item of files) {
            const itemPath = join(assetsPath, `spriteSheets/${item.name}`);
            await fs.appendFile(itemPath, item.buffer);
        }
    });
}

async function getFolderContent(
    folderPath,
    shorterPath = true,
    shortenFromFolder = "src",
) {
    let result = [];
    const getFilesRecursively = async (path) => {
        const files = await fs.readdir(path);
        for (const f of files) {
            let newPath = join(path, f);
            const stat = await fs.stat(newPath);
            if (stat.isDirectory()) {
                await getFilesRecursively(newPath);
            } else {
                if (shorterPath) {
                    const dir = newPath.split("/");
                    const fileDir = dir.slice(
                        dir.indexOf(shortenFromFolder) + 1,
                        dir.length,
                    );
                    newPath = fileDir.join("/");
                }
                result.push(newPath);
            }
        }
    };
    await getFilesRecursively(folderPath);
    return result;
}

async function emptySpriteSheetFolder() {
    const { name, path } = paths.spriteSheets;
    let files = await getFolderContent(path, true, name);
    if (files.length !== 0) {
        for (const f of files) {
            await fs.unlink(join(path, f));
        }
    }
}

async function generateAtlases() {
    const { path } = paths.images;
    try {
        const folders = await fs.readdir(path, "utf8");
        const spriteSheetNames = [];
        for (const folder of folders) {
            const folderPath = join(path, folder);
            const stat = await fs.stat(folderPath);
            if (!stat.isDirectory()) continue;
            const folderContent = await getFolderContent(
                join(path, folder),
                true,
                folder,
            );
            if (folderContent.length === 0) continue;
            const imageFiles = folderContent.filter((f) => isImage(f));
            spriteSheetNames.push(folder);
            await generateSpriteSheet(imageFiles, folder);
        }
        const data = `export const spriteSheets: string[] = ${JSON.stringify(
            spriteSheetNames,
        )}`;
        const file = join(assetsPath, "assetsNames/spriteSheets.ts");
        await fs.writeFile(file, data);
        await runPrettierOn(file);
    } catch (e) {
        console.log(e.message);
    }
}

async function generateUncompressedSprites() {
    const { path } = paths.uncompressed;
    try {
        const files = await getFolderContent(path, true);
        const images = files.filter((f) => isImage(f));
        let filesNamesAndPaths = [];
        if (images.length !== 0) {
            filesNamesAndPaths = images.map((el) => {
                const name = getFileNameWithExtension(el);
                return { name, path: el };
            });
        }
        const file = join(assetsPath, "assetsNames/assets.ts");
        const data = `export const assets: AssetNameAndPath[] = ${JSON.stringify(
            filesNamesAndPaths,
        )}`;
        await fs.writeFile(file, data);
        await runPrettierOn(file);
    } catch (e) {
        console.log(e.message);
    }
}

async function generateAudioAssets() {
    const { path } = paths.audio;
    try {
        const files = await getFolderContent(path, true);
        let filesNamesAndPath = [];
        if (files.length !== 0) {
            filesNamesAndPath = files.map((el) => {
                const name = getFileNameWithExtension(el);
                return { name, path: el };
            });
        }
        const file = join(assetsPath, "assetsNames/audio.ts");
        const data = `export const audioAssets: AssetNameAndPath[] = ${JSON.stringify(
            filesNamesAndPath,
        )}`;
        await fs.writeFile(file, data);
        await runPrettierOn(file);
    } catch (e) {
        console.log(e.message);
    }
}

async function generateShaders() {
    const { path } = paths.shaders;
    try {
        const shaderFiles = await getFolderContent(path, true);
        let filesNamesAndPath = [];
        if (shaderFiles.length !== 0) {
            filesNamesAndPath = shaderFiles.map((el) => {
                const name = getFileNameWithExtension(el);
                return { name, path: el };
            });
        }
        const file = join(assetsPath, "assetsNames/shaders.ts");
        const data = `export const shaders: AssetNameAndPath[] = ${JSON.stringify(
            filesNamesAndPath,
        )}`;
        await fs.writeFile(file, data);
        await runPrettierOn(file);
    } catch (e) {
        console.log(e.message);
    }
}

async function generateVideos() {
    const { path } = paths.videos;
    try {
        const files = await getFolderContent(path, true);
        const videoFiles = files.filter((f) => isVideo(f));
        let filesNamesAndPath = [];
        if (videoFiles.length !== 0) {
            filesNamesAndPath = videoFiles.map((el) => {
                const name = getFileNameWithExtension(el);
                return { name, path: el };
            });
        }
        const file = join(assetsPath, "assetsNames/videos.ts");
        const data = `export const videos: AssetNameAndPath[] = ${JSON.stringify(
            filesNamesAndPath,
        )}`;
        await fs.writeFile(file, data);
        await runPrettierOn(file);
    } catch (e) {
        console.log(e.message);
    }
}

async function generateSpines() {
    const { path } = paths.spines;
    try {
        const spines = await fs.readdir(path, "utf8");
        let spineFiles = [];
        if (spines.length !== 0) {
            spineFiles = await Promise.all(
                spines.map(async (s) => {
                    const files = await getFolderContent(join(path, s));
                    return {
                        key: s,
                        jsonURL: findFileWithExtension(files, "json"),
                        atlasURL: findFileWithExtension(files, "atlas"),
                        preMultipliedAlpha: true,
                    };
                }),
            );
        }
        const file = join(assetsPath, "assetsNames/spines.ts");
        const data = `export const spines: SpineFiles[] = ${JSON.stringify(spineFiles)}`;
        await fs.writeFile(file, data);
        await runPrettierOn(file);
    } catch (e) {
        console.log(e.message);
    }
}

async function runPrettierOn(file) {
    await exec(`prettier --write ${file}`);
}

async function start() {
    console.log("removing current sprite sheets");
    await emptySpriteSheetFolder();
    console.log("generating atlases");
    await generateAtlases();
    console.log("generating uncompressed sprites");
    await generateUncompressedSprites();
    console.log("generating audio assets");
    await generateAudioAssets();
    console.log("generating spines");
    await generateSpines();
    console.log("generating shaders");
    await generateShaders();
    console.log("generating videos");
    await generateVideos();
    console.log("asset generation complete");
    console.log("running the game");
}

start();
