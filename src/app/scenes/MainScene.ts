// import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
// import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import { Level } from "../components/Level";
import * as GAME from "../configs/GameConfig";
import {
    download,
    fixValue,
    getRandomSeed,
    getRandomPositiveInt,
    checkUploadedGameFile,
    // processGameSave,
} from "../services/Utilities";
import * as FILES from "../services/Files";
import { GameEvents, UiEvents } from "../configs/Events";
import { AoccPalette } from "../configs/UiConfig";

enum GameStates {
    NoGame,
    Game,
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

    private isWinningColor = GAME.ErrorValues.InvalidColorIndex;

    public constructor() {
        super({ key: SceneNames.Main });
    }

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
            this.gameView.reset();
            this.gameView.createClassicGame(this.level.getTubes());
        });
    }

    private initUIView(): void {
        this.uiView = new UIView(this);
        this.add.existing(this.uiView);

        const uiEvents = this.uiView.getUiEvents();
        uiEvents.on(UiEvents.ButtonRestartClicked, this.resetGame, this);
        uiEvents.on(UiEvents.ButtonUndoClicked, this.undoMove, this);
        uiEvents.on(UiEvents.NewGameSettingsSubmitted, this.initNewGame, this);
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

    private initStatJS(): void {
        const stats = new Stats();
        stats.showPanel(0);
        const update = (): void => {
            stats.begin();
            stats.end();
            requestAnimationFrame(update);
        };
        update();
        document.body.appendChild(stats.dom);
    }

    // private create(): void {
    //     this.startGame();
    //     this.uiView.showGameUi();
    //     this.gameState = GameStates.Game;
    // }

    private showNewGameForm(): void {
        this.gameState = GameStates.NoGame;
        this.uiView.hideGameUi();
        this.gameView.reset();
        this.uiView.showNewLevelForm();
    }

    private initNewGame(newGameObj: FormData): void {
        let tubesNum: number = GAME.ErrorValues.InvalidTubeIndex;
        let tubesVol: number = GAME.ErrorValues.InvalidTubeVolume;
        let gameMode = "";
        let gameFile: any;
        for (const [key, value] of newGameObj) {
            // console.log(`${key}: ${value}`);
            if (key === "tubes_number") tubesNum = Number(value);
            if (key === "tubes_volume") tubesVol = Number(value);
            if (key === "game_mode") gameMode = value.toString();
            if (key === "load_file") gameFile = value;
        }

        if (checkUploadedGameFile(gameFile)) {
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
                    console.error(error);
                    console.error(
                        "Error loading saved game JSON. LOAD another save or START a new game",
                    );
                    // throw new Error('Error occured: ', e);
                    this.showNewGameForm();
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
            if (gameMode !== "classic" && gameMode !== "uno") {
                console.error(
                    `Unknown game mode \"${gameMode}\", setting to \"classic\"`,
                );
                gameMode = "classic";
            }
            this.startGame(gameMode);
        }
    }

    private loadGame(gameObj: object): void {
        // console.log("Will try to init a game from this data a bit later");
        console.log(JSON.stringify(gameObj));
        this.level = new Level(this.gameEvents);

        // if randomly generated level
        this.rng = this.SEEDED_RANDOM_LIB(gameObj[FILES.SaveFile.Seed]);
        this.level.setRandomClassicLevel(
            gameObj[FILES.SaveFile.Tubes],
            gameObj[FILES.SaveFile.Volume],
            0, // enum Drains
            this.rng,
        );
        // setting winning color
        if (gameObj[FILES.SaveFile.Mode] === FILES.GameModes.UnoClassicRandom) {
            this.isWinningColor = this.level.getTubes()[0]["content"][0];
            this.uiView.setUnoGoalMessage(AoccPalette[this.isWinningColor]);
            // console.log(this.isWinningColor);
        } else {
            this.uiView.setClassicGoalMessage();
        }

        this.gameView.createClassicGame(this.level.getTubes());

        this.uiView.showGameUi();
        this.gameState = GameStates.Game;
    }

    private startGame(gameMode: string): void {
        this.level = new Level(this.gameEvents);
        this.level.setRandomClassicLevel(
            this.randomClassicLevelTubeNum,
            this.randomClassicLevelTubeVol,
            0, // enum Drains
            this.rng,
        );
        // this.level.setClassicTubes([[0, 1, 2], [3, 4, 5, 6], [7], []], 4);
        // console.log(JSON.stringify(this.level.getTubes()));

        // setting winning color
        if (gameMode === "uno") {
            this.isWinningColor = this.level.getTubes()[0]["content"][0];
            this.uiView.setUnoGoalMessage(AoccPalette[this.isWinningColor]);
            // console.log(this.isWinningColor);
        } else {
            this.uiView.setClassicGoalMessage();
        }

        this.gameView.createClassicGame(this.level.getTubes());

        this.uiView.showGameUi();
        this.gameState = GameStates.Game;
    }

    private move(source: number, recipient: number): void {
        const moveResult = this.level.tryToMove(source, recipient);
        if (moveResult) this.countSuccessfulMove();
    }

    private helperMove(source: number): void {
        const theOnlyRecipientTubeIndex = this.level.tryToHelperMove(source);
        if (theOnlyRecipientTubeIndex !== GAME.ErrorValues.InvalidTubeIndex) {
            this.gameView.helperMove(theOnlyRecipientTubeIndex);
            this.countSuccessfulMove();
        }
    }

    private addEmptyTube(): void {
        console.log("+1");
        if (!this.level.addEmptyTube()) {
            console.error("Error while trying to add an empty tube");
            return;
        }
        this.gameView.reset();
        this.gameView.createClassicGame(this.level.getTubes());
    }

    private removeEmptyTube(): void {
        console.log("-1");
        if (!this.level.removeEmptyTube()) {
            console.error("Error while trying to remove an empty tube");
            return;
        }
        this.gameView.reset();
        this.gameView.createClassicGame(this.level.getTubes());
    }

    private countSuccessfulMove(): void {
        this.moveCounter++;
        this.uiView.setCounter(this.moveCounter);
        if (this.isWinningColor === GAME.ErrorValues.InvalidColorIndex) {
            if (this.level.isWonClassic()) this.endGame(); // gather all colors to win
        } else if (this.level.isWonOneColor(this.isWinningColor)) this.endGame();
    }

    private endGame(): void {
        this.uiView.showWin();
        console.log(`You win in ${this.moveCounter} moves!`);
        console.log('Press "N" or reload to PLAY AGAIN');
        this.gameState = GameStates.GameFinished;
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
            download(
                saveStruct,
                `tubes-${saveGameMode}-${this.randomClassicLevelTubeNum}_${this.randomClassicLevelTubeVol}`,
            );
        } else {
            const tubes2Save = this.level.getTubes();
            const tubeNum = tubes2Save.length;
            const tubeVol = tubes2Save[0]["volume"];

            download(tubes2Save, `tubes-${saveGameMode}-${tubeNum}_${tubeVol}`);
        }
    }

    private resetGame(): void {
        if (this.moveCounter === 0) return;
        console.log("Level reset");
        this.level.reset();
        this.gameView.reset();
        this.gameView.createClassicGame(this.level.getTubes());
        this.moveCounter = 0;
        this.uiView.setCounter(this.moveCounter);
        this.uiView.hideWin();
    }

    private undoMove(): void {
        if (this.moveCounter === 0) return;
        // TODO: if gameState = win return;
        const lastMove = this.level.undoMove();
        this.gameView.undoMove(lastMove);
        this.moveCounter--;
        this.uiView.setCounter(this.moveCounter);
        this.uiView.hideWin();
    }

    private setHotKeyHandlers(): void {
        this.input.keyboard.on("keydown", (event) => {
            switch (event.keyCode) {
                case Phaser.Input.Keyboard.KeyCodes.S: // save
                case Phaser.Input.Keyboard.KeyCodes.X: // export
                    if (this.gameState === GameStates.NoGame) return;
                    this.saveLevel();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.R: // reset, restart, reload
                    if (this.gameState === GameStates.NoGame) return;
                    this.resetGame();
                    break;
                // case Phaser.Input.Keyboard.KeyCodes.L: // load
                //     if (this.gameState === GameStates.NoGame) return;
                //     console.log("loading not implemented");
                //     // this.level.load();
                //     // this.gameView.reset();
                //     // this.gameView.createClassicGame(this.level.getTubes());
                //     // this.moveCounter = 0;
                //     break;
                case Phaser.Input.Keyboard.KeyCodes.U: // undo
                    if (this.gameState === GameStates.NoGame) return;
                    this.undoMove();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.N: // new game
                    if (this.gameState === GameStates.NoGame) return;
                    this.showNewGameForm();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.PLUS:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD:
                    if (this.gameState !== GameStates.Game) return;
                    this.addEmptyTube();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.MINUS:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT:
                    if (this.gameState !== GameStates.Game) return;
                    this.removeEmptyTube();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.ONE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(0);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.TWO:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(1);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.THREE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(2);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.FOUR:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(3);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.FIVE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(4);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.SIX:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(5);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.SEVEN:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(6);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.EIGHT:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(7);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.NINE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(8);
                    break;
                // case Phaser.Input.Keyboard.KeyCodes.ZERO:
                // case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO:
                //     this.gameView.handleClick(9);
                //     break;
                case Phaser.Input.Keyboard.KeyCodes.A:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(9);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.B:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(10);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.C:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(11);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.D:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(12);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.E:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(13);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.F:
                    if (this.gameState !== GameStates.Game) return;
                    this.gameView.handleClick(14);
                    break;
            }
        });
    }
}
