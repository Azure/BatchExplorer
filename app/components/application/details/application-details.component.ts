import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs/Subscription";

import { Application } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";
import { ApplicationParams, ApplicationService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { SidebarManager } from "../../base/sidebar";
import { ApplicationCreateDialogComponent, ApplicationEditDialogComponent,
    DeleteApplicationDialogComponent,
} from "../action";

@Component({
    selector: "bl-application-details",
    templateUrl: "application-details.html",
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({id}, {tab}) {
        let label = tab ? `Application - ${tab}` : "Application";
        return {
            name: id,
            label,
        };
    }

    public application: Application;
    public applicationId: string;
    public decorator: ApplicationDecorator;
    public data: RxEntityProxy<ApplicationParams, Application>;

    private _paramsSubscriber: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private applicationService: ApplicationService,
        private dialog: MdDialog,
        private router: Router,
        private sidebarManager: SidebarManager,
        private viewContainerRef: ViewContainerRef) {

        this.data = this.applicationService.get(null);
        this.data.item.subscribe((application) => {
            this.application = application;
            if (application) {
                this.decorator = new ApplicationDecorator(application);
            }
        });

        this.data.deleted.subscribe((key) => {
            if (this.applicationId === key) {
                this.router.navigate(["/applications"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.applicationId = params["id"];
            this.data.params = { id: this.applicationId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    @autobind()
    public addPackage() {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletition.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public editApplication() {
        const sidebarRef = this.sidebarManager.open("edit-application", ApplicationEditDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletition.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public deleteApplication() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;
        const dialogRef = this.dialog.open(DeleteApplicationDialogComponent, config);
        dialogRef.componentInstance.applicationId = this.application.id;
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }
}
