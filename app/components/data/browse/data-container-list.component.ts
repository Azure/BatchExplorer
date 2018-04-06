import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, forwardRef } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import {
    BackgroundTaskService, ContextMenu, ContextMenuItem, QuickListItemStatus, SidebarManager,
} from "@batch-flask/ui";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { BlobContainer, LeaseStatus } from "app/models";
import { FileGroupCreateDto } from "app/models/dtos";
import { PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { ListContainerParams, StorageContainerService } from "app/services/storage";
import { ComponentUtils } from "app/utils";
import { Constants } from "common";
import { DeleteContainerAction, DeleteContainerDialogComponent, FileGroupCreateFormComponent } from "../action";

const defaultListOptions = {
    pageSize: Constants.ListPageSizes.default,
};
@Component({
    selector: "bl-data-container-list",
    templateUrl: "data-container-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => DataContainerListComponent),
    }],
})
export class DataContainerListComponent extends ListBaseComponent implements OnChanges, OnDestroy {
    @Input() public storageAccountId: string;

    public containers: List<BlobContainer>;
    public data: ListView<BlobContainer, ListContainerParams>;

    private _onGroupAddedSub: Subscription;

    constructor(
        router: Router,
        changeDetector: ChangeDetectorRef,
        activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private sidebarManager: SidebarManager,
        private taskManager: BackgroundTaskService,
        private pinnedEntityService: PinnedEntityService,
        private storageContainerService: StorageContainerService) {

        super(changeDetector);
        this.data = this.storageContainerService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.data.items.subscribe((containers) => {
            this.containers = containers;
            this.changeDetector.markForCheck();
        });

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._onGroupAddedSub = this.storageContainerService.onContainerAdded.subscribe((fileGroupId: string) => {
            this.data.loadNewItem(storageContainerService.get(this.storageAccountId, fileGroupId));
        });
    }

    public ngOnChanges(changes) {
        if (changes.storageAccountId && this.storageAccountId) {
            this.data.params = { storageAccountId: this.storageAccountId };
            this.data.fetchNext();
        }
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._onGroupAddedSub.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        if (this.storageAccountId) {
            return this.data.refresh();
        }

        return Observable.of(null);
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...defaultListOptions });
        } else {
            const filterText = (filter as any).value;
            this.data.setOptions({ ...defaultListOptions, filter: filterText && filterText.toLowerCase() });
        }

        if (this.storageAccountId) {
            this.data.fetchNext();
        }
    }

    public containerStatus(container: BlobContainer): QuickListItemStatus {
        switch (container.lease && container.lease.status) {
            case LeaseStatus.locked:
                return QuickListItemStatus.warning;
            default:
                return QuickListItemStatus.normal;
        }
    }

    public onScrollToBottom() {
        if (this.storageAccountId) {
            this.data.fetchNext();
        }
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteContainerAction(this.storageContainerService, this.storageAccountId,
                [...selection.keys]);
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

    private _deleteFileGroup(container: BlobContainer) {
        const dialogRef = this.dialog.open(DeleteContainerDialogComponent);
        dialogRef.componentInstance.id = container.id;
        dialogRef.componentInstance.name = container.name;
        dialogRef.afterClosed().subscribe((obj) => {
            this.storageContainerService.get(this.storageAccountId, container.id);
        });
    }

    private _manageFileGroup(container: BlobContainer) {
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

    private _pinFileGroup(container: BlobContainer) {
        this.pinnedEntityService.pinFavorite(container).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(container);
            }
        });
    }
}
