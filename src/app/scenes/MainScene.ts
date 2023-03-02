// import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
// import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import { Level } from "../components/Level";
import * as GAME from "../configs/GameConfig";
import { download, fixValue, getRandomSeed } from "../services/Utilities";
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

    private moveCounter = 0;
    private randomLevelSeed: string;
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

        this.handleKeys();
    }

    private initGameView(): void {
        this.gameView = new GameView(this, this.gameEvents);
        this.add.existing(this.gameView);
        // this.cameras.main.setRoundPixels(true);
    }

    private initUIView(): void {
        this.uiView = new UIView(this);
        this.add.existing(this.uiView);

        const uiEvents = this.uiView.getUiEvents();
        uiEvents.on(UiEvents.ButtonRestartClicked, this.resetLevel, this);
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

    // eslint-disable-next-line @typescript-eslint/ban-types
    private initNewGame(newGameObj: FormData): void {
        // console.log(...newGameObj);
        let tubesNum = 0;
        let tubesVol = 0;
        let gameMode = "";
        for (const [key, value] of newGameObj) {
            // console.log(`${key}: ${value}`);
            if (key === "tubes_number") tubesNum = Number(value);
            if (key === "tubes_volume") tubesVol = Number(value);
            if (key === "game_mode") gameMode = value.toString();
        }
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
            console.error(`Unknown game mode \"${gameMode}\", setting to \"classic\"`);
            gameMode = "classic";
        }
        this.startGame(gameMode);
    }

    private startGame(gameMode: string): void {
        this.level = new Level(this.gameEvents);

        this.randomLevelSeed = getRandomSeed();
        const rng = this.SEEDED_RANDOM_LIB(this.randomLevelSeed);
        this.level.setRandomClassicLevel(
            this.randomClassicLevelTubeNum,
            this.randomClassicLevelTubeVol,
            0, // enum Drains
            rng,
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
        console.warn("Reload the page to play again");
        this.gameState = GameStates.GameFinished;
    }

    private saveLevel(): void {
        let gameMode = "Classic Random";
        let gameModeFileName = "classic-random";
        if (this.isWinningColor !== GAME.ErrorValues.InvalidColorIndex) {
            gameMode = "Uno Classic Random";
            gameModeFileName = "uno-classic-random";
        }
        if (GAME.SAVE_WITH_RANDOM_SEED) {
            const saveStruct = {
                level: gameMode,
                tubes: this.randomClassicLevelTubeNum,
                volume: this.randomClassicLevelTubeVol,
                seed: this.randomLevelSeed,
            };
            download(
                saveStruct,
                `Tubes-${gameModeFileName}-${this.randomClassicLevelTubeNum}_${this.randomClassicLevelTubeVol}`,
            );
        } else {
            const tubes2Save = this.level.getTubes();
            const tubeNum = tubes2Save.length;
            const tubeVol = tubes2Save[0]["volume"];

            download(tubes2Save, `Tubes-${gameModeFileName}-${tubeNum}_${tubeVol}`);
        }
    }

    private resetLevel(): void {
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

    private handleKeys(): void {
        this.input.keyboard.on("keydown", (event) => {
            switch (event.keyCode) {
                case Phaser.Input.Keyboard.KeyCodes.S: // save
                case Phaser.Input.Keyboard.KeyCodes.X: // export
                    if (this.gameState === GameStates.NoGame) return;
                    this.saveLevel();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.R: // reset, restart, reload
                    if (this.gameState === GameStates.NoGame) return;
                    this.resetLevel();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.L: // load
                    if (this.gameState === GameStates.NoGame) return;
                    console.log("loading not implemented");
                    // this.level.load();
                    // this.gameView.reset();
                    // this.gameView.createClassicGame(this.level.getTubes());
                    // this.moveCounter = 0;
                    break;
                case Phaser.Input.Keyboard.KeyCodes.U: // undo
                    if (this.gameState === GameStates.NoGame) return;
                    this.undoMove();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.N: // new game
                    if (this.gameState === GameStates.NoGame) return;
                    this.gameState = GameStates.NoGame;
                    this.uiView.hideGameUi();
                    this.uiView.showNewLevelForm();
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
