import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "app/core";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { ContextMenu, ContextMenuItem } from "app/components/base/context-menu";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { SidebarManager } from "app/components/base/sidebar";
import { BlobContainer, LeaseStatus } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { ListContainerParams, PinnedEntityService, StorageService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { Filter } from "app/utils/filter-builder";
import { DeleteContainerAction, DeleteContainerDialogComponent, FileGroupCreateFormComponent } from "../action";

@Component({
    selector: "bl-file-group-list",
    templateUrl: "file-group-list.html",
})
export class FileGroupListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: ListView<BlobContainer, ListContainerParams>;
    public hasAutoStorage: boolean;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._setContainerFilter(this._filter);
    }
    public get filter(): Filter { return this._filter; }

    private _autoStorageSub: Subscription;
    private _onGroupAddedSub: Subscription;
    private _filter: Filter;

    constructor(
        router: Router,
        dialog: MatDialog,
        activatedRoute: ActivatedRoute,
        private sidebarManager: SidebarManager,
        private taskManager: BackgroundTaskService,
        private pinnedEntityService: PinnedEntityService,
        private storageService: StorageService) {

        super(dialog);
        this.data = this.storageService.containerListView(storageService.ncjFileGroupPrefix);
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.hasAutoStorage = false;
        this._autoStorageSub = storageService.hasAutoStorage.subscribe((hasAutoStorage) => {
            this.hasAutoStorage = hasAutoStorage;
            if (!hasAutoStorage) {
                this.status = Observable.of(LoadingStatus.Ready);
            }
        });

        this.status = this.data.status;
        this._onGroupAddedSub = this.storageService.onFileGroupAdded.subscribe((fileGroupId: string) => {
            this.data.loadNewItem(storageService.getContainerOnce(fileGroupId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._onGroupAddedSub.unsubscribe();
        this._autoStorageSub.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.hasAutoStorage) {
            return this.data.refresh();
        }

        return Observable.of(null);
    }

    public containerStatus(container: BlobContainer): QuickListItemStatus {
        switch (container.lease && container.lease.status) {
            case LeaseStatus.locked:
                return QuickListItemStatus.warning;
            default:
                return QuickListItemStatus.normal;
        }
    }

    public onScrollToBottom(x) {
        if (this.hasAutoStorage) {
            this.data.fetchNext();
        }
    }

    public deleteSelected() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteContainerAction(this.storageService, this.selectedItems);
            task.start(backgroundTask);

            return task.waitingDone;
        });
    }

    public contextmenu(container: BlobContainer) {
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this._deleteFileGroup(container) }),
            new ContextMenuItem({ label: "Add more files", click: () => this._manageFileGroup(container) }),
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(container) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinFileGroup(container),
            }),
        ]);
    }

    public trackFileGroup(index, fileGroup: BlobContainer) {
        return fileGroup.id;
    }

    private _setContainerFilter(filter: Filter) {
        if (filter.isEmpty() || filter.properties.length === 0) {
            this.data.setOptions({});
        } else {
            let filterText = (this._filter.properties[0] as any).value;
            this.data.setOptions({ filter: filterText && filterText.toLowerCase() });
        }

        if (this.hasAutoStorage) {
            this.data.fetchNext();
        }
    }

    private _deleteFileGroup(container: BlobContainer) {
        const dialogRef = this.dialog.open(DeleteContainerDialogComponent);
        dialogRef.componentInstance.id = container.id;
        dialogRef.componentInstance.name = container.name;
        dialogRef.afterClosed().subscribe((obj) => {
            this.storageService.getContainerOnce(container.id);
        });
    }

    private _manageFileGroup(container: BlobContainer) {
        const sidebarRef = this.sidebarManager.open("Maintain a file group", FileGroupCreateFormComponent);
        sidebarRef.component.setValue(new FileGroupCreateDto({
            name: container.name,
            includeSubDirectories: true,
            folder: null,
        }));

        sidebarRef.afterCompletion.subscribe(() => {
            this.storageService.onFileGroupUpdated.next();
        });
    }

    private _pinFileGroup(container: BlobContainer) {
        this.pinnedEntityService.pinFavorite(container).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(container);
            }
        });
    }
}
