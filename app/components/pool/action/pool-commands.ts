import { Injectable, Injector, OnDestroy } from "@angular/core";
import {
    COMMAND_LABEL_ICON, DialogService, ElectronRemote,
    EntityCommand, EntityCommands, Permission, SidebarManager, WorkspaceService,
} from "@batch-flask/ui";
import { Observable, Subscription } from "rxjs";

import { JobCreateBasicDialogComponent } from "app/components/job/action";

import { Pool } from "app/models";
import { FileSystemService, JobService, PinnedEntityService, PoolService } from "app/services";
import { PoolCreateBasicDialogComponent } from "./add/pool-create-basic-dialog.component";
import { DeletePoolDialogComponent, DeletePoolOutput } from "./delete";
import { PoolResizeDialogComponent } from "./resize";

@Injectable()
export class PoolCommands extends EntityCommands<Pool> implements OnDestroy {
    public addJob: EntityCommand<Pool, void>;
    public resize: EntityCommand<Pool, void>;
    public clone: EntityCommand<Pool, void>;
    public delete: EntityCommand<Pool, DeletePoolOutput>;
    public exportAsJSON: EntityCommand<Pool, void>;
    public pin: EntityCommand<Pool, void>;

    private _sub: Subscription;
    private _cloneVisible: boolean = true;
    private _exportVisible: boolean = true;
    private _pinVisible: boolean = true;

    constructor(
        injector: Injector,
        private dialog: DialogService,
        private fs: FileSystemService,
        private jobService: JobService,
        private poolService: PoolService,
        private pinnedEntityService: PinnedEntityService,
        private remote: ElectronRemote,
        private sidebarManager: SidebarManager,
        private workspaceService: WorkspaceService) {

        super(
            injector,
            "Pool",
            // Implementing the below hides all action buttons, not just export, clone and pin
            // {
            //     feature: "pool.action",
            // },
        );
        this._buildCommands();
        this._sub = this.workspaceService.currentWorkspace.subscribe((ws) => {
            this._cloneVisible = ws.isFeatureEnabled("pool.action.clone");
            this._exportVisible = ws.isFeatureEnabled("pool.action.export");
            this._pinVisible = ws.isFeatureEnabled("pool.action.pin");
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public get(poolId: string) {
        return this.poolService.get(poolId);
    }

    public getFromCache(poolId: string) {
        return this.poolService.getFromCache(poolId);
    }

    private _buildCommands() {
        this.addJob = this.simpleCommand({
            ...COMMAND_LABEL_ICON.AddJob,
            action: (pool) => this._addJob(pool),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.resize = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Resize,
            action: (pool) => this._resizePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.clone = this.simpleCommand({
            ...COMMAND_LABEL_ICON.Clone,
            action: (pool) => this._clonePool(pool),
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
            visible: () => this._cloneVisible,
        });

        this.delete = this.simpleCommand<DeletePoolOutput>({
            ...COMMAND_LABEL_ICON.Delete,
            action: (pool: Pool, options) => this._deletePool(pool, options),
            confirm: (entities) => this._confirmDeletePool(entities),
            permission: Permission.Write,
        });

        this.exportAsJSON = this.simpleCommand({
            ...COMMAND_LABEL_ICON.ExportAsJSON,
            action: (pool) => this._exportAsJSON(pool),
            multiple: false,
            confirm: false,
            notify: false,
            visible: () => this._exportVisible,
        });

        this.pin = this.simpleCommand({
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
            visible: () => this._pinVisible,
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
        if (!this.clone.visible(pool)) {
            return;
        }

        const ref = this.sidebarManager.open(`add-pool-${pool.id}`, PoolCreateBasicDialogComponent);
        ref.component.setValueFromEntity(pool);
    }

    private _exportAsJSON(pool: Pool) {
        if (!this.exportAsJSON.visible(pool)) {
            return;
        }

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
        if (!this.pin.visible(pool)) {
            return;
        }

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
