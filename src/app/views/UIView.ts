// import { CounterComponent } from "../components/CounterComponent";
import { UIService } from "../services/UIService";
import * as COLORS from "../configs/Colors";
// import * as GAME from "../configs/GameConfig";

interface XY {
    x: number;
    y: number;
}

export class UIView extends Phaser.GameObjects.Container {
    // private counter: CounterComponent;
    private counter: Phaser.GameObjects.Text;
    private winMessage: Phaser.GameObjects.Text;
    private buttonRestart: Phaser.GameObjects.Container;
    private buttonUndo: Phaser.GameObjects.Container;

    private newLevelPopup: Phaser.GameObjects.Container;
    // private dropDownDom:

    private wi: number;
    private he: number;

    private uiEvents: Phaser.Events.EventEmitter;

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();
        this.makeCounter();
        this.makeWinMessage();
        this.makeButtons();
        this.makeNewLevelPopup();
        // this.makeNewLevelForm();
    }

    public getUiEvents(): Phaser.Events.EventEmitter {
        return this.uiEvents;
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

    public showNewLevelPopup(): void {
        this.newLevelPopup.setVisible(true);
    }

    // public hideNewLevelPopup(): void {
    //     this.newLevelPopup.setVisible(false);
    // }

    private init(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.wi = width;
        this.he = height;

        this.uiEvents = new Phaser.Events.EventEmitter();
    }

    private makeNewLevelForm(): void {
        const element = this.scene.add.dom(400, 600).createFromCache("NewGameForm");
        element.setPerspective(800);
        element.addListener("click");
        element.on("click", (event) => {
            if (event.target.name === "StartButton") {
                const inputUsername = element.getChildByName("username");
                const inputPassword = element.getChildByName("password");

                //  Have they entered anything?
                if (inputUsername["value"] !== "" && inputPassword["value"] !== "") {
                    //  Turn off the click events
                    this.removeListener("click");

                    //  Tween the login form out
                    this.scene.tweens.add({
                        targets: element.rotate3d,
                        x: 1,
                        w: 90,
                        duration: 3000,
                        ease: "Power3",
                    });

                    this.scene.tweens.add({
                        targets: element,
                        scaleX: 2,
                        scaleY: 2,
                        y: 700,
                        duration: 3000,
                        ease: "Power3",
                        onComplete: () => {
                            element.setVisible(false);
                        },
                    });

                    //  Populate the text with whatever they typed in as the username!
                    // text.setText("Welcome " + inputUsername["value"]);
                    console.log("Welcome " + inputUsername["value"]);
                } else {
                    //  Flash the prompt
                    // this.scene.tweens.add({
                    //     targets: text,
                    //     alpha: 0.1,
                    //     duration: 200,
                    //     ease: "Power3",
                    //     yoyo: true,
                    // });
                    console.log("Fill the form!");
                }
            }
        });

        this.scene.tweens.add({
            targets: element,
            y: 300,
            duration: 3000,
            ease: "Power3",
        });
    }

    private makeNewLevelPopup(): void {
        const popupWidth = this.wi * 0.8;
        const popupHeight = this.he * 0.8;
        this.newLevelPopup = new Phaser.GameObjects.Container(
            this.scene,
            this.wi / 2,
            this.he / 2,
        );

        const back = new Phaser.GameObjects.Rectangle(
            this.scene,
            0, //this.newLevelPopup.x - popupWidth / 2,
            0, //this.newLevelPopup.y - popupHeight / 2,
            popupWidth,
            popupHeight,
            0x111b11,
            1.0,
        );
        back.setStrokeStyle(1.5, 0x99ff99, 1.0);
        this.newLevelPopup.add(back);

        const title = UIService.createText(
            this.scene,
            0,
            -popupHeight / 2 + this.he / 20,
            "New game",
            COLORS.uiWinMessageStyle,
        );
        this.newLevelPopup.add(title);

        const startButton = this.makeButton(
            "GO",
            { x: 0, y: this.he / 8 },
            { x: 120, y: 70 },
        );
        startButton.setInteractive();
        startButton.on("pointerup", () => this.newLevelPopup.setVisible(false));
        this.newLevelPopup.add(startButton);

        this.makeLevelSizeDropdown(this.newLevelPopup, popupHeight);

        this.newLevelPopup.setVisible(false);
        this.add(this.newLevelPopup);
    }

    private makeLevelSizeDropdown(
        parentCont: Phaser.GameObjects.Container,
        parentContHeight: number,
    ): void {
        const dropDown = this.scene.add
            .dom(0, -parentContHeight / 3)
            .createFromCache("TubesNumDropdown");
        // dropDown.setVisible(false);
        dropDown.addListener("click");
        dropDown.on("click", function (event) {
            if (event.target.name === "tubes-number") {
                console.log("Tubes number clicked!");
            } else {
                console.log("Something else clicked: ", event.target);
            }
        });
        parentCont.add(dropDown);
    }

    private makeCounter(): void {
        this.counter = UIService.createText(
            this.scene,
            this.wi / 1.08,
            this.he / 15,
            "0",
            COLORS.uiCounterStyle,
        );
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
            COLORS.uiButtonLabelStyle,
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
            this.uiEvents.emit("ButtonRestartClicked"),
        );
        this.add(this.buttonRestart);

        // console.log(this.wi / 2, this.he);
        this.buttonUndo = this.makeButton(
            "(U)ndo",
            { x: this.wi * 0.25, y: buttonHeight / 3 },
            { x: buttonWidth, y: buttonHeight },
        );
        // this.buttonUndo.setVisible(true);
        this.buttonUndo.on("pointerup", () => this.uiEvents.emit("ButtonUndoClicked"));
        this.add(this.buttonUndo);
    }

    private makeWinMessage(): void {
        this.winMessage = UIService.createText(
            this.scene,
            this.wi / 1.03,
            this.counter.y + this.he / 20,
            "YOU WIN!",
            COLORS.uiWinMessageStyle,
        );
        this.winMessage.setOrigin(1, 0.5);
        this.winMessage.setVisible(false);
        this.winMessage.setAlpha(0.0);
        this.add(this.winMessage);
    }
}
