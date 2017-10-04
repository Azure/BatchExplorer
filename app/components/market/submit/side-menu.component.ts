import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NcjPoolTemplate, ServerError } from "app/models";
import { PricingService, PythonRpcService } from "app/services";
import { NumberUtils } from "app/utils";
import { Subscription } from "rxjs/Subscription";
import { Modes, NcjParameterWrapper } from "./market-application.model";
import "./side-menu.scss";

@Component({
    selector: "bl-side-menu",
    templateUrl: "side-menu.html",
})
export class SideMenuComponent implements OnChanges, OnDestroy {
    public static breadcrumb() {
        return { name: "Sidemenu" };
    }
    public Modes = Modes;
    public estimatedCost = "n/a";
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
    private _subs: Subscription[] = [];

    constructor(private pricingService: PricingService,
                private pythonRpcService: PythonRpcService) {
        // do nothing
    }

    public ngOnChanges(changes) {
        if (changes.form) {
            this._subs.push(this.form.valueChanges.subscribe((value) => {
                this._updateEstimatedPrice();
            }));
        }
    }

    public ngOnDestroy(): void {
        this._subs.forEach(x => x.unsubscribe());
    }

    public isJobComplete() {
        return this.form.controls.job.valid;
    }

    public isPoolComplete() {
        if (this.modeState === Modes.ExistingPoolAndJob) {
            return this.form.controls.poolpicker.valid;
        } else if (this.modeState === Modes.NewPoolAndJob || this.modeState === Modes.NewPool) {
            return this.form.controls.pool.valid;
        } else {
            return false;
        }
    }

    private _updateEstimatedPrice() {
        if (this.isPoolComplete()) {
            this.error = null;
            const obs = this.pythonRpcService.callWithAuth("expand-ncj-pool", [this.poolTemplate, this.form.value.pool])
                .cascade((data) => {
                    if (data.vmSize) {
                        data.vmSize = data.vmSize.toLowerCase();
                        this.pricingService.computePoolPrice(data as any, { target: true }).subscribe((cost) => {
                            if (cost) {
                                this.estimatedCost = `${cost.unit} $${NumberUtils.pretty(cost.total)} / hour`;
                            } else {
                                this.estimatedCost = "n/a";
                            }
                        });
                    }
            });
            if (obs) {
                obs.subscribe({
                    error: (err) => this.error = ServerError.fromPython(err),
                });
            }
        } else {
            this.estimatedCost = "n/a";
        }
    }
}
