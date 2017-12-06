import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs/Subscription";

import { DialogService } from "app/components/base/dialogs";
import { SidebarManager } from "app/components/base/sidebar";
import { DownloadFileGroupDialogComponent } from "app/components/data/details";
import { BlobContainer } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";
import { FileGroupCreateDto } from "app/models/dtos";
import { GetContainerParams, StorageService } from "app/services";
import { EntityView } from "app/services/core";
import { DeleteContainerDialogComponent, FileGroupCreateFormComponent } from "../action";

@Component({
    selector: "bl-data-details",
    templateUrl: "data-details.html",
})
export class DataDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        let label = tab ? `File group - ${tab}` : "File group";
        return {
            name: id,
            label,
        };
    }

    public container: BlobContainer;
    public containerId: string;
    public decorator: ApplicationDecorator;
    public data: EntityView<BlobContainer, GetContainerParams>;

    private _paramsSubscriber: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private dialog: DialogService,
        private router: Router,
        private sidebarManager: SidebarManager,
        private storageService: StorageService) {

        this.data = this.storageService.containerView();
        this.data.item.subscribe((container) => {
            this.container = container;
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
            this.data.params = { id: this.containerId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    @autobind()
    public manageFileGroup() {
        const sidebarRef = this.sidebarManager.open("Maintain a file group", FileGroupCreateFormComponent);
        sidebarRef.component.setValue(new FileGroupCreateDto({
            name: this.container.name,
            includeSubDirectories: true,
            folder: null,
        }));

        sidebarRef.afterCompletion.subscribe(() => {
            this.storageService.onFileGroupUpdated.next();
        });
    }

    @autobind()
    public deleteFileGroup() {
        const dialogRef = this.dialog.open(DeleteContainerDialogComponent);
        dialogRef.componentInstance.id = this.container.id;
        dialogRef.componentInstance.name = this.container.name;
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }

    @autobind()
    public download() {
        const ref = this.dialog.open(DownloadFileGroupDialogComponent);
        ref.componentInstance.containerId = this.containerId;
        ref.componentInstance.subfolder = this.containerId;
        ref.componentInstance.pathPrefix = "";
    }
}
