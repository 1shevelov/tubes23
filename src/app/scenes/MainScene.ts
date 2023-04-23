// import { IocContext } from "power-di";
// import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
// import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import { Level } from "../components/Level";
import * as GAME from "../configs/GameConfig";
import { fixValue, getRandomPositiveInt, getRandomSeed } from "../services/Utilities";
import * as FILES from "../services/Files";
import {
    EndGameClosedActions,
    GameEvents,
    UiEvents,
    ViewEvents,
} from "../configs/Events";
import { AoccPalette, FORMS, BUTTONS, MENU } from "../configs/UiConfig";

enum GameStates {
    NoGame,
    Game,
    GameBusy,
    GameFinished,
}

export default class MainScene extends Phaser.Scene {
    private SEEDED_RANDOM_LIB = require("seedrandom");

    private gameView: GameView;
    private uiView: UIView;
    private foregroundView: ForegroundView;
    // private popupService: PopupService;
    private level: Level;
    private gameEvents: Phaser.Events.EventEmitter;

    private gameState = GameStates.NoGame;

    private randomLevelSeed: string;
    private rng: () => number;

    private moveCounter = 0;

    private randomClassicLevelTubeNum: number;
    private randomClassicLevelTubeVol: number;

    private gameMode: FILES.GameModes = FILES.GameModes.ClassicRandom;
    private isWinningColor = GAME.ErrorValues.InvalidColorIndex;
    private isFogOfWar = false;

    private isMoveHelperEnabled = true;
    private isTubesLabelsEnabled = GAME.DEFAULT_TUBE_HOTKEY_LABEL_SHOW;

    private updateGameViewTimer: number;

    public constructor() {
        super({ key: SceneNames.Main });
    }

    //noinspection unused,JSUnusedLocalSymbols
    private init(): void {
        this.gameEvents = new Phaser.Events.EventEmitter();
        // this.initServices();
        this.initGameView();
        this.initUIView();
        this.initForegroundView();

        // if (process.env.NODE_ENV !== "production") {
        //     this.initStatJS();
        // }
        this.gameEvents.on(GameEvents.TwoTubesChoosen, this.move, this);
        this.gameEvents.on(GameEvents.SourceTubeChoosen, this.helperMove, this);

        this.setHotKeyHandlers();

        this.randomLevelSeed = getRandomSeed();
        this.rng = this.SEEDED_RANDOM_LIB(this.randomLevelSeed);
    }

    private initGameView(): void {
        this.gameView = new GameView(this, this.gameEvents);
        this.add.existing(this.gameView);
        // this.cameras.main.setRoundPixels(true);
        this.scale.on("resize", () => {
            if (this.gameState === GameStates.Game) {
                clearTimeout(this.updateGameViewTimer);
                this.updateGameViewTimer = window.setTimeout(() => {
                    this.gameView.reset();
                    this.gameView.createClassicGame(this.level.getTubes());
                    this.gameView.switchTubesLabels(this.isTubesLabelsEnabled);
                    // this.gameView.updateView();
                }, 200);
            }
        });
        this.gameEvents.on(ViewEvents.MoveAnimationStarted, (duration: number) => {
            this.gameState = GameStates.GameBusy;
            setTimeout(() => {
                this.gameState = GameStates.Game;
            }, duration);
        });
    }

    private initUIView(): void {
        this.uiView = new UIView(this);
        this.add.existing(this.uiView);

        const uiEvents = this.uiView.getUiEvents();
        uiEvents.on(UiEvents.ResetCalled, this.resetGame, this);
        uiEvents.on(UiEvents.ButtonUndoClicked, this.undoMove, this);
        uiEvents.on(UiEvents.NewGameSettingsSubmitted, this.initNewGame, this);
        uiEvents.on(UiEvents.EndGameClosed, (action: string) => {
            if (action === EndGameClosedActions.Replay) this.resetGame();
            else if (action === EndGameClosedActions.NewGame)
                this.uiView.showForm(FORMS.START);
            // else if (
            //     action === EndGameClosedActions.Close
            // ); // do nothing
            // else console.error(`Unknown End Game closed action: "${action}"`);
        });
        uiEvents.on(UiEvents.SettingsSubmitted, this.setSettings, this);
        uiEvents.on(UiEvents.ExportCalled, () => {
            if (this.gameState !== GameStates.NoGame) this.saveLevel();
        });
        uiEvents.on(UiEvents.AddTubeCalled, () => {
            if (this.gameState === GameStates.Game) this.addEmptyTube();
        });
        uiEvents.on(UiEvents.RemoveTubeCalled, () => {
            if (this.gameState === GameStates.Game) this.removeEmptyTube();
        });
    }

    private initForegroundView(): void {
        this.foregroundView = new ForegroundView(this);
        this.add.existing(this.foregroundView);

        // this.popupService.view = this.foregroundView;
    }

    // private initServices(): void {
    //     this.popupService = IocContext.DefaultInstance.get(PopupService);
    //     this.popupService.initialize();
    // }

    // private initStatJS(): void {
    //     const stats = new Stats();
    //     stats.showPanel(0);
    //     const update = (): void => {
    //         stats.begin();
    //         stats.end();
    //         requestAnimationFrame(update);
    //     };
    //     update();
    //     document.body.appendChild(stats.dom);
    // }

    private showNewGameForm(): void {
        this.gameState = GameStates.NoGame;
        this.uiView.hideGameUi();
        this.gameView.reset();
        this.uiView.showForm(FORMS.START);
    }

    private initNewGame(newGameObj: FormData): void {
        let tubesNum: number = GAME.ErrorValues.InvalidTubeIndex;
        let tubesVol: number = GAME.ErrorValues.InvalidTubeVolume;
        let gameFile: any;
        let gameFoW = "";
        for (const [key, value] of newGameObj) {
            // console.log(`${key}: ${value}`);
            if (key === "tubes_number") tubesNum = Number(value);
            if (key === "tubes_volume") tubesVol = Number(value);
            if (key === "game_mode") {
                switch (value.toString()) {
                    case "classic":
                        this.gameMode = FILES.GameModes.ClassicRandom;
                        break;
                    case "uno":
                        this.gameMode = FILES.GameModes.UnoClassicRandom;
                        break;
                    default:
                        console.error(
                            "Unknown game mode in New Game form: ",
                            this.gameMode,
                        );
                        console.warn("Setting game mode to Classic Random");
                        this.gameMode = FILES.GameModes.ClassicRandom;
                }
            }
            if (key === "load_file") gameFile = value;
            if (key === "fog_of_war") gameFoW = value.toString();
        }

        if (FILES.checkUploadedGameFile(gameFile)) {
            const fReader = new FileReader();
            fReader.readAsText(gameFile);
            let json = {};
            fReader.onload = (event) => {
                const str = (event.target ?? {}).result;
                try {
                    json = JSON.parse(str as string);
                    // console.log("result JSON: ", JSON.stringify(json));
                    this.loadGame(json);
                } catch (error) {
                    // console.error(error);
                    console.error(
                        "Error loading saved game JSON. LOAD another save or START a new game",
                    );
                    this.showNewGameForm();
                    // throw new Error(
                    //     "Error loading saved game JSON. LOAD another save or START a new game",
                    // );
                }
            };
            fReader.onerror = (error) => {
                console.error(error);
                console.error(
                    "Error loading saved game JSON. LOAD another save or START a new game",
                );
                this.showNewGameForm();
            };
        } else {
            // starting new game

            // Random (8-12)
            if (tubesNum === 0) tubesNum = getRandomPositiveInt(8, 12, this.rng);
            // Random (3-5)
            if (tubesVol === 0) tubesVol = getRandomPositiveInt(3, 5, this.rng);

            this.randomClassicLevelTubeNum = fixValue(
                tubesNum,
                GAME.MIN_TUBES,
                GAME.MAX_TUBES,
            );
            this.randomClassicLevelTubeVol = fixValue(
                tubesVol,
                GAME.MIN_VOLUME,
                GAME.MAX_VOLUME,
            );
            if (
                this.gameMode !== FILES.GameModes.ClassicRandom &&
                this.gameMode !== FILES.GameModes.UnoClassicRandom
            ) {
                console.error(
                    `Unknown game mode \"${this.gameMode}\", setting to \"classic\"`,
                );
                this.gameMode = FILES.GameModes.ClassicRandom;
            }
            this.isFogOfWar = gameFoW === "true";

            if (this.level) this.level.destroy();
            else this.level = new Level(this.gameEvents);
            this.level.setRandomClassicLevel(
                this.randomClassicLevelTubeNum,
                this.randomClassicLevelTubeVol,
                0, // enum Drains
                this.rng,
            );
            // this.level.setClassicTubes([[0, 1, 2], [3, 4, 5, 6], [7], []], 4);
            // console.log(JSON.stringify(this.level.getTubes()));
            this.startGame();
        }
    }

    private loadGame(gameObj: object): void {
        // console.log(JSON.stringify(gameObj));
        if (this.level) this.level.destroy();
        else this.level = new Level(this.gameEvents);

        // if randomly generated level
        this.rng = this.SEEDED_RANDOM_LIB(gameObj[FILES.SaveFile.Seed]);
        this.level.setRandomClassicLevel(
            gameObj[FILES.SaveFile.Tubes],
            gameObj[FILES.SaveFile.Volume],
            0, // enum Drains
            this.rng,
        );
        // TODO: load and set isFogOfWar

        this.gameMode = gameObj[FILES.SaveFile.Mode];
        if (gameObj[FILES.SaveFile.Fog]) this.isFogOfWar = true;
        else this.isFogOfWar = false;
        this.startGame();
    }

    private startGame(): void {
        this.gameView.reset();
        if (this.gameMode === FILES.GameModes.UnoClassicRandom) {
            this.isWinningColor = this.level.getTubes()[0]["content"][0];
            this.uiView.setUnoGoalMessage(AoccPalette[this.isWinningColor]);
            // console.log(this.isWinningColor);
        } else {
            this.isWinningColor = GAME.ErrorValues.InvalidColorIndex;
            this.uiView.setClassicGoalMessage();
        }

        this.gameView.isFogOfWar = this.isFogOfWar;
        // TODO check duplicate
        this.gameView.createClassicGame(this.level.getTubes());
        if (this.isFogOfWar && this.gameMode === FILES.GameModes.UnoClassicRandom)
            this.gameView.clearFogOnUnoColor(
                this.level.getAllOfColor(this.isWinningColor),
            );

        this.moveCounter = 0;
        this.uiView.setCounter(this.moveCounter);
        this.uiView.hideWin();
        this.uiView.setButtonDisabled(BUTTONS.UNDO);
        this.uiView.disableMenuItem(MENU.RESET);
        this.uiView.showGameUi();
        this.gameView.switchTubesLabels(this.isTubesLabelsEnabled);
        this.gameState = GameStates.Game;
    }

    private move(source: number, recipient: number): void {
        const moveResult = this.level.tryToMove(source, recipient);
        if (moveResult) this.countSuccessfulMove();
    }

    private helperMove(source: number): void {
        if (!this.isMoveHelperEnabled) return;

        const theOnlyRecipientTubeIndex = this.level.tryToHelperMove(source);
        if (theOnlyRecipientTubeIndex !== GAME.ErrorValues.InvalidTubeIndex) {
            this.gameView.helperMove(theOnlyRecipientTubeIndex);
            this.countSuccessfulMove();
        }
    }

    private addEmptyTube(): void {
        if (!this.level.addEmptyTube()) {
            console.error("Error while trying to add an empty tube");
            return;
        }
        this.gameView.reset();
        this.gameView.createClassicGame(this.level.getTubes());
        this.gameView.switchTubesLabels(this.isTubesLabelsEnabled);
    }

    private removeEmptyTube(): void {
        if (!this.level.removeEmptyTube()) {
            console.error("Error while trying to remove an empty tube");
            return;
        }
        this.gameView.reset();
        this.gameView.createClassicGame(this.level.getTubes());
        this.gameView.switchTubesLabels(this.isTubesLabelsEnabled);
    }

    private countSuccessfulMove(): void {
        this.moveCounter++;
        this.uiView.setCounter(this.moveCounter);
        if (this.moveCounter === 1) {
            this.uiView.setButtonActive(BUTTONS.UNDO);
            this.uiView.enableMenuItem(MENU.RESET);
        }
        if (this.isWinningColor === GAME.ErrorValues.InvalidColorIndex) {
            if (this.level.isWonClassic() && !this.gameView.areFoggedPortionsPresent())
                this.endGame();
        } else if (this.level.isWonOneColor(this.isWinningColor)) this.endGame();
    }

    private endGame(): void {
        this.gameState = GameStates.GameFinished;
        this.uiView.showWin();
        // TODO: sent status WIN/LOSE
        this.uiView.showForm(FORMS.END, { counter: this.moveCounter });
    }

    private saveLevel(): void {
        let saveGameMode: string;
        if (this.isWinningColor === GAME.ErrorValues.InvalidColorIndex)
            saveGameMode = FILES.GameModes.ClassicRandom; //"Classic Random";
        else saveGameMode = FILES.GameModes.UnoClassicRandom;

        if (GAME.SAVE_WITH_RANDOM_SEED) {
            const saveStruct = {
                [FILES.SaveFile.Mode]: saveGameMode,
                [FILES.SaveFile.Tubes]: this.randomClassicLevelTubeNum,
                [FILES.SaveFile.Volume]: this.randomClassicLevelTubeVol,
                [FILES.SaveFile.Seed]: this.randomLevelSeed,
            };
            if (this.isFogOfWar) saveStruct[FILES.SaveFile.Fog] = "true";
            FILES.download(
                saveStruct,
                `tubes-${saveGameMode}-${this.randomClassicLevelTubeNum}_${this.randomClassicLevelTubeVol}`,
            );
        } else {
            const tubes2Save = this.level.getTubes();
            const tubeNum = tubes2Save.length;
            const tubeVol = tubes2Save[0]["volume"];

            FILES.download(tubes2Save, `tubes-${saveGameMode}-${tubeNum}_${tubeVol}`);
        }
    }

    private resetGame(): void {
        if (this.moveCounter === 0) return;
        console.log("Level reset");
        this.level.reset();
        this.uiView.closeForms();
        this.startGame();
    }

    private undoMove(): void {
        if (
            this.moveCounter === 0 ||
            this.gameState === GameStates.GameBusy ||
            this.gameState == GameStates.GameFinished
        )
            return;
        const lastMove = this.level.undoMove();
        this.gameView.undoMove(lastMove);
        this.moveCounter--;
        if (this.moveCounter === 0) {
            this.uiView.setButtonDisabled(BUTTONS.UNDO);
            this.uiView.disableMenuItem(MENU.RESET);
        }
        this.uiView.setCounter(this.moveCounter);
        this.uiView.hideWin();
    }

    private setSettings(settingsData: FormData): void {
        let isMoveHelperEnabledOption = false;
        let isTubesLabelsEnabledOption = false;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [key, value] of settingsData) {
            // console.log(`${key}: ${value}`);
            if (key === "move_helper") isMoveHelperEnabledOption = true;
            if (key === "tubes_labels") isTubesLabelsEnabledOption = true;
        }
        // console.log(
        //     "Move helper changed: ",
        //     isMoveHelperEnabledOption !== this.isMoveHelperEnabled,
        // );
        this.isMoveHelperEnabled = isMoveHelperEnabledOption;
        this.isTubesLabelsEnabled = isTubesLabelsEnabledOption;
        this.gameView.switchTubesLabels(isTubesLabelsEnabledOption);
    }

    private setHotKeyHandlers(): void {
        this.input.keyboard.on("keydown", (event) => {
            switch (event.keyCode) {
                case Phaser.Input.Keyboard.KeyCodes.S: // settings
                    if (this.gameState == GameStates.Game)
                        this.uiView.showForm(FORMS.SETTINGS);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.X: // export
                    if (this.gameState !== GameStates.NoGame) this.saveLevel();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.R: // reset, restart, reload
                    if (this.gameState !== GameStates.NoGame) this.resetGame();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.U: // undo
                    if (this.gameState === GameStates.Game) this.undoMove();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.M: // menu
                    if (this.gameState === GameStates.Game)
                        this.uiView.showForm(FORMS.MENU);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.N: // new game
                case Phaser.Input.Keyboard.KeyCodes.L: // load
                    if (this.gameState !== GameStates.NoGame) this.showNewGameForm();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.PLUS:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD:
                    if (this.gameState === GameStates.Game) this.addEmptyTube();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.MINUS:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT:
                    if (this.gameState === GameStates.Game) this.removeEmptyTube();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.ONE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(0);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.TWO:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(1);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.THREE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(2);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.FOUR:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(3);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.FIVE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(4);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.SIX:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(5);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.SEVEN:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(6);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.EIGHT:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(7);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.NINE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(8);
                    break;
                // case Phaser.Input.Keyboard.KeyCodes.ZERO:
                // case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO:
                //     this.gameView.handleClick(9);
                //     break;
                case Phaser.Input.Keyboard.KeyCodes.A:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(9);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.B:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(10);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.C:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(11);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.D:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(12);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.E:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(13);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.F:
                    if (this.gameState === GameStates.Game) this.gameView.handleClick(14);
                    break;
            }
        });
    }
}
