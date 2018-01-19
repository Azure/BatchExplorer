import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";

import { AccountResource } from "app/models";
import { AADApplication, PasswordCredential } from "app/models/ms-graph";

import { AppCreatedEvent } from "app/components/account/details/programatic-usage";
import "./aad-credentials-picker.scss";
import { ServicePrincipalService } from "app/services/ms-graph";

enum Step {
    pickApplication,
    generateSecret,
    displaySecret,
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

    public pickedApplication: AADApplication;
    public pickedSecret: PasswordCredential;
    public currentStep = Step.pickApplication;
    public principalId: string;

    public get tenantId() {
        return this.account && this.account.subscription.tenantId;
    }

    constructor(private changeDetector: ChangeDetectorRef, private servicePrincipalService: ServicePrincipalService) {
    }

    public get storageAccountId() {
        const autoStorage = this.account && this.account.autoStorage;
        return autoStorage && autoStorage.storageAccountId;
    }

    public pickApplication(app: AADApplication) {
        this.pickedApplication = app;
        this.currentStep = Step.generateSecret;
        this._loadServicePrincipal();
        this.changeDetector.markForCheck();
    }

    public createApp() {
        this.currentStep = Step.createApplication;
        this.changeDetector.markForCheck();
    }

    public appCreated(event: AppCreatedEvent) {
        this.pickedApplication = event.application;
        this.pickedSecret = event.secret;
        this.currentStep = Step.displaySecret;
        this._loadServicePrincipal();
        this.changeDetector.markForCheck();
    }

    public pickSecret(secret: PasswordCredential) {
        this.pickedSecret = secret;
        this.currentStep = Step.displaySecret;
        this.changeDetector.markForCheck();
    }

    private _loadServicePrincipal() {
        if (!this.pickedApplication) {
            return;
        }
        this.servicePrincipalService.getByAppId(this.pickedApplication.appId).subscribe((servicePrincipal) => {
            this.principalId = servicePrincipal.id;
            this.changeDetector.markForCheck();
        });
    }
}
