import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnChanges, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import {
    Activity, ActivityService, LoadingStatus, QuickListItemStatus,
} from "@batch-flask/ui";
import { List } from "immutable";
import { Observable, Subscription, of } from "rxjs";

import { BlobContainer, LeaseStatus } from "app/models";
import { ListView } from "app/services/core";
import { ListContainerParams, StorageContainerService } from "app/services/storage";
import { ComponentUtils } from "app/utils";
import { Constants } from "common";
import { BlobContainerCommands } from "../action";

import "./data-container-list.scss";

const defaultListOptions = {
    pageSize: Constants.ListPageSizes.default,
};
@Component({
    selector: "bl-data-container-list",
    templateUrl: "data-container-list.html",
    providers: [BlobContainerCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => DataContainerListComponent),
    }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataContainerListComponent extends ListBaseComponent implements OnInit, OnChanges, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public storageAccountId: string;

    public containers: List<BlobContainer>;
    public data: ListView<BlobContainer, ListContainerParams>;
    public dataSource: string;

    private _onGroupAddedSub: Subscription;

    constructor(
        router: Router,
        changeDetector: ChangeDetectorRef,
        public commands: BlobContainerCommands,
        private activeRoute: ActivatedRoute,
        private storageContainerService: StorageContainerService,
        private activityService: ActivityService) {

        super(changeDetector);
        this.data = this.storageContainerService.listView();
        ComponentUtils.setActiveItem(activeRoute, this.data);

        this.data.items.subscribe((containers) => {
            this.containers = containers;
            this.changeDetector.markForCheck();
        });

        this.data.status.subscribe((status) => {
            this.status = status;
            this.changeDetector.markForCheck();
        });

        this._onGroupAddedSub = this.storageContainerService.onContainerAdded.subscribe((fileGroupId: string) => {
            this.data.loadNewItem(storageContainerService.get(this.storageAccountId, fileGroupId));
        });
    }

    public ngOnInit() {
        this.activeRoute.params.subscribe((params) => {
            this.dataSource = params["dataSource"];
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.storageAccountId && this.storageAccountId) {
            this.containers = List([]);
            this.data.params = { storageAccountId: this.storageAccountId };
            this.commands.params = { storageAccountId: this.storageAccountId };
            this.data.fetchNext();
        }
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._onGroupAddedSub.unsubscribe();
    }

    public get entityType() {
        return this.dataSource === "file-groups" ? "File groups" : "Storage containers";
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
            this.data.setOptions({ ...defaultListOptions, filter });
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
        const initializer = () => {
            const arr = Array.from(selection.keys).map(id => {
                return new Activity(`Deleting container: ${id}`, () => {
                    return this.storageContainerService.delete(this.storageAccountId, id);
                }, () => {
                    this.refresh();
                });
            });

            return of(arr);
        };

        this.activityService.loadAndRun(new Activity("Deleting containers", initializer));
    }

    public trackFileGroup(index, fileGroup: BlobContainer) {
        return fileGroup.id;
    }
}
