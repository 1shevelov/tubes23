import { NinePatch } from "@koreez/phaser3-ninepatch";
import { ButtonStateNames } from "../enums/ButtonStateNames";
import { UIService } from "../services/UIService";

export class ButtonState extends Phaser.GameObjects.Container {
    private bkg: NinePatch | Phaser.GameObjects.Sprite;
    private text?: Phaser.GameObjects.Text;
    private icon?: Phaser.GameObjects.Sprite;

    public constructor(public readonly scene: Phaser.Scene, config: StateConfig, public stateName: ButtonStateNames) {
        super(scene);
        this.initialize(config);
    }

    public getBounds(): Phaser.Geom.Rectangle {
        const { width, height } = this.bkg.getBounds();
        return new Phaser.Geom.Rectangle(0, 0, width, height);
    }

    public updateLabel(label: string | number): void {
        this.text?.setText(label.toString());
    }

    private initialize({ bkg, tint, icon, text }: StateConfig): void {
        this.setBkg(bkg, tint);
        icon && this.setIcon(icon);
        text && this.setText(text);
    }

    private setBkg(bkgConfig, tint): void {
        this.bkg =
            bkgConfig.width && bkgConfig.height
                ? UIService.makeNinePatch(this.scene, bkgConfig)
                : this.makeImageBkg(bkgConfig);
        tint && (this.bkg.tint = tint);
        this.add(this.bkg);
    }

    private makeImageBkg(config): Phaser.GameObjects.Sprite {
        const { x, y, texture, frame } = config;
        return this.scene.add.sprite(x, y, texture, frame);
    }

    private setIcon(iconConfig): void {
        const { x, y, frame, texture, scaleX = 1, scaleY = 1 } = iconConfig;
        this.icon = this.scene.add.sprite(x, y, texture, frame);
        this.icon.setScale(scaleX, scaleY);
        this.add(this.icon);
    }

    private setText(textConfig): void {
        const { x, y, text, style } = textConfig;
        this.text = this.scene.add.text(x, y, text, style);
        this.text.setOrigin(0.5, 0.5);
        this.add(this.text);
    }
}
