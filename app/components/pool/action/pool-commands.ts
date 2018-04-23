import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands } from "@batch-flask/ui";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Pool } from "app/models";
import { PinnedEntityService, PoolService } from "app/services";
import { PoolResizeDialogComponent } from "./resize";

@Injectable()
export class PoolCommands extends EntityCommands<Pool> {
    public edit: EntityCommand<Pool, void>;
    public delete: EntityCommand<Pool, void>;
    public pin: EntityCommand<Pool, void>;

    constructor(
        injector: Injector,
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
        this.delete = this.simpleCommand({
            label: "Delete",
            action: (pool: Pool) => this.poolService.delete(pool.id),
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
}
