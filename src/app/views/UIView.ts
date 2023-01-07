import { CounterComponent } from "../components/CounterComponent";

export class UIView extends Phaser.GameObjects.Container {
    private counter: CounterComponent;

    public constructor(public scene) {
        super(scene);
        this.init();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private init(): void {}
}
