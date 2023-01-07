export class CounterComponent extends Phaser.GameObjects.Container {
    private bkg: Phaser.GameObjects.Sprite;
    private label: Phaser.GameObjects.Text;
    private rounds = 0;

    public constructor(scene) {
        super(scene);
        this.init();
    }

    public updateRounds(): void {
        this.label.setText(`Laps: ${++this.rounds}`);
    }

    private init(): void {
        this.initBkg();
        this.initLabel();
    }

    private initBkg(): void {
        this.bkg = this.scene.add.sprite(0, 0, "game-ui", "counter-bkg.png");
        this.add(this.bkg);
    }

    private initLabel(): void {
        this.label = this.scene.add.text(-170, -5, `Laps: ${this.rounds}`, {
            fontSize: "40px",
        });
        this.label.setOrigin(0, 0.5);
        this.add(this.label);
    }
}
