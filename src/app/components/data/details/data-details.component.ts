import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { ApplicationDecorator } from "app/decorators";
import { BlobContainer } from "app/models";
import {
    AutoStorageService, GetContainerParams, StorageContainerService,
} from "app/services/storage";
import { Subscription } from "rxjs";
import { BlobContainerCommands } from "../action";

@Component({
    selector: "bl-data-details",
    templateUrl: "data-details.html",
    providers: [BlobContainerCommands],
})
export class DataDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `File group - ${tab}` : "File group";
        return {
            name: id,
            label,
        };
    }

    public container: BlobContainer;
    public storageAccountId: string;
    public containerId: string;
    public decorator: ApplicationDecorator;
    public data: EntityView<BlobContainer, GetContainerParams>;
    public isFileGroup = false;

    private _paramsSubscriber: Subscription;

    constructor(
        private commands: BlobContainerCommands,
        private changeDetector: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private storageContainerService: StorageContainerService,
        private autoStorageService: AutoStorageService) {

        this.data = this.storageContainerService.view();
        this.data.item.subscribe((container) => {
            this.container = container;
            this.isFileGroup = container && container.isFileGroup;
            changeDetector.markForCheck();
        });

        this.data.deleted.subscribe((key) => {
            if (this.containerId === key) {
                this.router.navigate(["/data"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.containerId = params["id"];
            this.autoStorageService.getStorageAccountIdFromDataSource(params["dataSource"])
                .subscribe((storageAccountId) => {
                    this.storageAccountId = storageAccountId;
                    const storageParams = { storageAccountId: this.storageAccountId, id: this.containerId };
                    this.data.params = storageParams;
                    this.commands.params = storageParams;
                    this.data.fetch();
                    this.changeDetector.markForCheck();
                });
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh() {
        return this.commands.get(this.containerId);
    }
}
