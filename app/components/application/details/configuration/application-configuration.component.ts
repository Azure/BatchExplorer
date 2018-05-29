import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { BatchApplication } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";

@Component({
    selector: "bl-application-configuration",
    templateUrl: "application-configuration.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationConfigurationComponent {
    @Input()
    public set application(application: BatchApplication) {
        this._application = application;
        this.refresh(application);
    }
    public get application() { return this._application; }

    public decorator: ApplicationDecorator = {} as any;

    private _application: BatchApplication;

    public refresh(application: BatchApplication) {
        if (this.application) {
            this.decorator = new ApplicationDecorator(this.application);
        }
    }
}
