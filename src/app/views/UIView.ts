// import { CounterComponent } from "../components/CounterComponent";
import { UIService } from "../services/UIService";

export class UIView extends Phaser.GameObjects.Container {
    // private counter: CounterComponent;
    private counter: Phaser.GameObjects.Text;

    private wi: number;
    private he: number;

    public constructor(public scene) {
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
        const counterStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: "36px",
            align: "center",
        };
        this.counter = UIService.createText(
            this.scene,
            this.wi / 2,
            this.he / 10,
            "0",
            counterStyle,
        );
    }
}
