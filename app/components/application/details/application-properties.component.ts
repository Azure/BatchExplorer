import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { Application } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";

@Component({
    selector: "bl-application-properties",
    templateUrl: "application-properties.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationPropertiesComponent {
    @Input()
    public set application(application: Application) {
        this._application = application;
        this.refresh(application);
    }
    public get application() { return this._application; }

    public decorator: ApplicationDecorator = <any>{};

    private _application: Application;

    public refresh(application: Application) {
        if (this.application) {
            this.decorator = new ApplicationDecorator(this.application);
        }
    }
}
