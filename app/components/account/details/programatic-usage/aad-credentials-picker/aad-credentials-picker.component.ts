import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";

import { AccountResource } from "app/models";
import { ServicePrincipal } from "app/models/ms-graph";

import "./aad-credentials-picker.scss";

enum Step {
    pickApplication,
    generateSecret,
    createApplication,
}
@Component({
    selector: "bl-aad-credentials-picker",
    templateUrl: "aad-credentials-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADCredentialsPickerComponent {
    public Step = Step;
    @Input() public account: AccountResource;

    public pickedApplication: ServicePrincipal;
    public currentStep = Step.pickApplication;
    constructor(private changeDetector: ChangeDetectorRef) {
    }
    public pickApplication(app: ServicePrincipal) {
        this.pickedApplication = app;
        this.currentStep = Step.generateSecret;
        this.changeDetector.markForCheck();
    }
}
