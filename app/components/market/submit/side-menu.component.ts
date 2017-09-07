import { Component, Input, OnChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NcjPoolTemplate, ServerError } from "app/models";
import { PricingService, PythonRpcService } from "app/services";
import { NumberUtils } from "app/utils";
import { Modes, NcjParameterWrapper } from "./market-application.model";
import "./side-menu.scss";

@Component({
    selector: "bl-side-menu",
    templateUrl: "side-menu.html",
})
export class SideMenuComponent implements OnChanges {
    public static breadcrumb() {
        return { name: "Sidemenu" };
    }
    public Modes = Modes;
    public estimatedCost = "-";
    public modeText: string[] = ["None", "Run job with auto pool",
        "Run job with existing pool", "Create pool for later use"];
    public error: ServerError;
    @Input() public logo: string;
    @Input() public title: string;
    @Input() public action: string;
    @Input() public modeState: number;
    @Input() public form: FormGroup;
    @Input() public poolParametersWrapper: NcjParameterWrapper[];
    @Input() public jobParametersWrapper: NcjParameterWrapper[];
    @Input() public poolTemplate: NcjPoolTemplate;

    constructor(private pricingService: PricingService,
                private pythonRpcService: PythonRpcService) {
        // do nothing
    }

    public ngOnChanges(changes) {
        if (changes.form) {
            this.form.valueChanges.subscribe((value) => {
                this._updateEstimatedPrice();
            });
        }
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

    // asserts numberNodes and vmSize is present as parameters in the pool form
    public isCostComplete() {
        return this.form.value.pool.numberNodes && this.form.value.pool.vmSize;
    }

    private _updateEstimatedPrice() {
        if (this.isPoolComplete() && this.isCostComplete()) {
            this.error = null;
            const obs = this.pythonRpcService.callWithAuth("expand-ncj-pool", [this.poolTemplate, this.form.value.pool])
                .cascade((data) => {
                    if (data.vmSize) {
                        data.vmSize = data.vmSize.toLowerCase();
                        this.pricingService.computePoolPrice(data as any, { target: true }).subscribe((cost) => {
                            if (cost) {
                                this.estimatedCost = `${cost.unit} $${NumberUtils.pretty(cost.total)} / hour`;
                            } else {
                                this.estimatedCost = "-";
                            }
                        });
                    }
            });
            if (obs) {
                obs.subscribe({
                    error: (err) => this.error = ServerError.fromPython(err),
                });
            }
        }
    }
}
