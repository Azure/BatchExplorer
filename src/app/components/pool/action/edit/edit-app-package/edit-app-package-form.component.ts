import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Pool } from "app/models";

import { FormControl } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { NotificationService, SidebarRef } from "@batch-flask/ui";
import { PoolPatchDto } from "app/models/dtos";
import { NodeService, PoolService } from "app/services";
import { share, switchMap } from "rxjs/operators";
import "./edit-app-package-form.scss";

@Component({
    selector: "bl-edit-app-package-form",
    templateUrl: "edit-app-package-form.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAppPackageFormComponent {
    @Input() public set pool(pool: Pool) {
        this._pool = pool;
        this.appPackages.setValue([
            pool.applicationPackageReferences.toJS(),
        ]);
        this.changeDetector.markForCheck();
    }
    public get pool() { return this._pool; }

    public appPackages = new FormControl([]);

    private _pool: Pool;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
        private nodeService: NodeService,
        private poolService: PoolService,
        public sidebarRef: SidebarRef<any>) {

    }

    @autobind()
    public submit() {
        const packages = this.appPackages.value;
        const id = this._pool.id;
        return this.poolService.patch(id, new PoolPatchDto({
            applicationPackageReferences: packages,
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
            { name: "Reboot all", do: () => this.nodeService.rebootAll(this.pool.id) },
        ];

        this.notificationService.success("Updated", `Pool ${this.pool.id} start task was updated`, {
            persist: true,
            actions: actions,
        });
    }
}
