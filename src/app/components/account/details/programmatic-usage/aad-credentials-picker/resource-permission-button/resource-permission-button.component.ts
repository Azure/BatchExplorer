import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { RoleAssignment, RoleDefinition } from "app/models";
import { ResourceAccessService } from "app/services";
import { List } from "immutable";
import { Observable, of } from "rxjs";
import { flatMap } from "rxjs/operators";

import "./resource-permission-button.scss";

const allowedRoleNames = new Set([
    "Contributor",
    "Reader",
]);

let idCounter = 0;

@Component({
    selector: "bl-resource-permission-button",
    templateUrl: "resource-permission-button.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcePermissionButtonComponent implements OnChanges {
    @Input() public id = `bl-resource-permission-button-${idCounter++}`;

    @Input() public labelledBy: string;

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
    private _roleAssignment: RoleAssignment = null;
    private _roleDefinitions: List<RoleDefinition> = null;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private resourceAccessService: ResourceAccessService) {
    }

    public ngOnChanges(changes) {
        if (changes.resourceId) {
            this._loadRoleDefinitions();
        }

        if (changes.reosurceId || changes.principalId) {
            this._loadCurrentRole();
        }
    }

    public get color() {
        if (this.loading || this.currentRole) {
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
            obs = this._deleteAssignment().pipe(
                flatMap(() => {
                    return this.resourceAccessService.createAssignment(this.resourceId, this.principalId, role.id);
                }),
            );
        }

        obs.subscribe(() => {
            this.currentRole = role;
            this.changeDetector.markForCheck();
            this._loadCurrentRole();
        });
    }

    /**
     * Delete the assignment if applicable
     */
    private _deleteAssignment(): Observable<any> {
        const assignment = this._roleAssignment;
        if (assignment) {
            return this.resourceAccessService.deleteAssignment(assignment.id);
        } else {
            return of(null);
        }
    }

    private _loadCurrentRole() {
        if (!this.principalId || !this.resourceId) {
            return;
        }

        this.resourceAccessService.getRoleFor(this.resourceId, this.principalId)
            .subscribe(({ role, roleAssignment }) => {
                this._roleAssignment = roleAssignment;
                this.currentRole = role;
                this.loading = false;
                this.changeDetector.markForCheck();
            });
    }

    private _loadRoleDefinitions() {
        this.resourceAccessService.listRoleDefinitions(this.resourceId).subscribe((roles) => {
            this._roleDefinitions = roles;
            this.changeDetector.markForCheck();
        });
    }
}
