import { Injectable, Injector } from "@angular/core";
import {
    DialogService, ElectronRemote, EntityCommand,
    EntityCommandType, EntityCommands, SidebarManager,
} from "@batch-flask/ui";
import { Observable } from "rxjs/Observable";

import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { Pool } from "app/models";
import { FileSystemService, JobService, PinnedEntityService, PoolService } from "app/services";
import { PoolCreateBasicDialogComponent } from "./add/pool-create-basic-dialog.component";
import { DeletePoolDialogComponent, DeletePoolOutput } from "./delete";
import { PoolResizeDialogComponent } from "./resize";

@Injectable()
export class PoolCommands extends EntityCommands<Pool> {
    public refresh: EntityCommand<Pool, void>;
    public addJob: EntityCommand<Pool, void>;
    public resize: EntityCommand<Pool, void>;
    public clone: EntityCommand<Pool, void>;
    public delete: EntityCommand<Pool, DeletePoolOutput>;
    public exportAsJson: EntityCommand<Pool, void>;
    public pin: EntityCommand<Pool, void>;

    constructor(
        injector: Injector,
        private dialog: DialogService,
        private fs: FileSystemService,
        private jobService: JobService,
        private poolService: PoolService,
        private pinnedEntityService: PinnedEntityService,
        private remote: ElectronRemote,
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
        this.refresh = this.simpleCommand({
            label: "Refresh",
            action: (pool) => this._refreshPool(),
            multiple: false,
            confirm: false,
            notify: false,
            type: EntityCommandType.Refresh,
        });

        this.addJob = this.simpleCommand({
            label: "Add job",
            action: (pool) => this._addJob(pool),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.resize = this.simpleCommand({
            label: "Resize",
            action: (pool) => this._resizePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.clone = this.simpleCommand({
            label: "Clone",
            action: (pool) => this._clonePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.delete = this.simpleCommand<DeletePoolOutput>({
            label: "Delete",
            action: (pool: Pool, options) => this._deletePool(pool, options),
            confirm: (entities) => this._confirmDeletePool(entities),
        });

        this.exportAsJson = this.simpleCommand({
            label: "Export as JSON",
            action: (pool) => this._exportAsJSON(pool),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            label: (pool: Pool) => {
                return this.pinnedEntityService.isFavorite(pool) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (pool: Pool) => this._pinPool(pool),
            confirm: false,
            multiple: false,
        });
        const commonCommands = [
            this.addJob,
            this.resize,
            this.clone,
            this.delete,
            this.exportAsJson,
        ];

        this.commands = [
            ...commonCommands,
            this.pin,
        ];

        this.buttonCommands = [
            this.refresh,
            ...commonCommands,
        ];
    }

    private _refreshPool() {
        return this.poolService.view().refresh();
    }

    private _addJob(pool: Pool) {
        const createRef = this.sidebarManager.open("add-job", JobCreateBasicDialogComponent);
        createRef.component.preSelectPool(pool.id);
    }

    private _resizePool(pool: Pool) {
        const sidebarRef = this.sidebarManager.open(`resize-pool-${pool.id}`, PoolResizeDialogComponent);
        sidebarRef.component.pool = pool;
        this.sidebarManager.onClosed.subscribe(() => {
            this.poolService.get(pool.id);
        });
    }

    private _clonePool(pool: Pool) {
        const ref = this.sidebarManager.open(`add-pool-${pool.id}`, PoolCreateBasicDialogComponent);
        ref.component.setValueFromEntity(pool);
    }

    private _exportAsJSON(pool: Pool) {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Export",
            defaultPath: `${pool.id}.json`,
        });

        if (localPath) {
            const content = JSON.stringify(pool._original, null, 2);
            return Observable.fromPromise(this.fs.saveFile(localPath, content));
        }
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
