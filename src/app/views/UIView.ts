// import { CounterComponent } from "../components/CounterComponent";
import { UIService } from "../services/UIService";
import * as COLORS from "../configs/Colors";

export class UIView extends Phaser.GameObjects.Container {
    // private counter: CounterComponent;
    private counter: Phaser.GameObjects.Text;

    private wi: number;
    private he: number;

    public constructor(public scene: Phaser.Scene) {
        super(scene);
        this.init();
        this.makeCounter();
    }

    public setCounter(newVal: number): void {
        this.counter.setText(newVal.toString());
    }

    private init(): void {
        const { width, height } = this.scene.scale.gameSize;
        this.wi = width;
        this.he = height;
    }

    private makeCounter(): void {
        this.counter = UIService.createText(
            this.scene,
            this.wi / 2,
            this.he / 10,
            "0",
            COLORS.uiCounterStyle,
        );
    }
}
