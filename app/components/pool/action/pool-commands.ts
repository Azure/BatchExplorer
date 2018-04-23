import { Injectable, Injector } from "@angular/core";
import { DialogService, EntityCommand, EntityCommands, SidebarManager } from "@batch-flask/ui";

import { Pool } from "app/models";
import { JobService, PinnedEntityService, PoolService } from "app/services";
import { DeletePoolDialogComponent, DeletePoolOutput } from "./delete";
import { PoolResizeDialogComponent } from "./resize";

@Injectable()
export class PoolCommands extends EntityCommands<Pool> {
    public edit: EntityCommand<Pool, void>;
    public delete: EntityCommand<Pool, DeletePoolOutput>;
    public pin: EntityCommand<Pool, void>;

    constructor(
        injector: Injector,
        private dialog: DialogService,
        private jobService: JobService,
        private poolService: PoolService,
        private pinnedEntityService: PinnedEntityService,
        private sidebarManager: SidebarManager) {
        super(
            injector,
            "Pool",
        );

        this._buildCommands();
    }

    public get(jobId: string) {
        return this.poolService.get(jobId);
    }

    public getFromCache(jobId: string) {
        return this.poolService.getFromCache(jobId);
    }

    private _buildCommands() {
        this.edit = this.simpleCommand({
            label: "Resize",
            action: (pool) => this._resizePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
        });
        this.delete = this.simpleCommand<DeletePoolOutput>({
            label: "Delete",
            action: (pool: Pool, options) => this._deletePool(pool, options),
            confirm: (entities) => this._confirmDeletePool(entities),
        });

        this.pin = this.simpleCommand({
            label: (pool: Pool) => {
                return this.pinnedEntityService.isFavorite(pool) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (pool: Pool) => this._pinPool(pool),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.edit,
            this.delete,
            this.pin,
        ];
    }

    private _resizePool(pool: Pool) {
        const sidebarRef = this.sidebarManager.open(`resize-pool-${pool.id}`, PoolResizeDialogComponent);
        sidebarRef.component.pool = pool;
        this.sidebarManager.onClosed.subscribe(() => {
            this.poolService.get(pool.id);
        });
    }

    private _pinPool(pool: Pool) {
        this.pinnedEntityService.pinFavorite(pool).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(pool);
            }
        });
    }

    private _confirmDeletePool(entities: Pool[]) {
        const dialogRef = this.dialog.open(DeletePoolDialogComponent);
        dialogRef.componentInstance.pools = entities;
        return dialogRef.componentInstance.onSubmit;
    }

    private _deletePool(pool: Pool, { deleteJob }: DeletePoolOutput) {
        if (deleteJob) {
            this.jobService.delete(pool.id).subscribe();
        }
        return this.poolService.delete(pool.id);
    }
}
