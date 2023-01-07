// import { IocContext } from "power-di";
// import { CounterPopup } from "../popups/CounterPopup";
// import { PopupService } from "../services/PopupService";

export class ForegroundView extends Phaser.GameObjects.Container {
    // private popupService = IocContext.DefaultInstance.get(PopupService);
    // private modal: Phaser.GameObjects.Sprite;
    // private counterPopup: CounterPopup;

    public constructor(scene) {
        super(scene);
        this.init();
    }

    // public showCounterPopup(): void {
    //     this.initCounterPopup();
    //     this.counterPopup.show(0 | (Math.random() * 100));
    // }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private init(): void {}

    // private initCounterPopup(): void {
    //     const { width, height } = this.scene.scale.gameSize;
    //     this.counterPopup = new CounterPopup(this.scene);
    //     this.counterPopup.setPosition(width / 2, height / 2);
    //     this.counterPopup.on("okBtnClicked", () => {
    //         this.counterPopup.hide()?.on("complete", () => {
    //             this.counterPopup.destroy();
    //             this.emit("counterPopupClosed");
    //         });
    //     });
    //     this.add(this.counterPopup);
    // }
}
