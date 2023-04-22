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

    private counter: Phaser.GameObjects.Text;
    private COUNTER_REL_POS: XY = { x: 1.08, y: 15 };

    private winMessage: Phaser.GameObjects.Text;
    private goalMessage: Phaser.GameObjects.Text;
    private GOAL_REL_POS: XY = { x: 2, y: 1.03 };

    private newGameHtmlForm: Phaser.GameObjects.DOMElement;
    private endGameHtmlForm: Phaser.GameObjects.DOMElement;
    private menuHtml: Phaser.GameObjects.DOMElement;
    private settingsHtmlForm: Phaser.GameObjects.DOMElement;
    private formBack: Phaser.GameObjects.Sprite;
    private menuButton: Phaser.GameObjects.DOMElement;
    private undoButton: Phaser.GameObjects.DOMElement;

    private wi: number;
    private he: number;

    private uiEvents: Phaser.Events.EventEmitter;
    private unoMessagePortion: PortionView;

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();
        this.makeCounter();
        this.makeWinMessage();
        this.makeButtons();
        // this.makeNewLevelPopup();
        this.makeFormBack();
        this.makeNewGameForm();
        this.makeEndGameForm();
        this.makeSettingsForm();
        this.makeMenu();
        this.makeGoalMessage();
        // this.showForm(UI_CONFIG.FORMS.START);
        // Debug
        this.showForm(UI_CONFIG.FORMS.MENU);
        // this.menuButton.setVisible(true);
    }

    public showGameUi(): void {
        this.updateUiPosition();
        // this.buttonRestart.setVisible(true);
        this.undoButton.setVisible(true);
        this.counter.setVisible(true);
        this.goalMessage.setVisible(true);
        this.menuButton.setVisible(true);
    }

    public hideGameUi(): void {
        // this.buttonRestart.setVisible(false);
        this.undoButton.setVisible(false);
        this.counter.setVisible(false);
        this.goalMessage.setVisible(false);
        if (this.unoMessagePortion) this.unoMessagePortion.hide();
        this.hideWin();
        this.menuButton.setVisible(false);
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
        this.goalMessage.setText("Gather    this color only in any one tube to win");
        // this.goalMessage.setTint(winColor);
        this.unoMessagePortion.changeColor(winColor);
        this.unoMessagePortion.show();
    }

    public setClassicGoalMessage(): void {
        if (this.unoMessagePortion) this.unoMessagePortion.hide();
        this.goalMessage.setText("Gather all colors each in a separate tube to win");
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
        switch (form) {
            case UI_CONFIG.FORMS.START:
                htmlForm = this.newGameHtmlForm;
                if (this.endGameHtmlForm.visible)
                    this.closeForm(UI_CONFIG.FORMS.END, EndGameClosedActions.Close);
                this.hideGameUi();
                break;
            case UI_CONFIG.FORMS.END:
                htmlForm = this.endGameHtmlForm;
                if (Object.keys(_data).length > 0 && _data.hasOwnProperty("counter"))
                    htmlForm.getChildByID("moves_used").textContent =
                        _data["counter"].toString();
                this.hideGameUi();
                break;
            case UI_CONFIG.FORMS.MENU:
                this.menuHtml.setVisible(true);
                return;
            case UI_CONFIG.FORMS.SETTINGS:
                htmlForm = this.settingsHtmlForm;
                break;
            default:
                return;
        }

        this.refreshCoordinates();
        htmlForm.setX(this.wi / 2);
        htmlForm.setVisible(true);
        this.scene.tweens.add({
            targets: htmlForm,
            y: this.he / 2,
            alpha: 1.0,
            duration: this.FORM_ANIMATION_DURATION,
            ease: "Power3",
        });
    }

    public setButtonActive(button: UI_CONFIG.BUTTONS): void {
        let buttonToSetActive: Phaser.GameObjects.DOMElement;
        let backColor = "";
        switch (button) {
            case UI_CONFIG.BUTTONS.UNDO:
                buttonToSetActive = this.undoButton;
                backColor = UI_CONFIG.UiButtons.undoActiveButtonColor;
                (this.undoButton.node as HTMLButtonElement).addEventListener(
                    "click",
                    (event: MouseEvent) => {
                        this.uiEvents.emit(UiEvents.ButtonUndoClicked);
                        event.preventDefault();
                    },
                );
                break;
            case UI_CONFIG.BUTTONS.MENU:
                buttonToSetActive = this.menuButton;
                backColor = UI_CONFIG.UiButtons.menuActiveButtonColor;
                (this.menuButton.node as HTMLButtonElement).addEventListener(
                    "click",
                    (event: MouseEvent) => {
                        if (!this.menuHtml.visible) {
                            this.showForm(UI_CONFIG.FORMS.MENU);
                        } else {
                            this.menuHtml.setVisible(false);
                            this.formBack.setVisible(false);
                        }
                        event.preventDefault();
                    },
                );
                break;
            default:
                return;
        }
        (buttonToSetActive.node as HTMLButtonElement).style.backgroundColor = backColor;
        (buttonToSetActive.node as HTMLButtonElement).style.color =
            UI_CONFIG.UiButtons.activeButtonTextColor;
        (buttonToSetActive.node as HTMLButtonElement).style.cursor =
            UI_CONFIG.UiButtons.activeButtonCursor;
    }

    public setButtonDisabled(button: UI_CONFIG.BUTTONS): void {
        let buttonToDisable: Phaser.GameObjects.DOMElement;
        switch (button) {
            case UI_CONFIG.BUTTONS.UNDO:
                buttonToDisable = this.undoButton;
                break;
            case UI_CONFIG.BUTTONS.MENU:
                buttonToDisable = this.menuButton;
                break;
            default:
                return;
        }
        // (buttonToDisable.node as HTMLButtonElement).removeEventListener("click");
        (buttonToDisable.node as HTMLButtonElement).style.backgroundColor =
            UI_CONFIG.UiButtons.disabledButtonColor;
        (buttonToDisable.node as HTMLButtonElement).style.color =
            UI_CONFIG.UiButtons.disabledButtonTextColor;
        (buttonToDisable.node as HTMLButtonElement).style.cursor =
            UI_CONFIG.UiButtons.disabledButtonCursor;
    }

    private init(): void {
        this.refreshCoordinates();
        this.uiEvents = new Phaser.Events.EventEmitter();

        this.scene.scale.on("resize", () => {
            this.updateUiPosition();
        });
    }

    private refreshCoordinates(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.wi = width;
        this.he = height;
    }

    private makeFormBack(): void {
        this.formBack = new Phaser.GameObjects.Sprite(
            this.scene,
            this.wi / 2,
            this.he / 2,
            "game-ui",
            "1x1.png", // _orange
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
            this.closeForm(UI_CONFIG.FORMS.START, data);
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

        // "v 0." +
        // (new Date().getMonth() + 1).toString() +
        // new Date().getDate().toString() +
        // "." +
        // new Date().getHours().toString();
        (this.newGameHtmlForm.getChildByID("version") as HTMLDivElement).textContent =
            "v. " + BUILD_VER;
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

    private makeMenu(): void {
        this.menuHtml = this.scene.add.dom(110, 0).createFromCache("MenuHtml");
        this.menuHtml.setOrigin(0, 0);
        this.menuHtml.setPerspective(800);
        this.menuHtml.setVisible(false);
        this.menuHtml.setName(UI_CONFIG.FORMS.MENU);

        (
            this.menuHtml.getChildByName("close_button") as HTMLButtonElement
        ).addEventListener("click", (event) => {
            this.menuHtml.setVisible(false);
            this.formBack.setVisible(false);
            event.preventDefault();
        });

        this.enableMenuItem(UI_CONFIG.MENU.NEWGAME);
        (
            this.menuHtml.getChildByID(UI_CONFIG.MENU.NEWGAME) as HTMLLIElement
        ).addEventListener("click", (event: MouseEvent) => {
            this.menuHtml.setVisible(false);
            this.showForm(UI_CONFIG.FORMS.START);
            event.preventDefault();
        });

        this.disableMenuItem(UI_CONFIG.MENU.RESET);
        (
            this.menuHtml.getChildByID(UI_CONFIG.MENU.RESET) as HTMLLIElement
        ).addEventListener("click", (event: MouseEvent) => {
            this.menuHtml.setVisible(false);
            this.uiEvents.emit(UiEvents.ResetCalled);
            event.preventDefault();
        });

        this.enableMenuItem(UI_CONFIG.MENU.EXPORT);
        (
            this.menuHtml.getChildByID(UI_CONFIG.MENU.EXPORT) as HTMLLIElement
        ).addEventListener("click", (event: MouseEvent) => {
            this.menuHtml.setVisible(false);
            // send event to main scene
            event.preventDefault();
        });

        this.enableMenuItem(UI_CONFIG.MENU.SETTINGS);
        (
            this.menuHtml.getChildByID(UI_CONFIG.MENU.SETTINGS) as HTMLLIElement
        ).addEventListener("click", (event: MouseEvent) => {
            this.menuHtml.setVisible(false);
            this.showForm(UI_CONFIG.FORMS.SETTINGS);
            event.preventDefault();
        });
    }

    private enableMenuItem(item: UI_CONFIG.MENU): void {
        const itemElement = this.menuHtml.getChildByID(item) as HTMLLIElement;
        itemElement.style.backgroundColor = UI_CONFIG.MenuItems.normalBackgroundColor;
        itemElement.style.color = UI_CONFIG.MenuItems.textColor;
        itemElement.style.cursor = UI_CONFIG.MenuItems.cursor;
    }

    private disableMenuItem(item: UI_CONFIG.MENU): void {
        const itemElement = this.menuHtml.getChildByID(item) as HTMLLIElement;
        itemElement.style.backgroundColor = UI_CONFIG.MenuItems.disabledBackgroundColor;
        itemElement.style.color = UI_CONFIG.MenuItems.disabledTextColor;
        itemElement.style.cursor = UI_CONFIG.MenuItems.disabledCursor;
    }

    private makeSettingsForm(): void {
        this.settingsHtmlForm = this.scene.add
            .dom(this.wi / 2, this.he)
            .createFromCache("SettingsForm");
        this.settingsHtmlForm.setPerspective(800);
        this.settingsHtmlForm.setVisible(false);
        this.settingsHtmlForm.setName(UI_CONFIG.FORMS.SETTINGS);

        const form = this.settingsHtmlForm.getChildByName("settings");
        // (
        //     this.settingsHtmlForm.getChildByName("close_button") as HTMLButtonElement
        // ).addEventListener("click", (event) => {
        //     this.settingsHtmlForm.setVisible(false);
        //     this.formBack.setVisible(false);
        //     event.preventDefault();
        // });
        (form as HTMLFormElement).addEventListener("submit", (event) => {
            const data = new FormData(form as HTMLFormElement);
            this.closeForm(UI_CONFIG.FORMS.SETTINGS, data);
            event.preventDefault();
        });
    }

    private closeForm(
        form: UI_CONFIG.FORMS,
        signalData: FormData | EndGameClosedActions,
    ): void {
        let htmlForm: Phaser.GameObjects.DOMElement;
        let event: UiEvents;
        switch (form) {
            case UI_CONFIG.FORMS.START:
                htmlForm = this.newGameHtmlForm;
                event = UiEvents.NewGameSettingsSubmitted;
                break;
            case UI_CONFIG.FORMS.END:
                htmlForm = this.endGameHtmlForm;
                event = UiEvents.EndGameClosed;
                break;
            case UI_CONFIG.FORMS.SETTINGS:
                htmlForm = this.settingsHtmlForm;
                event = UiEvents.SettingsSubmitted;
                break;
            default:
                throw new Error("Unknown form: " + form);
        }

        this.scene.tweens.add({
            targets: htmlForm,
            y: -300,
            alpha: 0.5,
            duration: this.FORM_ANIMATION_DURATION,
            ease: "Power3",
            onComplete: () => {
                htmlForm.setVisible(false);
                htmlForm.setY(this.he);
                this.formBack.setVisible(false);
                this.uiEvents.emit(event, signalData);
            },
        });
    }

    private makeCounter(): void {
        this.counter = UIService.createText(
            this.scene,
            this.wi / this.COUNTER_REL_POS.x,
            this.he / this.COUNTER_REL_POS.y,
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
        // const buttonWidth = 150 > this.wi / 3.7 ? this.wi / 3.7 : 150;
        // const buttonHeight = buttonWidth / 2.4;

        this.createMenuButton();
        this.createUndoButton();

        this.setButtonActive(UI_CONFIG.BUTTONS.MENU);
        this.setButtonDisabled(UI_CONFIG.BUTTONS.UNDO);
    }

    private createMenuButton(): void {
        const menuButtonStyle = UI_CONFIG.UiButtonStyle;
        this.menuButton = this.scene.add
            .dom(5, 5)
            .createElement("button", menuButtonStyle, "Menu");
        this.menuButton.setOrigin(0, 0);
        this.menuButton.setPerspective(800);
        this.menuButton.setVisible(false);
    }

    private createUndoButton(): void {
        const undoButtonStyle = UI_CONFIG.UiButtonStyle;
        undoButtonStyle["backgroundColor"] =
            UI_CONFIG.UiButtons["undo-active-button-color"];
        this.undoButton = this.scene.add
            .dom(Number.parseInt(undoButtonStyle.width) + 10, 5)
            .createElement("button", undoButtonStyle, "Undo");
        this.undoButton.setOrigin(0, 0);
        this.undoButton.setPerspective(800);
        this.undoButton.setVisible(false);
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
            this.wi / this.GOAL_REL_POS.x,
            this.he / this.GOAL_REL_POS.y,
            "",
            UI_CONFIG.uiGoalMessageStyle,
        );
        this.goalMessage.setOrigin(0.5, 0.5);
        this.goalMessage.setVisible(false);
        this.add(this.goalMessage);
    }

    private updateUiPosition(): void {
        this.refreshCoordinates();
        this.counter.setPosition(
            this.wi / this.COUNTER_REL_POS.x,
            this.he / this.COUNTER_REL_POS.y,
        );
        this.goalMessage.setPosition(
            this.wi / this.GOAL_REL_POS.x,
            this.he / this.GOAL_REL_POS.y,
        );

        if (this.newGameHtmlForm.visible)
            this.newGameHtmlForm.setPosition(this.wi / 2, this.he / 2);
        if (this.endGameHtmlForm.visible)
            this.endGameHtmlForm.setPosition(this.wi / 2, this.he / 2);
        if (this.settingsHtmlForm.visible)
            this.settingsHtmlForm.setPosition(this.wi / 2, this.he / 2);
    }
}
