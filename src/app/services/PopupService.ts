import { injectable } from "power-di";
import { ForegroundView } from "../views/ForegroundView";
import EventEmitter = Phaser.Events.EventEmitter;

@injectable()
export class PopupService {
    public event$: EventEmitter;
    public view: ForegroundView;
    private popups: Phaser.GameObjects.Container[];

    public initialize(): void {
        this.popups = [];
        this.event$ = new EventEmitter();
        this.attachEvents();
    }

    // public showCounterPopup(): void {
    //     this.view.showCounterPopup();
    // }

    private attachEvents(): void {
        //
    }
}
