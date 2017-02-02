import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";

import { Application } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";

@Component({
    selector: "bex-application-properties",
    templateUrl: "application-properties.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationPropertiesComponent implements OnDestroy {
    @Input()
    public set application(application: Application) {
        this._application = application;
        this.refresh(application);
    }
    public get application() { return this._application; }

    public decorator: ApplicationDecorator = <any>{};

    private _application: Application;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(application: Application) {
        if (this.application) {
            this.decorator = new ApplicationDecorator(this.application);
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
