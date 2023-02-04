// import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
// import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import { Level } from "../components/Level";
import * as GAME from "../configs/GameConfig";
// import { download } from "../services/Utilities";

export default class MainScene extends Phaser.Scene {
    private gameView: GameView;
    private uiView: UIView;
    private foregroundView: ForegroundView;
    // private popupService: PopupService;
    private level: Level;
    private gameEvents: Phaser.Events.EventEmitter;

    private moveCounter = 0;

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
        this.gameEvents.on(GAME.EventTubesClicked, this.move, this);
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
        this.level.setRandomClassicLevel(6, 3);
        // this.level.setClassicTubes([[0, 1, 2], [3, 4, 5, 6], [7], []], 4);

        // this.gameView.drawRandomGenTubes(8, 4);
        // console.log(JSON.stringify(this.level.getTubes()));
        this.gameView.drawClassicTubes(this.level.getTubes());
        // download(this.level.getTubes(), "Tubes-random-classic" + );
    }

    private move(source: number, recipient: number): void {
        const moveResult = this.level.tryToMove(source, recipient);
        if (moveResult) {
            this.moveCounter++;
            if (this.level.isWonClassic()) {
                console.log(`You win! With ${this.moveCounter} moves`);
            }
        }
    }
}
