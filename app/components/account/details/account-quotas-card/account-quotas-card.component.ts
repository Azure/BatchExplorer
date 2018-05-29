import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit,
} from "@angular/core";
import { ElectronShell } from "@batch-flask/ui";
import { Subscription } from "rxjs";

import { AccountResource, BatchQuotas } from "app/models";
import { QuotaService } from "app/services";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { Constants } from "common";
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
        this.quotaService.updateUsages();
    }

    public ngOnDestroy(): void {
        this._quotaSub.unsubscribe();
        this._usageSub.unsubscribe();
    }

    @HostListener("contextmenu")
    public showContextMenu() {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Refresh", () => this.quotaService.refresh()),
            new ContextMenuItem("Request quota increase", () => this._gotoQuotaRequest()),
        ]));
    }

    private _gotoQuotaRequest() {
        this.shell.openExternal(Constants.ExternalLinks.supportRequest);
    }
}
