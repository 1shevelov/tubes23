// import { Button } from "../buttons/Button";
// import { getSellButtonConfig } from "../configs/SellBtnConfig";
// import { ButtonEvents } from "../enums/ButtonEvents";
import { SceneNames } from "../enums/Scenes";

export default class BootScene extends Phaser.Scene {
    public constructor() {
        super({ key: SceneNames.Boot });
    }

    public preload(): void {
        //
    }

    private init(): void {
        // const { width, height } = this.scale.gameSize;
        // const btn = new Button(this, getSellButtonConfig());
        // btn.setPosition(width / 2, height / 2);
        // this.add.existing(btn);
        // btn.on(ButtonEvents.Up, () => {
        //     btn.setInteractivity(false);
        //     setTimeout(() => {
        //         this.scene.start(SceneNames.Main);
        //     }, 2000);
        // });
    }

    private create(): void {
        //
    }
}
