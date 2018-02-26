import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { AccountResource, BatchQuotas } from "app/models";
import { QuotaService } from "app/services";

import "./account-quotas-card.scss";


@Component({
    selector: "bl-account-quotas-card",
    templateUrl: "account-quotas-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountQuotasCardComponent implements OnDestroy, OnInit {
    @Input() public account: AccountResource;

    public bufferValue = 100;

    public quotas: BatchQuotas = new BatchQuotas();
    public use: BatchQuotas = new BatchQuotas();
    public loadingUse = true;

    private _quotaSub: Subscription;

    constructor(private quotaService: QuotaService, private changeDetector: ChangeDetectorRef) {
        this._quotaSub = this.quotaService.quotas.subscribe((quotas) => {
            this.quotas = quotas;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.quotaService.getUsage().subscribe((quota) => {
            this.loadingUse = false;
            this.use = quota;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        this._quotaSub.unsubscribe();
    }
}
