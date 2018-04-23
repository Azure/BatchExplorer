import { Injectable, Injector } from "@angular/core";
import { EntityCommand, EntityCommands, SidebarManager } from "@batch-flask/ui";

import { BlobContainer } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { PinnedEntityService } from "app/services";
import { StorageContainerService } from "app/services/storage";
import { FileGroupCreateFormComponent } from "./add";

export interface StorageContainerParams {
    storageAccountId: string;
}

@Injectable()
export class BlobContainerCommands extends EntityCommands<BlobContainer, StorageContainerParams> {
    public delete: EntityCommand<BlobContainer, void>;
    public pin: EntityCommand<BlobContainer, void>;
    public addMoreFiles: EntityCommand<BlobContainer, void>;

    constructor(
        injector: Injector,
        private sidebarManager: SidebarManager,
        private pinnedEntityService: PinnedEntityService,
        private storageContainerService: StorageContainerService) {
        super(
            injector,
            "BlobContainer",
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
            label: "Delete",
            action: (container: BlobContainer) => {
                return this.storageContainerService.delete(this.params.storageAccountId, container.id);
            },
        });
        this.addMoreFiles = this.simpleCommand({
            label: "Add more files",
            action: (container: BlobContainer) => this._addFilesToFileGroup(container),
            multiple: false,
            confirm: false,
            notify: false,
            enabled: (container) => container.isFileGroup,
        });

        this.pin = this.simpleCommand({
            label: (pool: BlobContainer) => {
                return this.pinnedEntityService.isFavorite(pool) ? "Unpin favorite" : "Pin to favorites";
            },
            action: (pool: BlobContainer) => this._pinContainer(pool),
            confirm: false,
            multiple: false,
        });

        this.commands = [
            this.delete,
            this.addMoreFiles,
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

    private _pinContainer(container: BlobContainer) {
        this.pinnedEntityService.pinFavorite(container).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(container);
            }
        });
    }
}
