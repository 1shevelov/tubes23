import "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";
import BootScene from "./app/scenes/BootScene";
import MainScene from "./app/scenes/MainScene";
import PreloadScene from "./app/scenes/PreloadScene";

const config = {
    transparent: false,
    antialiasGL: false,
    // pixelArt: true,
    // roundPixels: true,
    type: Phaser.WEBGL,
    width: 2000,
    height: 1400,
    input: {
        mouse: {
            preventDefaultWheel: false,
        },
    },
    scale: {
        parent: "phaser-game",
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.RESIZE,
    },
    min: {
        width: 400,
        height: 400,
    },
    plugins: {
        scene: [
            {
                key: "SpinePlugin",
                plugin: window.SpinePlugin,
                mapping: "spine",
            },
        ],
    },
    antialias: true,
    scene: [PreloadScene, BootScene, MainScene],
    dom: {
        createContainer: true,
    },
};
window.addEventListener("load", () => {
    // const messageService = IocContext.DefaultInstance.get<MessageService, unknown>(MessageService);
    // messageService.initialize();
    new Phaser.Game(config);
});
