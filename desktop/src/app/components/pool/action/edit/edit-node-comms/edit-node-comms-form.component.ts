import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { I18nService, autobind } from "@batch-flask/core";
import { NotificationService, SidebarRef } from "@batch-flask/ui";
import { Pool } from "app/models";
import { BatchAccountService, PoolService } from "app/services";
import { UpdateNodeCommsAction } from "@batch/ui-react/lib/pool";
import { Subscription } from "rxjs";
import { of } from "rxjs";

@Component({
    selector: "bl-edit-node-comms-form",
    templateUrl: "edit-node-comms-form.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNodeCommsFormComponent implements OnDestroy {
    @Input()
    public set pool(pool: Pool) {
        this._pool = pool;
        if (this._accountArmId && pool.id) {
            // TODO: Should there be a way to push the initial state instead
            //       of pulling in via onInitialize? We already have the pool,
            //       and could convert it to a regular Javascript object with
            //       pool.toJS()
            this.action = new UpdateNodeCommsAction(this._accountArmId, pool.id);
        } else {
            this.action = undefined;
        }
        this.changeDetector.markForCheck();
    }
    public get pool() { return this._pool; }

    public action?: UpdateNodeCommsAction;

    private _subs: Subscription[] = [];
    private _pool: Pool;
    private _accountArmId: string;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
        private i18n: I18nService,
        private accountService: BatchAccountService,
        private poolService: PoolService,
        public sidebarRef: SidebarRef<any>) {
        this._subs.push(this.accountService.currentAccount.subscribe((account) => {
            this._accountArmId = account.id;
            changeDetector.markForCheck();
        }));
    }

    @autobind()
    public submit(error?: unknown) {
        if (error) {
            return of(error);
        }

        this._notifySuccess();

        // Refresh the pool
        return this.poolService.get(this._pool.id);
    }

    private _notifySuccess() {
        this.notificationService.success(
            this.i18n.t("common.updated"),
            this.i18n.t("edit-node-comms-form.updated", { poolId: this._pool.id }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }
}
