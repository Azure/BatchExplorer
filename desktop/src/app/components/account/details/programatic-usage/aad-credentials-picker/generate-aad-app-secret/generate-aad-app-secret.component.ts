import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { BatchAccount } from "app/models";
import { AADApplication } from "app/models/ms-graph";
import { AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";

import "./generate-aad-app-secret.scss";

@Component({
    selector: "bl-generate-aad-app-secret",
    templateUrl: "generate-aad-app-secret.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateAADAppSecretComponent implements OnChanges {
    @Input() public account: BatchAccount;
    @Input() public application: AADApplication;
    @Output() public secretPicked = new EventEmitter();
    @Output() public cancel = new EventEmitter();

    public principalId: string;
    public secret = new FormControl({});
    public get storageAccountId() {
        const autoStorage = this.account && this.account.autoStorage;
        return autoStorage && autoStorage.storageAccountId;
    }

    public get passwordCredentials() {
        return this.application && this.application.passwordCredentials;
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private aadApplicationService: AADApplicationService,
        private servicePrincipalService: ServicePrincipalService) {
    }

    public ngOnChanges(changes) {
        if (changes.application) {
            this._loadServicePrincipal();
        }
    }

    @autobind()
    public addNewSecret() {
        return this._addNewSecret(false);
    }

    @autobind()
    public resetCredentials() {
        return this._addNewSecret(true);
    }

    private _addNewSecret(reset) {
        const secret = this.secret.value;
        const obs = this.aadApplicationService.createSecret(this.application.id, {
            name: secret.name,
            value: secret.value,
            endDate: secret.endDate,
        }, reset);
        obs.subscribe((credential) => {
            this.secretPicked.emit(credential);
        });
        return obs;
    }

    private _loadServicePrincipal() {
        this.servicePrincipalService.getByAppId(this.application.id).subscribe((servicePrincipal) => {
            this.principalId = servicePrincipal.id;
            this.changeDetector.markForCheck();
        });
    }
}
