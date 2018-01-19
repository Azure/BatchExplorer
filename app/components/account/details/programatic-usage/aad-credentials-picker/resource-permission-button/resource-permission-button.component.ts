import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { RoleAssignment, RoleDefinition } from "app/models";
import { ArmHttpService, AuthorizationHttpService, ResourceAccessService } from "app/services";
import { Observable } from "rxjs";
import "./resource-permission-button.scss";

const allowedRoleNames = new Set([
    "Contributor",
    "Reader",
]);
@Component({
    selector: "bl-resource-permission-button",
    templateUrl: "resource-permission-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcePermissionButtonComponent implements OnChanges {
    /**
     * Id of the resource id to access
     */
    @Input() public resourceId: string;
    /**
     * Id of the user/servicePrincipal trying to use the resource
     */
    @Input() public principalId: string;

    public currentRole: RoleDefinition = null;
    public loading = true;
    private _roleAssignments: List<RoleAssignment> = null;
    private _roleDefinitions: List<RoleDefinition> = null;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private permissionService: AuthorizationHttpService,
        private arm: ArmHttpService,
        private resourceAccessService: ResourceAccessService) {
    }

    public ngOnChanges(changes) {
        if (changes.resourceId) {
            this._loadRoleAssignments();
            this._loadRoleDefinitions();
        }

        if (changes.principalId) {
            this._loadCurrentRole();
        }
    }

    public get permission() {
        const role = this.currentRole;
        if (!role) { return null; }
        return this.permissionService.checkResoucePermissions(role.properties.permissions.toJS());
    }

    public get color() {
        if (this.loading || this.permission) {
            return "primary";
        } else {
            return "danger";
        }
    }

    public get availableRoles() {
        return this._roleDefinitions && this._roleDefinitions.filter((x) => {
            return allowedRoleNames.has(x.properties.roleName);
        });
    }

    public trackRole(index, role: RoleDefinition) {
        return role.id;
    }

    public changeRole(role: RoleDefinition) {
        this.loading = true;
        let obs;

        if (!role) {
            obs = this._deleteAssignment();
        } else {
            obs = this._deleteAssignment().flatMap(() => {
                return this.resourceAccessService.createAssignment(this.resourceId, this.principalId, role.id);
            });
        }

        obs.subscribe(() => {
            this.currentRole = role;
            this.changeDetector.markForCheck();
            this._loadRoleAssignments();
        });
    }

    /**
     * Delete the assignment if applicable
     */
    private _deleteAssignment(): Observable<any> {
        const assignment = this._getRoleAssignment();
        if (assignment) {
            return this.resourceAccessService.deleteAssignment(assignment.id);
        } else {
            return Observable.of(null);
        }
    }

    private _loadRoleAssignments() {
        this.resourceAccessService.listRolesFor(this.resourceId).subscribe((response) => {
            this._roleAssignments = response;
            this._loadCurrentRole();
            this.changeDetector.markForCheck();
        });
    }

    private _loadCurrentRole() {
        const assignment = this._getRoleAssignment();
        if (!assignment) {
            this.loading = false;
            return;
        }
        // Already loaded this one
        if (this.currentRole && this.currentRole.id === assignment.properties.roleDefinitionId) { return; }

        // TODO change to use role getter
        this.arm.get(assignment.properties.roleDefinitionId).subscribe((response) => {
            this.loading = false;
            const role = new RoleDefinition(response.json());
            this.currentRole = role;
            this.changeDetector.markForCheck();
        });
    }

    private _loadRoleDefinitions() {
        this.resourceAccessService.listRoleDefinitions(this.resourceId).subscribe((roles) => {
            this._roleDefinitions = roles;
            this.changeDetector.markForCheck();
        });
    }

    private _getRoleAssignment() {
        console.log("Principal", this._roleAssignments, this.principalId);
        if (!this._roleAssignments || !this.principalId) { return null; }
        return this._roleAssignments.filter(x => x.properties.principalId === this.principalId).first();
    }
}
