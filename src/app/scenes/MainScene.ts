// import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
// import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import { Level } from "../components/Level";
import * as GAME from "../configs/GameConfig";
import { download, getRandomSeed } from "../services/Utilities";

export default class MainScene extends Phaser.Scene {
    private SEEDED_RANDOM_LIB = require("seedrandom");

    private gameView: GameView;
    private uiView: UIView;
    private foregroundView: ForegroundView;
    // private popupService: PopupService;
    private level: Level;
    private gameEvents: Phaser.Events.EventEmitter;

    private moveCounter = 0;
    private randomLevelSeed: string;
    private randomClassicLevelTubeNum: number;
    private randomClassicLevelTubeVol: number;

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
        this.gameEvents.on(GAME.Event2TubesChoosen, this.move, this);
        this.gameEvents.on(GAME.EventSourceTubeChoosen, this.helperMove, this);

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

    private create(): void {
        this.level = new Level(this.gameEvents);

        this.randomLevelSeed = getRandomSeed();
        const rng = this.SEEDED_RANDOM_LIB(this.randomLevelSeed);
        this.randomClassicLevelTubeNum = 6;
        this.randomClassicLevelTubeVol = 4;
        this.level.setRandomClassicLevel(
            this.randomClassicLevelTubeNum,
            this.randomClassicLevelTubeVol,
            rng,
        );
        // this.level.setClassicTubes([[0, 1, 2], [3, 4, 5, 6], [7], []], 4);

        // this.gameView.drawRandomGenTubes(8, 4);
        // console.log(JSON.stringify(this.level.getTubes()));
        this.gameView.createClassicGame(this.level.getTubes());
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
        if (this.level.isWonClassic()) {
            this.endGame();
        }
    }

    private endGame(): void {
        this.uiView.showWin();
        console.log(`You win in ${this.moveCounter} moves!`);
        console.warn("Reload the page to play again");
    }

    private saveLevel(): void {
        if (GAME.SAVE_WITH_RANDOM_SEED) {
            const saveStruct = {
                level: "Classic Random",
                tubes: this.randomClassicLevelTubeNum,
                volume: this.randomClassicLevelTubeVol,
                seed: this.randomLevelSeed,
            };
            download(
                saveStruct,
                `Tubes-random-classic-${this.randomClassicLevelTubeNum}_${this.randomClassicLevelTubeVol}`,
            );
        } else {
            const tubes2Save = this.level.getTubes();
            const tubeNum = tubes2Save.length;
            const tubeVol = tubes2Save[0]["volume"];
            download(tubes2Save, `Tubes-random-classic-${tubeNum}_${tubeVol}`);
        }
    }

    private resetLevel(): void {
        console.log("Level reset");
        this.level.reset();
        this.gameView.reset();
        this.gameView.createClassicGame(this.level.getTubes());
        this.moveCounter = 0;
        this.uiView.setCounter(this.moveCounter);
        this.uiView.hideWin();
    }

    private handleKeys(): void {
        this.input.keyboard.on("keydown", (event) => {
            switch (event.keyCode) {
                // save
                case Phaser.Input.Keyboard.KeyCodes.S: // save
                case Phaser.Input.Keyboard.KeyCodes.X: // export
                    this.saveLevel();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.R: // reset, restart, reload
                    this.resetLevel();
                    break;
                case Phaser.Input.Keyboard.KeyCodes.L: // load
                    console.log("loading not implemented");
                    // this.level.load();
                    // this.gameView.reset();
                    // this.gameView.createClassicGame(this.level.getTubes());
                    // this.moveCounter = 0;
                    break;
                case Phaser.Input.Keyboard.KeyCodes.ONE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE:
                    this.gameView.handleClick(0);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.TWO:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO:
                    this.gameView.handleClick(1);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.THREE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE:
                    this.gameView.handleClick(2);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.FOUR:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR:
                    this.gameView.handleClick(3);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.FIVE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE:
                    this.gameView.handleClick(4);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.SIX:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX:
                    this.gameView.handleClick(5);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.SEVEN:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN:
                    this.gameView.handleClick(6);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.EIGHT:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT:
                    this.gameView.handleClick(7);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.NINE:
                case Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE:
                    this.gameView.handleClick(8);
                    break;
                // case Phaser.Input.Keyboard.KeyCodes.ZERO:
                // case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO:
                //     this.gameView.handleClick(9);
                //     break;
                case Phaser.Input.Keyboard.KeyCodes.A:
                    this.gameView.handleClick(9);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.B:
                    this.gameView.handleClick(10);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.C:
                    this.gameView.handleClick(11);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.D:
                    this.gameView.handleClick(12);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.E:
                    this.gameView.handleClick(13);
                    break;
                case Phaser.Input.Keyboard.KeyCodes.F:
                    this.gameView.handleClick(14);
                    break;
            }
        });
    }
}
