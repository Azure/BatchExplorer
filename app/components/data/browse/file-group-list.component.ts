import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { BlobContainer, LeaseStatus } from "app/models";
import { ListContainerParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
import { DeleteContainerAction } from "../action";

@Component({
    selector: "bl-file-group-list",
    templateUrl: "file-group-list.html",
})
export class FileGroupListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<ListContainerParams, BlobContainer>;
    public hasAutoStorage: boolean;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._setContainerFilter(this._filter);
    }
    public get filter(): Filter { return this._filter; }

    private _onJobAddedSub: Subscription;
    private _autoStorageSub: Subscription;
    private _filter: Filter;

    constructor(
        router: Router,
        private taskManager: BackgroundTaskService,
        private storageService: StorageService) {

        super();
        this.data = this.storageService.listContainers(storageService.ncjFileGroupPrefix);

        this.hasAutoStorage = false;
        this._autoStorageSub = storageService.hasAutoStorage.subscribe((hasAutoStorage) => {
            this.hasAutoStorage = hasAutoStorage;
            if (!hasAutoStorage) {
                this.status = Observable.of(LoadingStatus.Ready);
            }
        });

        this.status = this.data.status;
        this._onJobAddedSub = this.storageService.onFileGroupAdded.subscribe((fileGroupId: string) => {
            this.data.loadNewItem(storageService.getContainerOnce(fileGroupId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._autoStorageSub.unsubscribe();
        this._onJobAddedSub.unsubscribe();
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
}
