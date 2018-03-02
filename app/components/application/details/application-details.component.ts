import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { Subscription } from "rxjs/Subscription";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { BatchApplication } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";
import { ApplicationParams, ApplicationService } from "app/services";
import { EntityView } from "app/services/core";
import {
    ApplicationCreateDialogComponent, ApplicationEditDialogComponent,
    DeleteApplicationDialogComponent,
} from "../action";

@Component({
    selector: "bl-application-details",
    templateUrl: "application-details.html",
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Application - ${tab}` : "Application";
        return {
            name: id,
            label,
        };
    }

    public application: BatchApplication;
    public applicationId: string;
    public decorator: ApplicationDecorator;
    public data: EntityView<BatchApplication, ApplicationParams>;

    private _paramsSubscriber: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private applicationService: ApplicationService,
        private dialog: MatDialog,
        private router: Router,
        private sidebarManager: SidebarManager) {

        this.data = this.applicationService.view();
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
        this.data.dispose();
    }

    @autobind()
    public addPackage() {
        const sidebarRef = this.sidebarManager.open("add-package", ApplicationCreateDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public editApplication() {
        const sidebarRef = this.sidebarManager.open("edit-application", ApplicationEditDialogComponent);
        sidebarRef.component.setValue(this.application);
        sidebarRef.afterCompletion.subscribe(() => {
            this.refresh();
        });
    }

    @autobind()
    public deleteApplication() {
        const dialogRef = this.dialog.open(DeleteApplicationDialogComponent);
        dialogRef.componentInstance.applicationId = this.application.id;
    }

    @autobind()
    public refresh() {
        return this.data.refresh();
    }
}
