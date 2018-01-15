import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { AccountResource, RoleAssignmentPrincipalType } from "app/models";
import { ResourceAccessService } from "app/services";
import { ServicePrincipalService } from "app/services/ms-graph";

import "./aad-credentials-picker.scss";
import { Observable } from "rxjs/Observable";
import { ServicePrincipal } from "app/models/ms-graph";

@Component({
    selector: "bl-aad-credentials-picker",
    templateUrl: "aad-credentials-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AADCredentialsPickerComponent implements OnInit {
    @Input() public account: AccountResource;

    public apps: ServicePrincipal[] = [];

    constructor(
        private servicePrincipalService: ServicePrincipalService,
        private resourceAccessService: ResourceAccessService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
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

    public trackApp(index, app: ServicePrincipal) {
        return app.id;
    }
}
