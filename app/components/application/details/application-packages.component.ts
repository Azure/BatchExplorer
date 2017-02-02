import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";

import { Application, ApplicationPackage } from "app/models";

@Component({
    selector: "bex-application-packages",
    templateUrl: "application-packages.html",
})

export class ApplicationPackagesComponent implements OnDestroy {
    @Input()
    public set application(application: Application) {
        this._application = application;
        this.refresh(application);
    }
    public get application() { return this._application; }

    public packages: ApplicationPackage[] = [];

    private _application: Application;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(application: Application) {
        if (this.application) {
            this.packages = this.application.packages || [];
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
