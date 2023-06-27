import { Injectable, Injector } from "@angular/core";
import {
    COMMAND_LABEL_ICON,
    DialogService,
    DownloadFolderComponent,
    EntityCommand,
    EntityCommands,
    Permission,
    SidebarManager,
} from "@batch-flask/ui";
import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { PinnedEntityService } from "app/services";
import { StorageBlobService, StorageContainerService } from "app/services/storage";
import { FileGroupCreateFormComponent } from "./add";
import { DeleteContainerDialogComponent } from "./delete";

export interface StorageContainerParams {
    storageAccountId: string;
}

@Injectable()
export class BlobContainerCommands extends EntityCommands<BlobContainer, StorageContainerParams> {
    public delete: EntityCommand<BlobContainer, void>;
    public addMoreFiles: EntityCommand<BlobContainer, void>;
    public download: EntityCommand<BlobContainer, void>;
    public pin: EntityCommand<BlobContainer, void>;

    constructor(
        injector: Injector,
        private dialog: DialogService,
        private sidebarManager: SidebarManager,
        private pinnedEntityService: PinnedEntityService,
        private storageBlobService: StorageBlobService,
        private storageContainerService: StorageContainerService) {
        super(
            injector,
            "BlobContainer",
            {
                feature: "data.action",
            },
        );

        this._buildCommands();
    }

    public get(containerName: string) {
        return this.storageContainerService.get(this.params.storageAccountId, containerName);
    }

    public getFromCache(containerName: string) {
        return this.storageContainerService.getFromCache(this.params.storageAccountId, containerName);
    }

    private _buildCommands() {
        this.delete = this.simpleCommand({
            name: "delete",
            ...COMMAND_LABEL_ICON.Delete,
            action: (container: BlobContainer) => this._deleteFileGroup(container),
            confirm: (containers) => this._confirmDeletion(containers),
            permission: Permission.Write,
        });

        this.addMoreFiles = this.simpleCommand({
            name: "add",
            ...COMMAND_LABEL_ICON.AddFile,
            action: (container: BlobContainer) => this._addFilesToFileGroup(container),
            enabled: (container) => container.isFileGroup,
            multiple: false,
            confirm: false,
            notify: false,
            permission: Permission.Write,
        });

        this.download = this.simpleCommand({
            name: "download",
            ...COMMAND_LABEL_ICON.Download,
            action: (container: BlobContainer) => this._download(container),
            multiple: false,
            confirm: false,
            notify: false,
        });

        this.pin = this.simpleCommand({
            name: "pin",
            label: (pool: BlobContainer) => {
                return this.pinnedEntityService.isFavorite(pool)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteLabel : COMMAND_LABEL_ICON.PinFavoriteLabel;
            },
            icon: (pool: BlobContainer) => {
                return this.pinnedEntityService.isFavorite(pool)
                    ? COMMAND_LABEL_ICON.UnpinFavoriteIcon : COMMAND_LABEL_ICON.PinFavoriteIcon;
            },
            action: (pool: BlobContainer) => this._pinContainer(pool),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.delete,
            this.addMoreFiles,
            this.download,
            this.pin,
        ];
    }

    private _addFilesToFileGroup(container: BlobContainer) {
        const sidebarRef = this.sidebarManager.open("Maintain a file group", FileGroupCreateFormComponent);
        sidebarRef.component.setValue(new FileGroupCreateDto({
            name: container.name,
            includeSubDirectories: true,
            paths: [],
        }));

        sidebarRef.afterCompletion.subscribe(() => {
            this.storageContainerService.onContainerUpdated.next();
        });
    }

    private _deleteFileGroup(container: BlobContainer) {
        return this.storageContainerService.delete(this.params.storageAccountId, container.id);
    }

    private _download(container: BlobContainer) {
        const ref = this.dialog.open(DownloadFolderComponent);
        ref.componentInstance.navigator = this.storageBlobService.navigate(container.storageAccountId, container.id);
        ref.componentInstance.subfolder = container.id;
        ref.componentInstance.folder = "";
    }

    private _pinContainer(container: BlobContainer) {
        if (this.pinnedEntityService.isFavorite(container)) {
            return this.pinnedEntityService.unPinFavorite(container);
        } else {
            return this.pinnedEntityService.pinFavorite(container);
        }
    }

    private _confirmDeletion(entities: BlobContainer[]) {
        const dialogRef = this.dialog.open(DeleteContainerDialogComponent);
        dialogRef.componentInstance.containers = entities;
        return dialogRef.componentInstance.onSubmit;
    }
}
