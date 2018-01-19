import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { RoleAssignment, RoleDefinition } from "app/models";
import { ArmHttpService, AuthorizationHttpService, ResourceAccessService } from "app/services";
import "./resource-permission-button.scss";

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
    private _roleAssignments: List<RoleAssignment> = null;
    private _roleDefinitions: StringMap<RoleDefinition> = null;

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

    public get loading() {
        return !(
            this._roleAssignments
            && this.currentRole);
    }

    public get color() {
        if (this.loading || this.permission) {
            return "primary";
        } else {
            return "danger";
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
        if (!assignment) { return; }
        // Already loaded this one
        if (this.currentRole && this.currentRole.id === assignment.properties.roleDefinitionId) { return; }

        // TODO change to use role getter
        this.arm.get(assignment.properties.roleDefinitionId).subscribe((response) => {
            const role = new RoleDefinition(response.json());
            this.currentRole = role;
            console.log("Got current role", this.currentRole);
            this.changeDetector.markForCheck();
        });
    }

    private _loadRoleDefinitions() {
        this.resourceAccessService.listRoleDefinitions(this.resourceId).subscribe((roles) => {
            const map: any = {};
            for (const role of roles.toArray()) {
                map[role.id] = role;
            }
            console.log("ROle defs", map);
            this._roleDefinitions = map;
            this.changeDetector.markForCheck();
        });
    }

    private _getRoleAssignment() {
        console.log("Principal", this._roleAssignments, this.principalId);
        if (!this._roleAssignments || !this.principalId) { return null; }
        return this._roleAssignments.filter(x => x.properties.principalId === this.principalId).first();
    }
}
