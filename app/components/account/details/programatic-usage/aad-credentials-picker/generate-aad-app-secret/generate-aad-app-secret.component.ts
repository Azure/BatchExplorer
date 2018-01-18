import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { AccountResource, RoleAssignment } from "app/models";
import { AADApplication, ServicePrincipal } from "app/models/ms-graph";
import { ResourceAccessService } from "app/services";
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
    private _servicePrincipal: ServicePrincipal;
    private _roles: StringMap<List<RoleAssignment>> = {};
    public get storageAccountId() {
        const autoStorage = this.account && this.account.autoStorage;
        return autoStorage && autoStorage.storageAccountId;
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private aadApplicationService: AADApplicationService,
        private servicePrincipalService: ServicePrincipalService,
        private resourceAccessService: ResourceAccessService) { }
    public ngOnChanges(changes) {
        if (changes.application) {
            this._loadServicePrincipal();
            console.log("PAssword creds", this.application.passwordCredentials.map(x => x.name).toJS(), this.application.passwordCredentials.toJS());
            // this.aadApplicationService.createSecret(this.application.id, "New pass").subscribe((result) => {
            //     console.log("Result is", result);
            // });
        }

        if (changes.account) {
            this._loadPermissions();
        }

    }

    public hasPermission(resourceId: string) {
        const roles = this._roles[resourceId];
        if (!roles) { return false; }
        return Boolean(roles.filter(x => x.properties.principalId === this._servicePrincipal.id).first());
    }

    private _loadServicePrincipal() {
        this.servicePrincipalService.getByAppId(this.application.id).subscribe((servicePrincipal) => {
            this._servicePrincipal = servicePrincipal;
        });
    }

    private _loadPermissions() {
        this.resourceAccessService.listRolesFor(this.account.id).subscribe((roles) => {
            console.log("Roles is", roles);
            this._roles[this.account.id] = roles;
            this.changeDetector.markForCheck();
        });

        if (this.storageAccountId) {
            this.resourceAccessService.listRolesFor(this.storageAccountId).subscribe((roles) => {
                this._roles[this.account.id] = roles;
                this.changeDetector.markForCheck();
            });
        }
    }
}
