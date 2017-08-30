import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Modes, NcjParameterWrapper } from "./market-application.model";
import "./side-menu.scss";

@Component({
    selector: "bl-side-menu",
    templateUrl: "side-menu.html",
})
export class SideMenuComponent {
    public static breadcrumb() {
        return { name: "Sidemenu" };
    }
    public Modes = Modes;
    @Input() public logo: string;
    @Input() public title: string;
    @Input() public action: string;
    @Input() public modeState: number;
    @Input() public form: FormGroup;
    @Input() public poolParametersWrapper: NcjParameterWrapper[];
    @Input() public jobParametersWrapper: NcjParameterWrapper[];

    public modeText: string[] = ["None", "Run job with auto pool",
    "Run job with existing pool", "Create pool for later use"];

    constructor() {
        // do nothing
    }

    public isJobComplete() {
        return this.form.controls.job.valid;
    }

    public isPoolComplete() {
        if (this.modeState === Modes.ExistingPoolAndJob) {
            return this.form.controls.poolpicker.valid;
        } else if (this.modeState === Modes.NewPool || this.modeState === Modes.NewPoolAndJob) {
            return this.form.controls.pool.valid;
        } else {
            return false;
        }
    }

    public isCostComplete() {
        return this.form.value.pool.numberNodes && this.form.value.pool.vmSize;
    }

}
