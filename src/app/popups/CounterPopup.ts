import { Button } from "../buttons/Button";
import { getRedButtonConfig } from "../configs/RedBtnConfig";
import { ButtonEvents } from "../enums/ButtonEvents";

export class CounterPopup extends Phaser.GameObjects.Container {
    private bkg: Phaser.GameObjects.Sprite;
    private label: Phaser.GameObjects.Text;
    private roundsLabel: Phaser.GameObjects.Text;
    private okBtn: Button;

    public constructor(scene) {
        super(scene);
        this.init();
    }

    public updateRounds(rounds: number): void {
        this.roundsLabel.setText(`${rounds} rounds`);
    }

    public hide(force = false): Phaser.Tweens.Tween | undefined {
        this.okBtn.setInteractivity(false);
        if (force) {
            this.setVisible(false);
            this.setScale(0);
            return;
        }

        return this.scene.add.tween({
            targets: this,
            scale: 0,
            duration: 300,
            onComplete: () => this.setVisible(false),
        });
    }

    public show(rounds: number): Phaser.Tweens.Tween {
        this.updateRounds(rounds);
        return this.scene.add.tween({
            targets: this,
            scale: 1,
            duration: 300,
            onStart: () => this.setVisible(true),
            onComplete: () => this.okBtn.setInteractivity(true),
        });
    }

    private init(): void {
        this.initBkg();
        this.initMainLabel();
        this.initRoundsLabel();
        this.initOkBtn();
        this.hide(true);
    }

    private initBkg(): void {
        this.bkg = this.scene.add.sprite(0, 0, "popup-bkg.png");
        this.add(this.bkg);
    }

    private initOkBtn(): void {
        this.okBtn = new Button(this.scene, getRedButtonConfig());
        this.okBtn.setPosition(0, 100);
        this.okBtn.setInteractivity(true);
        this.okBtn.on(ButtonEvents.Up, () => {
            this.emit("okBtnClicked");
        });
        this.add(this.okBtn);
    }

    private initMainLabel(): void {
        this.label = this.scene.add.text(0, -35, `Congratulations !!!\nRacoon made`, {
            fontSize: "40px",
            align: "center",
        });
        this.label.setOrigin(0.5, 0.5);
        this.add(this.label);
    }
    private initRoundsLabel(): void {
        this.roundsLabel = this.scene.add.text(0, 35, ``, {
            fontSize: "40px",
            align: "center",
        });
        this.roundsLabel.setOrigin(0.5, 0.5);
        this.updateRounds(0);
        this.add(this.roundsLabel);
    }
}
