import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output,
} from "@angular/core";
import { HttpCode, ListView, ServerError } from "@batch-flask/core";
import { RoleAssignmentPrincipalType } from "app/models";
import { AADApplication, ServicePrincipal } from "app/models/ms-graph";
import { ArmHttpService, AuthorizationHttpService, ResourceAccessService } from "app/services";
import { AADApplicationListParams, AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";
import { List } from "immutable";
import { forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

import "./aad-app-picker.scss";

@Component({
    selector: "bl-aad-app-picker",
    templateUrl: "aad-app-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADAppPickerComponent implements OnInit, OnDestroy {
    @Input() public selectedApplication: ServicePrincipal;
    @Output() public selectedApplicationChanged = new EventEmitter<ServicePrincipal>();
    @Output() public createApp = new EventEmitter<void>();

    public apps: List<ServicePrincipal> = List([]);

    private _allAppsView: ListView<AADApplication, AADApplicationListParams>;
    private _permissions = new Map<string, string>();
    private _roleDefs = new Map<string, string>();
    private _appMap = new Map<string, ServicePrincipal>();

    constructor(
        private servicePrincipalService: ServicePrincipalService,
        aadApplicationService: AADApplicationService,
        private resourceAccessService: ResourceAccessService,
        private arm: ArmHttpService,
        private permissionService: AuthorizationHttpService,
        private changeDetector: ChangeDetectorRef) {
        this._allAppsView = aadApplicationService.listView();
        this._allAppsView.params = { owned: true };
        this._allAppsView.items.subscribe((apps) => {
            // Only take web apps(exclude native apps)
            apps = List(apps.filter(x => x.isApiApp));
            this.apps = apps;
            this._updateAppMap(apps.toArray());
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this._allAppsView.fetchNext();
        this._loadApplicationWithAccessToAccount();
    }

    public ngOnDestroy() {
        this._allAppsView.dispose();
    }

    public trackApp(index, app: ServicePrincipal) {
        return app.id;
    }

    public pickApplication(id: string) {
        const application = this._appMap.get(id);
        this.selectedApplication = application;
        this.selectedApplicationChanged.emit(application);
    }

    public getPermission(applicationId: string) {
        return this._permissions.get(this._roleDefs.get(applicationId));
    }

    private _loadRoleDefinitions(roleDefs: string[]) {
        const unique = new Set<string>(roleDefs);

        const obs = [...unique].map((x) => {
            return this.arm.get(x).pipe(map(x => x.json()));
        });
        forkJoin(obs).subscribe((roles) => {
            for (const role of roles) {
                this._permissions.set(role.id, this.permissionService
                    .checkResoucePermissions(role.properties.permissions));
            }
            this.changeDetector.markForCheck();
        });
    }

    private _updateAppMap(apps: Iterable<AADApplication>) {
        for (const app of apps) {
            this._appMap.set(app.id, app);
        }
    }

    private _loadApplicationWithAccessToAccount() {
        this.resourceAccessService.listRolesForCurrentAccount().subscribe((roles) => {
            const apps = roles.filter(x => x.properties.principalType === RoleAssignmentPrincipalType.App).toArray();

            this._loadRoleDefinitions(apps.map(x => x.properties.roleDefinitionId));
            const obs = apps.map((x) => {
                return this.servicePrincipalService.get(x.properties.principalId).pipe(
                    catchError((error: ServerError) => {
                        if (error.status === HttpCode.NotFound) {
                            return of(null);
                        }
                    }),
                );
            });

            forkJoin(obs).subscribe((servicePrincipals: ServicePrincipal[]) => {
                for (const [index, servicePrincipal] of servicePrincipals.entries()) {
                    if (servicePrincipal) {
                        const role = apps[index];
                        this._roleDefs.set(servicePrincipal.appId, role.properties.roleDefinitionId);
                    }
                }
                this.changeDetector.markForCheck();
            });
        });
    }

}
