import { ButtonEvents } from "../enums/ButtonEvents";
import { ButtonStateNames } from "../enums/ButtonStateNames";
import { ButtonState } from "./ButtonState";

export abstract class ButtonBase extends Phaser.GameObjects.Container {
    protected states: {
        up: ButtonState;
        over?: ButtonState;
        down?: ButtonState;
        disabled?: ButtonState;
    };
    protected isInteractive: boolean;
    protected activeState: ButtonStateNames;

    public constructor(public readonly scene, { states, hitArea }: ButtonConfig) {
        super(scene);
        this.createStates(states);
        this.initHitArea(hitArea);
    }

    public get isDisabled(): boolean {
        return this.activeState === ButtonStateNames.Disabled;
    }

    public getBounds(): Phaser.Geom.Rectangle {
        if (!this.isDisabled) {
            return this.states.up.getBounds();
        }
        return this.states.disabled ? this.states.disabled.getBounds() : this.states.up.getBounds();
    }

    public updateLabel(label: string | number): void {
        // changes label ON ALL STATES
        Object.keys(this.states).forEach((el) => {
            this.states[el]?.updateLabel(label);
        });
    }

    public setInteractivity(value: boolean, disableVisually = false): void {
        // DisableVisually still keeps pointerUp event. But the btn looks disabled
        // Applies only if the btn is being disabled
        if (this.isInteractive === value) return;
        this.isInteractive = value;
        if (value) {
            this.enableInputs();
            this.setActiveState(ButtonStateNames.Up);
        } else {
            this.disableInputs(disableVisually);
            this.states.disabled && this.setActiveState(ButtonStateNames.Disabled);
        }
    }

    protected initState(_config: any, _stateName: ButtonStateNames): void {
        throw new Error("implement initState function in the class");
    }

    protected setActiveState(stateName: ButtonStateNames): void {
        if (this.activeState === stateName) return;
        this.activeState = stateName;
        Object.keys(this.states).forEach((el) => {
            if (this.states[el]?.stateName === stateName) {
                this.states[el].visible = true;
            } else if (this.states[el] && this.states[el].stateName !== stateName) {
                this.states[el].visible = false;
            }
        });
    }

    private createStates(statesConfig: any): any {
        const { up, over, down, disabled } = statesConfig;
        this.states = {
            up: up && this.initState(up, ButtonStateNames.Up),
            over: over && this.initState(over, ButtonStateNames.Over),
            down: down && this.initState(down, ButtonStateNames.Down),
            disabled: disabled && this.initState(disabled, ButtonStateNames.Disabled),
        };
        this.setButtonSize();
        this.setActiveState(ButtonStateNames.Up);
        this.isInteractive = true;
    }

    private initHitArea(hitArea: ButtonHitAreaConfig | undefined): void {
        const shape = hitArea?.area || this.states.up.getBounds();
        const hitAreaCallback = hitArea?.callback || Phaser.Geom.Rectangle.Contains;
        this.setInteractive({ hitArea: shape, hitAreaCallback, cursor: "pointer" });
        this.enableInputs();
    }

    private enableInputs(): void {
        this.disableInputs();
        this.on(Phaser.Input.Events.POINTER_UP, this.onPointerUpActions, this);
        this.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDownActions, this);
        this.on(Phaser.Input.Events.POINTER_OVER, this.onPointerOverActions, this);
        this.on(Phaser.Input.Events.POINTER_OUT, this.onPointerOutActions, this);
    }

    private disableInputs(disableOnlyVisually = false): void {
        !disableOnlyVisually && this.off(Phaser.Input.Events.POINTER_UP, this.onPointerUpActions, this);
        this.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDownActions, this);
        this.off(Phaser.Input.Events.POINTER_OVER, this.onPointerOverActions, this);
        this.off(Phaser.Input.Events.POINTER_OUT, this.onPointerOutActions, this);
    }

    private onPointerUpActions(): void {
        this.emit(ButtonEvents.Up);
        !this.isDisabled && this.setActiveState(ButtonStateNames.Up);
    }

    private onPointerDownActions(): void {
        this.emit(ButtonEvents.Down);
        this.setActiveState(ButtonStateNames.Down);
    }

    private onPointerOverActions(): void {
        this.emit(ButtonEvents.Over);
        this.setActiveState(ButtonStateNames.Over);
    }

    private onPointerOutActions(): void {
        this.setActiveState(ButtonStateNames.Up);
        this.emit(ButtonEvents.Out);
    }

    private setButtonSize(): void {
        const { width, height } = this.getBounds();
        this.setSize(width, height);
    }
}
