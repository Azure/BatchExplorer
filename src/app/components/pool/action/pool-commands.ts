import { Injectable, Injector } from "@angular/core";
import { ElectronRemote, FileSystemService } from "@batch-flask/electron";
import {
    COMMAND_LABEL_ICON, DialogService, EntityCommand, EntityCommands, Permission, SidebarManager,
} from "@batch-flask/ui";
import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { Pool } from "app/models";
import { JobService, PinnedEntityService, PoolService } from "app/services";
import { from } from "rxjs";
import { PoolCreateBasicDialogComponent } from "./add/pool-create-basic-dialog.component";
import { DeletePoolDialogComponent, DeletePoolOutput } from "./delete";
import { PoolResizeDialogComponent } from "./resize";

@Injectable()
export class PoolCommands extends EntityCommands<Pool> {
    public addJob: EntityCommand<Pool, void>;
    public resize: EntityCommand<Pool, void>;
    public clone: EntityCommand<Pool, void>;
    public delete: EntityCommand<Pool, DeletePoolOutput>;
    public exportAsJSON: EntityCommand<Pool, void>;
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
            {
                feature: "pool.action",
            },
        );
        this._buildCommands();
    }

    public get(poolId: string) {
        return this.poolService.get(poolId);
    }

    public getFromCache(poolId: string) {
        return this.poolService.getFromCache(poolId);
    }

    private _buildCommands() {
        this.addJob = this.simpleCommand({
            name: "add",
            ...COMMAND_LABEL_ICON.AddJob,
            action: (pool) => this._addJob(pool),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.resize = this.simpleCommand({
            name: "resize",
            ...COMMAND_LABEL_ICON.Resize,
            action: (pool) => this._resizePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.clone = this.simpleCommand({
            name: "clone",
            ...COMMAND_LABEL_ICON.Clone,
            action: (pool) => this._clonePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.delete = this.simpleCommand<DeletePoolOutput>({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (pool: Pool, options) => this._deletePool(pool, options),
            confirm: (entities) => this._confirmDeletePool(entities),
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            name: "exportAsJson",
            ...COMMAND_LABEL_ICON.ExportAsJSON,
            action: (pool) => this._exportAsJSON(pool),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            name: "pin",
            label: (pool: Pool) => {
                return this.pinnedEntityService.isFavorite(pool)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteLabel : COMMAND_LABEL_ICON.PinFavoriteLabel;
            },
            icon: (pool: Pool) => {
                return this.pinnedEntityService.isFavorite(pool)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteIcon : COMMAND_LABEL_ICON.PinFavoriteIcon;
            },
            action: (pool: Pool) => this._pinPool(pool),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.addJob,
            this.resize,
            this.clone,
            this.delete,
            this.exportAsJSON,
            this.pin,
        ];
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
            return from(this.fs.saveFile(localPath, content));
        }
    }

    private _pinPool(pool: Pool) {
        if (this.pinnedEntityService.isFavorite(pool)) {
            return this.pinnedEntityService.unPinFavorite(pool);
        } else {
            return this.pinnedEntityService.pinFavorite(pool);
        }
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
