import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { AccountResource, RoleAssignment } from "app/models";
import { AADApplication, ServicePrincipal } from "app/models/ms-graph";
import { ArmHttpService, AuthorizationHttpService, ResourceAccessService } from "app/services";
import { AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";
import { exists } from "common";
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

    private _servicePrincipal = new BehaviorSubject<ServicePrincipal>(null);
    private _roleAssignments = new BehaviorSubject<StringMap<List<RoleAssignment>>>(null);
    private _roles: StringMap<any> = {};

    public get storageAccountId() {
        const autoStorage = this.account && this.account.autoStorage;
        return autoStorage && autoStorage.storageAccountId;
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private servicePrincipalService: ServicePrincipalService,
        private arm: ArmHttpService,
        private permissionService: AuthorizationHttpService,
        private resourceAccessService: ResourceAccessService) {
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

    public getPermission(resourceId: string) {
        const assignment = this._getRoleAssignmentsFor(resourceId);
        if (!assignment) { return null; }
        const role = this._roles[assignment.properties.roleDefinitionId];
        if (!role) { return null; }
        return this.permissionService.checkResoucePermissions(role.properties.permissions);
    }

    private _loadServicePrincipal() {
        this.servicePrincipalService.getByAppId(this.application.id).subscribe((servicePrincipal) => {
            this.principalId = servicePrincipal.id;
        });
    }

    private _loadRoleAssignment() {
        const resources = [this.account.id];
        if (this.storageAccountId) {
            resources.push(this.storageAccountId);
        }
        const obs = resources.map(x => this.resourceAccessService.listRolesFor(x));
        Observable.forkJoin(obs).subscribe((result) => {
            const map: any = {};

            for (const [index, roleAssignments] of result.entries()) {
                const resourceId = resources[index];
                map[resourceId] = roleAssignments;
                this._roleAssignments.next(map);
            }
            this.changeDetector.markForCheck();

        });
    }

    private _loadRoles() {
        console.log("LOading roles");
        const resources = Object.keys(this._roleAssignments.value);
        const obs = [...new Set(resources.map((resourceId) => {
            return this._getRoleAssignmentsFor(resourceId).properties.roleDefinitionId;
        }))].map((roleDefinitionId) => this.arm.get(roleDefinitionId).map(x => x.json()));
        return Observable.forkJoin(obs).map((roles: any) => {
            const map: any = {};
            for (const role of roles) {
                map[role.id] = role;
            }
            console.log("Roles", map);
            return map;
        });
    }

    private _getRoleAssignmentsFor(resourceId: string) {
        if (!this._roleAssignments.value || !this._servicePrincipal.value) { return null; }
        const roles = this._roleAssignments.value[resourceId];
        if (!roles) { return null; }
        return roles.filter(x => x.properties.principalId === this._servicePrincipal.value.id).first();
    }

}
