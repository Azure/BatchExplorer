import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { I18nService, autobind } from "@batch-flask/core";
import { NotificationService, SidebarRef } from "@batch-flask/ui";
import { Pool } from "app/models";
import { PoolPatchDto } from "app/models/dtos";
import { NodeService, PoolService } from "app/services";
import { share, switchMap } from "rxjs/operators";

import "./edit-certificate-references-form.scss";

@Component({
    selector: "bl-edit-certificate-references-form",
    templateUrl: "edit-certificate-references-form.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCertificateReferencesComponent {
    @Input() public set pool(pool: Pool) {
        this._pool = pool;
        this.references.setValue(pool.certificateReferences.toJS());
        this.changeDetector.markForCheck();
    }
    public get pool() { return this._pool; }

    public references = new FormControl([]);

    private _pool: Pool;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
        private nodeService: NodeService,
        private poolService: PoolService,
        private i18n: I18nService,
        public sidebarRef: SidebarRef<any>) {

    }

    @autobind()
    public submit() {
        const packages = this.references.value;
        const id = this._pool.id;
        return this.poolService.patch(id, new PoolPatchDto({
            certificateReferences: packages,
        })).pipe(
            switchMap(() => {
                this._notifySuccess();
                return this.poolService.get(id); // Refresh the pool
            }),
            share(),
        );
    }

    private _notifySuccess() {
        const actions = [
            { name:  this.i18n.t("common.rebootAll"), do: () => this.nodeService.rebootAll(this.pool.id) },
        ];

        this.notificationService.success(
            this.i18n.t("common.updated"),
            this.i18n.t("edit-certificate-references-form.updated", { poolId: this.pool.id }), {
                persist: true,
                actions: actions,
            });
    }
}
