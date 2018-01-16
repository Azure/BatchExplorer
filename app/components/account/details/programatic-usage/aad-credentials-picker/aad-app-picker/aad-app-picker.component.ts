import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { List } from "immutable";
import { Observable } from "rxjs";

import { RoleAssignmentPrincipalType } from "app/models";
import { ServicePrincipal } from "app/models/ms-graph";
import { ArmHttpService, AuthorizationHttpService, ResourceAccessService } from "app/services";
import { ListView } from "app/services/core";
import { ServicePrincipalListParams, ServicePrincipalService } from "app/services/ms-graph";
import { FilterBuilder } from "app/utils/filter-builder";

import "./aad-app-picker.scss";

@Component({
    selector: "bl-aad-app-picker",
    templateUrl: "aad-app-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADAppPickerComponent implements OnInit, OnDestroy {
    @Input() public selectedApplication: ServicePrincipal;
    @Output() public selectedApplicationChanged = new EventEmitter<ServicePrincipal>();

    public apps: ServicePrincipal[] = [];
    public allApps: List<ServicePrincipal> = List([]);

    public searchAppControl = new FormControl("");
    private _allAppsView: ListView<ServicePrincipal, ServicePrincipalListParams>;
    private _permissions = new Map<string, string>();
    private _roleDefs = new Map<string, string>();
    private _appMap = new Map<string, ServicePrincipal>();

    constructor(
        private servicePrincipalService: ServicePrincipalService,
        private resourceAccessService: ResourceAccessService,
        private arm: ArmHttpService,
        private permissionService: AuthorizationHttpService,
        private changeDetector: ChangeDetectorRef) {
        this._allAppsView = servicePrincipalService.listView();
        this._allAppsView.items.subscribe((apps) => {
            this.allApps = apps;
            this._updateAppMap(apps.toArray());
            this.changeDetector.markForCheck();
        });

        this.searchAppControl.valueChanges.debounceTime(400).subscribe((query) => {
            let options;
            if (query) {
                options = {
                    $filter: FilterBuilder.prop("displayName").startswith(query).toOData(),
                };
            } else {
                options = {};
            }
            this._allAppsView.setOptions(options);
            this._allAppsView.refresh();
        });
    }

    public ngOnInit() {
        this._allAppsView.fetchNext();
        this.resourceAccessService.listRolesForCurrentAccount().flatMap((roles) => {
            const apps = roles.filter(x => x.properties.principalType === RoleAssignmentPrincipalType.App).toArray();
            for (const app of apps) {
                this._roleDefs.set(app.properties.principalId, app.properties.roleDefinitionId);
            }
            const roleDefs = new Set<string>(apps.map(x => x.properties.roleDefinitionId));
            console.log("Account roles are", roleDefs);
            this._loadRoleDefinitions([...roleDefs]);
            const obs = apps.map((x) => {
                return this.servicePrincipalService.get(x.properties.principalId);
            });

            return Observable.forkJoin(obs);
        }).subscribe((servicePrincipals: ServicePrincipal[]) => {
            console.log(servicePrincipals.map(x => x.toJS()));
            this.apps = servicePrincipals;
            this._updateAppMap(servicePrincipals);
            this.changeDetector.markForCheck();
        });
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

    public getPermission(principalId: string) {
        return this._permissions.get(this._roleDefs.get(principalId));
    }

    private _loadRoleDefinitions(roleDefs: string[]) {
        const obs = roleDefs.map((x) => {
            return this.arm.get(x).map(x => x.json());
        });
        Observable.forkJoin(obs).subscribe((roles) => {
            for (const role of roles) {
                this._permissions.set(role.id, this.permissionService
                    .checkResoucePermissions(role.properties.permissions));
            }
            this.changeDetector.markForCheck();
        });
    }

    private _updateAppMap(apps: Iterable<ServicePrincipal>) {
        for (const app of apps) {
            this._appMap.set(app.id, app);
        }
    }
}
