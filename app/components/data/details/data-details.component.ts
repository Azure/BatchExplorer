import { Component, OnDestroy, OnInit/*, ViewContainerRef*/ } from "@angular/core";
// import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs/Subscription";

import { BlobContainer } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";
import { GetContainerParams, StorageService  } from "app/services";
import { RxEntityProxy } from "app/services/core";
// import { SidebarManager } from "../../base/sidebar";
// import { ApplicationCreateDialogComponent, ApplicationEditDialogComponent,
//     DeleteApplicationDialogComponent,
// } from "../action";

@Component({
    selector: "bl-data-details",
    templateUrl: "data-details.html",
})
export class DataDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({id}, {tab}) {
        let label = tab ? `File group - ${tab}` : "File group";
        return {
            name: id,
            label,
        };
    }

    public container: BlobContainer;
    public containerId: string;
    public decorator: ApplicationDecorator;
    public data: RxEntityProxy<GetContainerParams, BlobContainer>;

    private _paramsSubscriber: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private storageService: StorageService,
        // private dialog: MdDialog,
        private router: Router,
        // private sidebarManager: SidebarManager,
        /*private viewContainerRef: ViewContainerRef*/) {

        this.data = this.storageService.getContainerProperties(null);
        this.data.item.subscribe((container) => {
            this.container = container;
        });

        this.data.deleted.subscribe((key) => {
            console.log("DataDetailsComponent :: DELETED: ", key, this.containerId);
            if (this.containerId === key) {
                console.log("DataDetailsComponent :: Navigating to /data");
                this.router.navigate(["/data"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.containerId = params["id"];
            this.data.params = { container: this.containerId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    public addFileGroup() {
        // const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        // sidebarRef.component.setValue(this.application);
        // sidebarRef.afterCompletition.subscribe(() => {
        //     this.refresh();
        // });
    }

    public deleteFileGroup() {
        // let config = new MdDialogConfig();
        // config.viewContainerRef = this.viewContainerRef;
        // const dialogRef = this.dialog.open(DeleteApplicationDialogComponent, config);
        // dialogRef.componentInstance.applicationId = this.application.id;
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }
}
