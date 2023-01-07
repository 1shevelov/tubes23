// import { IocContext } from "power-di";
// import { PopupService } from "../services/PopupService";

export class GameView extends Phaser.GameObjects.Container {
    // private popupService = IocContext.DefaultInstance.get(PopupService);
    private wi: number;
    private he: number;

    // all tubes in the scene
    private tubes: Array<Phaser.GameObjects.Graphics> = [];

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();
        this.drawTube(this.wi / 2, this.he / 2, 5);
    }

    private init(): void {
        this.resize();

        this.scene.scale.on("resize", this.resize, this);
    }

    private drawTube(centerX: number, centerY: number, volume: number): void {
        const portionSquareSize = this.wi > this.he ? Math.round(this.he / 20) : Math.round(this.he / 20);

        const tube = this.scene.add.graphics();
        tube.setDefaultStyles({
            lineStyle: {
                width: 1,
                color: 0xffffff,
                alpha: 1,
            },
            fillStyle: {
                color: 0xffffff,
                alpha: 1,
            },
        });
        const tubeWi = portionSquareSize;
        const tubeHe = portionSquareSize * volume;
        tube.strokeRoundedRect(centerX - tubeWi / 2, centerY - tubeHe / 2, tubeWi, tubeHe, portionSquareSize / 5);

        this.tubes.push(tube);
    }

    private resize(): void {
        // const prevWi = this.wi;
        // const prevHe = this.he;
        const { width, height } = this.scene.scale.gameSize;
        const halfShiftX = (width - this.wi) / 2;
        const halfShiftY = (height - this.he) / 2;
        this.wi = width;
        this.he = height;

        this.tubes.forEach((tube) => {
            tube.setX(tube.x + halfShiftX);
            tube.setY(tube.y + halfShiftY);
        });
    }

    // private handleBkgClick(): void {
    //     this.bkg.disableInteractive();
    //     this.popupService.showCounterPopup();
    //     setTimeout(() => {
    //         this.bkg.setInteractive();
    //     }, 2000);
    // }
}
