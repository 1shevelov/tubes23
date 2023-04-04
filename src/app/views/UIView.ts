// import { CounterComponent } from "../components/CounterComponent";
import { UIService } from "../services/UIService";
import * as UI_CONFIG from "../configs/UiConfig";
import { BUILD_VER } from "../configs/GameConfig";
import { UiEvents, EndGameClosedActions } from "../configs/Events";
import { PortionView } from "./PortionView";

interface XY {
    x: number;
    y: number;
}

export class UIView extends Phaser.GameObjects.Container {
    private readonly FORM_ANIMATION_DURATION = 1500;

    // private counter: CounterComponent;
    private counter: Phaser.GameObjects.Text;
    private winMessage: Phaser.GameObjects.Text;
    private goalMessage: Phaser.GameObjects.Text;
    private buttonRestart: Phaser.GameObjects.Container;
    private buttonUndo: Phaser.GameObjects.Container;

    private newGameHtmlForm: Phaser.GameObjects.DOMElement;
    private endGameHtmlForm: Phaser.GameObjects.DOMElement;
    private versionHtmlElement: Phaser.GameObjects.DOMElement;
    private formBack: Phaser.GameObjects.Sprite;

    private wi: number;
    private he: number;

    private uiEvents: Phaser.Events.EventEmitter;
    private unoMessagePortion: PortionView;

    private gameVersion: string;

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();
        this.makeCounter();
        this.makeWinMessage();
        this.makeButtons();
        // this.makeNewLevelPopup();
        this.makeFormBack();
        this.makeDivVersion();
        this.makeNewGameForm();
        this.makeEndGameForm();
        this.makeGoalMessage();
        this.showForm(UI_CONFIG.FORMS.START);
        // Debug
        // this.showForm("end");
    }

    public resizeUi(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.wi = width;
        this.he = height;

        if (this.newGameHtmlForm.visible)
            this.newGameHtmlForm.setPosition(this.wi / 2, this.he / 2);
        if (this.endGameHtmlForm.visible)
            this.endGameHtmlForm.setPosition(this.wi / 2, this.he / 2);
        // TODO: else update starting position
    }

    public showGameUi(): void {
        this.buttonRestart.setVisible(true);
        this.buttonUndo.setVisible(true);
        this.counter.setVisible(true);
        this.goalMessage.setVisible(true);
    }

    public hideGameUi(): void {
        this.buttonRestart.setVisible(false);
        this.buttonUndo.setVisible(false);
        this.counter.setVisible(false);
        this.goalMessage.setVisible(false);
        if (this.unoMessagePortion) this.unoMessagePortion.hide();
        this.hideWin();
    }

    public getUiEvents(): Phaser.Events.EventEmitter {
        return this.uiEvents;
    }

    // for game mode Uno
    public setUnoGoalMessage(winColor: number): void {
        if (!this.unoMessagePortion) {
            this.unoMessagePortion = new PortionView(this.scene);
            this.add(this.unoMessagePortion);
            this.unoMessagePortion.changeSize(
                this.he > this.wi ? this.wi / 25 : this.he / 25,
            );
            this.unoMessagePortion.changeXPos(this.goalMessage.x - 167);
            this.unoMessagePortion.changeYPos(this.goalMessage.y);
        }
        this.goalMessage.setText("Gather    this color only in one tube to win");
        // this.goalMessage.setTint(winColor);
        this.unoMessagePortion.changeColor(winColor);
        this.unoMessagePortion.show();
    }

    public setClassicGoalMessage(): void {
        if (this.unoMessagePortion) this.unoMessagePortion.hide();
        this.goalMessage.setText("Gather all colors in their own tube to win");
        this.goalMessage.setTint(0xffffff);
    }

    public showWin(): void {
        this.scene.add.tween({
            targets: this.counter,
            scale: 2.0,
            // tint: 0xff0000,
            ease: "Linear",
            duration: 300,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.winMessage.setVisible(true);
                this.scene.add.tween({
                    targets: this.winMessage,
                    alpha: 1.0,
                    tint: 0xff4444,
                    ease: "Linear",
                    duration: 200,
                });
            },
        });
    }

    public hideWin(): void {
        this.winMessage.setVisible(false);
        this.winMessage.setAlpha(0.0);
        this.winMessage.setTint(0xffffff);
    }

    public setCounter(newVal: number): void {
        this.counter.setText(newVal.toString());
    }

    // TODO: should I remove newGameHtmlForm hiding here?
    public closeForms(): void {
        if (this.newGameHtmlForm.visible) this.newGameHtmlForm.setVisible(false);
        if (this.endGameHtmlForm.visible)
            this.closeForm(UI_CONFIG.FORMS.END, EndGameClosedActions.Close);
    }

    public showForm(form: UI_CONFIG.FORMS, _data = {}): void {
        this.formBack.setVisible(true);
        let htmlForm: Phaser.GameObjects.DOMElement;
        if (form === UI_CONFIG.FORMS.START) {
            htmlForm = this.newGameHtmlForm;
            if (this.endGameHtmlForm.visible)
                this.closeForm(UI_CONFIG.FORMS.END, EndGameClosedActions.Close);
        } else {
            htmlForm = this.endGameHtmlForm;
            if (Object.keys(_data).length > 0 && _data.hasOwnProperty("counter"))
                htmlForm.getChildByID("moves_used").textContent =
                    _data["counter"].toString();
        }

        htmlForm.setVisible(true);
        this.scene.tweens.add({
            targets: htmlForm,
            y: this.he / 2,
            alpha: 1.0,
            duration: this.FORM_ANIMATION_DURATION,
            ease: "Power3",
            onComplete: () => {
                this.versionHtmlElement.setVisible(true);
            },
        });
    }

    private init(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.wi = width;
        this.he = height;

        this.uiEvents = new Phaser.Events.EventEmitter();
    }

    private makeFormBack(): void {
        this.formBack = new Phaser.GameObjects.Sprite(
            this.scene,
            this.wi / 2,
            this.he / 2,
            "game-ui",
            "1x1.png",
        );
        this.formBack.setInteractive();
        this.formBack.setVisible(false);
        this.formBack.setScale(this.wi, this.he);
        this.add(this.formBack);
    }

    private makeNewGameForm(): void {
        this.newGameHtmlForm = this.scene.add
            .dom(this.wi / 2, this.he)
            .createFromCache("NewGameForm");
        this.newGameHtmlForm.setPerspective(800);
        this.newGameHtmlForm.setVisible(false);
        this.newGameHtmlForm.setName(UI_CONFIG.FORMS.START);

        const form = this.newGameHtmlForm.getChildByName("form");
        (form as HTMLFormElement).addEventListener("submit", (event) => {
            const data = new FormData(form as HTMLFormElement);
            this.scene.tweens.add({
                targets: this.newGameHtmlForm,
                y: -300,
                alpha: 0.5,
                duration: this.FORM_ANIMATION_DURATION,
                ease: "Power3",
                onComplete: () => this.closeForm(UI_CONFIG.FORMS.START, data),
            });
            event.preventDefault();
        });
        const fileLoadInput = this.newGameHtmlForm.getChildByName("load_file");
        const startButton = this.newGameHtmlForm.getChildByName("start_button");
        const clearButton = this.newGameHtmlForm.getChildByName("clear_button");
        fileLoadInput.addEventListener("input", (event) => {
            // console.log("File load input event: ", event);
            const target = event.target as HTMLInputElement;
            if (target) {
                if (target.files?.length === 1) {
                    (startButton as HTMLButtonElement).value = "Load game";
                    (clearButton as HTMLButtonElement).style.visibility = "visible";
                } else {
                    (startButton as HTMLButtonElement).value = "New random game";
                    (clearButton as HTMLButtonElement).style.visibility = "hidden";
                }
            }
        });
        clearButton.addEventListener("click", (event) => {
            (fileLoadInput as HTMLInputElement).value = "";
            (startButton as HTMLButtonElement).value = "New random game";
            (clearButton as HTMLButtonElement).style.visibility = "hidden";
            event.preventDefault();
        });
    }

    private makeEndGameForm(): void {
        this.endGameHtmlForm = this.scene.add
            .dom(this.wi / 2, this.he)
            .createFromCache("EndGameForm");
        this.endGameHtmlForm.setPerspective(800);
        this.endGameHtmlForm.setVisible(false);
        this.endGameHtmlForm.setName(UI_CONFIG.FORMS.END);

        (
            this.endGameHtmlForm.getChildByName("replay_button") as HTMLButtonElement
        ).addEventListener("click", (event: MouseEvent) => {
            this.closeForm(UI_CONFIG.FORMS.END, EndGameClosedActions.Replay);
            event.preventDefault();
        });
        (
            this.endGameHtmlForm.getChildByName("new_game_button") as HTMLButtonElement
        ).addEventListener("click", (event: MouseEvent) => {
            this.closeForm(UI_CONFIG.FORMS.END, EndGameClosedActions.NewGame);
            event.preventDefault();
        });
    }

    private makeDivVersion(): void {
        this.versionHtmlElement = this.scene.add
            .dom(this.wi, this.he)
            .createFromCache("DivVersion");
        this.versionHtmlElement.setPerspective(800);
        this.versionHtmlElement.setVisible(false);

        this.gameVersion = BUILD_VER;
        // "v 0." +
        // (new Date().getMonth() + 1).toString() +
        // new Date().getDate().toString() +
        // "." +
        // new Date().getHours().toString();
        (this.versionHtmlElement.getChildByID("version") as HTMLDivElement).textContent =
            this.gameVersion;
    }

    private closeForm(
        form: UI_CONFIG.FORMS,
        signalData: FormData | EndGameClosedActions,
    ): void {
        const htmlForm: Phaser.GameObjects.DOMElement =
            form === UI_CONFIG.FORMS.START ? this.newGameHtmlForm : this.endGameHtmlForm;
        this.scene.tweens.add({
            targets: htmlForm,
            y: -300,
            alpha: 0.5,
            duration: this.FORM_ANIMATION_DURATION,
            ease: "Power3",
            onComplete: () => {
                htmlForm.setVisible(false);
                htmlForm.setY(this.he);
                if (this.versionHtmlElement) this.versionHtmlElement.setVisible(false);
                this.formBack.setVisible(false);

                let event: UiEvents;
                if (form === UI_CONFIG.FORMS.START)
                    event = UiEvents.NewGameSettingsSubmitted;
                else event = UiEvents.EndGameClosed;
                this.uiEvents.emit(event, signalData);
            },
        });
    }

    private makeCounter(): void {
        this.counter = UIService.createText(
            this.scene,
            this.wi / 1.08,
            this.he / 15,
            "0",
            UI_CONFIG.uiCounterStyle,
        );
        this.counter.setVisible(false);
        this.add(this.counter);
    }

    private makeButton(label: string, pos: XY, size: XY): Phaser.GameObjects.Container {
        const button = new Phaser.GameObjects.Container(this.scene, pos.x, pos.y);

        const buttonRect = new Phaser.GameObjects.Rectangle(
            this.scene,
            pos.x,
            pos.y,
            size.x,
            size.y,
            0x111b11,
            1.0,
        );
        buttonRect.setStrokeStyle(1.5, 0x99ff99, 1.0);
        button.add(buttonRect);

        button.setInteractive(
            new Phaser.Geom.Rectangle(
                pos.x - (size.x * 1.2) / 2,
                pos.y - (size.y * 1.3) / 2,
                size.x * 1.2,
                size.y * 1.3,
            ),
            Phaser.Geom.Rectangle.Contains,
        );
        // const debugInteractiveRect = new Phaser.GameObjects.Rectangle(
        //     this.scene,
        //     pos.x, // - size.x * 0.05,
        //     pos.y,
        //     size.x * 1.2,
        //     size.y * 1.3,
        //     0x00ff00,
        //     0.3,
        // );
        // button.add(debugInteractiveRect);

        const buttonLabel = UIService.createText(
            this.scene,
            pos.x,
            pos.y,
            label,
            UI_CONFIG.uiButtonLabelStyle,
        );
        button.add(buttonLabel);

        // button.setVisible(false);
        // this.add(button);
        return button;
    }

    private makeButtons(): void {
        const buttonWidth = 150 > this.wi / 3.7 ? this.wi / 3.7 : 150;
        const buttonHeight = buttonWidth / 2.4;

        this.buttonRestart = this.makeButton(
            "(R)estart",
            { x: this.wi * 0.07, y: buttonHeight / 3 },
            { x: buttonWidth, y: buttonHeight },
        );
        // this.buttonRestart.setVisible(true);
        this.buttonRestart.on("pointerup", () =>
            this.uiEvents.emit(UiEvents.ButtonRestartClicked),
        );
        this.buttonRestart.setVisible(false);
        this.add(this.buttonRestart);

        // console.log(this.wi / 2, this.he);
        this.buttonUndo = this.makeButton(
            "(U)ndo",
            { x: this.wi * 0.25, y: buttonHeight / 3 },
            { x: buttonWidth, y: buttonHeight },
        );
        this.buttonUndo.setVisible(false);
        this.buttonUndo.on("pointerup", () =>
            this.uiEvents.emit(UiEvents.ButtonUndoClicked),
        );
        this.add(this.buttonUndo);
    }

    private makeWinMessage(): void {
        this.winMessage = UIService.createText(
            this.scene,
            this.wi / 1.03,
            this.counter.y + this.he / 20,
            "YOU WIN!",
            UI_CONFIG.uiWinMessageStyle,
        );
        this.winMessage.setOrigin(1, 0.5);
        this.winMessage.setVisible(false);
        this.winMessage.setAlpha(0.0);
        this.add(this.winMessage);
    }

    private makeGoalMessage(): void {
        this.goalMessage = UIService.createText(
            this.scene,
            this.wi / 2,
            this.he / 1.03,
            "",
            UI_CONFIG.uiGoalMessageStyle,
        );
        this.goalMessage.setOrigin(0.5, 0.5);
        this.goalMessage.setVisible(false);
        this.add(this.goalMessage);
    }
}
