import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { FormControl } from "@angular/forms";

import { autobind } from "app/core";
import { AccountResource } from "app/models";
import { AADApplication } from "app/models/ms-graph";
import { AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";
import "./generate-aad-app-secret.scss";

@Component({
    selector: "bl-generate-aad-app-secret",
    templateUrl: "generate-aad-app-secret.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateAADAppSecretComponent implements OnChanges {
    @Input() public account: AccountResource;
    @Input() public application: AADApplication;
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
        private aadApplicationService: AADApplicationService,
        private servicePrincipalService: ServicePrincipalService) {
    }

    public ngOnChanges(changes) {
        if (changes.application) {
            this._loadServicePrincipal();
            // console.log("PAssword creds", this.application.passwordCredentials.map(x => x.name).toJS(), this.application.passwordCredentials.toJS());
            // this.aadApplicationService.createSecret(this.application.id, "New pass").subscribe((result) => {
            //     console.log("Result is", result);
            // });
        }
    }

    @autobind()
    public addNewSecret() {

        return this.aadApplicationService.createSecret(this.application.id);
    }

    @autobind()
    public resetCredentials() {
        return this.aadApplicationService.createSecret(this.application.id);
    }

    private _addNewSecret(reset) {
        const secret = this.secret.value;
        const obs = this.aadApplicationService.createSecret(this.application.id, {
            name: secret.name,
            value: secret.value,
            endDate: secret.endDate,
        }, reset);
        obs.subscribe(() => {

        });
        return obs;
    }

    private _loadServicePrincipal() {
        this.servicePrincipalService.getByAppId(this.application.id).subscribe((servicePrincipal) => {
            this.principalId = servicePrincipal.id;
        });
    }
}
