import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit,
} from "@angular/core";
import { ElectronShell } from "@batch-flask/electron";
import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { BatchAccount } from "app/models";
import { BatchQuotas, EMPTY_QUOTAS, QuotaService } from "app/services";
import { Constants } from "common";
import { Subscription } from "rxjs";

import "./account-quotas-card.scss";

@Component({
    selector: "bl-account-quotas-card",
    templateUrl: "account-quotas-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountQuotasCardComponent implements OnDestroy, OnInit {
    @Input() public account: BatchAccount;

    public bufferValue = 100;

    public quotas: BatchQuotas = EMPTY_QUOTAS;
    public use: BatchQuotas = EMPTY_QUOTAS;
    public loadingUse = true;

    private _quotaSub: Subscription;
    private _usageSub: Subscription;

    constructor(
        private quotaService: QuotaService,
        private changeDetector: ChangeDetectorRef,
        private contextMenuService: ContextMenuService,
        private shell: ElectronShell) {
        this._quotaSub = this.quotaService.quotas.subscribe((quotas) => {
            this.quotas = quotas;
            this.changeDetector.markForCheck();
        });

        this._usageSub = this.quotaService.usage.subscribe((quota) => {
            this.loadingUse = false;
            this.use = quota;
            this.changeDetector.markForCheck();
        });
    }
    public ngOnInit() {
        this.quotaService.updateUsages().subscribe();
    }

    public ngOnDestroy(): void {
        this._quotaSub.unsubscribe();
        this._usageSub.unsubscribe();
    }

    @HostListener("contextmenu")
    public showContextMenu() {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Refresh", () => this.quotaService.refresh().subscribe()),
            new ContextMenuItem("Request quota increase", () => this._gotoQuotaRequest()),
        ]));
    }

    private _gotoQuotaRequest() {
        this.shell.openExternal(Constants.ExternalLinks.supportRequest);
    }
}
