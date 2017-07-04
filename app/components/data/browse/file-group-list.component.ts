import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

// import { BackgroundTaskService } from "app/components/base/background-task";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { BlobContainer, LeaseStatus, ServerError } from "app/models";
import { ContainerListParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
// import { DeleteApplicationAction } from "../action";

@Component({
    selector: "bl-file-group-list",
    templateUrl: "file-group-list.html",
})
export class FileGroupListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<ContainerListParams, BlobContainer>;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;
        this._setContainerFilter(this._filter);
    }
    public get filter(): Filter { return this._filter; }

    private _onJobAddedSub: Subscription;
    private _containerPrefix: string = "job-";
    private _filter: Filter;

    // private taskManager: BackgroundTaskService

    constructor(
        router: Router,
        private storageService: StorageService) {

        super();
        this.data = this.storageService.listContainers(this._containerPrefix, (error: ServerError) => {
            console.log("listContainers :: Error :: ", error);
            // let handled = false;
            // if (this._isAutoStorageError(error)) {
            //     this.noLinkedStorage = true;
            //     handled = true;
            // }

            return false;
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
        this._onJobAddedSub.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public containerStatus(container: BlobContainer): QuickListItemStatus {
        switch (container.lease && container.lease.status) {
            case LeaseStatus.locked:
                return QuickListItemStatus.important;
            default:
                return QuickListItemStatus.normal;
        }
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    public deleteSelected() {
        // this.taskManager.startTask("", (backgroundTask) => {
        //     const task = new DeleteApplicationAction(this.applicationService, this.selectedItems);
        //     task.start(backgroundTask);

        //     return task.waitingDone;
        // });
    }

    private _setContainerFilter(filter: Filter) {
        if (filter.isEmpty() || filter.properties.length === 0) {
            this.data.setOptions({});
        } else {
            let filterText = (this._filter.properties[0] as any).value;
            this.data.setOptions({ filter: filterText && filterText.toLowerCase() });
        }

        this.data.fetchNext();
    }
}
