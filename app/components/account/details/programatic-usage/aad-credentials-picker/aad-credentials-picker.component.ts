import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { AccountResource, RoleAssignmentPrincipalType } from "app/models";
import { ServicePrincipal } from "app/models/ms-graph";
import { ResourceAccessService } from "app/services";
import { ListView } from "app/services/core";
import { ServicePrincipalListParams, ServicePrincipalService } from "app/services/ms-graph";

import { FormControl } from "@angular/forms";
import { FilterBuilder } from "app/utils/filter-builder";
import "./aad-credentials-picker.scss";

@Component({
    selector: "bl-aad-credentials-picker",
    templateUrl: "aad-credentials-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADCredentialsPickerComponent implements OnInit, OnDestroy {
    @Input() public account: AccountResource;

    public apps: ServicePrincipal[] = [];
    public allApps: List<ServicePrincipal> = List([]);
    public searchAppControl = new FormControl("");
    private _allAppsView: ListView<ServicePrincipal, ServicePrincipalListParams>;
    constructor(
        private servicePrincipalService: ServicePrincipalService,
        private resourceAccessService: ResourceAccessService,
        private changeDetector: ChangeDetectorRef) {
        this._allAppsView = servicePrincipalService.listView();
        this._allAppsView.items.subscribe((apps) => {
            console.log("new apps");
            this.allApps = apps;
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
            const apps = roles.filter(x => x.properties.principalType === RoleAssignmentPrincipalType.App);
            console.log("Account roles are", apps.map(x => x.properties.principalId).toJS());
            const obs = apps.map((x) => {
                return this.servicePrincipalService.get(x.properties.principalId);
            });
            return Observable.forkJoin(obs.toJS());
        }).subscribe((servicePrincipals: ServicePrincipal[]) => {
            console.log(servicePrincipals.map(x => x.toJS()));
            this.apps = servicePrincipals;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._allAppsView.dispose();
    }

    public trackApp(index, app: ServicePrincipal) {
        return app.id;
    }
}
